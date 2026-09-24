export type Permission = "not_asked" | "denied" | "allowed" | "provisional" | "ephemeral";
export type GoalMetric = "opened" | "returned_next_day" | "sessions" | "purchases";
export type NumericBehavior = "opened" | "dismissed" | "sessions" | "purchases" | "days_since_open";
export type Compare = "at_least" | "at_most";

export type Behavior = {
  permission: Permission;
  opened: number;
  dismissed: number;
  sessions: number;
  purchases: number;
  daysSinceOpen: number | null;
  returnedNextDay: boolean;
};

export type SegmentRule =
  | { behavior: "permission"; value: Permission }
  | { behavior: "returned_next_day"; value: boolean }
  | { behavior: NumericBehavior; op: Compare; value: number };

export type SegmentDraft = {
  id?: string;
  name: string;
  rules: SegmentRule[];
};

export type SavedSegment = {
  id: string;
  name: string;
  rules: SegmentRule[];
  updatedAt: string;
};

export const PERMISSIONS: Permission[] = ["not_asked", "denied", "allowed", "provisional", "ephemeral"];
export const GOAL_METRICS: GoalMetric[] = ["opened", "returned_next_day", "sessions", "purchases"];
export const NUMERIC_BEHAVIORS: NumericBehavior[] = ["opened", "dismissed", "sessions", "purchases", "days_since_open"];

const PERMISSION_LABEL: Record<Permission, string> = {
  not_asked: "Not asked",
  denied: "Denied",
  allowed: "Allowed",
  provisional: "Provisional",
  ephemeral: "Ephemeral",
};

const GOAL_LABEL: Record<GoalMetric, string> = {
  opened: "Opened the notification",
  returned_next_day: "Returned the next day",
  sessions: "Started a session",
  purchases: "Made a purchase",
};

const BEHAVIOR_LABEL: Record<SegmentRule["behavior"], string> = {
  permission: "Permission",
  opened: "Notification opened",
  dismissed: "Notification dismissed",
  returned_next_day: "Returned the next day",
  sessions: "Sessions",
  purchases: "Purchases",
  days_since_open: "Days since last open",
};

export function permissionLabel(value: Permission) {
  return PERMISSION_LABEL[value];
}

export function goalLabel(metric: GoalMetric) {
  return GOAL_LABEL[metric];
}

export function behaviorLabel(behavior: SegmentRule["behavior"]) {
  return BEHAVIOR_LABEL[behavior];
}

export function isPermission(value: unknown): value is Permission {
  return typeof value === "string" && (PERMISSIONS as readonly string[]).includes(value);
}

export function isGoalMetric(value: unknown): value is GoalMetric {
  return typeof value === "string" && (GOAL_METRICS as readonly string[]).includes(value);
}

export function isNumericBehavior(value: unknown): value is NumericBehavior {
  return typeof value === "string" && (NUMERIC_BEHAVIORS as readonly string[]).includes(value);
}

export function canReceivePush(permission: Permission) {
  return permission === "allowed" || permission === "provisional" || permission === "ephemeral";
}

export function defaultBehavior(status: "active" | "unregistered"): Behavior {
  if (status === "unregistered") {
    return { permission: "not_asked", opened: 0, dismissed: 0, sessions: 0, purchases: 0, daysSinceOpen: null, returnedNextDay: false };
  }
  return { permission: "allowed", opened: 0, dismissed: 0, sessions: 1, purchases: 0, daysSinceOpen: 1, returnedNextDay: false };
}

export function connectedBehavior(): Behavior {
  return { permission: "allowed", opened: 0, dismissed: 0, sessions: 0, purchases: 0, daysSinceOpen: 0, returnedNextDay: false };
}

