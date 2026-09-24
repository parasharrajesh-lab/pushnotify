import { createFileRoute } from "@tanstack/react-router";
import { isPlan } from "@/lib/account-types";
import { getSql } from "@/lib/db";
import { signedReplay } from "@/lib/payment-apply.server";

async function ownerId(request: Request) {
  const { auth } = await import("@/lib/auth/server");
  const session = await auth.api.getSession({ headers: request.headers });
  const userId = session?.user?.id;
  if (!userId) return null;
  const sql = await getSql();
  const rows = await sql<{ user_id: string }>`select user_id from platform_admins where user_id = ${userId} limit 1`;
  return rows[0] ? userId : null;
}

export const Route = createFileRoute("/api/webhooks/replay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await ownerId(request))) return Response.json({ error: "System rights are required." }, { status: 403 });
        const body = (await request.json().catch(() => null)) as {
          provider?: string;
          email?: string;
          plan?: string;
          outcome?: string;
        } | null;
        const provider = body?.provider === "skydo" ? "skydo" : body?.provider === "stripe" ? "stripe" : null;
        const outcome = body?.outcome === "failed" || body?.outcome === "canceled" || body?.outcome === "paid" ? body.outcome : null;
        const email = (body?.email ?? "").trim().toLowerCase();
        const plan = body?.plan ?? "";
        if (!provider || !outcome || !isPlan(plan) || !email.includes("@")) {
          return Response.json({ error: "Choose Stripe or Skydo, a plan, and an owner email." }, { status: 400 });
        }
        const result = await signedReplay({ provider, email, plan, outcome });
        if ("error" in result && result.error) return Response.json({ error: result.error }, { status: 400 });
        return Response.json(result);
      },
    },
  },
});
