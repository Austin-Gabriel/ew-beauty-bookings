import { createFileRoute } from "@tanstack/react-router";
import { SettingsPage } from "@/profile/SettingsPage";

export const Route = createFileRoute("/profile/settings")({
  head: () => ({
    meta: [{ title: "Settings — Ewà" }],
  }),
  component: SettingsPage,
});
