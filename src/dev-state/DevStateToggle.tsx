import { useState } from "react";
import {
  useDevState,
  type ThemeMode,
  type UserState,
  type AuthState,
  type OnboardingProgress,
} from "./devState";

/**
 * Floating dev-only panel — quiet, functional, dismissable.
 * Hidden in production via import.meta.env.PROD.
 *
 * Tap the badge to open a bottom sheet with the current dev fields.
 * Add a row per new field as features land.
 */
export function DevStateToggle() {
  const { state, set, reset, resolvedTheme } = useDevState();
  const [open, setOpen] = useState(false);

  if (import.meta.env.PROD) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open dev state panel"
        className="fixed bottom-4 right-4 z-[9998] flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-popover px-3 font-mono text-[11px] font-medium text-popover-foreground shadow-lg backdrop-blur"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-bagel" />
        dev
      </button>

      {open && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center sm:items-center">
          <button
            aria-label="Close dev state panel"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-midnight/40 backdrop-blur-sm"
          />
          <div
            role="dialog"
            aria-label="Dev state"
            className="relative max-h-[85vh] w-full max-w-[420px] overflow-y-auto rounded-t-3xl border border-hairline bg-popover p-5 text-popover-foreground shadow-2xl sm:rounded-3xl"
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-foreground/15 sm:hidden" />

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  Dev state
                </p>
                <h2 className="text-base font-semibold">Preview controls</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={reset}
                  className="rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-muted"
                >
                  Reset
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="space-y-5">
              <Field
                label="Theme override"
                hint={state.themeMode === "system" ? `System (${resolvedTheme})` : undefined}
              >
                <Segmented<ThemeMode>
                  value={state.themeMode}
                  options={[
                    { value: "system", label: "System" },
                    { value: "light", label: "Light" },
                    { value: "dark", label: "Dark" },
                  ]}
                  onChange={(v) => set("themeMode", v)}
                />
              </Field>

              <Field
                label="User state"
                hint={
                  state.userState === "new"
                    ? "Splash → Welcome"
                    : "Splash → Discover/Sign in"
                }
              >
                <Segmented<UserState>
                  value={state.userState}
                  options={[
                    { value: "new", label: "New user" },
                    { value: "returning", label: "Returning" },
                  ]}
                  onChange={(v) => set("userState", v)}
                />
              </Field>

              <Field label="Auth state" hint={authStateHint(state.authState)}>
                <Stacked<AuthState>
                  value={state.authState}
                  options={[
                    { value: "signed-out", label: "Signed out" },
                    { value: "mid-signup", label: "Mid signup" },
                    { value: "signed-in-no-session", label: "Signed in, no session" },
                    { value: "signed-in", label: "Signed in (valid session)" },
                    { value: "biometric-enrolled", label: "Biometric enrolled" },
                  ]}
                  onChange={(v) => set("authState", v)}
                />
              </Field>

              <Field
                label="Onboarding progress"
                hint="Lands signup at the next missing step"
              >
                <Stacked<OnboardingProgress>
                  value={state.onboardingProgress}
                  options={[
                    { value: "none", label: "Nothing yet" },
                    { value: "after-identifier", label: "After identifier (needs OTP)" },
                    { value: "after-verification", label: "After verification (needs address)" },
                    { value: "after-name", label: "After name (needs address)" },
                    { value: "after-address", label: "After address (ready to review)" },
                    { value: "complete", label: "Fully complete" },
                  ]}
                  onChange={(v) => set("onboardingProgress", v)}
                />
              </Field>
            </div>

            <p className="mt-5 font-mono text-[10px] leading-relaxed text-muted-foreground">
              Dev only — hidden in production builds.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function authStateHint(s: AuthState): string {
  switch (s) {
    case "signed-out": return "Splash → Welcome / Sign in";
    case "mid-signup": return "Splash → Sign up (resume)";
    case "signed-in-no-session": return "Splash → Sign in";
    case "signed-in": return "Splash → Discover";
    case "biometric-enrolled": return "Splash → Unlock (Face ID)";
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[12px] font-medium text-foreground">{label}</span>
        {hint && (
          <span className="text-right font-mono text-[10px] text-muted-foreground">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex w-full rounded-xl border border-hairline bg-muted/40 p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors ${
              active
                ? "bg-foreground text-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Stacked<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="space-y-1.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-[12.5px] font-medium transition-colors ${
              active
                ? "border-bagel bg-bagel/10 text-foreground"
                : "border-hairline text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{opt.label}</span>
            {active && (
              <span className="grid h-4 w-4 place-items-center rounded-full bg-bagel text-bagel-foreground">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12l5 5L20 7" />
                </svg>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