const SEED: Record<string, Behavior> = {
  usr_19f2: { permission: "allowed", opened: 4, dismissed: 0, sessions: 6, purchases: 2, daysSinceOpen: 0, returnedNextDay: true },
  usr_20aa: { permission: "allowed", opened: 2, dismissed: 1, sessions: 3, purchases: 1, daysSinceOpen: 0, returnedNextDay: true },
  usr_18c0: { permission: "allowed", opened: 0, dismissed: 2, sessions: 0, purchases: 0, daysSinceOpen: 8, returnedNextDay: false },
  usr_22e1: { permission: "provisional", opened: 1, dismissed: 0, sessions: 2, purchases: 0, daysSinceOpen: 1, returnedNextDay: false },
  usr_17b4: { permission: "allowed", opened: 1, dismissed: 0, sessions: 4, purchases: 0, daysSinceOpen: 0, returnedNextDay: true },
  usr_21d8: { permission: "allowed", opened: 3, dismissed: 1, sessions: 5, purchases: 1, daysSinceOpen: 0, returnedNextDay: true },
  usr_16a2: { permission: "denied", opened: 0, dismissed: 0, sessions: 0, purchases: 0, daysSinceOpen: 20, returnedNextDay: false },
  usr_23f0: { permission: "allowed", opened: 5, dismissed: 0, sessions: 7, purchases: 3, daysSinceOpen: 0, returnedNextDay: true },
  usr_15e7: { permission: "ephemeral", opened: 0, dismissed: 0, sessions: 1, purchases: 0, daysSinceOpen: 0, returnedNextDay: false },
  usr_24c3: { permission: "not_asked", opened: 0, dismissed: 0, sessions: 0, purchases: 0, daysSinceOpen: null, returnedNextDay: false },
  usr_19aa: { permission: "allowed", opened: 2, dismissed: 0, sessions: 2, purchases: 1, daysSinceOpen: 1, returnedNextDay: true },
  usr_25b1: { permission: "allowed", opened: 0, dismissed: 1, sessions: 1, purchases: 0, daysSinceOpen: 2, returnedNextDay: false },
};

export function seedBehavior(userId: string) {
  return SEED[userId] ?? null;
}

export function starterSegments(): { name: string; rules: SegmentRule[] }[] {
  return [
    { name: "Opened this week", rules: [{ behavior: "opened", op: "at_least", value: 1 }] },
    { name: "Away for a week", rules: [{ behavior: "days_since_open", op: "at_least", value: 7 }] },
  ];
}

export function parseBehavior(raw: string, status: "active" | "unregistered", userId = ""): Behavior {
  const seeded = raw.trim() ? null : seedBehavior(userId);
  if (seeded) return seeded;
  if (!raw.trim()) return defaultBehavior(status);
  try {
    const parsed = JSON.parse(raw) as Partial<Behavior>;
    if (!isPermission(parsed.permission)) return defaultBehavior(status);
    return {
      permission: parsed.permission,
      opened: count(parsed.opened, 500),
      dismissed: count(parsed.dismissed, 500),
      sessions: count(parsed.sessions, 500),
      purchases: count(parsed.purchases, 500),
      daysSinceOpen: parsed.daysSinceOpen == null ? null : count(parsed.daysSinceOpen, 365),
      returnedNextDay: Boolean(parsed.returnedNextDay),
    };
  } catch {
    return defaultBehavior(status);
  }
}

function count(value: unknown, max: number) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(max, n);
}

export function isSegmentRule(value: unknown): value is SegmentRule {
  if (!value || typeof value !== "object") return false;
  const rule = value as SegmentRule;
  if (rule.behavior === "permission") return isPermission(rule.value);
  if (rule.behavior === "returned_next_day") return typeof rule.value === "boolean";
  if (!isNumericBehavior(rule.behavior)) return false;
  if (rule.op !== "at_least" && rule.op !== "at_most") return false;
  return Number.isInteger(rule.value) && rule.value >= 0 && rule.value <= capFor(rule.behavior);
}

function capFor(behavior: NumericBehavior) {
  return behavior === "days_since_open" ? 365 : 500;
}

export function segmentError(draft: SegmentDraft) {
  const name = draft.name.trim();
  if (name.length < 2 || name.length > 40) return "Name should be 2–40 characters.";
  if (!Array.isArray(draft.rules) || draft.rules.length < 1 || draft.rules.length > 4) return "Use 1 to 4 behaviors.";
  const seen = new Set<string>();
  for (const rule of draft.rules) {
    if (!isSegmentRule(rule)) return "Check the behavior rule.";
    if (seen.has(rule.behavior)) return "Use each behavior once.";
    seen.add(rule.behavior);
  }
  return null;
}

export function matchesRule(behavior: Behavior, rule: SegmentRule) {
  if (rule.behavior === "permission") return behavior.permission === rule.value;
  if (rule.behavior === "returned_next_day") return behavior.returnedNextDay === rule.value;
  const amount = rule.behavior === "days_since_open" ? behavior.daysSinceOpen : behavior[rule.behavior];
  if (amount == null) return false;
  return rule.op === "at_least" ? amount >= rule.value : amount <= rule.value;
}

export function matchesAll(behavior: Behavior, rules: SegmentRule[]) {
  return rules.every((rule) => matchesRule(behavior, rule));
}

