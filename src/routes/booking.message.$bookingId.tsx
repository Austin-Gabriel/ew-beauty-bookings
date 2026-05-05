import { createFileRoute } from "@tanstack/react-router";
import { MessagePage } from "@/bookings/MessagePage";

export const Route = createFileRoute("/booking/message/$bookingId")({
  component: function Page() {
    const { bookingId } = Route.useParams();
    return <MessagePage bookingId={bookingId} />;
  },
});
