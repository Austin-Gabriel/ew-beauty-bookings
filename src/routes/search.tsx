import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/search/SearchPage";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — Ewà" },
      { name: "description", content: "Search Ewà for stylists, styles, and neighborhoods." },
    ],
  }),
  component: SearchPage,
});
