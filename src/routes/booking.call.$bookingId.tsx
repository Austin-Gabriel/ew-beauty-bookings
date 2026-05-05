import { createFileRoute } from "@tanstack/react-router";
import { CallPage } from "@/bookings/CallPage";

export const Route = createFileRoute("/booking/call/$bookingId")({
  component: function Page() {
    const { bookingId } = Route.useParams();
    return <CallPage bookingId={bookingId} />;
  },
});
