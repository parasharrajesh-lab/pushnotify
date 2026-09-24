import { createHmac } from "node:crypto";
import { isPlan, type PlanId } from "./account-types.ts";
import { DEMO_SKYDO_SECRET, DEMO_STRIPE_SECRET } from "./owner-access.ts";

export { DEMO_SKYDO_SECRET, DEMO_STRIPE_SECRET };

export function hmacSha256Hex(secret: string, message: string) {
  return createHmac("sha256", secret).update(message).digest("hex");
}

export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function stripeSignatureHeader(raw: string, secret: string, timestamp = Math.floor(Date.now() / 1000)) {
  const v1 = hmacSha256Hex(secret, `${timestamp}.${raw}`);
  return `t=${timestamp},v1=${v1}`;
}

export function verifyStripeSignature(raw: string, header: string, secret: string, now = Date.now()) {
  if (!secret) return "Stripe webhook secret is not set.";
  const parts = new Map<string, string>();
  for (const piece of header.split(",")) {
    const index = piece.indexOf("=");
    if (index > 0) parts.set(piece.slice(0, index), piece.slice(index + 1));
  }
  const timestamp = parts.get("t") ?? "";
  const signature = parts.get("v1") ?? "";
  const seconds = Number(timestamp);
  if (!timestamp || !signature || !Number.isFinite(seconds)) return "Stripe signature is missing.";
  if (Math.abs(now / 1000 - seconds) > 300) return "Stripe signature is too old.";
  const expected = hmacSha256Hex(secret, `${timestamp}.${raw}`);
  if (!safeEqual(expected, signature)) return "Stripe signature does not match.";
  return null;
}

export function skydoSignature(raw: string, secret: string) {
  return hmacSha256Hex(secret, raw);
}

export function verifySkydoSignature(raw: string, header: string, secret: string) {
  if (!secret) return "Skydo webhook secret is not set.";
  const signature = header.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(signature)) return "Skydo signature is missing.";
  const expected = skydoSignature(raw, secret);
  if (!safeEqual(expected, signature)) return "Skydo signature does not match.";
  return null;
}

export function planFromAmount(amount: number, currency: string): PlanId | null {
  const code = currency.trim().toLowerCase();
  const value = Math.round(amount);
  if (!Number.isFinite(value) || value < 0) return null;
  if (code === "usd") {
    if (value === 0) return "free";
    if (value === 59 || value === 5900) return "basic";
    if (value === 299 || value === 29900) return "advance";
    return null;
  }
  if (value === 0) return "free";
  if (value === 4999 || value === 499900) return "basic";
  if (value === 24999 || value === 2499900) return "advance";
  return null;
}

export type PaymentDecision = {
  eventId: string;
  eventType: string;
  email: string;
  plan: PlanId | null;
  billingState: "active" | "past_due" | null;
  amountPaise: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberOf(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function explicitPlan(value: unknown): PlanId | null {
  const plan = text(value).toLowerCase();
  return isPlan(plan) ? plan : null;
}

export function decideStripe(body: unknown): PaymentDecision | { error: string } {
  const event = asRecord(body);
  const id = text(event?.id);
  const type = text(event?.type);
  if (!id || !type) return { error: "Stripe event needs an id and a type." };
  const data = asRecord(event?.data);
  const object = asRecord(data?.object) ?? {};
  const metadata = asRecord(object.metadata) ?? {};
  const email = text(object.customer_email) || text(asRecord(object.customer_details)?.email) || text(metadata.email);
  const named = explicitPlan(metadata.plan);
  const currency = text(object.currency) || "inr";
  const amount = numberOf(object.amount_total) || numberOf(object.amount_paid);
  if (type === "customer.subscription.deleted") {
    return { eventId: id, eventType: type, email, plan: "free", billingState: "active", amountPaise: 0 };
  }
  if (type === "invoice.payment_failed") {
    return { eventId: id, eventType: type, email, plan: null, billingState: "past_due", amountPaise: amount };
  }
  if (type === "checkout.session.completed" || type === "invoice.paid" || type === "customer.subscription.updated") {
    const status = text(object.status);
    if (type === "customer.subscription.updated" && (status === "past_due" || status === "unpaid")) {
      return { eventId: id, eventType: type, email, plan: named, billingState: "past_due", amountPaise: amount };
    }
    const plan = named ?? planFromAmount(amount, currency);
    if (!plan) return { error: "This Stripe payment does not match Free, Basic, or Advance." };
    return { eventId: id, eventType: type, email, plan, billingState: "active", amountPaise: amount };
  }
  return { eventId: id, eventType: type, email, plan: null, billingState: null, amountPaise: 0 };
}

export function decideSkydo(body: unknown): PaymentDecision | { error: string } {
  const event = asRecord(body);
  const id = text(event?.id);
  const type = text(event?.event).toLowerCase();
  if (!id || !type) return { error: "Skydo event needs an id and an event name." };
  const email = text(event?.payer_email) || text(event?.email);
  const named = explicitPlan(event?.plan) ?? explicitPlan(event?.reference);
  const currency = text(event?.currency) || "INR";
  const amount = numberOf(event?.amount);
  if (type === "payment.failed" || type === "payment.cancelled") {
    return { eventId: id, eventType: type, email, plan: null, billingState: "past_due", amountPaise: 0 };
  }
  if (type === "payment.settled" || type === "payment.received") {
    const plan = named ?? planFromAmount(amount, currency);
    if (!plan) return { error: "This Skydo payment does not match Free, Basic, or Advance." };
    const code = currency.toLowerCase();
    const amountPaise = code === "inr" && amount < 100_000 ? Math.round(amount * 100) : code === "inr" ? Math.round(amount) : 0;
    return { eventId: id, eventType: type, email, plan, billingState: "active", amountPaise: plan === "free" ? 0 : amountPaise };
  }
  return { eventId: id, eventType: type, email, plan: null, billingState: null, amountPaise: 0 };
}
