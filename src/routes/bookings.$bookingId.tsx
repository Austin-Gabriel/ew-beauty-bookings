import { createFileRoute } from "@tanstack/react-router";
import { BookingDetailPage } from "@/bookings/BookingDetailPage";

export const Route = createFileRoute("/bookings/$bookingId")({
  component: BookingDetailRoute,
});

function BookingDetailRoute() {
  const { bookingId } = Route.useParams();
  return <BookingDetailPage bookingId={bookingId} />;
}
