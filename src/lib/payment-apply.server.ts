import { isPlan, type PlanId } from "@/lib/account-types";
import { periodLabel } from "@/lib/billing";
import { getSql, type Sql } from "@/lib/db";
import { writeSystemLog } from "@/lib/system-log";
import {
  DEMO_SKYDO_SECRET,
  DEMO_STRIPE_SECRET,
  decideSkydo,
  decideStripe,
  skydoSignature,
  stripeSignatureHeader,
  verifySkydoSignature,
  verifyStripeSignature,
  type PaymentDecision,
} from "@/lib/payments";

async function settings(sql: Sql) {
  await sql`
    insert into platform_settings (id, stripe_secret, skydo_secret)
    values ('default', ${DEMO_STRIPE_SECRET}, ${DEMO_SKYDO_SECRET})
    on conflict (id) do nothing
  `;
  const rows = await sql<{ stripe_secret: string; skydo_secret: string }>`
    select stripe_secret, skydo_secret from platform_settings where id = 'default' limit 1
  `;
  return rows[0] ?? { stripe_secret: DEMO_STRIPE_SECRET, skydo_secret: DEMO_SKYDO_SECRET };
}

async function applyDecision(sql: Sql, provider: "stripe" | "skydo", decision: PaymentDecision) {
  const seen = await sql<{ id: string }>`
    select id from payment_events where provider = ${provider} and event_id = ${decision.eventId} limit 1
  `;
  if (seen[0]) return { received: true, duplicate: true };
  if (!decision.email) {
    await record(sql, provider, decision, "ignored", "No customer email on the event.");
    return { received: true, matched: false };
  }
  const owners = await sql<{ id: string; mau: number }>`
    select b.id, b.mau
    from businesses b
    join memberships m on m.business_id = b.id and m.role = 'owner'
    join "user" u on u.id = m.user_id
    where lower(u.email) = ${decision.email.toLowerCase()}
    limit 1
  `;
  const business = owners[0];
  if (!business) {
    await record(sql, provider, decision, "unmatched", "No workspace owner uses that email.");
    return { received: true, matched: false };
  }
  if (decision.plan) {
    await sql`update businesses set plan = ${decision.plan} where id = ${business.id}`;
  }
  if (decision.billingState) {
    await sql`update businesses set billing_state = ${decision.billingState} where id = ${business.id}`;
  }
  if (decision.billingState === "active" && decision.plan && decision.plan !== "free" && decision.amountPaise > 0) {
    const label = `${periodLabel()} · ${provider} · ${decision.eventId.slice(0, 12)}`;
    await sql`
      insert into invoices (
        id, business_id, period_label, plan, mau, included_mau, base_paise, overage_paise, total_paise, status
      ) values (
        ${crypto.randomUUID()}, ${business.id}, ${label}, ${decision.plan}, ${business.mau}, 0,
        ${decision.amountPaise}, 0, ${decision.amountPaise}, 'paid'
      )
      on conflict (business_id, period_label) do nothing
    `;
  }
  await record(sql, provider, decision, "applied", decision.plan ? `Plan set to ${decision.plan}.` : "Billing state updated.");
  await writeSystemLog(sql, {
    actorId: "gateway",
    action: "Payment applied",
    businessId: business.id,
    detail: `${provider} · ${decision.email} · ${decision.plan ?? decision.billingState ?? "updated"}.`,
  });
  return { received: true, matched: true };
}

async function record(sql: Sql, provider: string, decision: PaymentDecision, status: string, detail: string) {
  await sql`
    insert into payment_events (id, provider, event_id, event_type, email, plan, amount_paise, status, detail)
    values (
      ${crypto.randomUUID()}, ${provider}, ${decision.eventId}, ${decision.eventType}, ${decision.email},
      ${decision.plan ?? ""}, ${decision.amountPaise}, ${status}, ${detail}
    )
    on conflict (provider, event_id) do nothing
  `;
}

export async function handleStripeRequest(request: Request) {
  const raw = await request.text();
  const sql = await getSql();
  const secret = (await settings(sql)).stripe_secret;
  const problem = verifyStripeSignature(raw, request.headers.get("stripe-signature") ?? "", secret);
  if (problem) return Response.json({ error: problem }, { status: 400 });
  return decideAndApply(sql, "stripe", raw);
}

export async function handleSkydoRequest(request: Request) {
  const raw = await request.text();
  const sql = await getSql();
  const secret = (await settings(sql)).skydo_secret;
  const problem = verifySkydoSignature(raw, request.headers.get("x-skydo-signature") ?? "", secret);
  if (problem) return Response.json({ error: problem }, { status: 400 });
  return decideAndApply(sql, "skydo", raw);
}

async function decideAndApply(sql: Sql, provider: "stripe" | "skydo", raw: string) {
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Body is not JSON." }, { status: 400 });
  }
  const decision = provider === "stripe" ? decideStripe(body) : decideSkydo(body);
  if ("error" in decision) return Response.json({ error: decision.error }, { status: 400 });
  return Response.json(await applyDecision(sql, provider, decision));
}

export async function signedReplay(input: { provider: "stripe" | "skydo"; email: string; plan: PlanId; outcome: "paid" | "failed" | "canceled" }) {
  const sql = await getSql();
  const current = await settings(sql);
  const id = `${input.provider}_${crypto.randomUUID().slice(0, 8)}`;
  if (input.provider === "stripe") {
    const type = input.outcome === "canceled" ? "customer.subscription.deleted" : input.outcome === "failed" ? "invoice.payment_failed" : "checkout.session.completed";
    const amount = input.plan === "advance" ? 2499900 : input.plan === "basic" ? 499900 : 0;
    const raw = JSON.stringify({
      id,
      type,
      data: { object: { customer_email: input.email, metadata: { plan: input.plan }, amount_total: amount, currency: "inr" } },
    });
    const header = stripeSignatureHeader(raw, current.stripe_secret);
    const problem = verifyStripeSignature(raw, header, current.stripe_secret);
    if (problem) return { error: problem };
    const decision = decideStripe(JSON.parse(raw));
    if ("error" in decision) return { error: decision.error };
    return applyDecision(sql, "stripe", decision);
  }
  const event = input.outcome === "paid" ? "payment.settled" : "payment.failed";
  const amount = input.plan === "advance" ? 24999 : input.plan === "basic" ? 4999 : 0;
  const raw = JSON.stringify({ id, event, payer_email: input.email, plan: input.plan, amount, currency: "INR" });
  const header = skydoSignature(raw, current.skydo_secret);
  const problem = verifySkydoSignature(raw, header, current.skydo_secret);
  if (problem) return { error: problem };
  const decision = decideSkydo(JSON.parse(raw));
  if ("error" in decision) return { error: decision.error };
  return applyDecision(sql, "skydo", decision);
}

export async function readWebhookSettings() {
  const sql = await getSql();
  return settings(sql);
}

export async function writeWebhookSettings(input: { stripeSecret: string; skydoSecret: string }) {
  const sql = await getSql();
  await settings(sql);
  await sql`
    update platform_settings set stripe_secret = ${input.stripeSecret}, skydo_secret = ${input.skydoSecret}
    where id = 'default'
  `;
  await writeSystemLog(sql, {
    actorId: "owner",
    action: "Payment gateway",
    detail: "Stripe and Skydo signing secrets were replaced. The values are not stored in the log.",
  });
}

export function assertPlan(value: string): value is PlanId {
  return isPlan(value);
}
