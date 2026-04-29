import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderTab } from "@/home/PlaceholderTab";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Ewà" },
      { name: "description", content: "Your upcoming and past Ewà bookings." },
    ],
  }),
  component: () => (
    <PlaceholderTab
      pageTitle="Bookings"
      headline="Bookings, on the way."
      subhead="Your upcoming sessions, past bookings, and rebook shortcuts will live here."
    />
  ),
});
