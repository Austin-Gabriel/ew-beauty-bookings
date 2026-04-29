import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BiometricPrompt } from "@/auth/SignInFlow";

export const Route = createFileRoute("/unlock")({
  head: () => ({ meta: [{ title: "Unlock — Ewà" }] }),
  component: UnlockPage,
});

function UnlockPage() {
  const navigate = useNavigate();
  const [_, setUsedFallback] = useState(false);
  return (
    <BiometricPrompt
      onSuccess={() => navigate({ to: "/discover" })}
      onFallback={() => {
        setUsedFallback(true);
        navigate({ to: "/signin" });
      }}
    />
  );
}
