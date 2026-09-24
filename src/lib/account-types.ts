import type { Campaign, Reach, Subscriber } from "@/lib/push";
import type { SavedSegment } from "@/lib/behavior";

export const ROLES = ["owner", "developer", "marketer", "analyst", "viewer"] as const;
export type Role = (typeof ROLES)[number];
export type PlanId = "free" | "basic" | "advance";
export type WorkspaceKind = "self" | "enterprise";
export type BillingMode = "recorded" | "pay_per_use";
export type BillingState = "active" | "past_due";

export type PaymentEventRow = {
  id: string;
  provider: string;
  eventType: string;
  email: string;
  plan: string;
  amountPaise: number;
  status: string;
  detail: string;
};

export type WebhookSecrets = { stripe: string; skydo: string };

export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  developer: "Developer",
  marketer: "Marketer",
  analyst: "Analyst",
  viewer: "Viewer",
};

export const RIGHTS: Record<Role, readonly string[]> = {
  owner: ["send", "devices", "devices_edit", "activity", "plan", "plan_edit", "team", "brand", "connect", "test"],
  developer: ["connect", "test", "activity", "devices"],
  marketer: ["send", "devices", "devices_edit", "activity"],
  analyst: ["devices", "activity", "plan"],
  viewer: ["activity"],
};

export const RIGHT_ROWS: { id: string; label: string }[] = [
  { id: "send", label: "Send push, image, video, deep link" },
  { id: "devices", label: "User path analytics" },
  { id: "devices_edit", label: "Register a test device" },
  { id: "activity", label: "Delivery log and campaign analytics" },
  { id: "plan", label: "MAU and subscription" },
  { id: "plan_edit", label: "Change plan" },
  { id: "team", label: "Invite the team and set roles" },
  { id: "brand", label: "Update name and logo" },
  { id: "connect", label: "Add an SDK or webhook" },
  { id: "test", label: "Run a test push" },
];

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function isPlan(value: string): value is PlanId {
  return value === "free" || value === "basic" || value === "advance";
}

export function planLabel(plan: PlanId) {
  if (plan === "advance") return "Advance";
  if (plan === "free") return "Free";
  return "Basic";
}

export function nextPlan(plan: PlanId): PlanId {
  if (plan === "free") return "basic";
  if (plan === "basic") return "advance";
  return "free";
}

export type MemberRow = {
  id: string;
  email: string;
  name: string;
  role: Role;
  pending: boolean;
};

export type SeatRow = {
  id: string;
  businessName: string;
  email: string;
  plan: PlanId;
  waiting: boolean;
  kind: WorkspaceKind;
};

export type InvoiceRow = {
  id: string;
  businessId: string;
  businessName: string;
  periodLabel: string;
  plan: PlanId;
  mau: number;
  includedMau: number;
  basePaise: number;
  overagePaise: number;
  totalPaise: number;
  status: string;
};

export type Grants = { sdk: boolean; webhook: boolean; test: boolean };

export const EMPTY_GRANTS: Grants = { sdk: false, webhook: false, test: false };

export type ConnectTarget = "android" | "ios" | "web";
export type ConnectKind = "sdk" | "webhook";

export type ConnectionRow = {
  id: string;
  kind: ConnectKind;
  target: ConnectTarget;
  name: string;
  endpoint: string;
  appKey: string;
};

export type OwnerToken = {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  userId: string;
  platform: "android" | "ios";
  tokenTail: string;
};

export type BusinessListRow = {
  id: string;
  name: string;
  plan: PlanId;
  ownerEmail: string;
  logo: string;
  grants: Grants;
  kind: WorkspaceKind;
  billing: BillingMode;
  billingState: BillingState;
  onboarded: boolean;
  mau: number;
};

export type BusinessSlice = {
  id: string;
  name: string;
  logo: string;
  plan: PlanId;
  mau: number;
  overCap: boolean;
  reach: Reach;
  subscribers: Subscriber[];
  campaigns: Campaign[];
  segments: SavedSegment[];
  grants: Grants;
  connections: ConnectionRow[];
  kind: WorkspaceKind;
  billing: BillingMode;
  billingState: BillingState;
  onboarded: boolean;
  invoices: InvoiceRow[];
};

export type SystemLogRow = {
  id: string;
  action: string;
  businessName: string;
  detail: string;
  createdAt: string;
};

export type AccountPayload = {
  isSystemAdmin: boolean;
  email: string;
  name: string;
  role: Role | null;
  members: MemberRow[];
  seats: SeatRow[];
  businesses: BusinessListRow[];
  tokens: OwnerToken[];
  logs: SystemLogRow[];
  business: BusinessSlice | null;
  invoices: InvoiceRow[];
  paymentEvents: PaymentEventRow[];
  webhookSecrets: WebhookSecrets;
};
