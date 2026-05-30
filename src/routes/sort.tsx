import { createFileRoute } from "@tanstack/react-router";
import { SortPage } from "@/home/SortPage";

export const Route = createFileRoute("/sort")({
  head: () => ({
    meta: [{ title: "Sort — Ewà" }],
  }),
  component: SortPage,
});
