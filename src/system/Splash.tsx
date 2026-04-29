import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { EwaLogo } from "../components/EwaLogo";

/**
 * Splash — editorial surface. Brand mark on a midnight field, with a
 * whisper of Fraunces beneath. Auto-advances to /welcome.
 */
export function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setLeaving(true), 1600);
    const t2 = window.setTimeout(() => navigate({ to: "/welcome" }), 2100);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [navigate]);

  return (
    <main
      className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-midnight text-cream transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center">
        <div className="animate-[fadeUp_700ms_ease-out_both]">
          <EwaLogo size={80} className="text-midnight" />
        </div>
        <h1 className="mt-7 animate-[fadeUp_700ms_ease-out_120ms_both] font-display text-6xl leading-none tracking-tight">
          ewà
        </h1>
        <p className="mt-4 animate-[fadeUp_700ms_ease-out_240ms_both] text-sm font-medium tracking-[0.18em] text-cream/70 uppercase">
          Beauty, where you are
        </p>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
