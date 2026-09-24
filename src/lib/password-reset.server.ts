import { randomBytes } from "node:crypto";
import { hashPassword } from "better-auth/crypto";
import { getSql } from "@/lib/db";
import {
  accountEmailError,
  hashResetCode,
  hashesMatch,
  isAccountState,
  newPasswordError,
  normalizeAccountEmail,
  type AccountState,
} from "@/lib/password-reset";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const TTL_MS = 20 * 60 * 1000;

type Body = { action?: unknown; email?: unknown; password?: unknown; confirm?: unknown };

function resetCookie(code: string, maxAge: number) {
  const value = code ? encodeURIComponent(code) : "";
  return `nock_reset=${value}; HttpOnly; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

function readCookie(request: Request) {
  const raw = request.headers.get("cookie") ?? "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === "nock_reset") return decodeURIComponent(rest.join("=")).trim().toUpperCase();
  }
  return "";
}

function json(body: object, status = 200, setCookie?: string) {
  const headers = new Headers();
  if (setCookie) headers.set("set-cookie", setCookie);
  return Response.json(body, { status, headers });
}

function sameOrigin(request: Request) {
  const site = request.headers.get("sec-fetch-site");
  return !site || site === "same-origin" || site === "none";
}

function newCode() {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < bytes.length; i += 1) code += ALPHABET[bytes[i]! % ALPHABET.length];
  return code;
}

async function classify(email: string): Promise<{ state: AccountState; userId: string | null }> {
  const sql = await getSql();
  const users = await sql<{ id: string }>`select id from "user" where lower(email) = ${email} limit 1`;
  const user = users[0];
  if (!user) return { state: "missing", userId: null };
  const admins = await sql<{ user_id: string }>`select user_id from platform_admins where user_id = ${user.id} limit 1`;
  if (admins[0]) return { state: "owner", userId: user.id };
  const accounts = await sql<{ password: string | null }>`
    select password from "account"
    where "userId" = ${user.id} and "providerId" = 'credential'
    limit 1
  `;
  if (accounts[0]?.password) return { state: "password", userId: user.id };
  return { state: "social", userId: user.id };
}

export async function handlePasswordReset(request: Request) {
  if (!sameOrigin(request)) return json({ error: "Forbidden" }, 403);
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body || (body.action !== "start" && body.action !== "finish" && body.action !== "status")) {
    return json({ error: "Unknown request." }, 400);
  }
  const emailError = accountEmailError(typeof body.email === "string" ? body.email : "");
  if (emailError) return json({ error: emailError }, 400);
  const email = normalizeAccountEmail(String(body.email));
  if (body.action === "status") {
    const found = await classify(email);
    return json({ state: found.state });
  }
  if (body.action === "start") return startReset(email);
  return finishReset(request, email, body);
}

async function startReset(email: string) {
  const sql = await getSql();
  const recent = await sql<{ n: number }>`
    select count(*)::int as n from password_resets
    where email = ${email} and created_at > now() - interval '15 minutes'
  `;
  if ((recent[0]?.n ?? 0) >= 5) return json({ error: "Wait a few minutes before requesting another reset." }, 429);

  const found = await classify(email);
  if (!isAccountState(found.state) || found.state === "missing" || found.state === "owner" || !found.userId) {
    return json({ issued: false, reason: found.state === "owner" ? "owner" : "missing" }, 200, resetCookie("", 0));
  }

  const code = newCode();
  const codeHash = await hashResetCode(email, code);
  const id = randomBytes(16).toString("hex");
  const expires = new Date(Date.now() + TTL_MS).toISOString();
  await sql`update password_resets set used_at = now() where email = ${email} and used_at is null`;
  await sql`
    insert into password_resets (id, user_id, email, code_hash, expires_at)
    values (${id}, ${found.userId}, ${email}, ${codeHash}, ${expires})
  `;
  return json({ issued: true, reason: found.state }, 200, resetCookie(code, 20 * 60));
}

async function finishReset(request: Request, email: string, body: Body) {
  const password = typeof body.password === "string" ? body.password : "";
  const confirm = typeof body.confirm === "string" ? body.confirm : "";
  const passwordError = newPasswordError(password, confirm);
  if (passwordError) return json({ error: passwordError }, 400);
  const code = readCookie(request);
  if (!/^[A-Z2-9]{8}$/.test(code)) return json({ error: "Request a new reset, then set the password." }, 400);

  const sql = await getSql();
  const rows = await sql<{ id: string; user_id: string; code_hash: string; attempts: number; expires_at: string | Date }>`
    select id, user_id, code_hash, attempts, expires_at
    from password_resets
    where email = ${email} and used_at is null
    order by created_at desc
    limit 1
  `;
  const row = rows[0];
  if (!row) return json({ error: "Request a new reset, then set the password." }, 400, resetCookie("", 0));
  const expiresAt = row.expires_at instanceof Date ? row.expires_at : new Date(row.expires_at);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() < Date.now()) {
    await sql`update password_resets set used_at = now() where id = ${row.id}`;
    return json({ error: "That reset expired. Request a new one." }, 400, resetCookie("", 0));
  }
  const matches = hashesMatch(row.code_hash, await hashResetCode(email, code));
  if (!matches) {
    const attempts = row.attempts + 1;
    if (attempts >= 5) await sql`update password_resets set attempts = ${attempts}, used_at = now() where id = ${row.id}`;
    else await sql`update password_resets set attempts = ${attempts} where id = ${row.id}`;
    return json({ error: "That reset is not valid. Request a new one." }, 400);
  }

  const found = await classify(email);
  if (found.state === "owner" || found.state === "missing" || found.userId !== row.user_id) {
    return json({ error: "That reset is not valid. Request a new one." }, 400, resetCookie("", 0));
  }

  const hashed = await hashPassword(password);
  const updated = await sql<{ id: string }>`
    update "account"
    set password = ${hashed}, "updatedAt" = now()
    where "userId" = ${row.user_id} and "providerId" = 'credential'
    returning id
  `;
  if (!updated[0]) {
    const accountId = randomBytes(16).toString("hex");
    await sql`
      insert into "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      values (${accountId}, ${row.user_id}, 'credential', ${row.user_id}, ${hashed}, now(), now())
    `;
  }
  await sql`update password_resets set used_at = now() where id = ${row.id}`;
  await sql`delete from "session" where "userId" = ${row.user_id}`;
  return json({ saved: true }, 200, resetCookie("", 0));
}
