import { createFileRoute } from "@tanstack/react-router";
import { FavoritesIndex } from "@/favorites/FavoritesIndex";

export const Route = createFileRoute("/favorites/")({
  head: () => ({
    meta: [
      { title: "Favorites — Ewà" },
      { name: "description", content: "Your saved pros and looks, organized into collections." },
    ],
  }),
  component: FavoritesIndex,
});
