import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/notifications")({
  component: () => <div className="p-5 text-foreground">Notifications — coming soon</div>,
});
