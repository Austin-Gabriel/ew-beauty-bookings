import lockupLight from "@/assets/ewa-wordmark-light.png"; // midnight wordmark, transparent — use on cream
import lockupDark from "@/assets/ewa-wordmark.png"; // cream wordmark, transparent  — use on midnight
import { useDevState } from "@/dev-state/devState";

/**
 * Pure SVG mark — the donut + inner dot + accent "à" tail.
 * Use in tight spaces (top corners, nav, avatars). The inner dot uses
 * currentColor so it adapts to the surface — pass `text-foreground` (or
 * any color class) to control it.
 */
export function EwaMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={(size * 140) / 120}
      className={className}
      aria-label="Ewà"
    >
      <circle cx="60" cy="80" r="50" fill="#FF823F" />
      <circle cx="60" cy="80" r="20" fill="currentColor" />
      <path d="M92 6 L104 0 L96 30 Z" fill="#FF823F" />
    </svg>
  );
}

/**
 * Full official lockup — uses the EXACT brand artwork (donut + serif "ewà").
 * Editorial moments only: splash, welcome, marketing.
 *
 * Picks the correct artwork variant for the current theme automatically so
 * the wordmark stays legible on both cream and midnight surfaces.
 */
export function EwaLockup({
  height = 56,
  className,
  variant = "auto",
}: {
  /** Rendered height in px. Width auto-scales. */
  height?: number;
  className?: string;
  /** Force a variant. "auto" follows current theme. */
  variant?: "auto" | "light" | "dark";
}) {
  const { resolvedTheme } = useDevState();
  // Fall back to the html class set by the pre-hydration script so we pick
  // the correct artwork on first paint, before React state hydrates.
  const domDark =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const useDark =
    variant === "auto" ? resolvedTheme === "dark" || domDark : variant === "dark";
  const src = useDark ? lockupDark : lockupLight;
  return (
    <img
      src={src}
      alt="Ewà"
      style={{ height }}
      className={`w-auto select-none object-contain ${className ?? ""}`}
      draggable={false}
    />
  );
}
