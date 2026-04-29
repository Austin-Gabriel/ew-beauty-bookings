import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AuthShell, useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { EwaLockup } from "@/components/ewa-logo";
import { useDevState } from "@/dev-state/devState";

/**
 * Splash — first touch. Uses the same editorial AuthShell as Welcome
 * (drifting bagel squiggles, warm glow, grain) so the visual language
 * is consistent across the pre-auth funnel. Theme is driven by the
 * global dev-state (and AuthShell's top-right toggle writes back to it).
 *
 * Auto-routes after a brief moment based on dev-state user session:
 *   - new       → /welcome
 *   - returning → /discover
 */
export function Splash() {
  return (
    <AuthShell glowBoost={1.15}>
      <SplashBody />
    </AuthShell>
  );
}

function SplashBody() {
  const navigate = useNavigate();
  const { state } = useDevState();
  const { isDark, text } = useAuthTheme();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Auth state takes priority. userState is the legacy "new vs returning"
    // toggle and is honored only when authState is "signed-out".
    let dest: "/welcome" | "/discover" | "/signin" | "/signup" | "/unlock" =
      state.userState === "returning" ? "/discover" : "/welcome";
    switch (state.authState) {
      case "signed-out":
        dest = state.userState === "returning" ? "/signin" : "/welcome";
        break;
      case "mid-signup":
        dest = "/signup";
        break;
      case "signed-in-no-session":
        dest = "/signin";
        break;
      case "signed-in":
        dest = "/discover";
        break;
      case "biometric-enrolled":
        dest = "/unlock";
        break;
    }
    const t1 = window.setTimeout(() => setLeaving(true), 1700);
    const t2 = window.setTimeout(() => navigate({ to: dest }), 2200);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [navigate, state.userState, state.authState]);

  return (
    <div
      className="relative z-[1] flex flex-1 flex-col items-center justify-center px-8 transition-opacity duration-500"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <div className="ewa-mark-in">
        <div className="ewa-breathe">
          <EwaLockup isDark={isDark} markSize={64} />
        </div>
      </div>
      <p
        className="ewa-rise mt-6 text-center"
        style={{
          fontFamily: SANS_STACK,
          fontSize: 14,
          letterSpacing: "0.01em",
          color: text,
          opacity: 0.62,
          animationDelay: "300ms",
        }}
      >
        Beauty, on your time.
      </p>
    </div>
  );
}
