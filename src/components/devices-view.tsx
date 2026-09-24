import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { defaultBehavior, permissionLabel, userPath } from "@/lib/behavior";
import { TAGS, tagLabel, type Platform, type Subscriber, type Tag } from "@/lib/push";
import { usePush } from "@/lib/push-store";
import { cn, formatCount, formatWhen } from "@/lib/utils";

const PATHS = [
  { id: "all", label: "All" },
  { id: "open", label: "Opened the app" },
  { id: "push", label: "Can receive push" },
  { id: "tap", label: "Opened a notification" },
  { id: "return", label: "Returned next day" },
  { id: "buy", label: "Purchased" },
] as const;

export function DevicesView() {
  const subscribers = usePush((s) => s.subscribers);
  const addDevice = usePush((s) => s.addDevice);
  const canEdit = usePush((s) => s.rights.includes("devices_edit"));
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | Platform>("all");
  const [step, setStep] = useState<(typeof PATHS)[number]["id"]>("all");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [nextPlatform, setNextPlatform] = useState<Platform>("android");
  const [tag, setTag] = useState<Tag>("orders");

  const fleet = useMemo(
    () => subscribers.filter((device) => platform === "all" || device.platform === platform),
    [subscribers, platform],
  );
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return fleet.filter((device) => {
      const path = userPath(device.behavior ?? defaultBehavior(device.status));
      if (step !== "all" && !path.find((item) => item.id === step)?.done) return false;
      if (!q) return true;
      return device.name.toLowerCase().includes(q) || device.userId.toLowerCase().includes(q) || device.city.toLowerCase().includes(q);
    });
  }, [fleet, query, step]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">User path analytics</h1>
          <p className="pt-1 max-w-xl text-sm text-muted-foreground">
            How people move from opening the app to a purchase. Dropping a token is a system owner setting, not a business action.
          </p>
        </div>
        {canEdit ? (
          <Button variant="outline" onClick={() => setOpen((v) => !v)}>
            {open ? "Close" : "Add test device"}
          </Button>
        ) : null}
      </div>

      <Funnel people={fleet} />

      {open ? (
        <form
          className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              const error = await addDevice({ name, userId, platform: nextPlatform, city, tag });
              if (error) {
                toast.error(error);
                return;
              }
              toast.success("Device registered. MAU +1.");
              setName("");
              setUserId("");
            })();
          }}
        >
          <label className="flex flex-col gap-1 text-sm font-medium">
            Name
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Aisha Khan" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            User id
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="usr_30ab" />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            City
            <Input value={city} onChange={(e) => setCity(e.target.value)} />
          </label>
          <div className="flex flex-col gap-1 text-sm font-medium">
            Platform and tag
            <div className="flex flex-wrap gap-2">
              {(["android", "ios"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={nextPlatform === item}
                  onClick={() => setNextPlatform(item)}
                  className={cn("h-11 rounded-sm px-3 text-sm", nextPlatform === item ? "bg-primary text-primary-foreground" : "bg-muted")}
                >
                  {item === "android" ? "Android" : "iOS"}
                </button>
              ))}
              {TAGS.map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={tag === item}
                  onClick={() => setTag(item)}
                  className={cn("h-11 rounded-sm px-3 text-sm", tag === item ? "bg-primary text-primary-foreground" : "bg-muted")}
                >
                  {tagLabel(item)}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Register device</Button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-col gap-3">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, user, city" aria-label="Search people" />
        <div className="flex flex-wrap gap-2">
          {(["all", "android", "ios"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={platform === item}
              onClick={() => setPlatform(item)}
              className={cn("h-11 rounded-sm px-3 text-sm font-medium", platform === item ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
              {item === "all" ? "All" : item === "android" ? "Android" : "iOS"}
            </button>
          ))}
          {PATHS.filter((item) => item.id !== "all").map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={step === item.id}
              onClick={() => setStep((current) => (current === item.id ? "all" : item.id))}
              className={cn("h-11 rounded-sm px-3 text-sm font-medium", step === item.id ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <li className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">No one matches that path.</li>
        ) : (
          rows.map((device) => {
            const behavior = device.behavior ?? defaultBehavior(device.status);
            const path = userPath(behavior);
            return (
              <li key={device.id} className="rounded-xl border border-border bg-card px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{device.name}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {device.userId} · {device.city} · {device.platform === "android" ? "Android" : "iOS"} · {tagLabel(device.tag)}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">{permissionLabel(behavior.permission)}</p>
                </div>
                <ol className="flex flex-wrap gap-2 pt-3">
                  {path.map((item) => (
                    <li
                      key={item.id}
                      className={cn(
                        "rounded-sm px-2 py-1 text-xs font-medium",
                        item.done ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.label}
                    </li>
                  ))}
                </ol>
                <p className="pt-2 text-xs tabular-nums text-muted-foreground">Last seen {formatWhen(device.lastSeen)}</p>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

function Funnel({ people }: { people: Subscriber[] }) {
  const known = people.length;
  const counts = PATHS.filter((item) => item.id !== "all").map((item) => ({
    ...item,
    count: people.filter((device) => userPath(device.behavior ?? defaultBehavior(device.status)).find((step) => step.id === item.id)?.done).length,
  }));
  return (
    <section className="rounded-xl border border-border bg-card p-4" aria-label="Path funnel">
      <p className="text-sm font-medium">Path · {formatCount(known)} known</p>
      <ul className="flex flex-col gap-2 pt-3">
        {counts.map((item) => (
          <li key={item.id}>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{item.label}</span>
              <span className="tabular-nums">{formatCount(item.count)}</span>
            </div>
            <div className="mt-1 h-2 rounded-sm bg-muted">
              <div className="h-2 rounded-sm bg-primary" style={{ width: known === 0 ? "0%" : `${Math.round((item.count / known) * 100)}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
