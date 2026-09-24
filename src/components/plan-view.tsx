import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { nextPlan, planLabel } from "@/lib/account-types";
import { formatInr, quoteUsage } from "@/lib/billing";
import { chartSeries } from "@/lib/push";
import { usePush } from "@/lib/push-store";
import { cn, formatCount } from "@/lib/utils";

const INCLUDED = ["Android and iOS", "API send and broadcast", "Platform and tag audience", "Dead-token cleanup", "30-day delivery log"];
const LOCKED = ["Web push", "Journeys", "A/B tests", "Webhooks and export", "12-month retention"];

export function PlanView() {
  const mau = usePush((s) => s.mau);
  const cap = usePush((s) => s.mauCap);
  const plan = usePush((s) => s.plan);
  const canEdit = usePush((s) => s.rights.includes("plan_edit"));
  const overCap = usePush((s) => s.overCap);
  const setOverCap = usePush((s) => s.setOverCap);
  const changePlan = usePush((s) => s.changePlan);
  const campaigns = usePush((s) => s.campaigns);
  const reset = usePush((s) => s.reset);
  const billing = usePush((s) => s.billing);
  const businessId = usePush((s) => s.businessId);
  const invoices = usePush((s) => s.invoices);
  const billingState = usePush((s) => s.billingState);
  const shown = overCap ? cap : mau;
  const pct = Math.min(100, Math.round((shown / cap) * 100));
  const data = chartSeries(campaigns);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Plan</h1>
        <p className="pt-1 text-sm text-muted-foreground">
          {planLabel(plan)} includes {formatCount(cap)} MAU.
          {plan === "free" ? " There is no charge and no overage." : " Extra MAU is pay per use. Stripe or Skydo can confirm the plan."}
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium text-muted-foreground">Mobile MAU this month</p>
        <p className="pt-2 font-display text-5xl font-medium tabular-nums tracking-tight">
          {formatCount(shown)}
          <span className="text-2xl text-muted-foreground"> / {formatCount(cap)}</span>
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-sm bg-muted" role="meter" aria-valuenow={shown} aria-valuemin={0} aria-valuemax={cap} aria-label="MAU used">
          <div className={cn("h-full w-full origin-left bg-primary", overCap && "bg-danger")} style={{ transform: `scaleX(${pct / 100})` }} />
        </div>
        <p className="pt-3 text-sm text-muted-foreground">
          {overCap
            ? "Cap preview is on. Sends are paused, the way a live Basic workspace behaves at 10,000 MAU."
            : `${formatCount(cap - mau)} MAU left before sends pause.`}
        </p>
        {billingState === "past_due" ? (
          <p className="pt-3 text-sm text-danger">A Stripe or Skydo payment failed. Sends stay paused until the next settled payment.</p>
        ) : null}
        <div className="flex flex-wrap gap-2 pt-4">
          <Button variant={overCap ? "default" : "outline"} onClick={() => void setOverCap(!overCap)}>
            {overCap ? "Clear cap preview" : "Preview the cap"}
          </Button>
          {canEdit ? (
            <Button variant="outline" onClick={() => void changePlan(nextPlan(plan))}>
              Move to {planLabel(nextPlan(plan))}
            </Button>
          ) : null}
          {canEdit ? (
            <Button variant="ghost" onClick={() => void reset()}>
              Reset sample
            </Button>
          ) : (
            <span />
          )}
        </div>
      </section>

      {billing === "pay_per_use" ? (
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium">Pay per use this period</h2>
          <p className="pt-2 font-display text-4xl font-medium tabular-nums">{formatInr(quoteUsage(plan, mau).totalPaise)}</p>
          <p className="pt-1 text-sm text-muted-foreground">
            {quoteUsage(plan, mau).extra > 0
              ? `${formatCount(quoteUsage(plan, mau).extra)} MAU above the included ${formatCount(cap)}, at the ${planLabel(plan)} rate.`
              : "Usage is inside the included MAU. The bill is the plan base until the system owner issues it."}
          </p>
          <ul className="flex flex-col gap-2 pt-3">
            {invoices.filter((item) => item.businessId === businessId).map((invoice) => (
              <li key={invoice.id} className="text-sm">
                {invoice.periodLabel} · {formatInr(invoice.totalPaise)} issued
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-medium">Delivered, last 14 days</h2>
        <div className="h-48 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="28%">
              <XAxis dataKey="label" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} axisLine={false} tickLine={false} interval={1} />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: "var(--color-muted)" }}
                contentStyle={{
                  background: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="sent" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium">On Basic</h2>
          <ul className="pt-3 text-sm text-muted-foreground">
            {INCLUDED.map((item) => (
              <li key={item} className="border-t border-border py-2 first:border-t-0">
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-medium">Advance, not on this plan</h2>
          <ul className="pt-3 text-sm text-subtle">
            {LOCKED.map((item) => (
              <li key={item} className="border-t border-border py-2 first:border-t-0">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
