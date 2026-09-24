import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { ActivityView } from "@/components/activity-view";
import { BrandView } from "@/components/brand-view";
import { ConnectView } from "@/components/connect-view";
import { DevicesView } from "@/components/devices-view";
import { EnterpriseOnboard } from "@/components/enterprise-onboard";
import { OnboardView } from "@/components/onboard-view";
import { PlanView } from "@/components/plan-view";
import { SendView } from "@/components/send-view";
import { SystemView } from "@/components/system-view";
import { TeamView } from "@/components/team-view";
import { planLabel, ROLE_LABEL } from "@/lib/account-types";
import { UserButton } from "@/lib/auth/gates";
import { usePush } from "@/lib/push-store";
import { cn, formatCount } from "@/lib/utils";

const NAV = [
  { id: "send", label: "Send", right: "send" },
  { id: "devices", label: "Devices", right: "devices" },
  { id: "activity", label: "Activity", right: "activity" },
  { id: "plan", label: "Plan", right: "plan" },
  { id: "team", label: "Team", right: "team" },
  { id: "connect", label: "Connect", right: "connect" },
  { id: "brand", label: "Brand", right: "brand" },
] as const;

type ViewId = (typeof NAV)[number]["id"] | "system";

export function Shell() {
  const ready = usePush((s) => s.ready);
  const loadError = usePush((s) => s.loadError);
  const load = usePush((s) => s.load);
  const rights = usePush((s) => s.rights);
  const role = usePush((s) => s.role);
  const isSystemAdmin = usePush((s) => s.isSystemAdmin);
  const businessId = usePush((s) => s.businessId);
  const businessName = usePush((s) => s.businessName);
  const plan = usePush((s) => s.plan);
  const mau = usePush((s) => s.mau);
  const mauCap = usePush((s) => s.mauCap);
  const overCap = usePush((s) => s.overCap);
  const kind = usePush((s) => s.kind);
  const onboarded = usePush((s) => s.onboarded);
  const [view, setView] = useState<ViewId>("send");

  useEffect(() => {
    void load();
  }, [load]);

  const items = [
    ...NAV.filter((item) => rights.includes(item.right)),
    ...(isSystemAdmin ? [{ id: "system" as const, label: "System" }] : []),
  ];

  useEffect(() => {
    if (!ready) return;
    if (items.some((item) => item.id === view)) return;
    const next = items[0]?.id;
    if (next) setView(next);
  }, [ready, view, rights, isSystemAdmin, items]);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Toaster position="top-center" />
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 flex-col border-r border-border bg-card px-4 py-6 lg:flex">
        <p className="font-display text-3xl font-medium tracking-tight">Nock</p>
        <p className="truncate pt-1 text-sm text-muted-foreground">{businessName || "Workspace"}</p>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Sections">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
              className={cn(
                "h-11 rounded-sm px-3 text-left text-sm font-medium",
                view === item.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6">
          <UserButton />
        </div>
      </aside>

      <div className="lg:pl-56">
        <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
          <div className="min-w-0">
            <p className="font-display text-xl font-medium leading-none lg:hidden">Nock</p>
            <p className="truncate text-sm text-muted-foreground">
              {businessName || "Workspace"}
              {role ? ` · ${ROLE_LABEL[role]}` : ""}
              {plan && businessId ? ` · ${planLabel(plan)}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {businessId ? (
              <p className={cn("text-sm tabular-nums", overCap ? "text-danger" : "text-foreground")}>
                <span className="font-medium">{formatCount(overCap ? mauCap : mau)}</span>
                <span className="text-muted-foreground"> / {formatCount(mauCap)} MAU</span>
              </p>
            ) : null}
            <div className="lg:hidden">
              <UserButton />
            </div>
            {isSystemAdmin ? (
              <a href="/admin" className="text-sm font-medium underline">
                Owner panel
              </a>
            ) : null}
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6 pb-28 lg:pb-10">
          {!ready ? <p className="font-display text-3xl font-medium">Nock</p> : null}
          {ready && loadError ? <p className="text-sm text-danger">{loadError}</p> : null}
          {ready && !loadError && !businessId && view !== "system" ? <OnboardView /> : null}
          {ready && !loadError && businessId && kind === "enterprise" && !onboarded ? <EnterpriseOnboard /> : null}
          {ready && !loadError && businessId && onboarded && view === "send" ? <SendView /> : null}
          {ready && !loadError && businessId && onboarded && view === "devices" ? <DevicesView /> : null}
          {ready && !loadError && businessId && onboarded && view === "activity" ? <ActivityView /> : null}
          {ready && !loadError && businessId && onboarded && view === "plan" ? <PlanView /> : null}
          {ready && !loadError && businessId && onboarded && view === "team" ? <TeamView /> : null}
          {ready && !loadError && businessId && onboarded && view === "connect" ? <ConnectView /> : null}
          {ready && !loadError && businessId && onboarded && view === "brand" ? <BrandView /> : null}
          {ready && !loadError && view === "system" && isSystemAdmin ? <SystemView /> : null}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-card lg:hidden" aria-label="Sections">
        <ul className="flex overflow-x-auto">
          {items.map((item) => (
            <li key={item.id} className="min-w-20 flex-1">
              <button
                type="button"
                aria-current={view === item.id ? "page" : undefined}
                onClick={() => setView(item.id)}
                className={cn("h-16 w-full text-sm font-medium", view === item.id ? "text-foreground" : "text-muted-foreground")}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
