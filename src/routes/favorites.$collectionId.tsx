import { createFileRoute } from "@tanstack/react-router";
import { CollectionDetail } from "@/favorites/CollectionDetail";

export const Route = createFileRoute("/favorites/$collectionId")({
  head: () => ({
    meta: [{ title: "Collection — Ewà" }],
  }),
  component: function Page() {
    const { collectionId } = Route.useParams();
    return <CollectionDetail collectionId={collectionId} />;
  },
});
