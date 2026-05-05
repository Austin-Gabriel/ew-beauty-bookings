import { createFileRoute } from "@tanstack/react-router";
import { ReceiptPage } from "@/bookings/ReceiptPage";

export const Route = createFileRoute("/booking/receipt/$bookingId")({
  component: function Page() {
    const { bookingId } = Route.useParams();
    return <ReceiptPage bookingId={bookingId} />;
  },
});
