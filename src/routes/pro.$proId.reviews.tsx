import { createFileRoute } from "@tanstack/react-router";
import { ReviewsPage } from "@/pro/ReviewsPage";

export const Route = createFileRoute("/pro/$proId/reviews")({
  head: () => ({ meta: [{ title: "Reviews — Ewà" }] }),
  component: function Page() {
    const { proId } = Route.useParams();
    return <ReviewsPage proId={proId} />;
  },
});
