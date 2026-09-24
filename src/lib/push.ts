import { seedBehavior, type Behavior } from "./behavior.ts";

export const MAU_CAP = 10_000;
export const APP_NAME = "Metro Bites";

export const TAGS = ["orders", "lapsing", "vip", "new"] as const;
export type Tag = (typeof TAGS)[number];
export type Platform = "android" | "ios";

export type Audience =
  | { kind: "all" }
  | { kind: "platform"; platform: Platform }
  | { kind: "tag"; tag: Tag }
  | { kind: "segment"; segmentId: string };

export type Subscriber = {
  id: string;
  name: string;
  userId: string;
  platform: Platform;
  city: string;
  tag: Tag;
  lastSeen: string;
  status: "active" | "unregistered";
  pushToken?: string;
  behavior: Behavior;
};

export type Campaign = {
  id: string;
  title: string;
  body: string;
  link: string;
  image?: string;
  video?: string;
  audience: Audience;
  createdAt: string;
  targeted: number;
  delivered: number;
  failed: number;
  clicked: number;
  seed: boolean;
  isTest?: boolean;
  testLabel?: string;
  channel?: "push" | "inapp";
  layout?: "lock" | "banner" | "modal" | "primer";
  deliveryState?: "sent" | "queued" | "scheduled" | "armed";
  qualification?: "past" | "live" | "external";
  button?: string;
  ctaLink?: string;
  scheduleAt?: string;
  endsAt?: string;
  frequency?: "once" | "session" | "daily" | "weekly";
  frequencyCap?: number;
  goalMetric?: "opened" | "returned_next_day" | "sessions" | "purchases";
  goalHits?: number;
  attributes?: string[];
};

export type Reach = Record<Platform, Record<Tag, number>>;

export const BASE_REACH: Reach = {
  android: { orders: 2140, lapsing: 960, vip: 410, new: 1170 },
  ios: { orders: 1088, lapsing: 520, vip: 302, new: 514 },
};

const TAG_LABEL: Record<Tag, string> = {
  orders: "Orders",
  lapsing: "Lapsing",
  vip: "VIP",
  new: "New",
};

export function mauCap(plan: "free" | "basic" | "advance") {
  if (plan === "advance") return 100_000;
  if (plan === "free") return 500;
  return MAU_CAP;
}

export const FREE_REACH: Reach = {
  android: { orders: 48, lapsing: 16, vip: 6, new: 22 },
  ios: { orders: 20, lapsing: 8, vip: 4, new: 12 },
};

export const SAMPLE_DISH =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#1e2a32"/><text x="40" y="200" fill="#f6f5f2" font-size="48" font-family="Georgia,serif">Weekend thali</text></svg>',
  );

export function tagLabel(tag: Tag) {
  return TAG_LABEL[tag];
}

export function audienceLabel(audience: Audience) {
  if (audience.kind === "all") return "All devices";
  if (audience.kind === "platform") return audience.platform === "android" ? "Android" : "iOS";
  if (audience.kind === "segment") return "Segment";
  return TAG_LABEL[audience.tag];
}

export function audienceSize(reach: Reach, audience: Audience) {
  if (audience.kind === "segment") return 0;
  const platforms: Platform[] = audience.kind === "platform" ? [audience.platform] : ["android", "ios"];
  const tags: Tag[] = audience.kind === "tag" ? [audience.tag] : [...TAGS];
  let total = 0;
  for (const platform of platforms) {
    for (const tag of tags) total += reach[platform][tag];
  }
  return total;
}

export function projectDelivery(targeted: number, salt: number) {
  if (targeted <= 0) return { targeted: 0, delivered: 0, failed: 0, clicked: 0 };
  const failRate = 0.016 + (salt % 9) / 2000;
  const failed = Math.min(targeted, Math.max(1, Math.round(targeted * failRate)));
  const delivered = Math.max(0, targeted - failed);
  const clickRate = 0.07 + (salt % 6) / 200;
  const clicked = Math.round(delivered * clickRate);
  return { targeted, delivered, failed, clicked };
}

export function saltFrom(title: string) {
  let n = 0;
  for (let i = 0; i < title.length; i++) n = (n + title.charCodeAt(i) * (i + 1)) % 997;
  return n;
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 3600_000).toISOString();
}

