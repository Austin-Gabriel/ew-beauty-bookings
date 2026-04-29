import type { ReactNode } from "react";
import { AuthShell, useAuthTheme, SANS_STACK } from "./auth-shell";
import { PrimaryButton, SecondaryButton } from "./auth-buttons";

/**
 * AuthFrame — the canonical shell for every working / form auth screen.
 *
 * Inherits the Welcome screen's surface (cream / midnight, animated
 * background, top-right theme toggle) via AuthShell — but with
 * `noSquiggles` so the decorative bagel ribbons don't compete with form
 * fields. Squiggles are reserved for editorial moments (Welcome, Splash,
 * the celebratory "You're in" done screen).
 *
 * No logo in the header. Intermediate screens don't need branding mid-flow;
 * the back arrow + slim progress bar carry navigation context.
 */
export interface AuthFrameProps {
  children: ReactNode;
  /** 0–1. Slim unlabeled progress bar at the very top. Omit to hide. */
  progress?: number;
  /** Show a back arrow in the header. */
  onBack?: () => void;
  /** Optional small uppercase label on the right of the header. */
  topRightLabel?: string;
}

export function AuthFrame({ children, progress, onBack, topRightLabel }: AuthFrameProps) {
  return (
    <AuthShell onBack={onBack} topLabel={topRightLabel} noSquiggles>
      {progress !== undefined && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[3px]"
          style={{ backgroundColor: "rgba(127,127,127,0.12)" }}
        >
          <div
            className="h-full transition-[width] duration-500 ease-out"
            style={{
              backgroundColor: "#FF823F",
              width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
            }}
          />
        </div>
      )}

      <div className="relative z-[1] mx-auto flex w-full max-w-[420px] flex-1 flex-col px-6 pb-8">
        {children}
      </div>
    </AuthShell>
  );
}

/**
 * Display headline — matches Welcome's H1 exactly.
 * Uncut Sans 26px / weight 500 / lh 1.18 / letterspacing -0.02em.
 */
export function AuthHeadline({ children, className }: { children: ReactNode; className?: string }) {
  const { text } = useAuthTheme();
  return (
    <h1
      className={`ewa-rise ${className ?? ""}`}
      style={{
        fontFamily: SANS_STACK,
        fontWeight: 500,
        fontSize: 26,
        lineHeight: 1.18,
        letterSpacing: "-0.02em",
        color: text,
        margin: 0,
        maxWidth: 320,
      }}
    >
      {children}
    </h1>
  );
}

/** Body subhead — matches Welcome's subhead. */
export function AuthSubhead({ children, className }: { children: ReactNode; className?: string }) {
  const { text } = useAuthTheme();
  return (
    <p
      className={`ewa-rise ${className ?? ""}`}
      style={{
        fontFamily: SANS_STACK,
        fontWeight: 400,
        fontSize: 13,
        lineHeight: 1.5,
        color: text,
        opacity: 0.62,
        marginTop: 12,
        maxWidth: 320,
        animationDelay: "120ms",
      }}
    >
      {children}
    </p>
  );
}

/** Eyebrow label — matches Welcome's "FOR PROFESSIONALS" treatment. */
export function AuthEyebrow({ children }: { children: ReactNode }) {
  const { text } = useAuthTheme();
  return (
    <div
      style={{
        fontFamily: SANS_STACK,
        fontSize: 10,
        letterSpacing: "1.6px",
        textTransform: "uppercase",
        color: text,
        opacity: 0.5,
        fontWeight: 500,
      }}
    >
      {children}
    </div>
  );
}

/* ---------- Button + link primitives — match Welcome exactly ---------- */

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
    <PrimaryButton type={type} onClick={onClick} disabled={disabled}>
      {children}
    </PrimaryButton>
  );
}

export function GhostCta({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return <SecondaryButton onClick={onClick}>{children}</SecondaryButton>;
}

export function TertiaryLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  const { text } = useAuthTheme();
  return (
    <button
      type="button"
      onClick={onClick}
      className="transition-opacity hover:opacity-100"
      style={{
        fontFamily: SANS_STACK,
        fontSize: 13,
        fontWeight: 500,
        color: text,
        opacity: 0.65,
      }}
    >
      {children}
    </button>
  );
}
