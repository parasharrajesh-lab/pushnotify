import { audienceSize, projectDelivery, saltFrom, type Audience, type Platform, type Reach, type Tag } from "./push.ts";
import {
  attributeError,
  canSeeMessage,
  estimateReach,
  isBehaviorAttribute,
  isGoalMetric,
  matchesAll,
  matchesAttributes,
  parseBehavior,
  projectGoal,
  type Behavior,
  type BehaviorAttribute,
  type GoalMetric,
  type SegmentRule,
} from "./behavior.ts";

export type Channel = "push" | "inapp";
export type Qualification = "past" | "live" | "external";
export type Layout = "lock" | "banner" | "modal" | "primer";
export type DeliveryWhen = "now" | "later";
export type DeliveryState = "sent" | "queued" | "scheduled" | "armed";
export type Frequency = "once" | "session" | "daily" | "weekly";

export type CampaignDraft = {
  channel: Channel;
  qualification: Qualification;
  layout: Layout;
  audience: Audience;
  title: string;
  body: string;
  link: string;
  image: string;
  video: string;
  button: string;
  ctaLink: string;
  delivery: DeliveryWhen;
  scheduleAt: string;
  endsAt: string;
  ttlHours: number;
  delaySeconds: number;
  quietHours: boolean;
  frequency: Frequency;
  frequencyCap: number;
  goal: string;
  goalMetric: GoalMetric;
  attributes: BehaviorAttribute[];
};

export type DeviceHint = {
  platform: Platform;
  tag: Tag;
  status: "active" | "unregistered";
  pushToken?: string;
  behavior?: Behavior;
};

export const STEPS = ["Start", "Who", "What", "When", "Publish"] as const;
export type StepName = (typeof STEPS)[number];

export const INDIA = "Asia/Kolkata";
export const MIN_LEAD_MS = 5 * 60 * 1000;
export const MAX_WINDOW_MS = 90 * 24 * 60 * 60 * 1000;

export function isChannel(value: unknown): value is Channel {
  return value === "push" || value === "inapp";
}

export function isQualification(value: unknown): value is Qualification {
  return value === "past" || value === "live" || value === "external";
}

export function isLayout(value: unknown): value is Layout {
  return value === "lock" || value === "banner" || value === "modal" || value === "primer";
}

export function isFrequency(value: unknown): value is Frequency {
  return value === "once" || value === "session" || value === "daily" || value === "weekly";
}

export function indiaHour(date: Date) {
  return Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: INDIA, hour: "2-digit", hourCycle: "h23" }).format(date),
  );
}

export function inQuietHours(date: Date) {
  const hour = indiaHour(date);
  return hour >= 21 || hour < 9;
}

export function parseInstant(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function istDate(year: number, month: number, day: number, hour: number, minute: number) {
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute - 30, 0));
}

export function istInputToIso(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return "";
  const date = istDate(Number(match[1]), Number(match[2]), Number(match[3]), Number(match[4]), Number(match[5]));
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

export function isoToIstInput(iso: string) {
  const date = parseInstant(iso);
  if (!date) return "";
  const map = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: INDIA,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}

export function suggestStart(now = new Date()) {
  const map = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: INDIA, year: "numeric", month: "2-digit", day: "2-digit" })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  let cursor = istDate(Number(map.year), Number(map.month), Number(map.day), 10, 0);
  if (cursor.getTime() < now.getTime() + MIN_LEAD_MS) cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
  return cursor.toISOString();
}

export function suggestEnd(startIso: string) {
  const start = parseInstant(startIso) ?? new Date();
  return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
}

export function formatSchedule(iso: string) {
  const date = parseInstant(iso);
  if (!date) return "";
  return `${new Intl.DateTimeFormat("en-IN", {
    timeZone: INDIA,
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date)} IST`;
}

export function badDeepLink(value: string) {
  const link = value.trim();
  if (!link) return null;
  if (link.length > 500 || /^(javascript|data|vbscript):/i.test(link)) return "That deep link is not allowed.";
  return null;
}

export function ctaHref(draft: { link?: string; ctaLink?: string }) {
  return (draft.ctaLink ?? "").trim() || (draft.link ?? "").trim();
}

export function destinationPath(link: string) {
  const value = link.trim();
  if (!value) return "";
  try {
    const url = new URL(value);
    const path = `${url.hostname}${url.pathname.replace(/\/$/, "")}`.replace(/^\/+/, "");
    return path || url.protocol.replace(":", "");
  } catch {
    return value.replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  }
}

