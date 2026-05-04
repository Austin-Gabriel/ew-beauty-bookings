import { createFileRoute } from "@tanstack/react-router";
import { BookingConfirmPage } from "@/booking/BookingConfirmPage";

export const Route = createFileRoute("/booking/confirm/$proId")({
  component: function Page() {
    const { proId } = Route.useParams();
    return <BookingConfirmPage proId={proId} />;
  },
});
