import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Phone } from "@/components/phone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { reviewCampaign, stateLabel, STEPS, tokenCounts, type CampaignDraft, type StepName } from "@/lib/notify";
import { audienceLabel, audienceSize, TAGS, tagLabel, type Audience, type Platform } from "@/lib/push";
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
  button: "Allow",
  delivery: "now",
  ttlHours: 24,
  delaySeconds: 0,
  quietHours: true,
  goal: "Order opened",
};

export function SendView() {
  const reach = usePush((s) => s.reach);
  const subscribers = usePush((s) => s.subscribers);
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
  }));
  const reviewed = reviewCampaign({ draft, reach, devices, plan });
  const tokens = tokenCounts(devices, draft.audience);
  const index = STEPS.indexOf(step);

  function patch(next: Partial<CampaignDraft>) {
    setDraft((current) => ({ ...current, ...next }));
  }

  function go(next: StepName) {
    const problem = reviewCampaign({ draft, reach, devices, plan }).error;
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
    toast.success(stateLabel(reviewed.state));
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
                <Choice on={draft.channel === "push"} label="Push" detail="Lock screen · FCM and APNs" onClick={() => patch({ channel: "push", layout: "lock" })} />
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
              <Input value={draft.goal} maxLength={80} onChange={(e) => patch({ goal: e.target.value })} placeholder="Optional conversion, such as Order opened" />
            </label>
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
            </fieldset>
            <p className="pt-3 text-sm tabular-nums text-muted-foreground">
              Estimated reach {formatCount(draft.layout === "primer" ? tokens.waiting : audienceSize(reach, draft.audience))} · {audienceLabel(draft.audience)}
            </p>
            {reviewed.error && (draft.layout === "primer" || audienceSize(reach, draft.audience) === 0) ? (
              <p className="pt-2 text-sm text-danger">{reviewed.error}</p>
            ) : null}
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
            <label className="flex flex-col gap-1 text-sm font-medium">
              Deep link
              <Input value={draft.link} onChange={(e) => patch({ link: e.target.value })} placeholder="app://order/4821" />
            </label>
            {draft.layout === "primer" ? (
              <label className="flex flex-col gap-1 text-sm font-medium">
                Button
                <Input value={draft.button} maxLength={24} onChange={(e) => patch({ button: e.target.value })} />
              </label>
            ) : null}
            <label className="flex flex-col gap-1 text-sm font-medium">
              Image
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
                  label="Later"
                  detail=""
                  onClick={() => patch({ delivery: "later", qualification: draft.qualification === "past" ? "past" : "past" })}
                />
              </div>
            </fieldset>
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
              Quiet hours, 9pm to 9am
            </label>
            {reviewed.error ? <p className="text-sm text-danger">{reviewed.error}</p> : null}
          </section>
        ) : null}

        {step === "Publish" ? (
          <section className="rounded-xl border border-border bg-card p-4 text-sm">
            <p className="font-medium">Summary</p>
            <ul className="pt-2 text-muted-foreground">
              <li>{draft.channel === "push" ? "Push" : "In-app"} · {draft.qualification === "past" ? "Past behavior" : draft.qualification === "live" ? "Live behavior" : "External trigger"}</li>
              <li>{audienceLabel(draft.audience)} · {formatCount(reviewed.targeted)} reachable</li>
              <li>{draft.delivery === "now" ? "Send now" : "Schedule"} · {stateLabel(reviewed.state)}</li>
              {draft.channel === "push" ? <li>TTL {draft.ttlHours} hours · APNs {formatCount(tokens.ios)} · FCM {formatCount(tokens.android)}</li> : <li>Delay {draft.delaySeconds}s · {draft.layout}</li>}
              {draft.goal ? <li>Goal · {draft.goal}</li> : null}
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
          onPlatform={setPreview}
        />
      </div>
    </div>
  );
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
