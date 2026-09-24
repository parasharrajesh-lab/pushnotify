import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Phone } from "@/components/phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { APP_EVENTS, attributeLabel, GOAL_METRICS, goalLabel, IOS_EVENTS, type BehaviorAttribute, type GoalMetric } from "@/lib/behavior";
import { ctaHref, destinationPath, formatSchedule, frequencyLabel, imageError, isoToIstInput, istInputToIso, reviewCampaign, stateLabel, STEPS, suggestEnd, suggestStart, tokenCounts, type CampaignDraft, type Frequency, type StepName } from "@/lib/notify";
import { audienceLabel, SAMPLE_DISH, TAGS, tagLabel, type Audience, type Platform } from "@/lib/push";
import { usePush } from "@/lib/push-store";
import { cn, formatCount } from "@/lib/utils";

const CHOICES: { id: string; audience: Audience; label: string }[] = [
  { id: "all", audience: { kind: "all" }, label: "All users" },
  { id: "android", audience: { kind: "platform", platform: "android" }, label: "Android" },
  { id: "ios", audience: { kind: "platform", platform: "ios" }, label: "iOS" },
  ...TAGS.map((tag) => ({ id: tag, audience: { kind: "tag", tag } as Audience, label: tagLabel(tag) })),
];

const EMPTY: CampaignDraft = {
  channel: "push",
  qualification: "past",
  layout: "lock",
  audience: { kind: "tag", tag: "orders" },
  title: "Rider is nearby",
  body: "Ananya is 4 minutes away with your order.",
  link: "metrobites://order/4821",
  image: "",
  video: "",
  button: "Track order",
  ctaLink: "",
  delivery: "now",
  scheduleAt: "",
  endsAt: "",
  ttlHours: 24,
  delaySeconds: 0,
  quietHours: true,
  frequency: "once",
  frequencyCap: 1,
  goal: "Opened the notification",
  goalMetric: "opened",
  attributes: [],
};

