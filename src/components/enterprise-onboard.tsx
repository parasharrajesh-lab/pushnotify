import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PLAN_RATES, formatInr } from "@/lib/billing";
import { usePush } from "@/lib/push-store";
import { formatCount } from "@/lib/utils";

export function EnterpriseOnboard() {
  const name = usePush((s) => s.businessName);
  const plan = usePush((s) => s.plan);
  const acceptTerms = usePush((s) => s.acceptTerms);
  const rate = PLAN_RATES[plan];

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <h1 className="font-display text-3xl font-medium tracking-tight">Enterprise onboarding</h1>
      <p className="text-sm text-pretty text-muted-foreground">
        {name} is registered on {rate.name}. Billing starts after you accept. The monthly base covers the included MAU. Extra monthly active devices are pay per use at the plan rate. The system owner issues the bill. No card is charged on this screen.
      </p>
      <section className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium">{rate.name}</p>
        <p className="pt-1 font-display text-4xl font-medium tabular-nums">{formatInr(rate.basePaise)}</p>
        <p className="text-sm text-muted-foreground">base per month · {formatCount(rate.includedMau)} MAU included</p>
        <p className="pt-3 text-sm">Then {formatInr(rate.overagePaise)} for each extra MAU.</p>
      </section>
      <Button
        onClick={() => {
          void (async () => {
            const error = await acceptTerms();
            if (error) toast.error(error);
            else toast.success("Pay-per-use is on. You can connect tokens.");
          })();
        }}
      >
        Accept and open the workspace
      </Button>
    </div>
  );
}
