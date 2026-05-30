import { createFileRoute } from "@tanstack/react-router";
import { SafetyPage } from "@/safety/SafetyPage";

export const Route = createFileRoute("/safety/")({
  head: () => ({
    meta: [
      { title: "Safety — Ewà" },
      { name: "description", content: "SOS, verified pros, emergency contacts, and live location for your Ewà appointments." },
    ],
  }),
  component: SafetyPage,
});
