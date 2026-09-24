import { authClient } from "@/lib/auth/client";

const BEARER_KEY = "grok-auth.bearer-token";

function messageOf(body: unknown, fallback: string) {
  if (!body || typeof body !== "object") return fallback;
  const record = body as { message?: unknown; error?: { message?: unknown } };
  if (typeof record.message === "string" && record.message) return record.message;
  if (typeof record.error?.message === "string" && record.error.message) return record.error.message;
  return fallback;
}

async function postAuth(path: string, payload: object) {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const token = response.headers.get("set-auth-token");
  if (token) sessionStorage.setItem(BEARER_KEY, token);
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(messageOf(body, "Sign-in failed."));
  await authClient.getSession();
}

export function emailSignUp(input: { name: string; email: string; password: string }) {
  return postAuth("/api/auth/sign-up/email", input);
}

export function emailSignIn(input: { email: string; password: string }) {
  return postAuth("/api/auth/sign-in/email", input);
}
