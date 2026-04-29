import { createFileRoute } from "@tanstack/react-router";
import { DiscoverPage } from "@/home/Discover";

export const Route = createFileRoute("/discover")({
  head: () => ({
    meta: [
      { title: "Discover — Ewà" },
      { name: "description", content: "Find trusted beauty pros near you." },
    ],
  }),
  component: DiscoverPage,
});
