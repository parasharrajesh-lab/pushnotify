import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nextPlan, planLabel, type PlanId } from "@/lib/account-types";
import { PLAN_RATES, formatInr, quoteUsage, runLogicChecks } from "@/lib/billing";
import { usePush } from "@/lib/push-store";
import { cn, formatCount, formatWhen } from "@/lib/utils";

const SECTIONS = [
  ["users", "B2B users"],
  ["onboarding", "Enterprise onboarding"],
  ["workspace", "Enterprise workspace"],
  ["plan", "Plan status"],
  ["invoices", "Invoices"],
  ["subscriptions", "Subscriptions"],
  ["gateways", "Payment gateways"],
  ["settings", "System settings"],
  ["log", "System log"],
] as const;

type Section = (typeof SECTIONS)[number][0];

const CHECKS = runLogicChecks();

export function AdminPanel() {
  const businesses = usePush((s) => s.businesses);
  const seats = usePush((s) => s.seats);
  const invoices = usePush((s) => s.invoices);
  const registerEnterprise = usePush((s) => s.registerEnterprise);
  const changeBusinessPlan = usePush((s) => s.changeBusinessPlan);
  const setGrants = usePush((s) => s.setGrants);
  const dropToken = usePush((s) => s.dropToken);
  const tokens = usePush((s) => s.tokens);
  const logs = usePush((s) => s.logs);
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
  const [section, setSection] = useState<Section>("users");
  const enterprises = businesses.filter((business) => business.kind === "enterprise");
  const waitingEnterprises = enterprises.filter((business) => !business.onboarded);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-display text-3xl font-medium tracking-tight">System management</h1>
        <p className="pt-1 max-w-xl text-sm text-muted-foreground">
          B2B user management for every workspace. Enterprise onboarding, the workspace and its device tokens, plan status, invoices, subscriptions, payment gateways, system settings, and the system log.
        </p>
        <div className="flex flex-wrap gap-2 pt-4" role="group" aria-label="System management">
          {SECTIONS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={section === id}
              onClick={() => setSection(id)}
              className={cn("h-11 rounded-sm px-3 text-sm font-medium", section === id ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
              {label}
            </button>
          ))}
        </div>
        {section === "subscriptions" ? (
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
        ) : null}
      </section>

      {section === "settings" ? (
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">System settings</h2>
        <p className="text-sm text-muted-foreground">
          Grants apply to every B2B workspace. Dropping a token is only done by the system owner. The device leaves that workspace's MAU and can no longer receive push.
        </p>
        {tokens.length === 0 ? <p className="text-sm text-muted-foreground">No active device is waiting.</p> : null}
        {tokens.map((token) => (
          <article key={token.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="min-w-0">
              <p className="font-medium">{token.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {token.businessName} · {token.userId} · {token.platform === "ios" ? "iOS" : "Android"}
                {token.tokenTail ? ` · token ${token.tokenTail}` : " · no token saved"}
              </p>
            </div>
            <button
              type="button"
              className="h-11 rounded-sm px-3 text-sm font-medium text-danger hover:bg-danger-bg"
              onClick={() => {
                void (async () => {
                  const error = await dropToken({ businessId: token.businessId, deviceId: token.id });
                  if (error) toast.error(error);
                  else toast("Token dropped. That device left MAU.");
                })();
              }}
            >
              Drop token
            </button>
          </article>
        ))}
      </section>
      ) : null}

      {section === "onboarding" ? (
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
      ) : null}

      {section === "users" || section === "plan" || section === "subscriptions" || section === "workspace" || section === "invoices" || section === "settings" ? (
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">
          {section === "users"
            ? "B2B users"
            : section === "plan"
              ? "Subscription plan status"
              : section === "subscriptions"
                ? "Move a workspace"
                : section === "workspace"
                  ? "Enterprise workspace"
                  : section === "invoices"
                    ? "Issue a bill"
                    : "Grants for every B2B workspace"}
        </h2>
        {(section === "workspace" ? enterprises : businesses).length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {section === "workspace" ? "No enterprise workspace yet. Register one under Enterprise onboarding." : "No business has registered yet."}
          </p>
        ) : null}
        {(section === "workspace" ? enterprises : businesses).map((business) => {
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
                  {quote && (section === "plan" || section === "invoices") ? (
                    <p className="pt-1 text-sm tabular-nums">
                      This period {formatInr(quote.totalPaise)}
                      {quote.extra > 0 ? ` · ${formatCount(quote.extra)} extra MAU ${formatInr(quote.overagePaise)}` : " · inside the included MAU"}
                    </p>
                  ) : null}
                </div>
                {section === "subscriptions" || section === "invoices" ? (
                <div className="flex flex-wrap gap-2">
                  {section === "subscriptions" ? (
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
                  ) : null}
                  {section === "invoices" && business.kind === "enterprise" ? (
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
                ) : null}
              </div>
              {section === "settings" ? (
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
              ) : null}
              {section === "workspace" ? (
                <div className="flex flex-col gap-2">
                  {tokens.filter((token) => token.businessId === business.id).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No active device on this workspace.</p>
                  ) : null}
                  {tokens
                    .filter((token) => token.businessId === business.id)
                    .map((token) => (
                      <div key={token.id} className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                          {token.name} · {token.userId} · {token.platform === "ios" ? "iOS" : "Android"}
                          {token.tokenTail ? ` · token ${token.tokenTail}` : " · no token saved"}
                        </p>
                        <button
                          type="button"
                          className="h-11 rounded-sm px-3 text-sm font-medium text-danger hover:bg-danger-bg"
                          onClick={() => {
                            void (async () => {
                              const error = await dropToken({ businessId: token.businessId, deviceId: token.id });
                              if (error) toast.error(error);
                              else toast("Token dropped. That device left MAU.");
                            })();
                          }}
                        >
                          Drop token
                        </button>
                      </div>
                    ))}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>
      ) : null}

      {section === "onboarding" ? (
      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Waiting to come online</h2>
        {seats.length === 0 && waitingEnterprises.length === 0 ? (
          <p className="text-sm text-muted-foreground">No enterprise is waiting. A registered enterprise stays here until the workspace accepts pay-per-use.</p>
        ) : null}
        {seats.map((seat) => (
          <p key={seat.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span className="font-medium">{seat.businessName}</span>
            <span className="text-muted-foreground">
              {" "}
              · {seat.email} · {planLabel(seat.plan)}
              {seat.kind === "enterprise" ? " · Enterprise pay per use · not signed in yet" : ""}
            </span>
          </p>
        ))}
        {waitingEnterprises.map((business) => (
          <p key={business.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
            <span className="font-medium">{business.name}</span>
            <span className="text-muted-foreground"> · {business.ownerEmail || "Owner pending"} · {planLabel(business.plan)} · waiting to accept</span>
          </p>
        ))}
      </section>
      ) : null}

      {section === "invoices" ? (
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
      ) : null}

      {section === "gateways" ? (
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Stripe and Skydo</h2>
        <p className="text-sm text-muted-foreground">
          Point Stripe at /api/webhooks/stripe and Skydo at /api/webhooks/skydo. Stripe signs Stripe-Signature. Skydo signs X-Skydo-Signature with HMAC-SHA256 of the raw body. A failed payment pauses sends. A deleted Stripe subscription moves the workspace to Free. Signing secrets are not shown on this page.
        </p>
        <p className="text-sm text-muted-foreground">Stripe {webhookSecrets.stripe ? "secret is saved" : "secret is not set"} · Skydo {webhookSecrets.skydo ? "secret is saved" : "secret is not set"}</p>
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
            <Input value={stripeSecret} onChange={(e) => setStripeSecret(e.target.value)} placeholder="Paste a new signing secret" autoComplete="off" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Skydo signing secret
            <Input value={skydoSecret} onChange={(e) => setSkydoSecret(e.target.value)} placeholder="Paste a new signing secret" autoComplete="off" />
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
      ) : null}

      {section === "log" ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">System log</h2>
          <p className="text-sm text-muted-foreground">Owner actions and applied gateway payments. Secrets are never written here.</p>
          {logs.length === 0 && paymentEvents.length === 0 ? <p className="text-sm text-muted-foreground">No system action has been recorded yet.</p> : null}
          {logs.map((entry) => (
            <p key={entry.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <span className="font-medium">{entry.action}</span>
              <span className="text-muted-foreground">
                {entry.businessName ? ` · ${entry.businessName}` : ""} · {entry.detail} · {formatWhen(entry.createdAt)}
              </span>
            </p>
          ))}
          {paymentEvents.map((event) => (
            <p key={event.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <span className="font-medium">Gateway · {event.provider}</span>
              <span className="text-muted-foreground">
                {" "}
                · {event.eventType} · {event.email || "no email"} · {event.status}
                {event.plan ? ` · ${event.plan}` : ""}
              </span>
            </p>
          ))}
        </section>
      ) : null}

      {section === "subscriptions" ? (
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
      ) : null}
    </div>
  );
}
