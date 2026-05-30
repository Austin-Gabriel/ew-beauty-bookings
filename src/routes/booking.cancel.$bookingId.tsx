import { createFileRoute, useParams } from "@tanstack/react-router";
import { CancelBookingPage } from "@/bookings/CancelBookingPage";

export const Route = createFileRoute("/booking/cancel/$bookingId")({
  head: () => ({
    meta: [{ title: "Cancel booking — Ewà" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { bookingId } = useParams({ from: "/booking/cancel/$bookingId" });
  return <CancelBookingPage bookingId={bookingId} />;
}
