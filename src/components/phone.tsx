import { useEffect, useState } from "react";
import { destinationPath } from "@/lib/notify";
import { type Platform } from "@/lib/push";
import { cn } from "@/lib/utils";

type PhoneProps = {
  platform: Platform;
  title: string;
  body: string;
  link: string;
  image: string;
  video: string;
  appName: string;
  logo: string;
  pulse: number;
  surface?: "lock" | "banner" | "modal" | "primer";
  button?: string;
  ctaLink?: string;
  onPlatform: (platform: Platform) => void;
};

export function Phone({ platform, title, body, link, image, video, appName, logo, pulse, surface = "lock", button = "", ctaLink = "", onPlatform }: PhoneProps) {
  const now = new Date();
  const time = now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const show = title.trim().length > 0 || body.trim().length > 0;
  const [logoFailed, setLogoFailed] = useState(false);
  const [opened, setOpened] = useState<"link" | "button" | null>(null);
  const mark = (appName.trim() || "N").charAt(0).toUpperCase();
  const messageLink = link.trim();
  const buttonLink = ctaLink.trim() || messageLink;
  const openHref = opened === "button" ? buttonLink : messageLink;
  const sameScreen = Boolean(messageLink) && destinationPath(buttonLink) === destinationPath(messageLink);
  const showImage = Boolean(image) && (opened === "link" || (opened === "button" && sameScreen));

  useEffect(() => {
    setOpened(null);
  }, [link, image, ctaLink, pulse]);

  return (
    <div className="mx-auto w-60">
      <div className="flex justify-center gap-1 pb-3" role="group" aria-label="Preview platform">
        {(["ios", "android"] as const).map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={platform === item}
            onClick={() => onPlatform(item)}
            className={cn(
              "h-11 rounded-sm px-3 text-xs font-medium",
              platform === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
            )}
          >
            {item === "ios" ? "iOS" : "Android"}
          </button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-foreground p-2">
        <div className="relative h-96 overflow-hidden rounded-lg bg-screen text-screen-fg">
          <div className="flex items-center justify-between px-4 pt-3 text-xs text-screen-muted">
            <span className="tabular-nums">{time}</span>
            <span>{platform === "ios" ? "Nock" : "LTE"}</span>
          </div>
          <p className="px-4 pt-5 text-center font-display text-4xl font-medium tabular-nums tracking-tight">{time}</p>
          <p className="px-4 pb-3 text-center text-xs text-screen-muted">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {surface === "lock" ? (
            show ? (
              <div key={pulse} className="banner-in mx-3">
                <button
                  type="button"
                  className="w-full overflow-hidden rounded-sm bg-notif p-3 text-left text-foreground"
                  onClick={() => messageLink && setOpened("link")}
                  disabled={!messageLink}
                >
                  <div className="flex items-center gap-2">
                    {logo && !logoFailed ? (
                      <img src={logo} alt="" className="size-6 rounded-sm object-cover" onError={() => setLogoFailed(true)} />
                    ) : (
                      <span className="flex size-6 items-center justify-center rounded-sm bg-primary font-mono text-xs font-semibold text-primary-foreground">
                        {mark}
                      </span>
                    )}
                    <p className="truncate text-xs font-medium">{appName || "App"}</p>
                    <p className="ml-auto text-xs text-muted-foreground">now</p>
                  </div>
                  <h3 className="pt-2 text-sm font-semibold leading-snug">{title.trim() || "Untitled"}</h3>
                  <p className="pt-1 text-sm leading-snug text-muted-foreground">{body.trim() || "Message body"}</p>
                  {image ? <img src={image} alt="" className="mt-2 h-16 w-full rounded-sm object-cover" /> : null}
                  {video ? <video src={video} className="mt-2 h-16 w-full rounded-sm" controls playsInline /> : null}
                  {messageLink ? <p className="truncate pt-2 font-mono text-xs text-subtle">{messageLink}</p> : null}
                </button>
                {button.trim() ? (
                  <button
                    type="button"
                    className="mt-2 h-9 w-full truncate rounded-sm bg-primary px-3 text-center text-sm font-medium text-primary-foreground"
                    onClick={() => setOpened("button")}
                  >
                    {button.trim()}
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="px-6 pt-8 text-center text-sm text-screen-muted">Write a message to preview it on the lock screen.</p>
            )
          ) : (
            <div className="px-3 pt-4">
              <p className="text-sm font-medium">{appName || "App"}</p>
              <div className="mt-3 h-2 w-24 rounded-sm bg-screen-muted/40" />
              <div className="mt-2 h-2 w-16 rounded-sm bg-screen-muted/30" />
              {show ? (
                <div key={pulse} className={cn("banner-in", surface === "modal" ? "mt-10" : "mt-4")}>
                  <button
                    type="button"
                    className="w-full overflow-hidden rounded-sm bg-notif p-3 text-left text-foreground"
                    onClick={() => messageLink && setOpened("link")}
                    disabled={!messageLink}
                  >
                    <h3 className="text-sm font-semibold leading-snug">{title.trim() || "Untitled"}</h3>
                    <p className="pt-1 text-sm leading-snug text-muted-foreground">{body.trim() || "Message body"}</p>
                    {image ? <img src={image} alt="" className="mt-2 h-14 w-full rounded-sm object-cover" /> : null}
                  </button>
                  {button.trim() ? (
                    <button
                      type="button"
                      className="mt-2 h-9 w-full truncate rounded-sm bg-primary px-3 text-center text-sm font-medium text-primary-foreground"
                      onClick={() => setOpened("button")}
                    >
                      {button.trim()}
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="pt-6 text-center text-sm text-screen-muted">Write the in-app message.</p>
              )}
            </div>
          )}
          {opened && openHref ? (
            <div className="absolute inset-0 flex flex-col bg-screen px-3 pt-8">
              <button type="button" className="self-start text-xs font-medium text-screen-fg" onClick={() => setOpened(null)}>
                Back
              </button>
              <p className="truncate pt-3 font-mono text-xs text-screen-muted">{destinationPath(openHref)}</p>
              {showImage ? (
                <img src={image} alt="" className="mt-3 h-40 w-full rounded-sm bg-foreground object-contain" />
              ) : (
                <p className="pt-6 text-sm text-screen-muted">This screen has no image.</p>
              )}
              <h3 className="pt-3 text-sm font-semibold text-screen-fg">{title.trim() || "Untitled"}</h3>
              <p className="pt-1 text-sm text-screen-muted">{body.trim()}</p>
            </div>
          ) : null}
        </div>
      </div>
      <p className="pt-3 text-center text-xs text-muted-foreground">
        {opened ? "Deep link screen" : surface === "lock" ? "Lock screen" : surface === "primer" ? "Permission primer" : "In-app message"}
      </p>
    </div>
  );
}
