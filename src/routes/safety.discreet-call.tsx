import { createFileRoute } from "@tanstack/react-router";
import { DiscreetCallPage } from "@/safety/DiscreetCallPage";

export const Route = createFileRoute("/safety/discreet-call")({
  head: () => ({
    meta: [
      { title: "Discreet support call — Ewà" },
      { name: "description", content: "Connect to Ewà safety support disguised as a regular phone call." },
    ],
  }),
  component: DiscreetCallPage,
});