export function SendView() {
  const reach = usePush((s) => s.reach);
  const subscribers = usePush((s) => s.subscribers);
  const segments = usePush((s) => s.segments);
  const plan = usePush((s) => s.plan);
  const logo = usePush((s) => s.logo);
  const appName = usePush((s) => s.businessName);
  const send = usePush((s) => s.send);
  const [draft, setDraft] = useState<CampaignDraft>(EMPTY);
  const [step, setStep] = useState<StepName>("Start");
  const [choice, setChoice] = useState("orders");
  const [preview, setPreview] = useState<Platform>("ios");
  const [pulse, setPulse] = useState(0);
  const [sending, setSending] = useState(false);

  const devices = subscribers.map((device) => ({
    platform: device.platform,
    tag: device.tag,
    status: device.status,
    pushToken: device.pushToken,
    behavior: device.behavior,
  }));
  const reviewed = reviewCampaign({ draft, reach, devices, segments, plan });
  const tokens = tokenCounts(devices, draft.audience);
  const index = STEPS.indexOf(step);

  function patch(next: Partial<CampaignDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function toggleAttribute(item: BehaviorAttribute) {
    const has = draft.attributes.includes(item);
    const next = has ? draft.attributes.filter((current) => current !== item) : [...draft.attributes, item];
    if (!has && next.length > 4) {
      toast.error("Use up to 4 behavior attributes.");
      return;
    }
    patch({ attributes: next });
  }

  function go(next: StepName) {
    const problem = reviewCampaign({ draft, reach, devices, segments, plan }).error;
    const early = step === "What" || step === "When" || next === "Publish" || next === "When";
    if (early && problem && STEPS.indexOf(next) > index) {
      toast.error(problem);
      return;
    }
    setStep(next);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (step !== "Publish") {
      const next = STEPS[index + 1];
      if (next) go(next);
      return;
    }
    if (reviewed.error || sending) {
      if (reviewed.error) toast.error(reviewed.error);
      return;
    }
    setSending(true);
    const error = await send(draft);
    setSending(false);
    if (error) {
      toast.error(error);
      return;
    }
    setPulse((n) => n + 1);
    toast.success(stateLabel(reviewed.state, draft.qualification));
  }

  function setFrequency(frequency: Frequency) {
    const cap = frequency === "daily" ? Math.min(draft.frequencyCap || 1, 5) : Math.min(draft.frequencyCap || 1, 10);
    const start = draft.delivery === "later" && draft.scheduleAt ? draft.scheduleAt : new Date().toISOString();
    patch({
      frequency,
      frequencyCap: frequency === "once" ? 1 : Math.max(1, cap),
      endsAt: frequency === "daily" || frequency === "weekly" ? draft.endsAt || suggestEnd(start) : draft.endsAt,
    });
  }

  const surface = draft.channel === "push" ? "lock" : draft.layout;

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <form onSubmit={onSubmit} className="order-2 flex min-w-0 flex-1 flex-col gap-5 lg:order-1">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Campaign</h1>
          <p className="pt-1 text-sm text-pretty text-muted-foreground">
            Push reaches the lock screen through FCM and APNs. In-app shows inside the open app, including the permission primer.
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="Campaign steps">
          {STEPS.map((name, item) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={step === name}
              onClick={() => go(name)}
              className={cn(
                "h-11 shrink-0 rounded-sm px-3 text-sm font-medium",
                step === name ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {item + 1}. {name}
            </button>
          ))}
        </div>

        {step === "Start" ? (
          <section className="flex flex-col gap-4">
            <fieldset>
              <legend className="pb-2 text-sm font-medium">Channel</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                <Choice on={draft.channel === "push"} label="Push" detail="Lock screen · FCM and APNs" onClick={() => patch({ channel: "push", layout: "lock", frequency: draft.frequency === "session" ? "once" : draft.frequency, frequencyCap: draft.frequency === "session" ? 1 : draft.frequencyCap })} />
                <Choice on={draft.channel === "inapp"} label="In-app" detail="Shown while the app is open" onClick={() => patch({ channel: "inapp", layout: draft.layout === "lock" ? "banner" : draft.layout })} />
              </div>
            </fieldset>
            <fieldset>
              <legend className="pb-2 text-sm font-medium">Who qualifies</legend>
              <div className="flex flex-wrap gap-2">
                <Choice on={draft.qualification === "past"} label="Past behavior" detail="" onClick={() => patch({ qualification: "past" })} />
                <Choice on={draft.qualification === "live"} label="Live behavior" detail="" onClick={() => patch({ qualification: "live", delivery: "now" })} />
                <Choice on={draft.qualification === "external"} label="External trigger" detail="" onClick={() => patch({ qualification: "external", delivery: "now" })} />
              </div>
            </fieldset>
            <div className="rounded-xl border border-border bg-card p-4 text-sm">
              <p className="font-medium">iOS and Android setup</p>
              <ol className="list-decimal space-y-1 pt-2 pl-4 text-muted-foreground">
                <li>Ask with an in-app primer before the system permission.</li>
                <li>Save the APNs or FCM token on the device.</li>
                <li>Address the campaign to those tokens, with a deep link and rich media.</li>
              </ol>
              <p className="pt-3 tabular-nums text-muted-foreground">
                APNs tokens {formatCount(tokens.ios)} · FCM tokens {formatCount(tokens.android)} · Waiting on permission {formatCount(tokens.waiting)}
              </p>
            </div>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Goal
            </label>
            <div className="flex flex-wrap gap-2">
              {GOAL_METRICS.map((metric) => (
                <Choice key={metric} on={draft.goalMetric === metric} label={goalLabel(metric)} detail="" onClick={() => patch({ goalMetric: metric as GoalMetric, goal: goalLabel(metric) })} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Counted after delivery. A denied or not-asked device cannot count as an open.</p>
          </section>
        ) : null}

        {step === "Who" ? (
          <section>
            <fieldset>
              <legend className="pb-2 text-sm font-medium">Audience</legend>
              <div className="flex flex-wrap gap-2">
                {CHOICES.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={choice === item.id}
                    onClick={() => {
                      setChoice(item.id);
                      patch({ audience: item.audience });
                      if (item.audience.kind === "platform") setPreview(item.audience.platform);
                    }}
                    className={cn("h-10 rounded-sm px-3 text-sm font-medium", choice === item.id ? "bg-primary text-primary-foreground" : "bg-muted")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              {segments.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-3">
                  {segments.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={choice === item.id}
                      onClick={() => {
                        setChoice(item.id);
                        patch({ audience: { kind: "segment", segmentId: item.id } });
                      }}
                      className={cn("h-10 rounded-sm px-3 text-sm font-medium", choice === item.id ? "bg-primary text-primary-foreground" : "bg-muted")}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="pt-3 text-sm text-muted-foreground">Create a segment to target behavior.</p>
              )}
            </fieldset>
            <fieldset>
              <legend className="pb-2 text-sm font-medium">Behavior attributes</legend>
              <p className="pb-2 text-sm text-muted-foreground">Every selected event must be true. App events follow the analytics names. iOS events are the notification permission.</p>
              <p className="pb-1 text-xs font-medium text-muted-foreground">App events</p>
              <div className="flex flex-wrap gap-2">
                {APP_EVENTS.map((item) => (
                  <Attr key={item} on={draft.attributes.includes(item)} label={attributeLabel(item)} onClick={() => toggleAttribute(item)} />
                ))}
              </div>
              <p className="pb-1 pt-3 text-xs font-medium text-muted-foreground">iOS permission</p>
              <div className="flex flex-wrap gap-2">
                {IOS_EVENTS.map((item) => (
                  <Attr key={item} on={draft.attributes.includes(item)} label={attributeLabel(item)} onClick={() => toggleAttribute(item)} />
                ))}
              </div>
            </fieldset>
            <p className="pt-3 text-sm tabular-nums text-muted-foreground">
              Estimated reach {formatCount(reviewed.targeted)} · {audienceName(draft.audience, segments)}
            </p>
            {reviewed.error && reviewed.targeted === 0 ? <p className="pt-2 text-sm text-danger">{reviewed.error}</p> : null}
          </section>
        ) : null}

        {step === "What" ? (
          <section className="flex flex-col gap-4">
            {draft.channel === "inapp" ? (
              <fieldset>
                <legend className="pb-2 text-sm font-medium">Layout</legend>
                <div className="flex flex-wrap gap-2">
                  <Choice on={draft.layout === "banner"} label="Banner" detail="" onClick={() => patch({ layout: "banner" })} />
                  <Choice on={draft.layout === "modal"} label="Modal" detail="" onClick={() => patch({ layout: "modal" })} />
                  <Choice on={draft.layout === "primer"} label="Push primer" detail="" onClick={() => patch({ layout: "primer" })} />
                </div>
              </fieldset>
            ) : (
              <p className="text-sm text-muted-foreground">One message on the lock screen. Title, body, image, and a deep link.</p>
            )}
            <label className="flex flex-col gap-1 text-sm font-medium">
              Title
              <Input value={draft.title} maxLength={65} onChange={(e) => patch({ title: e.target.value })} />
              <span className="text-xs font-normal tabular-nums text-muted-foreground">{draft.title.length}/65</span>
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Message
              <Textarea value={draft.body} maxLength={180} onChange={(e) => patch({ body: e.target.value })} />
              <span className="text-xs font-normal tabular-nums text-muted-foreground">{draft.body.length}/180</span>
            </label>
            <fieldset className="rounded-xl border border-border p-3">
              <legend className="px-1 text-sm font-medium">Deep link</legend>
              <label className="flex flex-col gap-1 text-sm font-medium">
                URL
                <Input value={draft.link} onChange={(e) => patch({ link: e.target.value })} placeholder="metrobites://order/4821" />
              </label>
              <p className="pt-2 text-sm text-muted-foreground">
                The image opens on this screen when the person taps the message{draft.link.trim() ? `: ${destinationPath(draft.link)}` : ""}.
              </p>
              <label className="flex flex-col gap-1 pt-3 text-sm font-medium">
                Image for this screen
                <Input value={draft.image.startsWith("data:") ? "" : draft.image} onChange={(e) => patch({ image: e.target.value })} placeholder="https:// image" />
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="text-sm text-muted-foreground"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    if (file.size > 120_000) {
                      toast.error("Image must be under 120 KB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = () => patch({ image: typeof reader.result === "string" ? reader.result : "" });
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              <button type="button" className="mt-2 text-sm font-medium underline" onClick={() => patch({ image: SAMPLE_DISH })}>
                Use sample image
              </button>
              {draft.image && draft.link.trim() ? (
                <img src={draft.image} alt="" className="mt-3 h-24 w-full rounded-sm bg-foreground object-contain" />
              ) : null}
              {imageError(draft.image, draft.link) ? <p className="pt-2 text-sm text-danger">{imageError(draft.image, draft.link)}</p> : null}
            </fieldset>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Button
              <Input value={draft.button} maxLength={24} onChange={(e) => patch({ button: e.target.value })} placeholder="Track order" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Button deep link
              <Input value={draft.ctaLink} onChange={(e) => patch({ ctaLink: e.target.value })} placeholder="Leave empty to use the message deep link" />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium">
              Video
              <Input
                value={draft.video}
                disabled={plan !== "advance" || draft.layout === "primer"}
                onChange={(e) => patch({ video: e.target.value })}
                placeholder={plan === "advance" ? "https:// video" : "Video is on Advance"}
              />
            </label>
          </section>
        ) : null}

        {step === "When" ? (
          <section className="flex flex-col gap-4">
            <fieldset>
              <legend className="pb-2 text-sm font-medium">Delivery</legend>
              <div className="flex flex-wrap gap-2">
                <Choice on={draft.delivery === "now"} label="Now" detail="" onClick={() => patch({ delivery: "now" })} />
                <Choice
                  on={draft.delivery === "later"}
                  label="Custom time"
                  detail=""
                  onClick={() => patch({ delivery: "later", scheduleAt: draft.scheduleAt || suggestStart() })}
                />
              </div>
              <p className="pt-2 text-sm text-muted-foreground">
                {draft.qualification === "past"
                  ? "Past behavior sends at this time."
                  : "Live and external triggers start accepting the action at this time. They do not send on the clock."}
              </p>
            </fieldset>
            {draft.delivery === "later" ? (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Date and time (IST)
                <Input
                  type="datetime-local"
                  value={isoToIstInput(draft.scheduleAt)}
                  onChange={(e) => patch({ scheduleAt: istInputToIso(e.target.value) })}
                />
              </label>
            ) : null}
            <fieldset>
              <legend className="pb-2 text-sm font-medium">Frequency</legend>
              <div className="flex flex-wrap gap-2">
                <Choice on={draft.frequency === "once"} label="Once" detail="" onClick={() => patch({ frequency: "once", frequencyCap: 1 })} />
                {draft.channel === "inapp" ? (
                  <Choice on={draft.frequency === "session"} label="Per session" detail="" onClick={() => setFrequency("session")} />
                ) : null}
                <Choice on={draft.frequency === "daily"} label="Daily" detail="" onClick={() => setFrequency("daily")} />
                <Choice on={draft.frequency === "weekly"} label="Weekly" detail="" onClick={() => setFrequency("weekly")} />
              </div>
            </fieldset>
            {draft.frequency !== "once" ? (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Cap per device
                <Input
                  type="number"
                  min={1}
                  max={draft.frequency === "daily" ? 5 : 10}
                  value={draft.frequencyCap}
                  onChange={(e) => patch({ frequencyCap: Math.round(Number(e.target.value)) })}
                />
              </label>
            ) : null}
            {draft.frequency === "daily" || draft.frequency === "weekly" || draft.channel === "inapp" ? (
              <label className="flex flex-col gap-1 text-sm font-medium">
                {draft.frequency === "daily" || draft.frequency === "weekly" ? "End (IST)" : "Stop showing after (IST, optional)"}
                <Input
                  type="datetime-local"
                  value={isoToIstInput(draft.endsAt)}
                  onChange={(e) => patch({ endsAt: istInputToIso(e.target.value) })}
                />
              </label>
            ) : null}
            {draft.channel === "push" ? (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Time to live, hours
                <Input
                  type="number"
                  min={1}
                  max={72}
                  value={draft.ttlHours}
                  onChange={(e) => patch({ ttlHours: Number(e.target.value) })}
                />
              </label>
            ) : (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Delay after the trigger, seconds
                <Input
                  type="number"
                  min={0}
                  max={1200}
                  value={draft.delaySeconds}
                  onChange={(e) => patch({ delaySeconds: Number(e.target.value) })}
                />
              </label>
            )}
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={draft.quietHours} onChange={(e) => patch({ quietHours: e.target.checked })} />
              Quiet hours, 9pm to 9am IST
            </label>
            {reviewed.error ? <p className="text-sm text-danger">{reviewed.error}</p> : null}
          </section>
        ) : null}

        {step === "Publish" ? (
          <section className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="font-medium">Summary</p>
            <ul className="pt-2 text-muted-foreground">
              <li>{draft.channel === "push" ? "Push" : "In-app"} · {draft.qualification === "past" ? "Past behavior" : draft.qualification === "live" ? "Live behavior" : "External trigger"}</li>
              <li>{audienceName(draft.audience, segments)}{draft.attributes.length ? ` · ${draft.attributes.map(attributeLabel).join(", ")}` : ""} · {formatCount(reviewed.targeted)} reachable</li>
              <li>{draft.button.trim() ? `${draft.button.trim()} → ${ctaHref(draft)}` : "No button. A tap uses the deep link."}</li>
              {draft.image ? <li>Image opens on {destinationPath(draft.link) || "the deep link"}</li> : null}
              <li>{draft.delivery === "now" ? "Send now" : formatSchedule(draft.scheduleAt) || "Custom time"} · {stateLabel(reviewed.state, draft.qualification)}</li>
              <li>
                {frequencyLabel(draft.frequency, draft.frequencyCap)}
                {draft.endsAt ? ` · until ${formatSchedule(draft.endsAt)}` : ""}
              </li>
              {draft.channel === "push" ? <li>TTL {draft.ttlHours} hours · APNs {formatCount(tokens.ios)} · FCM {formatCount(tokens.android)}</li> : <li>Delay {draft.delaySeconds}s · {draft.layout}</li>}
              {draft.goalMetric ? <li>Goal · {goalLabel(draft.goalMetric)}{reviewed.state === "sent" ? ` · ${formatCount(reviewed.goalHits)}` : " · counted after it sends"}</li> : null}
            </ul>
            {reviewed.error ? <p className="pt-3 text-danger">{reviewed.error}</p> : null}
          </section>
        ) : null}

        <div className="flex gap-2">
          {index > 0 ? (
            <Button type="button" variant="outline" onClick={() => setStep(STEPS[index - 1] ?? "Start")}>
              Back
            </Button>
          ) : null}
          <Button type="submit" disabled={sending || (step === "Publish" && Boolean(reviewed.error))}>
            {sending ? "Publishing…" : step === "Publish" ? "Publish campaign" : "Continue"}
          </Button>
        </div>
      </form>

      <div className="order-1 lg:sticky lg:top-24 lg:order-2 lg:w-64 lg:shrink-0">
        <Phone
          platform={preview}
          title={draft.title}
          body={draft.body}
          link={draft.link}
          image={draft.image}
          video={plan === "advance" ? draft.video : ""}
          appName={appName}
          logo={logo}
          pulse={pulse}
          surface={surface === "lock" ? "lock" : surface}
          button={draft.button}
          ctaLink={draft.ctaLink}
          onPlatform={setPreview}
        />
      </div>
    </div>
  );
}

function Attr({ on, label, onClick }: { on: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn("h-10 rounded-sm px-3 font-mono text-xs font-medium", on ? "bg-primary text-primary-foreground" : "bg-muted")}
    >
      {label}
    </button>
  );
}

function audienceName(audience: Audience, segments: { id: string; name: string }[]) {
  if (audience.kind === "segment") return segments.find((item) => item.id === audience.segmentId)?.name ?? "Segment";
  return audienceLabel(audience);
}

function Choice({ on, label, detail, onClick }: { on: boolean; label: string; detail: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn("rounded-xl border px-3 py-3 text-left", on ? "border-primary bg-card" : "border-border bg-card")}
    >
      <p className="text-sm font-medium">{label}</p>
      {detail ? <p className="pt-1 text-xs text-muted-foreground">{detail}</p> : null}
    </button>
  );
}
