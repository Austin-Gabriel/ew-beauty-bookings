import { createFileRoute } from "@tanstack/react-router";
import { SignupFlow } from "@/auth/SignupFlow";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — Ewà" },
      { name: "description", content: "Create your Ewà account in a few quick steps." },
    ],
  }),
  component: SignupFlow,
});
