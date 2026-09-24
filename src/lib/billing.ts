import { RIGHTS, type PlanId, type Role, type BillingMode, type WorkspaceKind } from "./account-types.ts";

export type { BillingMode, WorkspaceKind };

export type PlanRate = {
  name: string;
  basePaise: number;
  includedMau: number;
  overagePaise: number;
};

export const PLAN_RATES: Record<PlanId, PlanRate> = {
  free: { name: "Free", basePaise: 0, includedMau: 500, overagePaise: 0 },
  basic: { name: "Basic", basePaise: 499_900, includedMau: 10_000, overagePaise: 80 },
  advance: { name: "Advance", basePaise: 2_499_900, includedMau: 100_000, overagePaise: 40 },
};

export type BillQuote = {
  plan: PlanId;
  mau: number;
  includedMau: number;
  extra: number;
  basePaise: number;
  overagePaise: number;
  totalPaise: number;
};

export function quoteUsage(plan: PlanId, mau: number): BillQuote {
  const rate = PLAN_RATES[plan];
  const used = Math.max(0, Math.floor(mau));
  const extra = plan === "free" ? 0 : Math.max(0, used - rate.includedMau);
  const overagePaise = extra * rate.overagePaise;
  return {
    plan,
    mau: used,
    includedMau: rate.includedMau,
    extra,
    basePaise: rate.basePaise,
    overagePaise,
    totalPaise: rate.basePaise + overagePaise,
  };
}

export function formatInr(paise: number) {
  const rupees = paise / 100;
  const whole = Number.isInteger(rupees);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: whole ? 0 : 2,
    minimumFractionDigits: whole ? 0 : 2,
  }).format(rupees);
}

