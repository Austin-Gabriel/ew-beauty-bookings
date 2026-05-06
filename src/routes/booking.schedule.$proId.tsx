import { createFileRoute } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { SchedulePage } from "@/booking/SchedulePage";

const searchSchema = z.object({
  service: fallback(z.string(), "").default(""),
});

export const Route = createFileRoute("/booking/schedule/$proId")({
  validateSearch: zodValidator(searchSchema),
  component: function Page() {
    const { proId } = Route.useParams();
    return <SchedulePage proId={proId} />;
  },
});