export function canSeeMessage(behavior: Behavior, channel: "push" | "inapp", layout: "lock" | "banner" | "modal" | "primer") {
  if (layout === "primer") return behavior.permission === "not_asked";
  if (channel === "push") return canReceivePush(behavior.permission);
  return true;
}

export function estimateReach(total: number, known: number, eligible: number) {
  if (total <= 0 || known <= 0 || eligible <= 0) return 0;
  return Math.max(eligible, Math.round((total * eligible) / known));
}

export function meetsGoal(behavior: Behavior, metric: GoalMetric) {
  if (metric === "opened") return canReceivePush(behavior.permission) && behavior.opened >= 1;
  if (metric === "returned_next_day") return behavior.returnedNextDay;
  if (metric === "sessions") return behavior.sessions >= 1;
  return behavior.purchases >= 1;
}

export function projectGoal(people: Behavior[], metric: GoalMetric, delivered: number) {
  if (delivered <= 0 || people.length === 0) return 0;
  const hits = people.filter((person) => meetsGoal(person, metric)).length;
  return Math.min(delivered, Math.round((delivered * hits) / people.length));
}

export function describeRule(rule: SegmentRule) {
  if (rule.behavior === "permission") return `Permission is ${permissionLabel(rule.value).toLowerCase()}`;
  if (rule.behavior === "returned_next_day") return rule.value ? "Returned the next day" : "Did not return the next day";
  const op = rule.op === "at_least" ? "at least" : "at most";
  const window = rule.behavior === "purchases" ? " in 30 days" : rule.behavior === "days_since_open" ? "" : " in 7 days";
  return `${behaviorLabel(rule.behavior)} ${op} ${rule.value}${window}`;
}

export function behaviorSummary(behavior: Behavior) {
  const days = behavior.daysSinceOpen == null ? "never opened" : `${behavior.daysSinceOpen}d since open`;
  return `${permissionLabel(behavior.permission)} · ${behavior.opened} opens · ${behavior.sessions} sessions · ${behavior.purchases} purchases · ${days}`;
}

export const APP_EVENTS = [
  "session_start",
  "first_open",
  "screen_view",
  "notification_receive",
  "notification_open",
  "notification_dismiss",
  "purchase",
] as const;

export const IOS_EVENTS = ["authorized", "provisional", "ephemeral", "denied", "not_determined"] as const;

export type BehaviorAttribute = (typeof APP_EVENTS)[number] | (typeof IOS_EVENTS)[number];

const ATTRIBUTE_LABEL: Record<BehaviorAttribute, string> = {
  session_start: "session_start",
  first_open: "first_open",
  screen_view: "screen_view",
  notification_receive: "notification_receive",
  notification_open: "notification_open",
  notification_dismiss: "notification_dismiss",
  purchase: "purchase",
  authorized: "authorized",
  provisional: "provisional",
  ephemeral: "ephemeral",
  denied: "denied",
  not_determined: "notDetermined",
};

export function attributeLabel(attribute: BehaviorAttribute) {
  return ATTRIBUTE_LABEL[attribute];
}

export function isBehaviorAttribute(value: unknown): value is BehaviorAttribute {
  return typeof value === "string" && (value in ATTRIBUTE_LABEL);
}

export function attributeError(attributes: BehaviorAttribute[]) {
  if (attributes.length > 4) return "Use up to 4 behavior attributes.";
  const permissions = attributes.filter((item) => (IOS_EVENTS as readonly string[]).includes(item));
  if (permissions.length > 1) return "A device has one notification permission. Pick only one.";
  return null;
}

export function matchesAttribute(behavior: Behavior, attribute: BehaviorAttribute) {
  if (attribute === "session_start") return behavior.sessions >= 1;
  if (attribute === "first_open") return behavior.sessions >= 1 && behavior.daysSinceOpen === 0;
  if (attribute === "screen_view") return behavior.sessions >= 1 && behavior.daysSinceOpen !== null;
  if (attribute === "notification_receive") return canReceivePush(behavior.permission);
  if (attribute === "notification_open") return behavior.opened >= 1;
  if (attribute === "notification_dismiss") return behavior.dismissed >= 1;
  if (attribute === "purchase") return behavior.purchases >= 1;
  if (attribute === "authorized") return behavior.permission === "allowed";
  if (attribute === "provisional") return behavior.permission === "provisional";
  if (attribute === "ephemeral") return behavior.permission === "ephemeral";
  if (attribute === "denied") return behavior.permission === "denied";
  return behavior.permission === "not_asked";
}

export function matchesAttributes(behavior: Behavior, attributes: BehaviorAttribute[]) {
  return attributes.every((attribute) => matchesAttribute(behavior, attribute));
}