export function periodLabel(date = new Date()) {
  return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export function checkPushToken(platform: "android" | "ios", token: string) {
  const value = token.trim();
  if (platform === "ios") {
    if (!/^[0-9a-fA-F]{64}$/.test(value)) return "An iOS token is 64 hexadecimal characters.";
    return null;
  }
  if (value.length < 80 || value.length > 4096 || !/^[A-Za-z0-9_:\-]+$/.test(value) || !value.includes(":")) {
    return "An Android token is an FCM registration string with a colon.";
  }
  return null;
}

export function invitesAllowed(plan: PlanId) {
  if (plan === "free") return "Team invites start on Basic.";
  return null;
}

export function sendsAllowed(input: {
  plan: PlanId;
  mau: number;
  overCap: boolean;
  kind: WorkspaceKind;
  onboarded: boolean;
  video: boolean;
  billingState?: "active" | "past_due";
}) {
  if (input.kind === "enterprise" && !input.onboarded) return "Finish enterprise onboarding before sending.";
  if (input.billingState === "past_due") return "Payment failed. Sends stay paused until Stripe or Skydo settles.";
  if (input.video && input.plan !== "advance") return "Video is included on Advance.";
  const cap = PLAN_RATES[input.plan].includedMau;
  if (input.overCap || input.mau >= cap) return "This plan's MAU cap is full. Sends are paused.";
  return null;
}

export type LogicCheck = { name: string; pass: boolean; detail: string };

export function runLogicChecks(): LogicCheck[] {
  const basicFull = quoteUsage("basic", 10_000);
  const basicOver = quoteUsage("basic", 10_001);
  const advanceFull = quoteUsage("advance", 100_000);
  const advanceOver = quoteUsage("advance", 100_500);
  const ios = "ab".repeat(32);
  const android = `cDemo:APA91b${"A".repeat(80)}`;
  const checks: { name: string; pass: boolean; detail: string }[] = [
    {
      name: "Basic inside the cap",
      pass: basicFull.extra === 0 && basicFull.totalPaise === PLAN_RATES.basic.basePaise,
      detail: "10,000 MAU bills only the ₹4,999 base.",
    },
    {
      name: "Basic pay per use",
      pass: basicOver.extra === 1 && basicOver.overagePaise === 80,
      detail: "Each MAU past 10,000 adds ₹0.80.",
    },
    {
      name: "Advance inside the cap",
      pass: advanceFull.extra === 0 && advanceFull.totalPaise === PLAN_RATES.advance.basePaise,
      detail: "100,000 MAU bills only the ₹24,999 base.",
    },
    {
      name: "Advance pay per use",
      pass: advanceOver.extra === 500 && advanceOver.overagePaise === 20_000,
      detail: "500 extra MAU on Advance is ₹200.",
    },
    {
      name: "Enterprise uses the plan rate",
      pass: quoteUsage("advance", 100_500).totalPaise === PLAN_RATES.advance.basePaise + 20_000,
      detail: "There is no third price. Enterprise follows Basic or Advance.",
    },
    {
      name: "iOS token",
      pass: checkPushToken("ios", ios) === null && checkPushToken("ios", ios.slice(1)) !== null,
      detail: "APNs tokens are 64 hex characters.",
    },
    {
      name: "Android token",
      pass: checkPushToken("android", android) === null && checkPushToken("android", "short") !== null,
      detail: "FCM tokens are long and include a colon.",
    },
    {
      name: "Enterprise must onboard",
      pass: sendsAllowed({ plan: "basic", mau: 10, overCap: false, kind: "enterprise", onboarded: false, video: false }) !== null,
      detail: "Sends stay closed until the enterprise accepts pay-per-use.",
    },
    {
      name: "Cap pauses sends",
      pass: sendsAllowed({ plan: "basic", mau: 10_000, overCap: false, kind: "self", onboarded: true, video: false }) !== null,
      detail: "A full MAU cap blocks the next broadcast.",
    },
    {
      name: "Video is Advance only",
      pass:
        sendsAllowed({ plan: "basic", mau: 10, overCap: false, kind: "self", onboarded: true, video: true }) !== null &&
        sendsAllowed({ plan: "advance", mau: 10, overCap: false, kind: "self", onboarded: true, video: true }) === null,
      detail: "Basic rejects a video payload.",
    },
    {
      name: "Owner and developer rights",
      pass: RIGHTS.owner.includes("plan_edit") && RIGHTS.developer.includes("connect") && !RIGHTS.developer.includes("team"),
      detail: "The owner manages the plan. A developer can connect, not invite.",
    },
    {
      name: "Viewer cannot send",
      pass: !(RIGHTS.viewer as readonly string[]).includes("send") && (RIGHTS.marketer as readonly string[]).includes("send"),
      detail: "A viewer reads activity. A marketer can send.",
    },
    {
      name: "Free cap",
      pass:
        sendsAllowed({ plan: "free", mau: 120, overCap: false, kind: "self", onboarded: true, video: false }) === null &&
        sendsAllowed({ plan: "free", mau: 500, overCap: false, kind: "self", onboarded: true, video: false }) !== null,
      detail: "Free includes 500 MAU. The next send pauses at the cap. There is no overage charge.",
    },
    {
      name: "Free price",
      pass: quoteUsage("free", 500).totalPaise === 0 && quoteUsage("free", 800).overagePaise === 0,
      detail: "Free stays at ₹0 even past the cap.",
    },
    {
      name: "Free cannot send video or invite",
      pass: sendsAllowed({ plan: "free", mau: 10, overCap: false, kind: "self", onboarded: true, video: true }) !== null && invitesAllowed("free") !== null && invitesAllowed("basic") === null,
      detail: "Video stays on Advance. Team invites start on Basic.",
    },
    {
      name: "Failed payment pauses sends",
      pass: sendsAllowed({ plan: "basic", mau: 10, overCap: false, kind: "self", onboarded: true, video: false, billingState: "past_due" }) !== null,
      detail: "A failed Stripe or Skydo payment pauses sends until the next settled payment.",
    },
  ];
  const roles: Role[] = ["owner", "developer", "marketer", "analyst", "viewer"];
  if (roles.some((role) => RIGHTS[role].includes("send") && role === "viewer")) {
    checks.push({ name: "Viewer send leak", pass: false, detail: "Viewer gained send." });
  }
  return checks;
}
