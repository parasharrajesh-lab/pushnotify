import { audienceSize, projectDelivery, saltFrom, type Audience, type Platform, type Reach, type Tag } from "./push.ts";

export type Channel = "push" | "inapp";
export type Qualification = "past" | "live" | "external";
export type Layout = "lock" | "banner" | "modal" | "primer";
export type DeliveryWhen = "now" | "later";
export type DeliveryState = "sent" | "queued" | "scheduled" | "armed";

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
  delivery: DeliveryWhen;
  ttlHours: number;
  delaySeconds: number;
  quietHours: boolean;
  goal: string;
};

export type DeviceHint = {
  platform: Platform;
  tag: Tag;
  status: "active" | "unregistered";
  pushToken?: string;
};

export const STEPS = ["Start", "Who", "What", "When", "Publish"] as const;
export type StepName = (typeof STEPS)[number];

export function isChannel(value: unknown): value is Channel {
  return value === "push" || value === "inapp";
}

export function isQualification(value: unknown): value is Qualification {
  return value === "past" || value === "live" || value === "external";
}

export function isLayout(value: unknown): value is Layout {
  return value === "lock" || value === "banner" || value === "modal" || value === "primer";
}

export function inQuietHours(date: Date) {
  const hour = date.getHours();
  return hour >= 21 || hour < 9;
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

export function reviewCampaign(input: {
  draft: CampaignDraft;
  reach: Reach;
  devices: DeviceHint[];
  plan: "free" | "basic" | "advance";
  now?: Date;
}) {
  const draft = input.draft;
  const now = input.now ?? new Date();
  const tokens = tokenCounts(input.devices, draft.audience);
  const pushReach = audienceSize(input.reach, draft.audience);
  const targeted = draft.channel === "inapp" && draft.layout === "primer" ? tokens.waiting : pushReach;
  const error = campaignError(draft, input.plan, targeted);
  const quiet = draft.quietHours && inQuietHours(now);
  let state: DeliveryState = "sent";
  if (!error) {
    if (draft.qualification !== "past") state = "armed";
    else if (draft.delivery === "later") state = "scheduled";
    else if (draft.channel === "push" && quiet) state = "queued";
  }
  const stats =
    state === "sent" && !error
      ? projectDelivery(targeted, saltFrom(draft.title))
      : { targeted, delivered: 0, failed: 0, clicked: 0 };
  return { error, targeted, tokens, state, stats, quiet };
}

export function campaignError(draft: CampaignDraft, plan: "free" | "basic" | "advance", targeted: number) {
  if (!draft.title.trim() || draft.title.trim().length > 65) return "Title is required, up to 65 characters.";
  if (!draft.body.trim() || draft.body.trim().length > 180) return "Message is required, up to 180 characters.";
  if (draft.video.trim() && plan !== "advance") return "Video is included on Advance.";
  if (draft.channel === "push" && draft.layout !== "lock") return "Push uses the lock screen.";
  if (draft.channel === "inapp" && draft.layout === "lock") return "Choose a banner, a modal, or a permission primer.";
  if (draft.layout === "primer" && draft.video.trim()) return "A permission primer is text and a button.";
  if (draft.layout === "primer" && !draft.button.trim()) return "The primer needs a button, such as Allow.";
  if (draft.qualification !== "past" && draft.delivery === "later") return "A live or external trigger sends when the action happens, not on a clock.";
  if (draft.channel === "inapp" && (draft.delaySeconds < 0 || draft.delaySeconds > 1200)) return "In-app delay is 0 to 1,200 seconds.";
  if (draft.channel === "push" && (draft.ttlHours < 1 || draft.ttlHours > 72)) return "Push stays available for 1 to 72 hours.";
  if (targeted <= 0 && draft.layout === "primer") return "No device is waiting for notification permission.";
  if (targeted <= 0) return "No reachable devices in that audience.";
  return null;
}

export function stepError(step: StepName, draft: CampaignDraft, plan: "free" | "basic" | "advance", targeted: number) {
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
    return null;
  }
  if (step === "When" || step === "Publish") return campaignError(draft, plan, targeted);
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
  goal: string;
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
      goal: typeof parsed.goal === "string" ? parsed.goal : "",
      state: parsed.state,
    };
  } catch {
    return null;
  }
}

export function stateLabel(state: DeliveryState) {
  if (state === "queued") return "Queued until quiet hours end";
  if (state === "scheduled") return "Scheduled";
  if (state === "armed") return "Waiting for the trigger";
  return "Sent";
}
