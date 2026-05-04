import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/profile/TermsPage";

export const Route = createFileRoute("/profile/terms")({
  component: TermsPage,
});
