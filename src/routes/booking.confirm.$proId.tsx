import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { BookingConfirmPage } from "@/booking/BookingConfirmPage";

const searchSchema = z.object({
  service: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/booking/confirm/$proId")({
  validateSearch: zodValidator(searchSchema),
  component: function Page() {
    const { proId } = Route.useParams();
    const { service } = Route.useSearch();
    return <BookingConfirmPage proId={proId} serviceId={service || undefined} />;
  },
});
