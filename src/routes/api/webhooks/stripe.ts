import { createFileRoute } from "@tanstack/react-router";
import { handleStripeRequest } from "@/lib/payment-apply.server";

export const Route = createFileRoute("/api/webhooks/stripe")({
  server: {
    handlers: {
      POST: ({ request }) => handleStripeRequest(request),
    },
  },
});
