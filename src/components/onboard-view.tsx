import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { completeRegistration } from "@/lib/account-fns";
import { planLabel, type PlanId } from "@/lib/account-types";
import { usePush } from "@/lib/push-store";
import { cn } from "@/lib/utils";

export function OnboardView() {
  const load = usePush((s) => s.load);
  const [name, setName] = useState("");
  const [plan, setPlan] = useState<PlanId>("free");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mx-auto flex max-w-lg flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        setBusy(true);
        void (async () => {
          try {
            await completeRegistration({ data: { businessName: name, plan } });
            await load();
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not open the workspace.");
            setBusy(false);
          }
        })();
      }}
    >
      <h1 className="font-display text-3xl font-medium tracking-tight">Open your workspace</h1>
      <p className="text-sm text-muted-foreground">Your sign-in is not on a team yet. Name the business and choose Free, Basic, or Advance.</p>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Business name
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
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
            {item === "free" ? "Free" : item === "basic" ? "Basic" : "Advance"}
          </button>
        ))}
      </div>
      <Button type="submit" disabled={busy}>
        {busy ? "Opening…" : "Create workspace"}
      </Button>
    </form>
  );
}
