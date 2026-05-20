import { createFileRoute } from "@tanstack/react-router";
import { ProProfile } from "@/pro/ProProfile";

export const Route = createFileRoute("/pro/$proId/")({
  component: function Page() {
    const { proId } = Route.useParams();
    return <ProProfile proId={proId} />;
  },
});
