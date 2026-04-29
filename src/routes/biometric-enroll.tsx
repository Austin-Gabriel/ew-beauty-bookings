import { createFileRoute } from "@tanstack/react-router";
import { BiometricEnroll } from "@/auth/SignInFlow";

export const Route = createFileRoute("/biometric-enroll")({
  head: () => ({ meta: [{ title: "Set up Face ID — Ewà" }] }),
  component: BiometricEnroll,
});
