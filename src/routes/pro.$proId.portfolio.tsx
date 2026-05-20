import { createFileRoute } from "@tanstack/react-router";
import { PortfolioPage } from "@/pro/PortfolioPage";

export const Route = createFileRoute("/pro/$proId/portfolio")({
  head: () => ({ meta: [{ title: "Portfolio — Ewà" }] }),
  component: function Page() {
    const { proId } = Route.useParams();
    return <PortfolioPage proId={proId} />;
  },
});
