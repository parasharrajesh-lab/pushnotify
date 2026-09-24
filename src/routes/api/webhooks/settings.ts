import { createFileRoute } from "@tanstack/react-router";
import { getSql } from "@/lib/db";
import { writeWebhookSettings } from "@/lib/payment-apply.server";

async function ownerId(request: Request) {
  const { auth } = await import("@/lib/auth/server");
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  if (!userId) return null;
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`select user_id from platform_admins where user_id = ${userId} limit 1`;
  return rows[0] ? userId : null;
}

export const Route = createFileRoute("/api/webhooks/settings")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await ownerId(request))) return Response.json({ error: "System rights are required." }, { status: 403 });
        const body = (await request.json().catch(() => null)) as { stripeSecret?: string; skydoSecret?: string } | null;
        const stripeSecret = (body?.stripeSecret ?? "").trim();
        const skydoSecret = (body?.skydoSecret ?? "").trim();
        if (stripeSecret.length < 8 || skydoSecret.length < 8 || stripeSecret.length > 200 || skydoSecret.length > 200) {
          return Response.json({ error: "Each secret needs 8–200 characters." }, { status: 400 });
        }
        await writeWebhookSettings({ stripeSecret, skydoSecret });
        return Response.json({ saved: true });
      },
    },
  },
});
