import { createFileRoute } from "@tanstack/react-router";
import { LanguagePage } from "@/profile/LanguagePage";

export const Route = createFileRoute("/profile/language")({
  head: () => ({
    meta: [{ title: "Language — Ewà" }],
  }),
  component: LanguagePage,
});
