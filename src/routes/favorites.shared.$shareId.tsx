import { createFileRoute } from "@tanstack/react-router";
import { SharedCollection } from "@/favorites/SharedCollection";

export const Route = createFileRoute("/favorites/shared/$shareId")({
  head: () => ({
    meta: [{ title: "Shared collection — Ewà" }],
  }),
  component: function Page() {
    const { shareId } = Route.useParams();
    return <SharedCollection shareId={shareId} />;
  },
});
