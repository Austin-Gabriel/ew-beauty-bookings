import { createFileRoute } from "@tanstack/react-router";
import { HelpCenterPage } from "@/profile/HelpCenterPage";

export const Route = createFileRoute("/profile/help")({
  component: HelpCenterPage,
});
