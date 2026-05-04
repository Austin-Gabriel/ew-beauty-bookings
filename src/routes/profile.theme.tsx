import { createFileRoute } from "@tanstack/react-router";
import { ThemePage } from "@/profile/ThemePage";

export const Route = createFileRoute("/profile/theme")({
  component: ThemePage,
});
