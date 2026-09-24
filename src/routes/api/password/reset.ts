import { createFileRoute } from "@tanstack/react-router";
import { handlePasswordReset } from "@/lib/password-reset.server";

export const Route = createFileRoute("/api/password/reset")({
  server: {
    handlers: {
      POST: ({ request }) => handlePasswordReset(request),
    },
  },
});
