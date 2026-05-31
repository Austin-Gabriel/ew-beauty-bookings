import { createFileRoute } from "@tanstack/react-router";
import { HairProfilePage } from "@/profile/HairProfilePage";

export const Route = createFileRoute("/profile/hair-profile")({
  head: () => ({
    meta: [{ title: "Hair profile — Ewà" }],
  }),
  component: HairProfilePage,
});
