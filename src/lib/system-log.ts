import type { Sql } from "@/lib/db";

export async function writeSystemLog(
  sql: Sql,
  input: { actorId: string; action: string; detail: string; businessId?: string },
) {
  const action = input.action.trim().slice(0, 80);
  const detail = input.detail.trim().replace(/\s+/g, " ").slice(0, 240);
  if (!action) return;
  await sql`
    insert into system_logs (id, actor_id, action, business_id, detail)
    values (${crypto.randomUUID()}, ${input.actorId}, ${action}, ${input.businessId ?? ""}, ${detail})
  `;
}
