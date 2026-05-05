import { createFileRoute } from "@tanstack/react-router";
import { RatePage } from "@/bookings/RatePage";

export const Route = createFileRoute("/booking/rate/$bookingId")({
  component: function Page() {
    const { bookingId } = Route.useParams();
    return <RatePage bookingId={bookingId} />;
  },
});
