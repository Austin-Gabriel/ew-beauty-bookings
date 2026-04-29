import wordmarkDarkSrc from "@/assets/ewa-wordmark.png"; // white wordmark on transparent
import { useDevState } from "@/dev-state/devState";

/**
 * Pure SVG mark — orange donut + inner dot + accent "à" tail.
 * Use this in tight spaces (top corners, nav, avatars).
 *
 * The inner dot uses currentColor so it reads correctly on either surface
 * — pass `text-foreground` (or any color class) to control it.
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
 * Full lockup — donut mark + "ewà" wordmark. Editorial moments only
 * (splash, welcome, marketing). The wordmark uses Fraunces so it can be
 * tinted via currentColor — guaranteed to read on cream OR midnight without
 * a clipping background.
 *
 * On dark mode we additionally overlay the official artwork so the brand's
 * exact letterform shows up — but only when the artwork has a transparent
 * background that won't break the surface.
 */
export function EwaLockup({
  size = 56,
  className,
  variant = "auto",
}: {
  size?: number;
  className?: string;
  /** Force one of the two artworks. "auto" follows current theme. */
  variant?: "auto" | "light" | "dark";
}) {
  const { resolvedTheme } = useDevState();
  const useDarkArt = (variant === "auto" ? resolvedTheme : variant) === "dark";

  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <EwaMark size={size * 0.78} className="text-foreground" />
      {useDarkArt ? (
        // Official wordmark artwork — transparent PNG, white letterforms.
        <img
          src={wordmarkDarkSrc}
          alt="Ewà"
          style={{ height: size * 0.7, marginLeft: -size * 0.6 }}
          className="w-auto select-none object-contain"
          draggable={false}
        />
      ) : (
        // Fraunces wordmark — themable, no clipping background.
        <span
          className="font-display leading-none tracking-tight text-foreground"
          style={{ fontSize: size * 0.95, fontWeight: 500 }}
        >
          ewà
        </span>
      )}
    </div>
  );
}
