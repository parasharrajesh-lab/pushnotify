export type AccountState = "missing" | "owner" | "password" | "social";

export function normalizeAccountEmail(value: string) {
  return value.trim().toLowerCase();
}

export function accountEmailError(value: string) {
  const email = normalizeAccountEmail(value);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 160) return "Enter a valid email.";
  return null;
}

export function newPasswordError(password: string, confirm: string) {
  if (password.length < 8) return "Use at least 8 characters.";
  if (password.length > 128) return "Use at most 128 characters.";
  if (password !== confirm) return "Those passwords do not match.";
  return null;
}

export async function hashResetCode(email: string, code: string) {
  const data = new TextEncoder().encode(`${normalizeAccountEmail(email)}:${code.trim().toUpperCase()}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function hashesMatch(left: string, right: string) {
  if (left.length !== right.length) return false;
  let diff = 0;
  for (let i = 0; i < left.length; i += 1) diff |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return diff === 0;
}

export function isAccountState(value: unknown): value is AccountState {
  return value === "missing" || value === "owner" || value === "password" || value === "social";
}

/** Null means this email can set a new password. */
export function resetStartMessage(state: AccountState) {
  if (state === "missing") return "No account uses that email. Register a workspace.";
  if (state === "owner") return "The system owner password is not changed on this page.";
  return null;
}

export function signInFailureMessage(state: AccountState) {
  if (state === "missing") return "No account uses that email. Register a workspace.";
  if (state === "social") {
    return "This email is registered with Google or X. Set a password with Forgot password, or continue with that provider.";
  }
  if (state === "owner") return "That password does not match. The system owner password is not changed on this page.";
  return "That password does not match. Use Forgot password to set a new one.";
}

export function signUpConflictMessage(state: AccountState) {
  if (state === "owner") return "That email is the system owner. Use System owner sign in.";
  if (state === "social") {
    return "That email is already registered with Google or X. Set a password with Forgot password, or continue with that provider.";
  }
  if (state === "missing") return "No account uses that email. Register a workspace.";
  return "That email is already registered. The password does not match. Use Forgot password to set a new one.";
}

export function isExistingAccountError(message: string) {
  return /already exists/i.test(message);
}
