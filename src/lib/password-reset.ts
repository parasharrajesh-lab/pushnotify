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
