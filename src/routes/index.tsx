import { createFileRoute } from "@tanstack/react-router";
import { Splash } from "../system/Splash";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ewà — Beauty, where you are" },
      {
        name: "description",
        content:
          "Premium mobile beauty. Book trusted pros who travel to you — barbers, stylists, braiders, nail techs, makeup artists, locticians.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return <Splash />;
}
