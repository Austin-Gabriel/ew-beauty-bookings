import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BiometricPrompt } from "@/auth/SignInFlow";

export const Route = createFileRoute("/unlock")({
  head: () => ({ meta: [{ title: "Unlock — Ewà" }] }),
  component: UnlockPage,
});

function UnlockPage() {
  const navigate = useNavigate();
  return (
    <BiometricPrompt
      onSuccess={() => navigate({ to: "/discover" })}
      onFallback={() => navigate({ to: "/signin" })}
    />
  );
}
