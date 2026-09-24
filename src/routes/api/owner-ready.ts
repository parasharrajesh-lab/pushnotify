import { createFileRoute } from "@tanstack/react-router";
import { seedSystemOwner } from "@/lib/owner-seed.server";

export const Route = createFileRoute("/api/owner-ready")({
  server: {
    handlers: {
      POST: async () => {
        await seedSystemOwner();
        return Response.json({ ready: true });
      },
    },
  },
});
