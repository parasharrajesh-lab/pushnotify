import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type ConnectKind, type ConnectTarget } from "@/lib/account-types";
import { usePush } from "@/lib/push-store";
import { cn } from "@/lib/utils";

const TARGETS: { id: ConnectTarget; label: string }[] = [
  { id: "android", label: "Android" },
  { id: "ios", label: "iOS" },
  { id: "web", label: "Website" },
];

function targetLabel(target: ConnectTarget) {
  return TARGETS.find((item) => item.id === target)?.label ?? target;
}

export function ConnectView() {
  const grants = usePush((s) => s.grants);
  const connections = usePush((s) => s.connections);
  const rights = usePush((s) => s.rights);
  const addLink = usePush((s) => s.addLink);
  const removeLink = usePush((s) => s.removeLink);
  const testRun = usePush((s) => s.testRun);
  const connectToken = usePush((s) => s.connectToken);
  const subscribers = usePush((s) => s.subscribers);
  const canConnect = rights.includes("connect");
  const canTest = rights.includes("test");
  const [kind, setKind] = useState<ConnectKind>("sdk");
  const [target, setTarget] = useState<ConnectTarget>("android");
  const [name, setName] = useState("");
  const [endpoint, setEndpoint] = useState("");
  const [testId, setTestId] = useState("");
  const [title, setTitle] = useState("Test from Nock");
  const [body, setBody] = useState("This is a sandbox delivery to the connected app.");
  const [link, setLink] = useState("metrobites://test");
  const [tokenPlatform, setTokenPlatform] = useState<"android" | "ios">("android");
  const [tokenName, setTokenName] = useState("");
  const [token, setToken] = useState("");
  const tokens = subscribers.filter((item) => item.pushToken && item.status === "active");

  const kindOpen = kind === "sdk" ? grants.sdk : grants.webhook;
  const chosen = connections.find((item) => item.id === testId) ?? connections[0];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-medium tracking-tight">Connect</h1>
        <p className="pt-1 max-w-xl text-sm text-muted-foreground">
          Owners and developers add an SDK or a webhook after the system admin grants it. A test run records one delivery to that connection.
        </p>
      </div>

      <section className="flex flex-wrap gap-2 text-sm">
        <span className={cn("rounded-sm px-3 py-2", grants.sdk ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
          SDK {grants.sdk ? "granted" : "locked"}
        </span>
        <span className={cn("rounded-sm px-3 py-2", grants.webhook ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
          Webhook {grants.webhook ? "granted" : "locked"}
        </span>
        <span className={cn("rounded-sm px-3 py-2", grants.test ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
          Test run {grants.test ? "granted" : "locked"}
        </span>
      </section>

      <form
        className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void (async () => {
            const error = await connectToken({ platform: tokenPlatform, token, name: tokenName });
            if (error) toast.error(error);
            else {
              toast.success("Messaging token connected.");
              setToken("");
              setTokenName("");
            }
          })();
        }}
      >
        <h2 className="text-sm font-medium">Android and iOS messaging token</h2>
        <p className="text-sm text-muted-foreground">
          Paste an FCM registration token or a 64-character APNs device token. It is stored on this workspace and counted in MAU.
        </p>
        <div className="flex gap-2">
          {(["android", "ios"] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={tokenPlatform === item}
              onClick={() => setTokenPlatform(item)}
              className={cn("h-11 rounded-sm px-3 text-sm font-medium", tokenPlatform === item ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
              {item === "android" ? "Android" : "iOS"}
            </button>
          ))}
        </div>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Device name
          <Input value={tokenName} onChange={(e) => setTokenName(e.target.value)} placeholder="Rider phone" />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Token
          <Textarea value={token} onChange={(e) => setToken(e.target.value)} rows={3} required placeholder={tokenPlatform === "ios" ? "64 hex characters" : "FCM token with a colon"} />
        </label>
        <Button type="submit">Connect token</Button>
        {tokens.length > 0 ? (
          <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
            {tokens.map((item) => (
              <li key={item.id}>
                {item.name} · {item.platform === "ios" ? "iOS" : "Android"} · {item.pushToken?.slice(-8)}
              </li>
            ))}
          </ul>
        ) : null}
      </form>

      {canConnect ? (
        <form
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void (async () => {
              const error = await addLink({ kind, target, name, endpoint });
              if (error) toast.error(error);
              else {
                toast.success(kind === "sdk" ? "SDK key created." : "Webhook saved.");
                setName("");
                setEndpoint("");
              }
            })();
          }}
        >
          <h2 className="text-sm font-medium">Add a connection</h2>
          <div className="flex flex-wrap gap-2">
            {(["sdk", "webhook"] as const).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={kind === item}
                onClick={() => setKind(item)}
                className={cn("h-11 rounded-sm px-3 text-sm font-medium", kind === item ? "bg-primary text-primary-foreground" : "bg-muted")}
              >
                {item === "sdk" ? "SDK" : "Webhook"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {TARGETS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={target === item.id}
                onClick={() => setTarget(item.id)}
                className={cn("h-11 rounded-sm px-3 text-sm font-medium", target === item.id ? "bg-primary text-primary-foreground" : "bg-muted")}
              >
                {item.label}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Name
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Metro Bites Android" required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            {kind === "webhook" ? "Webhook URL" : target === "web" ? "Site origin" : target === "ios" ? "Bundle id" : "Package name"}
            <Input
              value={endpoint}
              onChange={(e) => setEndpoint(e.target.value)}
              placeholder={kind === "webhook" ? "https://api.example.com/nock" : target === "web" ? "https://app.example.com" : "com.example.app"}
              required={kind === "webhook"}
            />
          </label>
          {!kindOpen ? (
            <p className="text-sm text-muted-foreground">The system admin has not granted {kind === "sdk" ? "SDK" : "webhook"} access yet.</p>
          ) : null}
          <Button type="submit" disabled={!kindOpen}>
            {kind === "sdk" ? "Create SDK key" : "Save webhook"}
          </Button>
        </form>
      ) : null}

      <ul className="flex flex-col gap-2">
        {connections.length === 0 ? <li className="text-sm text-muted-foreground">No SDK or webhook yet.</li> : null}
        {connections.map((item) => (
          <li key={item.id} className="rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  {item.kind === "sdk" ? "SDK" : "Webhook"} · {targetLabel(item.target)}
                  {item.endpoint ? ` · ${item.endpoint}` : ""}
                </p>
              </div>
              {canConnect ? (
                <button
                  type="button"
                  className="h-10 rounded-sm px-3 text-xs font-medium text-danger hover:bg-danger-bg"
                  onClick={() => {
                    void (async () => {
                      const error = await removeLink(item.id);
                      if (error) toast.error(error);
                    })();
                  }}
                >
                  Remove
                </button>
              ) : null}
            </div>
            {item.appKey ? (
              <p className="mt-2 break-all font-mono text-xs text-subtle">App key {item.appKey}</p>
            ) : null}
          </li>
        ))}
      </ul>

      {canTest ? (
        <form
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!chosen) return;
            void (async () => {
              const error = await testRun({ connectionId: chosen.id, title, body, link });
              if (error) toast.error(error);
              else toast.success(`Test recorded for ${chosen.name}.`);
            })();
          }}
        >
          <h2 className="text-sm font-medium">Test run</h2>
          <p className="text-sm text-muted-foreground">Sends one sandbox delivery to the connection you pick. It stays in Activity.</p>
          {connections.length === 0 ? <p className="text-sm text-muted-foreground">Add a connection before a test run.</p> : null}
          <div className="flex flex-wrap gap-2">
            {connections.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={(testId || connections[0]?.id) === item.id}
                onClick={() => setTestId(item.id)}
                className={cn(
                  "h-11 rounded-sm px-3 text-sm font-medium",
                  (testId || connections[0]?.id) === item.id ? "bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                {item.name}
              </button>
            ))}
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Title
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Message
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium">
            Deep link
            <Input value={link} onChange={(e) => setLink(e.target.value)} />
          </label>
          {!grants.test ? <p className="text-sm text-muted-foreground">The system admin has not granted test runs yet.</p> : null}
          <Button type="submit" disabled={!grants.test || connections.length === 0}>
            Run test
          </Button>
        </form>
      ) : null}
    </div>
  );
}