export function imageFileError(image: string) {
  const value = image.trim();
  if (!value) return null;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(value)) {
    if (value.length > 180_000) return "Use a PNG, JPEG, WEBP, or GIF under 120 KB.";
    return null;
  }
  if (/^data:image\/svg\+xml[,;]/i.test(value)) {
    if (value.length > 20_000 || /<script/i.test(value)) return "That image is not allowed.";
    return null;
  }
  if (value.startsWith("data:")) return "Use a PNG, JPEG, WEBP, or GIF under 120 KB.";
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return "Image links must use https.";
    if (url.toString().length > 500) return "That image link is too long.";
    return null;
  } catch {
    return "Image must be an https link or a small upload.";
  }
}

export function imageError(image: string, link: string) {
  if (!image.trim()) return null;
  if (!link.trim()) return "Add a deep link so the image opens on a screen.";
  return imageFileError(image);
}

export function frequencyLabel(frequency: Frequency, cap: number) {
  if (frequency === "session") return `${cap} per session`;
  if (frequency === "daily") return `${cap} per day`;
  if (frequency === "weekly") return `${cap} per week`;
  return "Once";
}

function matches(device: DeviceHint, audience: Audience) {
  if (audience.kind === "platform" && device.platform !== audience.platform) return false;
  if (audience.kind === "tag" && device.tag !== audience.tag) return false;
  return true;
}

export function tokenCounts(devices: DeviceHint[], audience: Audience) {
  const matched = devices.filter((device) => matches(device, audience));
  const withToken = (platform: Platform) =>
    matched.filter((device) => device.platform === platform && device.status === "active" && Boolean(device.pushToken?.trim())).length;
  return {
    android: withToken("android"),
    ios: withToken("ios"),
    waiting: matched.filter((device) => device.status === "unregistered").length,
  };
}

function frequencyError(draft: CampaignDraft) {
  if (!isFrequency(draft.frequency)) return "Choose a frequency.";
  const cap = draft.frequencyCap;
  if (!Number.isInteger(cap)) return "Frequency must be a whole number.";
  if (draft.frequency === "once") {
    if (cap !== 1) return "A one-time campaign is delivered once.";
    return null;
  }
  if (draft.frequency === "session") {
    if (draft.channel !== "inapp") return "Per session is for in-app messages.";
    if (cap < 1 || cap > 10) return "Show an in-app message 1 to 10 times per session.";
    return null;
  }
  if (draft.frequency === "daily") {
    if (cap < 1 || cap > 5) return "Daily cap is 1 to 5.";
    return null;
  }
  if (cap < 1 || cap > 10) return "Weekly cap is 1 to 10.";
  return null;
}

function windowError(draft: CampaignDraft, now: Date) {
  const start = draft.delivery === "later" ? parseInstant(draft.scheduleAt) : now;
  if (draft.delivery === "later") {
    if (!draft.scheduleAt.trim()) return "Pick a date and time.";
    if (!start) return "That date and time is not valid.";
    if (start.getTime() < now.getTime() + MIN_LEAD_MS) return "Pick a time at least 5 minutes from now.";
    if (start.getTime() > now.getTime() + MAX_WINDOW_MS) return "Schedule within the next 90 days.";
    if (draft.channel === "push" && draft.quietHours && inQuietHours(start)) {
      return "That time is inside quiet hours, 9pm to 9am IST. Pick 9am to 9pm, or turn quiet hours off.";
    }
  }
  const repeating = draft.frequency === "daily" || draft.frequency === "weekly";
  if (repeating && !draft.endsAt.trim()) return "A repeating campaign needs an end date.";
  if (draft.endsAt.trim()) {
    const end = parseInstant(draft.endsAt);
    if (!end || !start) return "That end date is not valid.";
    if (end.getTime() <= start.getTime()) return "The end must be after the start.";
    if (end.getTime() - start.getTime() > MAX_WINDOW_MS) return "A campaign can run for up to 90 days.";
  }
  return null;
}

