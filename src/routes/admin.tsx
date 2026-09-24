import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Toaster } from "sonner";
import { AdminPanel } from "@/components/admin-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authEnabled } from "@/lib/auth/client";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { emailSignIn } from "@/lib/email-session";
import { usePush } from "@/lib/push-store";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) {
    return (
      <main className="grid min-h-dvh place-items-center bg-background text-foreground">
        <p className="font-display text-4xl font-medium">Nock</p>
      </main>
    );
  }
  if (!user) return <AdminLogin />;
  return <AdminGate />;
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetch("/api/owner-ready", { method: "POST" })
      .then(async (response) => {
        if (!response.ok) throw new Error("The system owner account is not ready.");
        setReady(true);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "The system owner account is not ready.");
      });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await emailSignIn({ email: email.trim(), password });
      window.location.assign("/admin");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-10 text-foreground">
      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-md flex-col gap-4">
        <p className="font-display text-4xl font-medium tracking-tight">Nock</p>
        <h1 className="font-display text-3xl font-medium tracking-tight">System owner</h1>
        <p className="text-sm text-muted-foreground">
          Separate from a business workspace. Enter the system owner email and password. They are not listed on this page.
        </p>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" required />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium">
          Password
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" disabled={busy || !ready || !authEnabled}>
          {ready ? (busy ? "Please wait…" : "Sign in") : "Preparing the owner account…"}
        </Button>
        <a href="/login" className="text-sm text-muted-foreground underline">
          Business sign in
        </a>
      </form>
    </main>
  );
}

function AdminGate() {
  const ready = usePush((s) => s.ready);
  const loadError = usePush((s) => s.loadError);
  const load = usePush((s) => s.load);
  const isSystemAdmin = usePush((s) => s.isSystemAdmin);
  const email = usePush((s) => s.email);
  const role = usePush((s) => s.role);
  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Toaster position="top-center" />
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-4">
        <div>
          <p className="font-display text-2xl font-medium">Nock</p>
          <p className="text-sm text-muted-foreground">System management</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" className="text-sm font-medium underline">
            Workspace
          </a>
          <UserButton />
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-6">
        {!ready ? <p className="font-display text-3xl font-medium">Nock</p> : null}
        {ready && loadError ? <p className="text-sm text-danger">{loadError}</p> : null}
        {ready && !loadError && !isSystemAdmin ? (
          <p className="max-w-md text-sm text-muted-foreground">
            This panel is only for the system owner. Signed in as {email || "unknown"} {role ? `(${role})` : "(no workspace)"}.
          </p>
        ) : null}
        {ready && !loadError && isSystemAdmin ? <AdminPanel /> : null}
      </div>
    </main>
  );
}
