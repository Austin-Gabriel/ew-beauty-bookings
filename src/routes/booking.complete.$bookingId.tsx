import { createFileRoute } from "@tanstack/react-router";
import { ServiceCompletePage } from "@/bookings/ServiceCompletePage";

export const Route = createFileRoute("/booking/complete/$bookingId")({
  component: function Page() {
    const { bookingId } = Route.useParams();
    return <ServiceCompletePage bookingId={bookingId} />;
  },
});
