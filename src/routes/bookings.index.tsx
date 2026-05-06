import { createFileRoute } from "@tanstack/react-router";
import { BookingsPage } from "@/bookings/BookingsPage";

export const Route = createFileRoute("/bookings/")({
  component: BookingsPage,
});
