import { createFileRoute } from "@tanstack/react-router";
import { CreditsPage } from "@/profile/CreditsPage";

export const Route = createFileRoute("/profile/credits")({
  head: () => ({
    meta: [{ title: "Ewà credits" }],
  }),
  component: CreditsPage,
});
