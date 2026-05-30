import { createFileRoute } from "@tanstack/react-router";
import { AppleSignInPage } from "@/auth/AppleSignInPage";

export const Route = createFileRoute("/signin/apple")({
  head: () => ({
    meta: [{ title: "Sign in with Apple — Ewà" }],
  }),
  component: AppleSignInPage,
});
