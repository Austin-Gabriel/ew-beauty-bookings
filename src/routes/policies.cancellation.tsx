import { createFileRoute } from "@tanstack/react-router";
import { CancellationPolicyPage } from "@/bookings/CancellationPolicyPage";

export const Route = createFileRoute("/policies/cancellation")({
  head: () => ({
    meta: [
      { title: "Cancellation Policy — Ewà" },
      { name: "description", content: "Ewà's cancellation and refund policy for bookings." },
    ],
  }),
  component: CancellationPolicyPage,
});
