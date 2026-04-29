import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderTab } from "@/home/PlaceholderTab";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Ewà" },
      { name: "description", content: "Chat with your Ewà pros." },
    ],
  }),
  component: () => (
    <PlaceholderTab
      pageTitle="Messages"
      headline="Messages, on the way."
      subhead="Direct chat with your pros — booking confirmations, prep notes, and day-of details."
    />
  ),
});
