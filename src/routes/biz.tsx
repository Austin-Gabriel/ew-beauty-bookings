import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/biz")({
  component: () => <Outlet />,
});
