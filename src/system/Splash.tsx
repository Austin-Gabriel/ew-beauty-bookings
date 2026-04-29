import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { EwaLockup } from "@/components/EwaLogo";
import { EwaRibbons } from "@/components/EwaRibbons";
import { useDevState } from "@/dev-state/devState";

/**
 * Splash — first touch. Editorial surface, brand-forward.
 * Drifting bagel-toned ribbons (same visual language as Ewà Biz),
 * official lockup centered, warm tagline.
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
    const t1 = window.setTimeout(() => setLeaving(true), 1700);
    const t2 = window.setTimeout(() => navigate({ to: dest }), 2200);
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
      <EwaRibbons />

      <div className="relative z-10 flex flex-col items-center px-8">
        <div className="animate-[fadeUp_900ms_ease-out_both]">
          <EwaLockup height={56} />
        </div>
        <p className="mt-6 animate-[fadeUp_900ms_ease-out_220ms_both] font-display text-[15px] italic tracking-tight text-muted-foreground">
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
