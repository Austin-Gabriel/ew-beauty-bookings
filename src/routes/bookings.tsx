import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Ewà" },
      { name: "description", content: "Your upcoming and past Ewà bookings." },
    ],
  }),
  component: () => <Outlet />,
});
