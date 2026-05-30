import { createFileRoute } from "@tanstack/react-router";
import { ReportIssuePage } from "@/safety/ReportIssuePage";

export const Route = createFileRoute("/safety/report")({
  head: () => ({
    meta: [
      { title: "Report an issue — Ewà" },
      { name: "description", content: "Anonymously report concerns about an Ewà pro." },
    ],
  }),
  component: ReportIssuePage,
});
