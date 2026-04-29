import { createFileRoute } from "@tanstack/react-router";
import { Splash } from "@/system/Splash";

export const Route = createFileRoute("/splash")({
  head: () => ({
    meta: [{ title: "Ewà" }],
  }),
  component: () => <Splash />,
});
