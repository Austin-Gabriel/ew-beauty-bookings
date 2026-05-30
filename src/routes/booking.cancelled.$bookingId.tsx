import { createFileRoute } from "@tanstack/react-router";
import { CancelledBookingPage } from "@/bookings/CancelledBookingPage";

export const Route = createFileRoute("/booking/cancelled/$bookingId")({
  head: () => ({
    meta: [
      { title: "Booking cancelled — Ewà" },
      { name: "description", content: "Your Ewà booking was cancelled. Refund and alternatives below." },
    ],
  }),
  component: function Page() {
    const { bookingId } = Route.useParams();
    return <CancelledBookingPage bookingId={bookingId} />;
  },
});
