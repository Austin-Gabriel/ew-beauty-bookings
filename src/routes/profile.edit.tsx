import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile/edit")({
  component: () => <div className="p-5 text-foreground">Edit profile — coming soon</div>,
});
