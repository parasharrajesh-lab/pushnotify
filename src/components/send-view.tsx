import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Phone } from "@/components/phone";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { audienceLabel, audienceSize, TAGS, tagLabel, type Audience, type Platform } from "@/lib/push";
import { usePush } from "@/lib/push-store";
import { cn, formatCount } from "@/lib/utils";

const CHOICES: { id: string; audience: Audience; label: string }[] = [
  { id: "all", audience: { kind: "all" }, label: "All devices" },
  { id: "android", audience: { kind: "platform", platform: "android" }, label: "Android" },
  { id: "ios", audience: { kind: "platform", platform: "ios" }, label: "iOS" },
  ...TAGS.map((tag) => ({ id: tag, audience: { kind: "tag", tag } as Audience, label: tagLabel(tag) })),
];

export function SendView() {
  const reach = usePush((s) => s.reach);
  const mau = usePush((s) => s.mau);
  const cap = usePush((s) => s.mauCap);
  const plan = usePush((s) => s.plan);
  const logo = usePush((s) => s.logo);
  const appName = usePush((s) => s.businessName);
  const overCap = usePush((s) => s.overCap);
  const send = usePush((s) => s.send);
  const [title, setTitle] = useState("Rider is nearby");
  const [body, setBody] = useState("Ananya is 4 minutes away with your Metro Bites order.");
  const [link, setLink] = useState("metrobites://order/4821");
  const [image, setImage] = useState("");
  const [video, setVideo] = useState("");
  const [choice, setChoice] = useState(CHOICES[3].id);
  const [preview, setPreview] = useState<Platform>("ios");
  const [pulse, setPulse] = useState(0);
  const [sending, setSending] = useState(false);

  const audience = CHOICES.find((item) => item.id === choice)?.audience ?? CHOICES[0].audience;
  const targeted = audienceSize(reach, audience);
  const blocked = overCap || mau >= cap;
  const snippet = `{
  "audience": ${JSON.stringify(audience)},
  "notification": {
    "title": ${JSON.stringify(title)},
    "body": ${JSON.stringify(body)},
    "link": ${JSON.stringify(link)},
    "image": ${JSON.stringify(image)},
    "video": ${JSON.stringify(video)}
  }
}`;

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (blocked || sending) return;
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    const error = await send({ title, body, link, image, video: plan === "advance" ? video : "", audience });
    setSending(false);
    if (error) {
      toast.error(error);
      return;
    }
    const latest = usePush.getState().campaigns[0];
    setPulse((n) => n + 1);
    if (audience.kind === "platform") setPreview(audience.platform);
    toast.success(latest ? `Delivered to ${formatCount(latest.delivered)} devices` : "Sent");
  }

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <form onSubmit={onSubmit} className="order-2 flex min-w-0 flex-1 flex-col gap-5 lg:order-1">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Send a push</h1>
          <p className="pt-1 text-sm text-pretty text-muted-foreground">
            Basic sends to Android and iOS. Pick a platform or a tag, then watch the lock screen.
          </p>
        </div>

        {blocked ? (
          <p className="rounded-lg border border-border bg-danger-bg px-4 py-3 text-sm text-danger">
            Basic includes {formatCount(cap)} MAU. Sends are paused until the cap clears.
          </p>
        ) : null}

        <label className="flex flex-col gap-2 text-sm font-medium">
          Title
          <Input value={title} maxLength={65} onChange={(e) => setTitle(e.target.value)} placeholder="Short title" />
          <span className="text-xs font-normal tabular-nums text-muted-foreground">{title.length}/65</span>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Message
          <Textarea value={body} maxLength={180} onChange={(e) => setBody(e.target.value)} placeholder="What should the lock screen say?" />
          <span className="text-xs font-normal tabular-nums text-muted-foreground">{body.length}/180</span>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Deep link
          <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="metrobites://order/4821" />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Image
          <Input value={image.startsWith("data:") ? "" : image} onChange={(e) => setImage(e.target.value)} placeholder="https:// image link" />
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
              reader.onload = () => setImage(typeof reader.result === "string" ? reader.result : "");
              reader.readAsDataURL(file);
            }}
          />
          {image ? <span className="text-xs font-normal text-muted-foreground">Image attached</span> : null}
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Video
          <Input
            value={video}
            disabled={plan !== "advance"}
            onChange={(e) => setVideo(e.target.value)}
            placeholder={plan === "advance" ? "https:// video link" : "Video is on Advance"}
          />
        </label>

        <fieldset>
          <legend className="pb-2 text-sm font-medium">Audience</legend>
          <div className="flex flex-wrap gap-2">
            {CHOICES.map((item) => {
              const on = item.id === choice;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setChoice(item.id);
                    if (item.audience.kind === "platform") setPreview(item.audience.platform);
                  }}
                  className={cn(
                    "h-10 rounded-sm px-3 text-sm font-medium",
                    on ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="pt-2 text-sm tabular-nums text-muted-foreground">
            {formatCount(targeted)} reachable devices · {audienceLabel(audience)}
          </p>
        </fieldset>

        <Button type="submit" disabled={blocked || sending || !title.trim() || !body.trim() || targeted === 0}>
          {sending ? "Sending…" : "Send push"}
        </Button>

        <details className="rounded-xl border border-border bg-card p-4">
          <summary className="text-sm font-medium">Same call over the API</summary>
          <pre className="mt-3 overflow-x-auto font-mono text-xs leading-relaxed text-muted-foreground">{snippet}</pre>
          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              void navigator.clipboard.writeText(snippet);
              toast.success("API body copied");
            }}
          >
            Copy body
          </Button>
        </details>
      </form>

      <div className="order-1 lg:sticky lg:top-24 lg:order-2 lg:w-64 lg:shrink-0">
        <Phone
          platform={preview}
          title={title}
          body={body}
          link={link}
          image={image}
          video={plan === "advance" ? video : ""}
          appName={appName}
          logo={logo}
          pulse={pulse}
          onPlatform={setPreview}
        />
        <div className="flex justify-center pt-3">
          <Badge>Basic · mobile only</Badge>
        </div>
      </div>
    </div>
  );
}
