import { createFileRoute } from "@tanstack/react-router";
import { ProProfile } from "@/pro/ProProfile";
import { MOCK_PROS } from "@/data/mock-pros";

export const Route = createFileRoute("/pro/$proId")({
  head: ({ params }) => {
    const pro = MOCK_PROS.find((p) => p.id === params.proId);
    const title = pro ? `${pro.name} — Ewà` : "Pro — Ewà";
    return {
      meta: [
        { title },
        { name: "description", content: pro ? pro.headline : "Pro profile on Ewà." },
      ],
    };
  },
  component: function Page() {
    const { proId } = Route.useParams();
    return <ProProfile proId={proId} />;
  },
});
