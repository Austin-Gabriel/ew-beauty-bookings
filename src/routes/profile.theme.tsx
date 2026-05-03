import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/theme")({
  component: () => <div className="p-5 text-foreground">Theme — coming soon</div>,
});