export function reviewCampaign(input: {
  draft: CampaignDraft;
  reach: Reach;
  devices: DeviceHint[];
  segments?: { id: string; rules: SegmentRule[] }[];
  plan: "free" | "basic" | "advance";
  now?: Date;
}) {
  const draft = input.draft;
  const now = input.now ?? new Date();
  const metric = isGoalMetric(draft.goalMetric) ? draft.goalMetric : "opened";
  const attributes = (draft.attributes ?? []).filter(isBehaviorAttribute);
  const attrProblem = attributeError(attributes);
  let devices = input.devices;
  let pushReach = audienceSize(input.reach, draft.audience);
  let segmentMissing = false;
  if (draft.audience.kind === "segment") {
    const segmentId = draft.audience.segmentId;
    const segment = input.segments?.find((item) => item.id === segmentId);
    if (!segment) segmentMissing = true;
    else {
      devices = input.devices.filter(
        (device) => matchesAll(behaviorOf(device), segment.rules) && canSeeMessage(behaviorOf(device), draft.channel, draft.layout),
      );
      pushReach = estimateReach(audienceSize(input.reach, { kind: "all" }), input.devices.length, devices.length);
    }
  }
  if (!segmentMissing && !attrProblem && attributes.length > 0) {
    const pool = draft.audience.kind === "segment" ? input.devices : input.devices.filter((device) => fitsAudience(device, draft.audience));
    const matched = (draft.audience.kind === "segment" ? devices : pool).filter(
      (device) => matchesAttributes(behaviorOf(device), attributes) && canSeeMessage(behaviorOf(device), draft.channel, draft.layout),
    );
    devices = matched;
    const total = draft.audience.kind === "segment" ? audienceSize(input.reach, { kind: "all" }) : audienceSize(input.reach, draft.audience);
    const known = draft.audience.kind === "segment" ? input.devices.length : pool.length;
    pushReach = estimateReach(total, known, matched.length);
  }
  const tokens = tokenCounts(devices, draft.audience.kind === "segment" || attributes.length > 0 ? { kind: "all" } : draft.audience);
  const targeted = segmentMissing || attrProblem
    ? 0
    : draft.audience.kind === "segment" || attributes.length > 0
      ? pushReach
      : draft.channel === "inapp" && draft.layout === "primer"
        ? tokens.waiting
        : pushReach;
  const error = segmentMissing
    ? "That segment is not on this workspace."
    : attrProblem
      ? attrProblem
      : campaignError(draft, input.plan, targeted, now);
  const quiet = draft.quietHours && draft.delivery === "now" && draft.channel === "push" && inQuietHours(now);
  let state: DeliveryState = "sent";
  if (!error) {
    if (draft.qualification !== "past") state = draft.delivery === "later" ? "scheduled" : "armed";
    else if (draft.delivery === "later") state = "scheduled";
    else if (quiet) state = "queued";
  }
  const stats =
    state === "sent" && !error
      ? projectDelivery(targeted, saltFrom(draft.title))
      : { targeted, delivered: 0, failed: 0, clicked: 0 };
  const goalPeople =
    draft.audience.kind === "segment" || attributes.length > 0
      ? devices
      : input.devices.filter((device) => fitsAudience(device, draft.audience) && canSeeMessage(behaviorOf(device), draft.channel, draft.layout));
  const goalHits = state === "sent" && !error ? projectGoal(goalPeople.map(behaviorOf), metric, stats.delivered) : 0;
  return { error, targeted, tokens, state, stats, quiet, goalHits };
}

function fitsAudience(device: DeviceHint, audience: Audience) {
  if (audience.kind === "platform") return device.platform === audience.platform;
  if (audience.kind === "tag") return device.tag === audience.tag;
  return true;
}

function behaviorOf(device: DeviceHint) {
  return device.behavior ?? parseBehavior("", device.status);
}

export function campaignError(
  draft: CampaignDraft,
  plan: "free" | "basic" | "advance",
  targeted: number,
  now = new Date(),
) {
  if (!draft.title.trim() || draft.title.trim().length > 65) return "Title is required, up to 65 characters.";
  if (!draft.body.trim() || draft.body.trim().length > 180) return "Message is required, up to 180 characters.";
  if (draft.video.trim() && plan !== "advance") return "Video is included on Advance.";
  if (draft.channel === "push" && draft.layout !== "lock") return "Push uses the lock screen.";
  if (draft.channel === "inapp" && draft.layout === "lock") return "Choose a banner, a modal, or a permission primer.";
  if (draft.layout === "primer" && draft.video.trim()) return "A permission primer is text and a button.";
  const linkBad = badDeepLink(draft.link);
  if (linkBad) return linkBad;
  const ctaBad = badDeepLink(draft.ctaLink);
  if (ctaBad) return ctaBad;
  const picture = imageError(draft.image, draft.link);
  if (picture) return picture;
  if (draft.button.trim().length > 24) return "The button label is up to 24 characters.";
  if (draft.layout === "primer" && !draft.button.trim()) return "The primer needs a button, such as Allow.";
  if (draft.button.trim() && !ctaHref(draft)) return "The button needs a deep link.";
  if (draft.channel === "inapp" && (draft.delaySeconds < 0 || draft.delaySeconds > 1200)) return "In-app delay is 0 to 1,200 seconds.";
  if (draft.channel === "push" && (draft.ttlHours < 1 || draft.ttlHours > 72)) return "Push stays available for 1 to 72 hours.";
  const freq = frequencyError(draft);
  if (freq) return freq;
  const timing = windowError(draft, now);
  if (timing) return timing;
  if (targeted <= 0 && draft.layout === "primer") return "No device is waiting for notification permission.";
  if (targeted <= 0) return "No reachable devices in that audience.";
  return null;
}

