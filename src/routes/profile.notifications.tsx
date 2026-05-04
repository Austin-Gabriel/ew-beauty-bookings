import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/profile/NotificationsPage";

export const Route = createFileRoute("/profile/notifications")({
  component: NotificationsPage,
});
