import { createFileRoute } from "@tanstack/react-router";
import { TippingPage } from "@/profile/TippingPage";

export const Route = createFileRoute("/profile/tipping")({
  component: TippingPage,
});
