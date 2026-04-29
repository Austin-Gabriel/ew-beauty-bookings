import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderTab } from "@/home/PlaceholderTab";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Ewà" },
      { name: "description", content: "Manage your Ewà account." },
    ],
  }),
  component: () => (
    <PlaceholderTab
      pageTitle="Profile"
      headline="Profile, on the way."
      subhead="Saved pros, addresses, payment methods, and preferences will live here."
    />
  ),
});
