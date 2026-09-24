import assert from "node:assert/strict";
import test from "node:test";
import { FREE_REACH } from "./push.ts";
import { campaignError, inQuietHours, reviewCampaign, type CampaignDraft, type DeviceHint } from "./notify.ts";

const devices: DeviceHint[] = [
  { platform: "ios", tag: "orders", status: "active", pushToken: "ab".repeat(32) },
  { platform: "android", tag: "orders", status: "active", pushToken: `fcm:${"A".repeat(80)}` },
  { platform: "ios", tag: "new", status: "unregistered" },
];

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
    delivery: "now",
    ttlHours: 24,
    delaySeconds: 0,
    quietHours: false,
    goal: "",
    ...over,
  };
}

test("past behavior push sends now, and quiet hours queue it", () => {
  const day = reviewCampaign({
    draft: draft(),
    reach: FREE_REACH,
    devices,
    plan: "free",
    now: new Date("2026-09-24T15:00:00"),
  });
  assert.equal(day.error, null);
  assert.equal(day.state, "sent");
  assert.ok(day.stats.delivered > 0);

  const night = reviewCampaign({
    draft: draft({ quietHours: true }),
    reach: FREE_REACH,
    devices,
    plan: "free",
    now: new Date("2026-09-24T22:00:00"),
  });
  assert.equal(night.state, "queued");
  assert.equal(night.stats.delivered, 0);
  assert.equal(inQuietHours(new Date("2026-09-24T08:30:00")), true);
  assert.equal(inQuietHours(new Date("2026-09-24T09:05:00")), false);
});

test("live and external triggers wait, and cannot be put on a clock", () => {
  const live = reviewCampaign({
    draft: draft({ channel: "inapp", layout: "banner", qualification: "live" }),
    reach: FREE_REACH,
    devices,
    plan: "basic",
  });
  assert.equal(live.state, "armed");
  assert.equal(live.stats.delivered, 0);
  assert.match(campaignError(draft({ qualification: "external", delivery: "later" }), "basic", 10) ?? "", /not on a clock/);
});

test("in-app primer only targets devices that have not allowed notifications", () => {
  const none = reviewCampaign({
    draft: draft({ channel: "inapp", layout: "primer" }),
    reach: FREE_REACH,
    devices: devices.filter((device) => device.status === "active"),
    plan: "basic",
  });
  assert.match(none.error ?? "", /waiting for notification permission/);

  const ready = reviewCampaign({
    draft: draft({ channel: "inapp", layout: "primer", audience: { kind: "platform", platform: "ios" } }),
    reach: FREE_REACH,
    devices,
    plan: "basic",
  });
  assert.equal(ready.error, null);
  assert.equal(ready.targeted, 1);
  assert.equal(ready.state, "sent");
});

test("push ttl, in-app delay, and video follow the channel rules", () => {
  assert.match(campaignError(draft({ ttlHours: 0 }), "basic", 10) ?? "", /1 to 72/);
  assert.match(campaignError(draft({ channel: "inapp", layout: "modal", delaySeconds: 1201 }), "basic", 10) ?? "", /1,200/);
  assert.match(campaignError(draft({ video: "https://cdn.example/a.mp4" }), "free", 10) ?? "", /Advance/);
  assert.equal(campaignError(draft({ channel: "inapp", layout: "banner", delaySeconds: 30 }), "basic", 10), null);
});
