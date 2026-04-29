import wordmarkLight from "@/assets/ewa-logo.jpg"; // dark wordmark on white (use in light mode)
import wordmarkDark from "@/assets/ewa-wordmark.png"; // white wordmark on transparent (use in dark mode)
import { useDevState } from "@/dev-state/devState";

/**
 * Pure SVG mark — orange donut + inner dot + accent. The dot color
 * adapts to the surface (use `text-midnight` on light, `text-cream` on dark
 * via currentColor) so the inner cutout reads correctly on both.
 *
 * Use this in tight spaces (top corners, nav, avatars).
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
 * Full lockup — uses the EXACT uploaded brand artwork (mark + wordmark).
 * Reserved for editorial moments: splash, welcome, marketing surfaces.
 *
 * Picks the correct artwork for the current theme automatically so the
 * letterforms stay legible on either background.
 */
export function EwaLockup({
  height = 56,
  className,
}: {
  height?: number;
  className?: string;
}) {
  const { resolvedTheme } = useDevState();
  const src = resolvedTheme === "dark" ? wordmarkDark : wordmarkLight;
  return (
    <img
      src={src}
      alt="Ewà"
      style={{ height }}
      className={`w-auto select-none ${className ?? ""}`}
      draggable={false}
    />
  );
}
