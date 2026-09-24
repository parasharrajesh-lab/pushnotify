import { getSql } from "@/lib/db";
import { SYSTEM_OWNER } from "@/lib/owner-credentials.server";

let pending: Promise<void> | null = null;

export function seedSystemOwner() {
  pending ??= run().catch((error) => {
    pending = null;
    throw error;
  });
  return pending;
}

async function run() {
  const { auth } = await import("@/lib/auth/server");
  const sql = await getSql();
  const existing = await sql<{ id: string }>`select id from "user" where lower(email) = ${SYSTEM_OWNER.email} limit 1`;
  if (!existing[0]) {
    await auth.api.signUpEmail({
      body: { email: SYSTEM_OWNER.email, password: SYSTEM_OWNER.password, name: SYSTEM_OWNER.name },
      headers: new Headers({ origin: "http://127.0.0.1:8080" }),
    });
  }
  const user = await sql<{ id: string }>`select id from "user" where lower(email) = ${SYSTEM_OWNER.email} limit 1`;
  if (!user[0]) return;
  await sql`insert into platform_admins (user_id) values (${user[0].id}) on conflict (user_id) do nothing`;
  const viewers = await sql<{ id: string }>`select id from "user" where email like ${'%@viewer.grok.invalid'}`;
  for (const viewer of viewers) {
    await sql`delete from platform_admins where user_id = ${viewer.id}`;
  }
}
