import { createFileRoute } from "@tanstack/react-router";
import { PendingApprovalPage } from "@/booking/PendingApprovalPage";

export const Route = createFileRoute("/booking/pending/$bookingId")({
  component: function Page() {
    const { bookingId } = Route.useParams();
    return <PendingApprovalPage bookingId={bookingId} />;
  },
});
