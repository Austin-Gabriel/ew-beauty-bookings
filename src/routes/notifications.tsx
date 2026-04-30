import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/notifications/NotificationsPage";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & Offers — Ewà" },
      { name: "description", content: "Updates, promotions, and offers from Ewà." },
    ],
  }),
  component: NotificationsPage,
});
