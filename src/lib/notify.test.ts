import assert from "node:assert/strict";
import test from "node:test";
import { FREE_REACH, seedSubscribers } from "./push.ts";
import {
  campaignError,
  ctaHref,
  destinationPath,
  imageError,
  imageFileError,
  inQuietHours,
  istInputToIso,
  isoToIstInput,
  reviewCampaign,
  type CampaignDraft,
  type DeviceHint,
} from "./notify.ts";

const devices: DeviceHint[] = [
  { platform: "ios", tag: "orders", status: "active", pushToken: "ab".repeat(32) },
  { platform: "android", tag: "orders", status: "active", pushToken: `fcm:${"A".repeat(80)}` },
  { platform: "ios", tag: "new", status: "unregistered" },
];

const afternoon = new Date("2026-09-24T09:30:00.000Z");

function draft(over: Partial<CampaignDraft> = {}): CampaignDraft {
  return {
    channel: "push",
    qualification: "past",
    layout: "lock",
    audience: { kind: "all" },
    title: "Order update",
    body: "The rider is nearby.",
    link: "app://order/1",
    image: "",
    video: "",
    button: "Allow",
    ctaLink: "",
    delivery: "now",
    scheduleAt: "",
    endsAt: "",
    ttlHours: 24,
    delaySeconds: 0,
    quietHours: false,
    frequency: "once",
    frequencyCap: 1,
    goal: "",
    goalMetric: "opened",
    attributes: [],
    ...over,
  };
}

test("past behavior push sends now, and quiet hours queue it", () => {
  const day = reviewCampaign({
    draft: draft(),
    reach: FREE_REACH,
    devices,
    plan: "free",
    now: afternoon,
  });
  assert.equal(day.error, null);
  assert.equal(day.state, "sent");
  assert.ok(day.stats.delivered > 0);

  const night = reviewCampaign({
    draft: draft({ quietHours: true }),
    reach: FREE_REACH,
    devices,
    plan: "free",
    now: new Date("2026-09-24T16:30:00.000Z"),
  });
  assert.equal(night.state, "queued");
  assert.equal(night.stats.delivered, 0);
  assert.equal(inQuietHours(new Date("2026-09-24T03:00:00.000Z")), true);
  assert.equal(inQuietHours(new Date("2026-09-24T03:35:00.000Z")), false);
});

test("a custom time sends past behavior later, and only opens a live window", () => {
  const start = "2026-09-24T12:30:00.000Z";
  const scheduled = reviewCampaign({
    draft: draft({ delivery: "later", scheduleAt: start, quietHours: true }),
    reach: FREE_REACH,
    devices,
    plan: "basic",
    now: afternoon,
  });
  assert.equal(scheduled.error, null);
  assert.equal(scheduled.state, "scheduled");
  assert.equal(scheduled.stats.delivered, 0);

  const live = reviewCampaign({
    draft: draft({
      channel: "inapp",
      layout: "banner",
      qualification: "live",
      delivery: "later",
      scheduleAt: start,
      frequency: "session",
      frequencyCap: 1,
    }),
    reach: FREE_REACH,
    devices,
    plan: "basic",
    now: afternoon,
  });
  assert.equal(live.error, null);
  assert.equal(live.state, "scheduled");
  assert.match(campaignError(draft({ qualification: "external", delivery: "later", scheduleAt: "" }), "basic", 10, afternoon) ?? "", /date and time/);
  assert.match(
    campaignError(draft({ delivery: "later", scheduleAt: "2026-09-24T16:30:00.000Z", quietHours: true }), "basic", 10, afternoon) ?? "",
    /quiet hours/,
  );
  assert.match(
    campaignError(draft({ delivery: "later", scheduleAt: "2026-09-24T09:00:00.000Z" }), "basic", 10, afternoon) ?? "",
    /5 minutes/,
  );
});

test("the button label is editable and resolves its own deep link", () => {
  assert.equal(ctaHref(draft({ ctaLink: "" })), "app://order/1");
  assert.equal(ctaHref(draft({ ctaLink: "app://track/9" })), "app://track/9");
  assert.match(campaignError(draft({ button: "Open", link: "", ctaLink: "" }), "basic", 10, afternoon) ?? "", /deep link/);
  assert.match(campaignError(draft({ ctaLink: "javascript:alert(1)" }), "basic", 10, afternoon) ?? "", /not allowed/);
  assert.equal(campaignError(draft({ button: "Track", ctaLink: "metrobites://order/9" }), "basic", 10, afternoon), null);
});

