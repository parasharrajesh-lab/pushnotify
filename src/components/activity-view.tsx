import { useState } from "react";
import { Phone } from "@/components/phone";
import { audienceLabel, type Campaign, type Platform } from "@/lib/push";
import { usePush } from "@/lib/push-store";
import { cn, formatCount, formatWhen } from "@/lib/utils";

export function ActivityView() {
  const campaigns = usePush((s) => s.campaigns);
  const appName = usePush((s) => s.businessName);
  const logo = usePush((s) => s.logo);
  const [selected, setSelected] = useState<string | null>(campaigns[0]?.id ?? null);
  const [preview, setPreview] = useState<Platform>("ios");
  const current = campaigns.find((item) => item.id === selected) ?? null;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="order-2 flex min-w-0 flex-1 flex-col gap-4 lg:order-1">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Activity</h1>
          <p className="pt-1 text-sm text-muted-foreground">Broadcasts from this workspace. Basic keeps a short delivery log.</p>
        </div>
        <ul className="flex flex-col gap-2">
          {campaigns.map((campaign) => (
            <li key={campaign.id}>
              <CampaignRow campaign={campaign} on={campaign.id === selected} onSelect={() => setSelected(campaign.id)} />
            </li>
          ))}
        </ul>
      </div>
      <div className="order-1 lg:sticky lg:top-24 lg:order-2 lg:w-64 lg:shrink-0">
        {current ? (
          <Phone
            platform={preview}
            title={current.title}
            body={current.body}
            link={current.link}
            image={current.image ?? ""}
            video={current.video ?? ""}
            appName={appName}
            logo={logo}
            pulse={0}
            onPlatform={setPreview}
          />
        ) : (
          <p className="text-sm text-muted-foreground">No sends yet.</p>
        )}
      </div>
    </div>
  );
}

function CampaignRow({ campaign, on, onSelect }: { campaign: Campaign; on: boolean; onSelect: () => void }) {
  const rate = campaign.targeted === 0 ? 0 : Math.round((campaign.delivered / campaign.targeted) * 100);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={on}
      className={cn(
        "w-full rounded-xl border px-4 py-3 text-left",
        on ? "border-primary bg-card" : "border-border bg-card hover:bg-muted",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">{campaign.title}</p>
        <p className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatWhen(campaign.createdAt)}</p>
      </div>
      <p className="pt-1 text-sm text-muted-foreground">
        {campaign.isTest ? `Test run · ${campaign.testLabel || "Connection"}` : audienceLabel(campaign.audience)}
      </p>
      <p className="pt-2 text-xs tabular-nums text-muted-foreground">
        {formatCount(campaign.delivered)} delivered · {formatCount(campaign.failed)} failed · {formatCount(campaign.clicked)} clicked · {rate}%
      </p>
    </button>
  );
}
