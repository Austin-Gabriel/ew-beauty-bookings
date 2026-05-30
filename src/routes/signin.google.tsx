import { createFileRoute } from "@tanstack/react-router";
import { GoogleSignInPage } from "@/auth/GoogleSignInPage";

export const Route = createFileRoute("/signin/google")({
  head: () => ({
    meta: [{ title: "Sign in with Google — Ewà" }],
  }),
  component: GoogleSignInPage,
});
