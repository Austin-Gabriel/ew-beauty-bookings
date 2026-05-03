import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell } from "@/home/AppShell";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Ewà" },
      { name: "description", content: "Manage your Ewà account." },
    ],
  }),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
