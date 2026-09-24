import { useState } from "react";
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
  onPlatform: (platform: Platform) => void;
};

export function Phone({ platform, title, body, link, image, video, appName, logo, pulse, surface = "lock", button = "", onPlatform }: PhoneProps) {
  const now = new Date();
  const time = now.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
  const show = title.trim().length > 0 || body.trim().length > 0;
  const [logoFailed, setLogoFailed] = useState(false);
  const mark = (appName.trim() || "N").charAt(0).toUpperCase();

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
              <article key={pulse} className="banner-in mx-3 max-h-64 overflow-hidden rounded-sm bg-notif p-3 text-foreground">
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
                {link.trim() ? <p className="truncate pt-2 font-mono text-xs text-subtle">{link.trim()}</p> : null}
              </article>
            ) : (
              <p className="px-6 pt-8 text-center text-sm text-screen-muted">Write a message to preview it on the lock screen.</p>
            )
          ) : (
            <div className="px-3 pt-4">
              <p className="text-sm font-medium">{appName || "App"}</p>
              <div className="mt-3 h-2 w-24 rounded-sm bg-screen-muted/40" />
              <div className="mt-2 h-2 w-16 rounded-sm bg-screen-muted/30" />
              {show ? (
                <article
                  key={pulse}
                  className={cn(
                    "banner-in overflow-hidden bg-notif p-3 text-foreground",
                    surface === "modal" ? "mt-10 rounded-lg" : "mt-4 rounded-sm",
                  )}
                >
                  <h3 className="text-sm font-semibold leading-snug">{title.trim() || "Untitled"}</h3>
                  <p className="pt-1 text-sm leading-snug text-muted-foreground">{body.trim() || "Message body"}</p>
                  {image ? <img src={image} alt="" className="mt-2 h-14 w-full rounded-sm object-cover" /> : null}
                  {surface === "primer" ? (
                    <p className="mt-3 h-9 rounded-sm bg-primary text-center text-sm font-medium leading-9 text-primary-foreground">
                      {button.trim() || "Allow"}
                    </p>
                  ) : null}
                </article>
              ) : (
                <p className="pt-6 text-center text-sm text-screen-muted">Write the in-app message.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <p className="pt-3 text-center text-xs text-muted-foreground">
        {surface === "lock" ? "Lock screen" : surface === "primer" ? "Permission primer" : "In-app message"}
      </p>
    </div>
  );
}