export function stepError(step: StepName, draft: CampaignDraft, plan: "free" | "basic" | "advance", targeted: number, now = new Date()) {
  if (step === "Start" || step === "Who") {
    if (targeted <= 0 && draft.layout === "primer") return "No device is waiting for notification permission.";
    if (targeted <= 0) return "No reachable devices in that audience.";
    return null;
  }
  if (step === "What") {
    if (!draft.title.trim() || draft.title.trim().length > 65) return "Title is required, up to 65 characters.";
    if (!draft.body.trim() || draft.body.trim().length > 180) return "Message is required, up to 180 characters.";
    if (draft.video.trim() && plan !== "advance") return "Video is included on Advance.";
    if (draft.layout === "primer" && !draft.button.trim()) return "The primer needs a button, such as Allow.";
    if (draft.button.trim() && !ctaHref(draft)) return "The button needs a deep link.";
    const linkBad = badDeepLink(draft.link) ?? badDeepLink(draft.ctaLink);
    if (linkBad) return linkBad;
    return null;
  }
  if (step === "When" || step === "Publish") return campaignError(draft, plan, targeted, now);
  return null;
}

export type StoredProcess = {
  channel: Channel;
  qualification: Qualification;
  layout: Layout;
  delivery: DeliveryWhen;
  ttlHours: number;
  delaySeconds: number;
  quietHours: boolean;
  button: string;
  ctaLink: string;
  scheduleAt: string;
  endsAt: string;
  frequency: Frequency;
  frequencyCap: number;
  goal: string;
  goalMetric: GoalMetric;
  goalHits: number;
  attributes: BehaviorAttribute[];
  state: DeliveryState;
};

export function readProcess(raw: string): StoredProcess | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredProcess>;
    if (!isChannel(parsed.channel) || !isLayout(parsed.layout) || !parsed.state) return null;
    return {
      channel: parsed.channel,
      qualification: isQualification(parsed.qualification) ? parsed.qualification : "past",
      layout: parsed.layout,
      delivery: parsed.delivery === "later" ? "later" : "now",
      ttlHours: Number(parsed.ttlHours) || 24,
      delaySeconds: Number(parsed.delaySeconds) || 0,
      quietHours: Boolean(parsed.quietHours),
      button: typeof parsed.button === "string" ? parsed.button : "",
      ctaLink: typeof parsed.ctaLink === "string" ? parsed.ctaLink : "",
      scheduleAt: typeof parsed.scheduleAt === "string" ? parsed.scheduleAt : "",
      endsAt: typeof parsed.endsAt === "string" ? parsed.endsAt : "",
      frequency: isFrequency(parsed.frequency) ? parsed.frequency : "once",
      frequencyCap: Number.isInteger(Number(parsed.frequencyCap)) ? Number(parsed.frequencyCap) : 1,
      goal: typeof parsed.goal === "string" ? parsed.goal : "",
      goalMetric: isGoalMetric(parsed.goalMetric) ? parsed.goalMetric : "opened",
      goalHits: Number.isInteger(Number(parsed.goalHits)) ? Number(parsed.goalHits) : 0,
      attributes: Array.isArray(parsed.attributes) ? parsed.attributes.filter(isBehaviorAttribute) : [],
      state: parsed.state,
    };
  } catch {
    return null;
  }
}

export function stateLabel(state: DeliveryState, qualification: Qualification = "past") {
  if (state === "queued") return "Queued until quiet hours end";
  if (state === "scheduled") return qualification === "past" ? "Scheduled" : "Starts at the chosen time";
  if (state === "armed") return "Waiting for the trigger";
  return "Sent";
}
