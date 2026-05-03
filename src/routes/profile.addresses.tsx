import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/addresses")({
  component: () => <div className="p-5 text-foreground">Saved addresses — coming soon</div>,
});
