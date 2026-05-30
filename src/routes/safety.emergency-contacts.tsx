import { createFileRoute } from "@tanstack/react-router";
import { EmergencyContactsPage } from "@/safety/EmergencyContactsPage";

export const Route = createFileRoute("/safety/emergency-contacts")({
  head: () => ({
    meta: [
      { title: "Emergency contacts — Ewà" },
      { name: "description", content: "Trusted contacts notified by SOS during your Ewà appointments." },
    ],
  }),
  component: EmergencyContactsPage,
});
