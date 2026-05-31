import { createFileRoute } from "@tanstack/react-router";
import { PromotionsPage } from "@/profile/PromotionsPage";

export const Route = createFileRoute("/profile/promotions")({
  head: () => ({
    meta: [{ title: "Promotions — Ewà" }],
  }),
  component: PromotionsPage,
});
