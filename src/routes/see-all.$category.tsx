import { createFileRoute } from "@tanstack/react-router";
import { SeeAllPage } from "@/home/SeeAll";

const TITLES: Record<string, string> = {
  online: "Online now",
  available: "Available today",
  new: "New in your area",
  trending: "Trending styles",
};

export const Route = createFileRoute("/see-all/$category")({
  head: ({ params }) => ({
    meta: [{ title: `${TITLES[params.category] ?? "Browse"} — Ewà` }],
  }),
  component: SeeAllPage,
});
