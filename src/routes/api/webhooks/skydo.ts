import { createFileRoute } from "@tanstack/react-router";
import { handleSkydoRequest } from "@/lib/payment-apply.server";

export const Route = createFileRoute("/api/webhooks/skydo")({
  server: {
    handlers: {
      POST: ({ request }) => handleSkydoRequest(request),
    },
  },
});
