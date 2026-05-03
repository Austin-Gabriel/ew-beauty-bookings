import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/tipping")({
  component: () => <div className="p-5 text-foreground">Tipping preferences — coming soon</div>,
});