function daysAgo(days: number, hour = 11) {
  const d = new Date();
  d.setHours(hour, 12, 0, 0);
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

export function seedSubscribers(): Subscriber[] {
  const rows: Omit<Subscriber, "behavior">[] = [
    { id: "d1", name: "Aisha Khan", userId: "usr_19f2", platform: "android", city: "Mumbai", tag: "orders", lastSeen: hoursAgo(1), status: "active" },
    { id: "d2", name: "Rohan Mehta", userId: "usr_20aa", platform: "ios", city: "Mumbai", tag: "vip", lastSeen: hoursAgo(3), status: "active" },
    { id: "d3", name: "Neha Iyer", userId: "usr_18c0", platform: "android", city: "Pune", tag: "lapsing", lastSeen: hoursAgo(26), status: "active" },
    { id: "d4", name: "Vikram Shah", userId: "usr_22e1", platform: "ios", city: "Bengaluru", tag: "orders", lastSeen: hoursAgo(5), status: "active" },
    { id: "d5", name: "Sara D'Souza", userId: "usr_17b4", platform: "android", city: "Delhi", tag: "new", lastSeen: hoursAgo(8), status: "active" },
    { id: "d6", name: "Imran Qureshi", userId: "usr_21d8", platform: "android", city: "Hyderabad", tag: "orders", lastSeen: hoursAgo(14), status: "active" },
    { id: "d7", name: "Meera Nair", userId: "usr_16a2", platform: "ios", city: "Mumbai", tag: "lapsing", lastSeen: hoursAgo(50), status: "active" },
    { id: "d8", name: "Arjun Kapoor", userId: "usr_23f0", platform: "android", city: "Jaipur", tag: "vip", lastSeen: hoursAgo(6), status: "active" },
    { id: "d9", name: "Priya Menon", userId: "usr_15e7", platform: "ios", city: "Bengaluru", tag: "new", lastSeen: hoursAgo(2), status: "active" },
    { id: "d10", name: "Kabir Anand", userId: "usr_24c3", platform: "android", city: "Delhi", tag: "lapsing", lastSeen: hoursAgo(30), status: "unregistered" },
    { id: "d11", name: "Tara Joshi", userId: "usr_19aa", platform: "ios", city: "Pune", tag: "orders", lastSeen: hoursAgo(9), status: "active" },
    { id: "d12", name: "Dev Patel", userId: "usr_25b1", platform: "android", city: "Mumbai", tag: "new", lastSeen: hoursAgo(4), status: "active" },
  ];
  return rows.map((row) => ({
    ...row,
    behavior: seedBehavior(row.userId) ?? {
      permission: row.status === "unregistered" ? "not_asked" : "allowed",
      opened: 0,
      dismissed: 0,
      sessions: 0,
      purchases: 0,
      daysSinceOpen: row.status === "unregistered" ? null : 0,
      returnedNextDay: false,
    },
  }));
}

export function seedCampaigns(): Campaign[] {
  return [
    {
      id: "c1",
      title: "Rider is 4 minutes away",
      body: "Ananya has your Metro Bites order and is turning onto your street.",
      link: "metrobites://order/4821",
      audience: { kind: "tag", tag: "orders" },
      createdAt: daysAgo(1, 19),
      ...projectDelivery(3228, 40),
      seed: true,
    },
    {
      id: "c2",
      title: "Weekend thali is back",
      body: "Saturday lunch thali is live in Mumbai and Pune until 3pm.",
      link: "",
      image: SAMPLE_DISH,
      audience: { kind: "all" },
      createdAt: daysAgo(3, 10),
      ...projectDelivery(7104, 12),
      seed: true,
    },
    {
      id: "c3",
      title: "We kept your usual",
      body: "₹80 off the bowl you ordered last month. Today only.",
      link: "metrobites://offer/winback",
      audience: { kind: "tag", tag: "lapsing" },
      createdAt: daysAgo(6, 18),
      ...projectDelivery(1480, 7),
      seed: true,
    },
    {
      id: "c4",
      title: "VIP window opens at 7",
      body: "Early access to the Andheri kitchen before the dinner rush.",
      link: "",
      audience: { kind: "tag", tag: "vip" },
      createdAt: daysAgo(9, 16),
      ...projectDelivery(712, 3),
      seed: true,
    },
    {
      id: "c5",
      title: "Welcome, here's ₹50",
      body: "Use it on your first Metro Bites order. Expires Sunday.",
      link: "metrobites://welcome",
      audience: { kind: "platform", platform: "android" },
      createdAt: daysAgo(12, 12),
      ...projectDelivery(4680, 21),
      seed: true,
    },
  ];
}

/** Delivered volume already reflected in the chart, excluding sends made in this session. */
export const HISTORY = [420, 880, 610, 1540, 390, 970, 1280, 760, 2104, 540, 860, 1430, 690, 540];

export function chartSeries(campaigns: Campaign[]) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  return HISTORY.map((base, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() - (HISTORY.length - 1 - index));
    const extra = campaigns
      .filter((c) => !c.seed && new Date(c.createdAt).toDateString() === day.toDateString())
      .reduce((sum, c) => sum + c.delivered, 0);
    return {
      label: day.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      sent: base + extra,
    };
  });
}

export function isAudience(value: unknown): value is Audience {
  if (!value || typeof value !== "object") return false;
  const v = value as Audience;
  if (v.kind === "all") return true;
  if (v.kind === "platform") return v.platform === "android" || v.platform === "ios";
  if (v.kind === "tag") return (TAGS as readonly string[]).includes(v.tag);
  if (v.kind === "segment") return typeof v.segmentId === "string" && v.segmentId.trim().length > 0 && v.segmentId.length <= 80;
  return false;
}
