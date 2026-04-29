import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { EwaLockup } from "@/components/EwaLogo";
import { useDevState } from "@/dev-state/devState";

/**
 * Splash — first touch. Editorial cream surface, generous whitespace,
 * decorative bagel-toned organic shapes at low opacity for warmth.
 *
 * Auto-routes after a brief moment based on dev-state user session:
 *   - new       → /welcome
 *   - returning → /discover
 */
export function Splash() {
  const navigate = useNavigate();
  const { state } = useDevState();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const dest = state.userState === "returning" ? "/discover" : "/welcome";
    const t1 = window.setTimeout(() => setLeaving(true), 1500);
    const t2 = window.setTimeout(() => navigate({ to: dest }), 2000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [navigate, state.userState]);

  return (
    <main
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background text-foreground transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Decorative bagel-toned shapes — low opacity, never compete with mark */}
      <Squiggles />

      <div className="relative z-10 flex flex-col items-center px-8">
        <div className="animate-[fadeUp_700ms_ease-out_both]">
          <EwaLockup height={72} />
        </div>
        <p className="mt-7 animate-[fadeUp_700ms_ease-out_180ms_both] font-display text-[15px] italic tracking-tight text-muted-foreground">
          Beauty, on your time.
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

function Squiggles() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 390 844"
      fill="none"
    >
      <defs>
        <radialGradient id="bagelGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF823F" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#FF823F" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* Soft warm glows */}
      <circle cx="60" cy="120" r="180" fill="url(#bagelGlow)" />
      <circle cx="340" cy="740" r="220" fill="url(#bagelGlow)" />

      {/* Hand-drawn squiggles in bagel, low opacity */}
      <g stroke="#FF823F" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.18">
        <path d="M30 220 C 70 200, 100 240, 140 220 S 210 200, 250 230" />
        <path d="M150 700 C 190 680, 220 720, 260 700 S 330 680, 370 710" />
      </g>
    </svg>
  );
}
