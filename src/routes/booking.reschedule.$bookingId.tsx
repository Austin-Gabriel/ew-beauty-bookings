import { createFileRoute } from "@tanstack/react-router";
import { ReschedulePage } from "@/bookings/ReschedulePage";

export const Route = createFileRoute("/booking/reschedule/$bookingId")({
  component: function Page() {
    const { bookingId } = Route.useParams();
    return <ReschedulePage bookingId={bookingId} />;
  },
});
