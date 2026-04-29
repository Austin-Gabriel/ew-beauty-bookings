/**
 * The Ewà logomark — orange circle with midnight dot, plus the accent stroke.
 * Pure SVG so it scales and themes cleanly. Use the brand orange always
 * (Bagel is full saturation, never tinted).
 */
export function EwaLogo({ size = 56, className }: { size?: number; className?: string }) {
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
 * Full wordmark — "ewà" in editorial serif beside the mark.
 * Use only on splash, welcome, and rare editorial moments.
 */
export function EwaWordmark({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <EwaLogo size={44} className="text-foreground" />
      <span className="font-display text-5xl leading-none tracking-tight text-foreground">
        ewà
      </span>
    </div>
  );
}
