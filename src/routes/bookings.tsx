import { createFileRoute } from "@tanstack/react-router";
import { BookingsPage } from "@/bookings/BookingsPage";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Ewà" },
      { name: "description", content: "Your upcoming and past Ewà bookings." },
    ],
  }),
  component: BookingsPage,
});
