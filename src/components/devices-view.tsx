import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { behaviorSummary, defaultBehavior } from "@/lib/behavior";
import { TAGS, tagLabel, type Platform, type Tag } from "@/lib/push";
import { usePush } from "@/lib/push-store";
import { cn, formatWhen } from "@/lib/utils";

export function DevicesView() {
  const subscribers = usePush((s) => s.subscribers);
  const addDevice = usePush((s) => s.addDevice);
  const unregister = usePush((s) => s.unregister);
  const canEdit = usePush((s) => s.rights.includes("devices_edit"));
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<"all" | Platform>("all");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [nextPlatform, setNextPlatform] = useState<Platform>("android");
  const [tag, setTag] = useState<Tag>("orders");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return subscribers.filter((device) => {
      if (platform !== "all" && device.platform !== platform) return false;
      if (!q) return true;
      return (
        device.name.toLowerCase().includes(q) ||
        device.userId.toLowerCase().includes(q) ||
        device.city.toLowerCase().includes(q)
      );
    });
  }, [subscribers, query, platform]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Devices</h1>
          <p className="pt-1 text-sm text-muted-foreground">A sample of the Metro Bites fleet. Dead tokens drop out of MAU.</p>
        </div>
        {canEdit ? (
          <Button variant="outline" onClick={() => setOpen((v) => !v)}>
            {open ? "Close" : "Add test device"}
          </Button>
        ) : null}
      </div>

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
                  className={cn(
                    "h-11 rounded-sm px-3 text-sm",
                    nextPlatform === item ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, user, city" aria-label="Search devices" />
        <div className="flex gap-2">
          {(["all", "android", "ios"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={platform === item}
              onClick={() => setPlatform(item)}
              className={cn(
                "h-11 rounded-sm px-3 text-sm font-medium",
                platform === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              )}
            >
              {item === "all" ? "All" : item === "android" ? "Android" : "iOS"}
            </button>
          ))}
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {rows.length === 0 ? (
          <li className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            No devices match that filter.
          </li>
        ) : (
          rows.map((device) => (
            <li key={device.id} className="rounded-xl border border-border bg-card px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{device.name}</p>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    {device.userId} · {device.city}
                    {device.pushToken ? ` · token ${device.pushToken.slice(-8)}` : ""}
                  </p>
                </div>
                <p className={cn("text-xs font-medium", device.status === "active" ? "text-ok" : "text-danger")}>
                  {device.status === "active" ? "Active" : "Unregistered"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-muted-foreground">
                <span className="rounded-sm bg-muted px-2 py-1">{device.platform === "android" ? "Android" : "iOS"}</span>
                <span className="rounded-sm bg-muted px-2 py-1">{tagLabel(device.tag)}</span>
                <span>{behaviorSummary(device.behavior ?? defaultBehavior(device.status))}</span>
                <span className="tabular-nums">{formatWhen(device.lastSeen)}</span>
                {device.status === "active" && canEdit ? (
                  <button
                    type="button"
                    className="ml-auto h-11 rounded-sm px-2 text-xs font-medium text-danger hover:bg-danger-bg"
                    onClick={() => {
                      void (async () => {
                        const error = await unregister(device.id);
                        if (error) toast.error(error);
                        else toast("Token marked unregistered. MAU −1.");
                      })();
                    }}
                  >
                    Drop token
                  </button>
                ) : null}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
