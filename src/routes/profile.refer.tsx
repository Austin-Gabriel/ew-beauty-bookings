import { createFileRoute } from "@tanstack/react-router";
import { ReferPage } from "@/profile/ReferPage";

export const Route = createFileRoute("/profile/refer")({
  head: () => ({
    meta: [{ title: "Refer friends — Ewà" }],
  }),
  component: ReferPage,
});
