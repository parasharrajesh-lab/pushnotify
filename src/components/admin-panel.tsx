import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nextPlan, planLabel, type PlanId } from "@/lib/account-types";
import { PLAN_RATES, formatInr, quoteUsage, runLogicChecks } from "@/lib/billing";
import { usePush } from "@/lib/push-store";
import { cn, formatCount } from "@/lib/utils";

const CHECKS = runLogicChecks();

export function AdminPanel() {
  const businesses = usePush((s) => s.businesses);
  const seats = usePush((s) => s.seats);
  const invoices = usePush((s) => s.invoices);
  const registerEnterprise = usePush((s) => s.registerEnterprise);
  const changeBusinessPlan = usePush((s) => s.changeBusinessPlan);
  const setGrants = usePush((s) => s.setGrants);
  const issueBill = usePush((s) => s.issueBill);
  const paymentEvents = usePush((s) => s.paymentEvents);
  const webhookSecrets = usePush((s) => s.webhookSecrets);
  const load = usePush((s) => s.load);
  const [stripeSecret, setStripeSecret] = useState("");
  const [skydoSecret, setSkydoSecret] = useState("");
  const [replayEmail, setReplayEmail] = useState("");
  const [replayPlan, setReplayPlan] = useState<PlanId>("basic");
  const [replayProvider, setReplayProvider] = useState<"stripe" | "skydo">("stripe");
  const [businessName, setBusinessName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<PlanId>("advance");

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-display text-3xl font-medium tracking-tight">Subscriptions</h1>
        <p className="pt-1 max-w-xl text-sm text-muted-foreground">
          Free, Basic, and Advance are the rates. An enterprise is billed pay per use on Basic or Advance after the owner accepts. Stripe and Skydo confirm a paid plan.
        </p>
        <div className="grid gap-3 pt-4 sm:grid-cols-2">
          {(Object.keys(PLAN_RATES) as PlanId[]).map((id) => {
            const rate = PLAN_RATES[id];
            return (
              <article key={id} className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium">{rate.name}</p>
                <p className="pt-1 font-display text-4xl font-medium tabular-nums">{formatInr(rate.basePaise)}</p>
                <p className="text-sm text-muted-foreground">{formatCount(rate.includedMau)} MAU included</p>
                <p className="pt-2 text-sm">Then {formatInr(rate.overagePaise)} per extra MAU</p>
              </article>
            );
          })}
        </div>
      </section>

      <form
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void (async () => {
            const error = await registerEnterprise({ businessName, contact, email, plan });
            if (error) toast.error(error);
            else {
              toast.success("Enterprise registered. Billing starts after they accept.");
              setBusinessName("");
              setContact("");
              setEmail("");
            }
          })();
        }}
      >
        <h2 className="text-sm font-medium">Register an enterprise</h2>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Company
          <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Contact name
          <Input value={contact} onChange={(e) => setContact(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Billing email
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <div className="flex gap-2">
          {(["basic", "advance"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={plan === item}
              onClick={() => setPlan(item)}
              className={cn("h-11 rounded-sm px-3 text-sm font-medium", plan === item ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
              {item === "basic" ? "Basic" : "Advance"}
            </button>
          ))}
        </div>
        <Button type="submit">Register enterprise</Button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Workspaces</h2>
        {businesses.map((business) => {
          const quote = business.kind === "enterprise" ? quoteUsage(business.plan, business.mau) : null;
          return (
            <article key={business.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{business.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {business.ownerEmail || "Owner pending"} · {planLabel(business.plan)}
                    {business.billingState === "past_due" ? " · payment failed" : ""} ·{" "}
                    {business.kind === "enterprise" ? (business.onboarded ? "Enterprise live" : "Waiting to accept") : "Self-serve"} ·{" "}
                    {formatCount(business.mau)} MAU
                  </p>
                  {quote ? (
                    <p className="pt-1 text-sm tabular-nums">
                      This period {formatInr(quote.totalPaise)}
                      {quote.extra > 0 ? ` · ${formatCount(quote.extra)} extra MAU ${formatInr(quote.overagePaise)}` : " · inside the included MAU"}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void (async () => {
                        const error = await changeBusinessPlan({
                          id: business.id,
                          plan: nextPlan(business.plan),
                        });
                        if (error) toast.error(error);
                      })();
                    }}
                  >
                    Set {planLabel(nextPlan(business.plan))}
                  </Button>
                  {business.kind === "enterprise" ? (
                    <Button
                      size="sm"
                      onClick={() => {
                        void (async () => {
                          const error = await issueBill(business.id);
                          if (error) toast.error(error);
                          else toast.success("Bill issued.");
                        })();
                      }}
                    >
                      Issue bill
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["sdk", "SDK"],
                    ["webhook", "Webhook"],
                    ["test", "Test run"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={business.grants[key]}
                    onClick={() => {
                      void (async () => {
                        const error = await setGrants({
                          id: business.id,
                          sdk: key === "sdk" ? !business.grants.sdk : business.grants.sdk,
                          webhook: key === "webhook" ? !business.grants.webhook : business.grants.webhook,
                          test: key === "test" ? !business.grants.test : business.grants.test,
                        });
                        if (error) toast.error(error);
                      })();
                    }}
                    className={cn(
                      "h-11 rounded-sm px-3 text-sm font-medium",
                      business.grants[key] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      {seats.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Waiting for registration</h2>
          {seats.map((seat) => (
            <p key={seat.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <span className="font-medium">{seat.businessName}</span>
              <span className="text-muted-foreground">
                {" "}
                · {seat.email} · {planLabel(seat.plan)}
                {seat.kind === "enterprise" ? " · Enterprise pay per use" : ""}
              </span>
            </p>
          ))}
        </section>
      ) : null}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Bills</h2>
        {invoices.length === 0 ? <p className="text-sm text-muted-foreground">No bill has been issued.</p> : null}
        {invoices.map((invoice) => (
          <p key={invoice.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span className="font-medium">{invoice.businessName}</span>
            <span className="text-muted-foreground">
              {" "}
              · {invoice.periodLabel} · {planLabel(invoice.plan)} · {formatCount(invoice.mau)} MAU ·{" "}
            </span>
            <span className="tabular-nums">{formatInr(invoice.totalPaise)}</span>
          </p>
        ))}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Stripe and Skydo</h2>
        <p className="text-sm text-muted-foreground">
          Point Stripe at /api/webhooks/stripe and Skydo at /api/webhooks/skydo. Stripe signs Stripe-Signature. Skydo signs X-Skydo-Signature with HMAC-SHA256 of the raw body. A failed payment pauses sends. A deleted Stripe subscription moves the workspace to Free.
        </p>
        <p className="break-all font-mono text-xs text-subtle">Stripe secret {webhookSecrets.stripe || stripeSecret}</p>
        <p className="break-all font-mono text-xs text-subtle">Skydo secret {webhookSecrets.skydo || skydoSecret}</p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              const token = sessionStorage.getItem("grok-auth.bearer-token");
              const response = await fetch("/api/webhooks/settings", {
                method: "POST",
                credentials: "include",
                headers: {
                  "content-type": "application/json",
                  ...(token ? { authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ stripeSecret, skydoSecret }),
              });
              const body = (await response.json().catch(() => null)) as { error?: string } | null;
              if (!response.ok) toast.error(body?.error || "Could not save secrets.");
              else {
                toast.success("Webhook secrets saved.");
                await load();
              }
            })();
          }}
        >
          <label className="flex flex-col gap-1 text-sm font-medium">
            Stripe signing secret
            <Input value={stripeSecret} onChange={(e) => setStripeSecret(e.target.value)} placeholder={webhookSecrets.stripe} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Skydo signing secret
            <Input value={skydoSecret} onChange={(e) => setSkydoSecret(e.target.value)} placeholder={webhookSecrets.skydo} />
          </label>
          <Button type="submit">Save secrets</Button>
        </form>
        <form
          className="flex flex-col gap-3 border-t border-border pt-3"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              const token = sessionStorage.getItem("grok-auth.bearer-token");
              const response = await fetch("/api/webhooks/replay", {
                method: "POST",
                credentials: "include",
                headers: {
                  "content-type": "application/json",
                  ...(token ? { authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ provider: replayProvider, email: replayEmail, plan: replayPlan, outcome: "paid" }),
              });
              const body = (await response.json().catch(() => null)) as { error?: string; matched?: boolean } | null;
              if (!response.ok) toast.error(body?.error || "Webhook was rejected.");
              else {
                toast.success(body?.matched ? "Signed payment applied." : "Signed, but no workspace matched that email.");
                await load();
              }
            })();
          }}
        >
          <h3 className="text-sm font-medium">Send a signed test</h3>
          <div className="flex flex-wrap gap-2">
            {(["stripe", "skydo"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={replayProvider === item}
                onClick={() => setReplayProvider(item)}
                className={cn("h-11 rounded-sm px-3 text-sm font-medium", replayProvider === item ? "bg-primary text-primary-foreground" : "bg-muted")}
              >
                {item === "stripe" ? "Stripe" : "Skydo"}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Owner email
            <Input type="email" value={replayEmail} onChange={(e) => setReplayEmail(e.target.value)} required />
          </label>
          <div className="flex flex-wrap gap-2">
            {(["free", "basic", "advance"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={replayPlan === item}
                onClick={() => setReplayPlan(item)}
                className={cn("h-11 rounded-sm px-3 text-sm font-medium", replayPlan === item ? "bg-primary text-primary-foreground" : "bg-muted")}
              >
                {planLabel(item)}
              </button>
            ))}
          </div>
          <Button type="submit">Apply signed payment</Button>
        </form>
        <ul className="flex flex-col gap-2">
          {paymentEvents.map((event) => (
            <li key={event.id} className="text-sm">
              <span className="font-medium">{event.provider}</span>
              <span className="text-muted-foreground">
                {" "}
                · {event.eventType} · {event.email || "no email"} · {event.status}
                {event.plan ? ` · ${event.plan}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Rules</h2>
        <ul className="flex flex-col gap-2">
          {CHECKS.map((check) => (
            <li key={check.name} className="rounded-xl border border-border bg-card px-4 py-3">
              <p className="text-sm font-medium">{check.pass ? "Pass" : "Fail"} · {check.name}</p>
              <p className="text-sm text-muted-foreground">{check.detail}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