test("frequency caps, and a repeating campaign needs an end inside 90 days", () => {
  assert.match(campaignError(draft({ frequency: "session", frequencyCap: 1 }), "basic", 10, afternoon) ?? "", /in-app/);
  assert.match(campaignError(draft({ frequency: "once", frequencyCap: 3 }), "basic", 10, afternoon) ?? "", /once/);
  assert.match(campaignError(draft({ frequency: "daily", frequencyCap: 6 }), "basic", 10, afternoon) ?? "", /1 to 5/);
  assert.match(campaignError(draft({ frequency: "daily", frequencyCap: 1 }), "basic", 10, afternoon) ?? "", /end date/);
  const end = new Date(afternoon.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();
  const daily = reviewCampaign({
    draft: draft({ frequency: "daily", frequencyCap: 2, endsAt: end }),
    reach: FREE_REACH,
    devices,
    plan: "basic",
    now: afternoon,
  });
  assert.equal(daily.error, null);
  assert.equal(daily.state, "sent");
  assert.match(
    campaignError(draft({ frequency: "weekly", frequencyCap: 1, endsAt: new Date(afternoon.getTime() - 1000).toISOString() }), "basic", 10, afternoon) ?? "",
    /after the start/,
  );
  const modal = reviewCampaign({
    draft: draft({ channel: "inapp", layout: "modal", qualification: "external", frequency: "session", frequencyCap: 3, button: "Open" }),
    reach: FREE_REACH,
    devices,
    plan: "basic",
    now: afternoon,
  });
  assert.equal(modal.error, null);
  assert.equal(modal.state, "armed");
});

test("in-app primer only targets devices that have not allowed notifications", () => {
  const none = reviewCampaign({
    draft: draft({ channel: "inapp", layout: "primer" }),
    reach: FREE_REACH,
    devices: devices.filter((device) => device.status === "active"),
    plan: "basic",
    now: afternoon,
  });
  assert.match(none.error ?? "", /waiting for notification permission/);

  const ready = reviewCampaign({
    draft: draft({ channel: "inapp", layout: "primer", audience: { kind: "platform", platform: "ios" } }),
    reach: FREE_REACH,
    devices,
    plan: "basic",
    now: afternoon,
  });
  assert.equal(ready.error, null);
  assert.equal(ready.targeted, 1);
  assert.equal(ready.state, "sent");
});

test("push ttl, in-app delay, video, and India time follow the channel rules", () => {
  assert.match(campaignError(draft({ ttlHours: 0 }), "basic", 10, afternoon) ?? "", /1 to 72/);
  assert.match(campaignError(draft({ channel: "inapp", layout: "modal", delaySeconds: 1201 }), "basic", 10, afternoon) ?? "", /1,200/);
  assert.match(campaignError(draft({ video: "https://cdn.example/a.mp4" }), "free", 10, afternoon) ?? "", /Advance/);
  assert.equal(campaignError(draft({ channel: "inapp", layout: "banner", delaySeconds: 30 }), "basic", 10, afternoon), null);
  const iso = istInputToIso("2026-09-25T18:30");
  assert.equal(iso, "2026-09-25T13:00:00.000Z");
  assert.equal(isoToIstInput(iso), "2026-09-25T18:30");
  assert.equal(inQuietHours(new Date(iso)), false);
  assert.equal(inQuietHours(new Date(istInputToIso("2026-09-25T21:00"))), true);
});

test("attributes narrow a segment, and the image opens only with a deep link", () => {
  const people = seedSubscribers().map((person) => ({
    platform: person.platform,
    tag: person.tag,
    status: person.status,
    behavior: person.behavior,
  }));
  const bought = reviewCampaign({
    draft: draft({ attributes: ["purchase", "authorized"] }),
    reach: FREE_REACH,
    devices: people,
    plan: "free",
    now: afternoon,
  });
  assert.equal(bought.error, null);
  assert.equal(bought.targeted, 57);

  const clash = reviewCampaign({
    draft: draft({ attributes: ["authorized", "denied"] }),
    reach: FREE_REACH,
    devices: people,
    plan: "free",
    now: afternoon,
  });
  assert.match(clash.error ?? "", /one notification permission/);
  assert.equal(clash.targeted, 0);

  assert.match(campaignError(draft({ image: "https://cdn.example/dish.jpg", link: "" }), "free", 10, afternoon) ?? "", /deep link/);
  assert.equal(imageFileError("https://cdn.example/dish.jpg"), null);
  assert.match(imageFileError("http://cdn.example/dish.jpg") ?? "", /https/);
  assert.match(imageFileError("javascript:alert(1)") ?? "", /https|not allowed|Image/);
  assert.equal(destinationPath("metrobites://order/4821"), "order/4821");
  assert.equal(imageError("https://cdn.example/dish.jpg", "metrobites://order/4821"), null);
});
