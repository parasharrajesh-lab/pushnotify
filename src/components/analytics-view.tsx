import { useState } from "react";
import { campaignAnalytics, percent, type ChannelRollup, type TrackChannel } from "@/lib/campaign-analytics";
import { stateLabel } from "@/lib/notify";
import { usePush } from "@/lib/push-store";
import { cn, formatCount, formatWhen } from "@/lib/utils";

type Filter = "all" | TrackChannel;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "push", label: "Push" },
  { id: "inapp", label: "In-app" },
];

export function AnalyticsView() {
  const campaigns = usePush((s) => s.campaigns);
  const [filter, setFilter] = useState<Filter>("all");
  const report = campaignAnalytics(campaigns);
  const roll = report[filter];
  const shown = report.rows.filter((row) => !row.isTest && (filter === "all" || row.channel === filter));
  const sent = shown.filter((row) => row.state === "sent");
  const waiting = shown.filter((row) => row.state !== "sent");

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Campaign analytics</h1>
        <p className="pt-1 max-w-xl text-sm text-muted-foreground">
          Push and in-app are counted separately. A scheduled, queued, or armed campaign is not delivered yet, and a test run is not included in these rates.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Channel">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={filter === item.id}
            onClick={() => setFilter(item.id)}
            className={cn("h-11 rounded-sm px-3 text-sm font-medium", filter === item.id ? "bg-primary text-primary-foreground" : "bg-muted")}
          >
            {item.label}
          </button>
        ))}
      </div>

      <Rollup roll={roll} />

      {filter !== "push" ? (
        <section className="grid gap-2 sm:grid-cols-3">
          <LayoutStat label="Banner" roll={report.layouts.banner} />
          <LayoutStat label="Modal" roll={report.layouts.modal} />
          <LayoutStat label="Permission primer" roll={report.layouts.primer} />
        </section>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Waiting · {formatCount(report.waiting.scheduled)} scheduled · {formatCount(report.waiting.queued)} queued for quiet hours ·{" "}
        {formatCount(report.waiting.armed)} waiting for a trigger
        {report.tests > 0 ? ` · ${formatCount(report.tests)} test ${report.tests === 1 ? "run" : "runs"} excluded` : ""}
      </p>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium">Sent</h2>
        {sent.length === 0 ? (
          <p className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            {filter === "inapp" ? "No in-app message has been sent yet." : filter === "push" ? "No push has been sent yet." : "No campaign has been sent yet."}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {sent.map((row) => (
              <li key={row.id} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{row.title}</p>
                  <p className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatWhen(row.createdAt)}</p>
                </div>
                <p className="pt-1 text-sm text-muted-foreground">
                  {row.channel === "push" ? "Push" : "In-app"}
                  {row.channel === "inapp" ? ` · ${row.layout}` : ""}
                  {" · "}
                  {formatCount(row.delivered)} delivered · {formatCount(row.failed)} failed · {formatCount(row.clicked)} clicked
                  {row.goalHits > 0 ? ` · ${formatCount(row.goalHits)} goal` : ""}
                </p>
                <p className="pt-1 text-xs tabular-nums text-muted-foreground">
                  {percent(row.targeted === 0 ? 0 : row.delivered / row.targeted)} delivered · {percent(row.delivered === 0 ? 0 : row.clicked / row.delivered)} clicked
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {waiting.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium">Not sent yet</h2>
          <ul className="flex flex-col gap-2">
            {waiting.map((row) => (
              <li key={`${row.id}-wait`} className="rounded-xl border border-border bg-card px-4 py-3">
                <p className="font-medium">{row.title}</p>
                <p className="pt-1 text-sm text-muted-foreground">
                  {row.channel === "push" ? "Push" : "In-app"} · {stateLabel(row.state)} · {formatCount(row.targeted)} targeted, none delivered
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Rollup({ roll }: { roll: ChannelRollup }) {
  const tiles = [
    ["Targeted", formatCount(roll.targeted), `${formatCount(roll.sent)} sent`],
    ["Delivered", formatCount(roll.delivered), percent(roll.deliveryRate)],
    ["Failed", formatCount(roll.failed), percent(roll.failRate)],
    ["Clicked", formatCount(roll.clicked), `${percent(roll.clickRate)} of delivered`],
  ] as const;
  return (
    <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" aria-label="Totals">
      {tiles.map(([label, value, detail]) => (
        <article key={label} className="rounded-xl border border-border bg-card p-4">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="pt-1 font-display text-3xl font-medium tabular-nums">{value}</p>
          <p className="pt-1 text-xs tabular-nums text-muted-foreground">{detail}</p>
        </article>
      ))}
      {roll.goalHits > 0 ? (
        <article className="rounded-xl border border-border bg-card p-4 sm:col-span-2 lg:col-span-4">
          <p className="text-sm text-muted-foreground">Goal hits</p>
          <p className="pt-1 text-sm tabular-nums">
            {formatCount(roll.goalHits)} · {percent(roll.goalRate)} of delivered. A goal hit cannot exceed the messages that were delivered.
          </p>
        </article>
      ) : null}
    </section>
  );
}

function LayoutStat({ label, roll }: { label: string; roll: ChannelRollup }) {
  return (
    <article className="rounded-xl border border-border bg-card px-4 py-3">
      <p className="text-sm font-medium">{label}</p>
      <p className="pt-1 text-sm tabular-nums text-muted-foreground">
        {formatCount(roll.sent)} sent · {formatCount(roll.delivered)} delivered · {percent(roll.clickRate)} clicked
      </p>
    </article>
  );
}
