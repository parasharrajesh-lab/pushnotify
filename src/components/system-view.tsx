import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { nextPlan, planLabel, type PlanId } from "@/lib/account-types";
import { usePush } from "@/lib/push-store";
import { cn } from "@/lib/utils";

export function SystemView() {
  const businesses = usePush((s) => s.businesses);
  const seats = usePush((s) => s.seats);
  const addBusiness = usePush((s) => s.addBusiness);
  const changeBusinessPlan = usePush((s) => s.changeBusinessPlan);
  const setGrants = usePush((s) => s.setGrants);
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState<PlanId>("basic");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">System</h1>
        <p className="pt-1 text-sm text-muted-foreground">
          Add a business user, then grant SDK, webhook, and test-run rights. Enterprise registration and pay-per-use bills are in the system owner panel.
        </p>
        <a href="/admin" className="mt-3 inline-block text-sm font-medium underline">
          Open the owner panel
        </a>
      </div>
      <form
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void (async () => {
            const error = await addBusiness({ businessName, email, plan });
            if (error) toast.error(error);
            else {
              toast.success("Business user saved.");
              setBusinessName("");
              setEmail("");
            }
          })();
        }}
      >
        <label className="flex flex-col gap-1 text-sm font-medium">
          Business name
          <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Owner email
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <div className="flex gap-2">
          {(["free", "basic", "advance"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={plan === item}
              onClick={() => setPlan(item)}
              className={cn("h-11 rounded-sm px-3 text-sm font-medium", plan === item ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
              {planLabel(item)}
            </button>
          ))}
        </div>
        <Button type="submit">Add business user</Button>
      </form>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Workspaces</h2>
        {businesses.length === 0 ? <p className="text-sm text-muted-foreground">No business has registered yet.</p> : null}
        {businesses.map((business) => (
          <article key={business.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {business.logo ? <img src={business.logo} alt="" className="size-10 rounded-sm object-cover" /> : null}
                <div>
                  <p className="font-medium">{business.name}</p>
                  <p className="text-sm text-muted-foreground">{business.ownerEmail || "Owner pending"} · {planLabel(business.plan)}</p>
                </div>
              </div>
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
            </div>
            <div className="flex flex-wrap gap-2" aria-label={`Grants for ${business.name}`}>
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
        ))}
      </section>

      {seats.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Waiting for registration</h2>
          {seats.map((seat) => (
            <p key={seat.id} className="rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <span className="font-medium">{seat.businessName}</span>
              <span className="text-muted-foreground"> · {seat.email} · {planLabel(seat.plan)}</span>
            </p>
          ))}
        </section>
      ) : null}
    </div>
  );
}
