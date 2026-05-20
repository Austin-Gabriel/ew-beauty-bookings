import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/notifications/NotificationsPage";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Ewà" },
      { name: "description", content: "Recent activity and updates from your bookings and pros." },
    ],
  }),
  component: NotificationsPage,
});
