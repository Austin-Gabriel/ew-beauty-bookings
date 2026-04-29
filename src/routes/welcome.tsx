import { createFileRoute } from "@tanstack/react-router";
import WelcomePage from "@/pages/Welcome";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome — Ewà" },
      {
        name: "description",
        content:
          "Beauty that comes to you. Discover trusted pros and book on your terms — wherever life is happening.",
      },
      { property: "og:title", content: "Welcome to Ewà" },
      {
        property: "og:description",
        content: "Beauty that comes to you. Book trusted pros on your terms.",
      },
    ],
  }),
  component: WelcomePage,
});
