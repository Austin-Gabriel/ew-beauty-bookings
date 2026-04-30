import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useDevState } from "@/dev-state/devState";

const SANS = '"Uncut Sans", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';

interface ThemeCtx {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  text: string;
  bg: string;
  borderCol: string;
  sans: string;
}
const ThemeContext = createContext<ThemeCtx | null>(null);

export function useAuthTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext);
  // Always-call hook so order is stable; only used when no Provider above.
  const { resolvedTheme } = useDevState();
  if (ctx) return ctx;
  // Fallback path: components that call useAuthTheme() in their own body
  // (i.e. ABOVE the AuthShell they then render as children) would otherwise
  // get a stale dark default. Mirror the same theme the AuthShell will pick.
  const isDark = resolvedTheme === "dark";
  return {
    isDark,
    setIsDark: () => {},
    text: isDark ? "#F0EBD8" : "#061C27",
    bg: isDark ? "#061C27" : "#F0EBD8",
    borderCol: isDark ? "rgba(240,235,216,0.18)" : "rgba(6,28,39,0.18)",
    sans: SANS,
  };
}

export const SANS_STACK = SANS;

export interface AuthShellProps {
  children: ReactNode;
  topLabel?: string;
  onBack?: () => void;
  glowBoost?: number;
  quietSquiggles?: boolean;
  /**
   * Fully removes the decorative bagel squiggle layers AND the warm glow.
   * Use on form/working surfaces (signup steps, signin, face id, discover) —
   * squiggles are an editorial accent reserved for celebratory/marketing
   * moments (welcome, splash, signup-done).
   */
  noSquiggles?: boolean;
  /** Hide the top-right theme toggle (used on screens that already have
   *  their own chrome). */
  hideThemeToggle?: boolean;
}

export function AuthShell({
  children,
  topLabel,
  onBack,
  glowBoost = 1,
  quietSquiggles = false,
  noSquiggles = false,
  hideThemeToggle = false,
}: AuthShellProps) {
  // Bridge AuthShell theme to global dev-state so the floating dev toggle
  // controls dark/light here too. The local "setIsDark" updates the dev state.
  const { resolvedTheme, set } = useDevState();
  const isDark = resolvedTheme === "dark";
  const setIsDark = (v: boolean) => set("themeMode", v ? "dark" : "light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const text = isDark ? "#F0EBD8" : "#061C27";
  const bg = isDark ? "#061C27" : "#F0EBD8";
  const glowBase = (isDark ? 0.14 : 0.09) * glowBoost;
  const borderCol = isDark ? "rgba(240,235,216,0.18)" : "rgba(6,28,39,0.18)";
  const squiggleOpacity = quietSquiggles ? (isDark ? 0.06 : 0.07) : (isDark ? 0.08 : 0.12);
  const grainOpacity = isDark ? 0.18 : 0.18;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, text, bg, borderCol, sans: SANS }}>
      <div
        className="relative flex min-h-screen w-full flex-col overflow-hidden"
        style={{
          backgroundColor: bg,
          color: text,
          fontFamily: SANS,
          transition: "background-color 600ms cubic-bezier(0.4, 0, 0.2, 1), color 600ms cubic-bezier(0.4, 0, 0.2, 1)",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {!noSquiggles && (
          <>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-[10%] ewa-drift-a"
              style={{
                opacity: squiggleOpacity,
                transition: "opacity 600ms ease",
                ...(quietSquiggles
                  ? {
                      WebkitMaskImage: "linear-gradient(to bottom, transparent 70%, #000 92%)",
                      maskImage: "linear-gradient(to bottom, transparent 70%, #000 92%)",
                    }
                  : {}),
              }}
            >
              <svg viewBox="0 0 600 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                <path d="M-20,180 C80,100 180,260 290,180 S500,100 640,200" fill="none" stroke="#FF823F" strokeWidth="42" strokeLinecap="round" />
                <path d="M-40,440 C90,360 220,520 340,440 S560,360 660,460" fill="none" stroke="#FF823F" strokeWidth="36" strokeLinecap="round" />
              </svg>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-[15%] ewa-drift-b"
              style={{
                opacity: squiggleOpacity * 0.7,
                transition: "opacity 600ms ease",
                ...(quietSquiggles
                  ? {
                      WebkitMaskImage: "linear-gradient(to bottom, transparent 70%, #000 92%)",
                      maskImage: "linear-gradient(to bottom, transparent 70%, #000 92%)",
                    }
                  : {}),
              }}
            >
              <svg viewBox="0 0 600 600" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
                <path d="M-30,300 C120,220 260,400 400,310 S620,240 700,330" fill="none" stroke="#FF823F" strokeWidth="28" strokeLinecap="round" />
              </svg>
            </div>

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 ewa-glow-anim"
              style={
                {
                  background: `radial-gradient(circle 460px at 50% 28%, rgba(255,130,63,${glowBase}) 0%, rgba(255,130,63,0) 70%)`,
                  ["--glow-base" as never]: glowBase,
                } as React.CSSProperties
              }
            />

            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: isDark
                  ? "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)"
                  : "radial-gradient(ellipse at center, transparent 60%, rgba(6,28,39,0.06) 100%)",
                transition: "background 600ms ease",
              }}
            />
          </>
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            opacity: grainOpacity,
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
            backgroundSize: "220px 220px",
            transition: "opacity 600ms ease",
          }}
        />

        <div className="relative z-10 flex items-center justify-between px-5" style={{ paddingTop: 14 }}>
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
                style={{ border: `1px solid ${borderCol}`, color: text, opacity: 0.7 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            ) : null}
            {topLabel ? (
              <div
                className="ewa-fade"
                style={{
                  fontSize: 10,
                  letterSpacing: "1.6px",
                  textTransform: "uppercase",
                  color: text,
                  opacity: 0.45,
                  fontWeight: 500,
                }}
              >
                {topLabel}
              </div>
            ) : null}
          </div>
          {!hideThemeToggle && (
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle color mode"
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 hover:scale-110 active:scale-95"
              style={{ border: `1px solid ${borderCol}`, color: text, opacity: 0.7, fontSize: 12 }}
            >
              {isDark ? "☀" : "☾"}
            </button>
          )}
        </div>

        {children}

        {!mounted && (
          <div aria-hidden className="absolute inset-0" style={{ backgroundColor: bg, transition: "opacity 200ms" }} />
        )}
      </div>
    </ThemeContext.Provider>
  );
}
