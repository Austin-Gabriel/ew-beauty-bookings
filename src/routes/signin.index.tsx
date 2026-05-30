import { createFileRoute } from "@tanstack/react-router";
import { SignInFlow } from "@/auth/SignInFlow";

export const Route = createFileRoute("/signin/")({
  head: () => ({
    meta: [
      { title: "Sign in — Ewà" },
      { name: "description", content: "Welcome back to Ewà." },
    ],
  }),
  component: SignInFlow,
});
