import { createFileRoute } from "@tanstack/react-router";
import { RatingPage } from "@/profile/RatingPage";

export const Route = createFileRoute("/profile/rating")({
  head: () => ({
    meta: [{ title: "Your client rating — Ewà" }],
  }),
  component: RatingPage,
});
