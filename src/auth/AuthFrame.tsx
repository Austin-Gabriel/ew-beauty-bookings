import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { EwaMark } from "@/components/EwaLogo";
import { EwaRibbons } from "@/components/EwaRibbons";

/**
 * AuthFrame — the canonical shell for every auth screen.
 *
 * Inherits the Welcome screen's visual language exactly:
 *  • cream/midnight surface from theme tokens
 *  • drifting bagel ribbons (quieter on form-heavy screens)
 *  • mark-only header, optional back arrow + slim unlabeled progress bar
 *  • generous left-aligned editorial spacing
 *  • CTAs anchored at the bottom
 *
 * Form-heavy screens pass `quietRibbons` to push the squiggles down to the
 * bottom 25% so they never compete with the input fields.
 */
export interface AuthFrameProps {
  children: ReactNode;
  /** 0–1. Slim unlabeled progress bar at the very top. Omit to hide. */
  progress?: number;
  /** Show a back arrow in the header. */
  onBack?: () => void;
  /** Mute the ribbons + mask them to the bottom 25% on form screens. */
  quietRibbons?: boolean;
  /** Optional small uppercase label on the right of the header. */
  topRightLabel?: string;
}

export function AuthFrame({
  children,
  progress,
  onBack,
  quietRibbons = false,
  topRightLabel,
}: AuthFrameProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div
        className={
          quietRibbons
            ? "pointer-events-none absolute inset-0 opacity-55 [mask-image:linear-gradient(to_bottom,transparent_60%,#000_92%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_60%,#000_92%)]"
            : "pointer-events-none absolute inset-0"
        }
      >
        <EwaRibbons />
      </div>

      {progress !== undefined && (
        <div className="absolute inset-x-0 top-0 z-20 h-[3px] bg-foreground/8">
          <div
            className="h-full bg-bagel transition-[width] duration-500 ease-out"
            style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
          />
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-6 pt-10 pb-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                aria-label="Go back"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-foreground/70 transition-transform active:scale-95"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <Link to="/welcome" aria-label="Ewà home">
                <EwaMark size={28} className="text-foreground" />
              </Link>
            )}
          </div>
          {topRightLabel && (
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
              {topRightLabel}
            </span>
          )}
        </header>

        {children}
      </div>
    </main>
  );
}

/** Bagel pill primary CTA — matches the Welcome screen. */
export function PrimaryCta({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center rounded-full bg-bagel text-[15px] font-semibold text-bagel-foreground shadow-[0_8px_24px_-12px_rgba(255,130,63,0.7)] transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

/** Outlined pill — secondary action. */
export function GhostCta({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-12 w-full items-center justify-center rounded-full border border-hairline text-[14px] font-medium text-foreground transition-colors hover:bg-foreground/[0.04]"
    >
      {children}
    </button>
  );
}

/** Tertiary inline text link styled like the Welcome screen footers. */
export function TertiaryLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[13px] font-medium text-foreground/70 underline-offset-4 transition-colors hover:text-foreground hover:underline"
    >
      {children}
    </button>
  );
}
