import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/profile/PrivacyPage";

export const Route = createFileRoute("/profile/privacy")({
  component: PrivacyPage,
});
