import { createFileRoute } from "@tanstack/react-router";
import { MapViewPage } from "@/home/MapViewPage";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [{ title: "Map — Ewà" }],
  }),
  component: MapViewPage,
});
