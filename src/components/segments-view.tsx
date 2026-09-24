import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  behaviorLabel,
  describeRule,
  isSegmentRule,
  matchesAll,
  PERMISSIONS,
  permissionLabel,
  segmentError,
  type NumericBehavior,
  type Permission,
  type SegmentRule,
} from "@/lib/behavior";
import type { SavedSegment } from "@/lib/behavior";
import { usePush } from "@/lib/push-store";
import { cn, formatCount } from "@/lib/utils";

const BEHAVIORS: SegmentRule["behavior"][] = [
  "opened",
  "dismissed",
  "sessions",
  "purchases",
  "days_since_open",
  "returned_next_day",
  "permission",
];

const BLANK: SegmentRule = { behavior: "opened", op: "at_least", value: 1 };

function ruleFor(behavior: SegmentRule["behavior"]): SegmentRule {
  if (behavior === "permission") return { behavior, value: "allowed" };
  if (behavior === "returned_next_day") return { behavior, value: true };
  return { behavior, op: "at_least", value: 1 };
}

export function SegmentsView() {
  const segments = usePush((s) => s.segments);
  const subscribers = usePush((s) => s.subscribers);
  const save = usePush((s) => s.saveSegment);
  const [editing, setEditing] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [rules, setRules] = useState<SegmentRule[]>([BLANK]);
  const [saving, setSaving] = useState(false);

  const problem = segmentError({ id: editing ?? undefined, name, rules });
  const liveRules = rules.filter(isSegmentRule);
  const names = subscribers.filter((person) => liveRules.length > 0 && matchesAll(person.behavior, liveRules)).map((person) => person.name);

  function load(segment: SavedSegment) {
    setEditing(segment.id);
    setName(segment.name);
    setRules(segment.rules);
  }

  function clear() {
    setEditing(null);
    setName("");
    setRules([BLANK]);
  }

  function setBehavior(index: number, behavior: SegmentRule["behavior"]) {
    setRules((current) => current.map((rule, item) => (item === index ? ruleFor(behavior) : rule)));
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <form
        className="order-2 flex min-w-0 flex-1 flex-col gap-4 lg:order-1"
        onSubmit={(event) => {
          event.preventDefault();
          if (problem || saving) {
            if (problem) toast.error(problem);
            return;
          }
          setSaving(true);
          void (async () => {
            const error = await save({ id: editing ?? undefined, name, rules });
            setSaving(false);
            if (error) {
              toast.error(error);
              return;
            }
            toast.success(editing ? "Segment updated." : "Segment created.");
            if (!editing) clear();
          })();
        }}
      >
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Segments</h1>
          <p className="pt-1 text-sm text-pretty text-muted-foreground">
            A segment is who matches every rule. Opens, dismisses, and sessions are the last 7 days. Purchases are the last 30 days. Returning the next day is 1-day retention after a message.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Name
          <Input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="Opened, still buying" />
        </label>
        <div className="flex flex-col gap-3">
          {rules.map((rule, index) => (
            <div key={index} className="grid gap-2 rounded-xl border border-border bg-card p-3 sm:grid-cols-[1.4fr_1fr_auto]">
              <label className="flex flex-col gap-1 text-sm font-medium">
                Behavior
                <select
                  className="h-11 rounded-sm border border-border bg-card px-3 text-sm"
                  value={rule.behavior}
                  onChange={(e) => setBehavior(index, e.target.value as SegmentRule["behavior"])}
                >
                  {BEHAVIORS.map((behavior) => (
                    <option key={behavior} value={behavior} disabled={rules.some((item, itemIndex) => itemIndex !== index && item.behavior === behavior)}>
                      {behaviorLabel(behavior)}
                    </option>
                  ))}
                </select>
              </label>
              <RuleValue rule={rule} onChange={(next) => setRules((current) => current.map((item, itemIndex) => (itemIndex === index ? next : item)))} />
              {rules.length > 1 ? (
                <button type="button" className="h-11 self-end rounded-sm px-3 text-sm text-danger" onClick={() => setRules((current) => current.filter((_, item) => item !== index))}>
                  Remove
                </button>
              ) : (
                <span />
              )}
            </div>
          ))}
        </div>
        {rules.length < 4 ? (
          <button
            type="button"
            className="self-start text-sm font-medium underline"
            onClick={() => {
              const next = BEHAVIORS.find((behavior) => rules.every((rule) => rule.behavior !== behavior));
              if (next) setRules((current) => [...current, ruleFor(next)]);
            }}
          >
            Add behavior
          </button>
        ) : null}
        <p className="text-sm text-muted-foreground">
          {names.length === 0 ? "No known device matches yet." : `${formatCount(names.length)} of ${formatCount(subscribers.length)} devices · ${names.slice(0, 3).join(", ")}${names.length > 3 ? ` and ${names.length - 3} more` : ""}`}
        </p>
        {problem && name.trim() ? <p className="text-sm text-danger">{problem}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" disabled={saving || Boolean(problem)}>
            {saving ? "Saving…" : editing ? "Update segment" : "Create segment"}
          </Button>
          {editing ? (
            <Button type="button" variant="outline" onClick={clear}>
              New segment
            </Button>
          ) : null}
        </div>
      </form>
      <ul className="order-1 flex flex-col gap-2 lg:order-2 lg:w-80 lg:shrink-0">
        {segments.map((segment) => {
          const matched = subscribers.filter((person) => matchesAll(person.behavior, segment.rules));
          return (
            <li key={segment.id}>
              <button
                type="button"
                onClick={() => load(segment)}
                aria-pressed={editing === segment.id}
                className={cn("w-full rounded-xl border px-4 py-3 text-left", editing === segment.id ? "border-primary bg-card" : "border-border bg-card")}
              >
                <p className="font-medium">{segment.name}</p>
                <ul className="pt-1 text-sm text-muted-foreground">
                  {segment.rules.map((rule) => (
                    <li key={rule.behavior}>{describeRule(rule)}</li>
                  ))}
                </ul>
                <p className="pt-2 text-xs tabular-nums text-muted-foreground">{matched.length === 1 ? "1 device" : `${formatCount(matched.length)} devices`}</p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RuleValue({ rule, onChange }: { rule: SegmentRule; onChange: (rule: SegmentRule) => void }) {
  if (rule.behavior === "permission") {
    return (
      <label className="flex flex-col gap-1 text-sm font-medium">
        Is
        <select
          className="h-11 rounded-sm border border-border bg-card px-3 text-sm"
          value={rule.value}
          onChange={(e) => onChange({ behavior: "permission", value: e.target.value as Permission })}
        >
          {PERMISSIONS.map((value) => (
            <option key={value} value={value}>
              {permissionLabel(value)}
            </option>
          ))}
        </select>
      </label>
    );
  }
  if (rule.behavior === "returned_next_day") {
    return (
      <label className="flex flex-col gap-1 text-sm font-medium">
        Did they
        <select
          className="h-11 rounded-sm border border-border bg-card px-3 text-sm"
          value={rule.value ? "yes" : "no"}
          onChange={(e) => onChange({ behavior: "returned_next_day", value: e.target.value === "yes" })}
        >
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </label>
    );
  }
  const max = rule.behavior === "days_since_open" ? 365 : 500;
  return (
    <div className="grid grid-cols-2 gap-2">
      <label className="flex flex-col gap-1 text-sm font-medium">
        Compare
        <select
          className="h-11 rounded-sm border border-border bg-card px-3 text-sm"
          value={rule.op}
          onChange={(e) => onChange({ ...rule, op: e.target.value === "at_most" ? "at_most" : "at_least" })}
        >
          <option value="at_least">At least</option>
          <option value="at_most">At most</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium">
        Value
        <Input
          type="number"
          min={0}
          max={max}
          value={rule.value}
          onChange={(e) => onChange({ behavior: rule.behavior as NumericBehavior, op: rule.op, value: Math.round(Number(e.target.value)) })}
        />
      </label>
    </div>
  );
}
