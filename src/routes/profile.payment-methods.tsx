import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/payment-methods")({
  component: () => <div className="p-5 text-foreground">Payment methods — coming soon</div>,
});
