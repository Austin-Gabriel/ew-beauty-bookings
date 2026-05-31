import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/profile/LegalPage";

export const Route = createFileRoute("/profile/legal")({
  head: () => ({
    meta: [{ title: "Terms & privacy — Ewà" }],
  }),
  component: LegalPage,
});
