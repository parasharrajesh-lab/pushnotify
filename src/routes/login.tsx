import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { completeRegistration } from "@/lib/account-fns";
import { planLabel, type PlanId } from "@/lib/account-types";
import { emailSignIn, emailSignUp } from "@/lib/email-session";
import { accountEmailError, isAccountState, isExistingAccountError, newPasswordError, normalizeAccountEmail, resetStartMessage, signInFailureMessage, signUpConflictMessage, type AccountState } from "@/lib/password-reset";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/login")({ component: Login });

const PLANS: { id: PlanId; name: string; price: string; mau: string; points: string[] }[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    mau: "500 MAU",
    points: ["Android and iOS", "Image and deep link", "Sends pause at the cap"],
  },
  {
    id: "basic",
    name: "Basic",
    price: "₹4,999",
    mau: "10,000 MAU",
    points: ["Team and roles", "Then ₹0.80 per extra MAU", "Stripe or Skydo"],
  },
  {
    id: "advance",
    name: "Advance",
    price: "₹24,999",
    mau: "100,000 MAU",
    points: ["Video on the lock screen", "Then ₹0.40 per extra MAU", "Stripe or Skydo"],
  },
];

function Login() {
  const [mode, setMode] = useState<"in" | "up" | "reset">("up");
  const [plan, setPlan] = useState<PlanId>("free");
  const [name, setName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetReady, setResetReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function showMode(next: "in" | "up" | "reset") {
    setMode(next);
    setError("");
    setNotice("");
    setResetReady(false);
    setPassword("");
    setConfirm("");
  }

  async function accountState(mail: string): Promise<AccountState> {
    const response = await fetch("/api/password/reset", {
      method: "POST",
      credentials: "include",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "status", email: mail }),
    });
    const body = (await response.json().catch(() => null)) as { state?: unknown } | null;
    return isAccountState(body?.state) ? body.state : "missing";
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const mail = normalizeAccountEmail(email);
    if (mode !== "reset" && password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "reset") {
        if (!resetReady) {
          const emailError = accountEmailError(mail);
          if (emailError) {
            setError(emailError);
            setBusy(false);
            return;
          }
          const response = await fetch("/api/password/reset", {
            method: "POST",
            credentials: "include",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ action: "start", email: mail }),
          });
          const body = (await response.json().catch(() => null)) as { issued?: boolean; reason?: unknown; error?: string } | null;
          if (!response.ok) throw new Error(body?.error || "Could not start a reset.");
          if (!body?.issued) {
            setError(resetStartMessage(body?.reason === "owner" ? "owner" : "missing") ?? "No account uses that email. Register a workspace.");
            setBusy(false);
            return;
          }
          setResetReady(true);
          setNotice("Choose a new password. It replaces the old one for this email.");
          setBusy(false);
          return;
        }
        const passwordError = newPasswordError(password, confirm);
        if (passwordError) {
          setError(passwordError);
          setBusy(false);
          return;
        }
        const response = await fetch("/api/password/reset", {
          method: "POST",
          credentials: "include",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action: "finish", email: mail, password, confirm }),
        });
        const body = (await response.json().catch(() => null)) as { saved?: boolean; error?: string } | null;
        if (!response.ok || !body?.saved) throw new Error(body?.error || "Could not save the new password.");
        setResetReady(false);
        setPassword("");
        setConfirm("");
        setMode("in");
        setNotice("Password saved. Sign in with the new one.");
        setBusy(false);
        return;
      }
      if (mode === "up") {
        if (name.trim().length < 2 || businessName.trim().length < 2) {
          setError("Name and business are required.");
          setBusy(false);
          return;
        }
        try {
          await emailSignUp({ name: name.trim(), email: mail, password });
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : "";
          if (!isExistingAccountError(message)) throw caught;
          const state = await accountState(mail);
          if (state !== "password") throw new Error(signUpConflictMessage(state));
          try {
            await emailSignIn({ email: mail, password });
          } catch {
            throw new Error(signUpConflictMessage("password"));
          }
        }
        await completeRegistration({ data: { businessName: businessName.trim(), plan } });
      } else {
        try {
          await emailSignIn({ email: mail, password });
        } catch (caught) {
          const message = caught instanceof Error ? caught.message : "";
          if (!/invalid email or password/i.test(message)) throw caught;
          throw new Error(signInFailureMessage(await accountState(mail)));
        }
      }
      window.location.assign("/");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh bg-background px-4 py-8 text-foreground">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:items-start">
        <section>
          <p className="font-display text-4xl font-medium tracking-tight">Nock</p>
          <h1 className="pt-3 font-display text-3xl font-medium tracking-tight">
            {mode === "up" ? "Register a workspace" : mode === "reset" ? "New password" : "Sign in"}
          </h1>
          <p className="pt-2 max-w-md text-sm text-pretty text-muted-foreground">
            {mode === "reset"
              ? "Business emails can set a new password here. The system owner uses a separate sign-in."
              : "Mobile push for a business and its team. Pick a plan, then sign in with email, Google, or X."}
          </p>
          {mode === "up" ? (
            <div className="grid gap-3 pt-6">
              {PLANS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={plan === item.id}
                  onClick={() => setPlan(item.id)}
                  className={cn(
                    "rounded-xl border p-4 text-left",
                    plan === item.id ? "border-primary bg-card" : "border-border bg-card",
                  )}
                >
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="pt-1 font-display text-3xl font-medium tabular-nums">{item.price}</p>
                  <p className="text-xs text-muted-foreground">per month · {item.mau}</p>
                  <ul className="pt-3 text-sm text-muted-foreground">
                    {item.points.map((point) => (
                      <li key={point} className="border-t border-border py-1.5 first:border-t-0">
                        {point}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          ) : null}
          <p className="pt-4 text-xs text-muted-foreground">
            Free opens immediately. Basic and Advance can also be confirmed by a signed Stripe or Skydo payment. No card is charged on this page.
          </p>
        </section>

        <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              aria-pressed={mode === "up"}
              className={cn("h-11 rounded-sm text-sm font-medium", mode === "up" ? "bg-primary text-primary-foreground" : "bg-muted")}
              onClick={() => showMode("up")}
            >
              Register
            </button>
            <button
              type="button"
              aria-pressed={mode === "in"}
              className={cn("h-11 rounded-sm text-sm font-medium", mode === "in" ? "bg-primary text-primary-foreground" : "bg-muted")}
              onClick={() => showMode("in")}
            >
              Sign in
            </button>
          </div>
          {mode === "up" ? (
            <>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Your name
                <Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </label>
              <label className="flex flex-col gap-1 text-sm font-medium">
                Business name
                <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Metro Bites" />
              </label>
            </>
          ) : null}
          <label className="flex flex-col gap-1 text-sm font-medium">
            Email
            <Input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (resetReady) {
                  setResetReady(false);
                  setPassword("");
                  setConfirm("");
                  setNotice("");
                }
              }}
              autoComplete="email"
              required
            />
          </label>
          {mode !== "reset" || resetReady ? (
            <label className="flex flex-col gap-1 text-sm font-medium">
              {mode === "reset" ? "New password" : "Password"}
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                required
              />
            </label>
          ) : null}
          {mode === "in" ? (
            <button type="button" className="self-start text-sm underline" onClick={() => showMode("reset")}>
              Forgot password
            </button>
          ) : null}
          {mode === "reset" && resetReady ? (
            <label className="flex flex-col gap-1 text-sm font-medium">
              Confirm new password
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </label>
          ) : null}
          {notice ? <p className="text-sm text-muted-foreground">{notice}</p> : null}
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" disabled={busy || !authEnabled}>
            {busy
              ? "Please wait…"
              : mode === "up"
                ? `Create ${planLabel(plan)} workspace`
                : mode === "reset"
                  ? resetReady
                    ? "Save new password"
                    : "Continue"
                  : "Sign in"}
          </Button>
          {mode === "reset" ? (
            <button type="button" className="self-start text-sm underline" onClick={() => showMode("in")}>
              Back to sign in
            </button>
          ) : null}
          {authEnabled && mode !== "reset" ? (
            <div className="flex flex-col gap-2 border-t border-border pt-4">
              {GROK_PROVIDERS.map((provider) => (
                <Button
                  key={provider.providerId}
                  variant="outline"
                  onClick={() => {
                    void signIn(provider.providerId, { callbackURL: "/" }).catch((caught: unknown) => {
                      setError(caught instanceof Error ? caught.message : "Could not sign in.");
                    });
                  }}
                >
                  Continue with {provider.label}
                </Button>
              ))}
            </div>
          ) : null}
          {!authEnabled && mode !== "reset" ? (
            <p className="text-sm text-muted-foreground">Sign-in is disabled.</p>
          ) : null}
        </form>
      </div>
      <div className="mx-auto mt-8 w-full max-w-5xl border-t border-border pt-4">
        <a href="/admin" className="text-sm font-medium underline">
          System owner sign in
        </a>
        <p className="pt-1 max-w-md text-xs text-muted-foreground">
          Separate from a business workspace. The owner password is not shown.
        </p>
      </div>
    </main>
  );
}

