import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SearchingPage } from "@/booking/SearchingPage";

const searchSchema = z.object({
  proId: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/booking/searching/$bookingId")({
  validateSearch: zodValidator(searchSchema),
  component: function Page() {
    const { bookingId } = Route.useParams();
    const { proId } = Route.useSearch();
    return <SearchingPage bookingId={bookingId} proId={proId || undefined} />;
  },
});
