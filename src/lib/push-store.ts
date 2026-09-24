import { create } from "zustand";
import {
  addBusinessUser,
  addConnection,
  addDevice as addDeviceFn,
  acceptEnterprise,
  connectToken,
  dropDevice,
  inviteMember,
  issueInvoice,
  loadAccount,
  registerEnterprise,
  removeConnection,
  removeMember,
  resetWorkspace,
  runTest,
  sendPush,
  setBusinessGrants,
  setBusinessPlan,
  setCapPreview,
  setMemberRole,
  setOwnPlan,
  updateBrand,
} from "@/lib/account-fns";
import {
  EMPTY_GRANTS,
  RIGHTS,
  type AccountPayload,
  type BusinessListRow,
  type ConnectionRow,
  type ConnectKind,
  type ConnectTarget,
  type Grants,
  type InvoiceRow,
  type MemberRow,
  type PaymentEventRow,
  type PlanId,
  type Role,
  type SeatRow,
} from "@/lib/account-types";
import { BASE_REACH, mauCap, type Campaign, type Platform, type Reach, type Subscriber, type Tag } from "@/lib/push";
import type { CampaignDraft } from "@/lib/notify";
import type { BillingMode, BillingState, WebhookSecrets, WorkspaceKind } from "@/lib/account-types";

type PushState = {
  ready: boolean;
  loadError: string;
  isSystemAdmin: boolean;
  email: string;
  userName: string;
  role: Role | null;
  rights: string[];
  members: MemberRow[];
  seats: SeatRow[];
  businesses: BusinessListRow[];
  businessId: string | null;
  businessName: string;
  logo: string;
  plan: PlanId;
  mauCap: number;
  mau: number;
  reach: Reach;
  subscribers: Subscriber[];
  campaigns: Campaign[];
  overCap: boolean;
  grants: Grants;
  connections: ConnectionRow[];
  kind: WorkspaceKind;
  billing: BillingMode;
  billingState: BillingState;
  onboarded: boolean;
  invoices: InvoiceRow[];
  paymentEvents: PaymentEventRow[];
  webhookSecrets: WebhookSecrets;
  load: () => Promise<void>;
  send: (input: CampaignDraft) => Promise<string | null>;
  addDevice: (input: { name: string; userId: string; platform: Platform; city: string; tag: Tag }) => Promise<string | null>;
  unregister: (id: string) => Promise<string | null>;
  setOverCap: (on: boolean) => Promise<string | null>;
  reset: () => Promise<string | null>;
  saveBrand: (input: { name: string; logo: string }) => Promise<string | null>;
  changePlan: (plan: PlanId) => Promise<string | null>;
  invite: (input: { email: string; role: Role }) => Promise<string | null>;
  changeRole: (input: { id: string; role: Role }) => Promise<string | null>;
  removeTeammate: (id: string) => Promise<string | null>;
  addBusiness: (input: { businessName: string; email: string; plan: PlanId }) => Promise<string | null>;
  changeBusinessPlan: (input: { id: string; plan: PlanId }) => Promise<string | null>;
  setGrants: (input: { id: string; sdk: boolean; webhook: boolean; test: boolean }) => Promise<string | null>;
  addLink: (input: { kind: ConnectKind; target: ConnectTarget; name: string; endpoint: string }) => Promise<string | null>;
  removeLink: (id: string) => Promise<string | null>;
  testRun: (input: { connectionId: string; title: string; body: string; link: string }) => Promise<string | null>;
  registerEnterprise: (input: { businessName: string; contact: string; email: string; plan: PlanId }) => Promise<string | null>;
  acceptTerms: () => Promise<string | null>;
  issueBill: (id: string) => Promise<string | null>;
  connectToken: (input: { platform: Platform; token: string; name: string }) => Promise<string | null>;
};

function fromAccount(account: AccountPayload) {
  const business = account.business;
  return {
    ready: true,
    loadError: "",
    isSystemAdmin: account.isSystemAdmin,
    email: account.email,
    userName: account.name,
    role: account.role,
    rights: account.role ? [...RIGHTS[account.role]] : [],
    members: account.members,
    seats: account.seats,
    businesses: account.businesses,
    businessId: business?.id ?? null,
    businessName: business?.name ?? "",
    logo: business?.logo ?? "",
    plan: business?.plan ?? "basic",
    mauCap: mauCap(business?.plan ?? "basic"),
    mau: business?.mau ?? 0,
    reach: business?.reach ?? structuredClone(BASE_REACH),
    subscribers: business?.subscribers ?? [],
    campaigns: business?.campaigns ?? [],
    overCap: business?.overCap ?? false,
    grants: business?.grants ?? EMPTY_GRANTS,
    connections: business?.connections ?? [],
    kind: business?.kind ?? "self",
    billing: business?.billing ?? "recorded",
    billingState: business?.billingState ?? "active",
    onboarded: business?.onboarded ?? true,
    invoices: account.invoices.length ? account.invoices : (business?.invoices ?? []),
    paymentEvents: account.paymentEvents,
    webhookSecrets: account.webhookSecrets,
  };
}

async function apply(run: () => Promise<AccountPayload>) {
  try {
    usePush.setState(fromAccount(await run()));
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : "Something went wrong.";
  }
}

export const usePush = create<PushState>((set) => ({
  ready: false,
  loadError: "",
  isSystemAdmin: false,
  email: "",
  userName: "",
  role: null,
  rights: [],
  members: [],
  seats: [],
  businesses: [],
  businessId: null,
  businessName: "",
  logo: "",
  plan: "basic",
  mauCap: mauCap("basic"),
  mau: 0,
  reach: structuredClone(BASE_REACH),
  subscribers: [],
  campaigns: [],
  overCap: false,
  grants: EMPTY_GRANTS,
  connections: [],
  kind: "self",
  billing: "recorded",
  billingState: "active",
  onboarded: true,
  invoices: [],
  paymentEvents: [],
  webhookSecrets: { stripe: "", skydo: "" },
  load: async () => {
    try {
      set(fromAccount(await loadAccount()));
    } catch (error) {
      set({ ready: true, loadError: error instanceof Error ? error.message : "Could not load the workspace." });
    }
  },
  send: (input) => apply(() => sendPush({ data: input })),
  addDevice: (input) => apply(() => addDeviceFn({ data: input })),
  unregister: (id) => apply(() => dropDevice({ data: id })),
  setOverCap: (on) => apply(() => setCapPreview({ data: on })),
  reset: () => apply(() => resetWorkspace()),
  saveBrand: (input) => apply(() => updateBrand({ data: input })),
  changePlan: (plan) => apply(() => setOwnPlan({ data: plan })),
  invite: (input) => apply(() => inviteMember({ data: input })),
  changeRole: (input) => apply(() => setMemberRole({ data: input })),
  removeTeammate: (id) => apply(() => removeMember({ data: id })),
  addBusiness: (input) => apply(() => addBusinessUser({ data: input })),
  changeBusinessPlan: (input) => apply(() => setBusinessPlan({ data: input })),
  setGrants: (input) => apply(() => setBusinessGrants({ data: input })),
  addLink: (input) => apply(() => addConnection({ data: input })),
  removeLink: (id) => apply(() => removeConnection({ data: id })),
  testRun: (input) => apply(() => runTest({ data: input })),
  registerEnterprise: (input) => apply(() => registerEnterprise({ data: input })),
  acceptTerms: () => apply(() => acceptEnterprise()),
  issueBill: (id) => apply(() => issueInvoice({ data: id })),
  connectToken: (input) => apply(() => connectToken({ data: input })),
}));
