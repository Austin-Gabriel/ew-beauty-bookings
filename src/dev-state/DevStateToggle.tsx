import { useEffect, useRef, useState } from "react";
import {
  useDevState,
  type ThemeMode,
  type UserState,
  type AuthState,
  type OnboardingProgress,
  type CustomerState,
  type FavoritesSeed,
  type BookingsSeed,
  type ActiveBookingStage,
  type ProfileState,
  type BookingConfirmState,
  type SearchingStage,
  type ScheduleState,
} from "./devState";

const POS_KEY = "ewa.devstate.pos.v1";
const BUTTON_SIZE = 36; // h-9
const EDGE_PAD = 12;

type Pos = { x: number; y: number };

function clampPos(p: Pos): Pos {
  if (typeof window === "undefined") return p;
  const maxX = Math.max(EDGE_PAD, window.innerWidth - BUTTON_SIZE - EDGE_PAD);
  const maxY = Math.max(EDGE_PAD, window.innerHeight - BUTTON_SIZE - EDGE_PAD);
  return {
    x: Math.max(EDGE_PAD, Math.min(maxX, p.x)),
    y: Math.max(EDGE_PAD, Math.min(maxY, p.y)),
  };
}

function readInitialPos(): Pos {
  if (typeof window === "undefined") return { x: 16, y: 16 };
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) return clampPos(JSON.parse(raw));
  } catch {}
  // Default: top-right, well clear of the bottom tab bar.
  return clampPos({ x: window.innerWidth - 70, y: 80 });
}

/**
 * Floating dev-only panel — quiet, functional, dismissable.
 * Hidden in production via import.meta.env.PROD.
 *
 * The badge is draggable so it never has to overlap live UI (e.g. the
 * Profile tab in the bottom tab bar). Position persists in localStorage.
 */
export function DevStateToggle() {
  const { state, set, reset, resolvedTheme } = useDevState();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<Pos>({ x: 16, y: 16 });
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);

  useEffect(() => {
    setPos(readInitialPos());
    const onResize = () => setPos((p) => clampPos(p));
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(POS_KEY, JSON.stringify(pos));
    } catch {}
  }, [pos]);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      moved: false,
    };
    setDragging(true);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;
    if (Math.abs(dx) + Math.abs(dy) > 4) d.moved = true;
    const maxX = window.innerWidth - BUTTON_SIZE - EDGE_PAD;
    const maxY = window.innerHeight - BUTTON_SIZE - EDGE_PAD;
    setPos({
      x: Math.max(EDGE_PAD, Math.min(maxX, d.origX + dx)),
      y: Math.max(EDGE_PAD, Math.min(maxY, d.origY + dy)),
    });
  };
  const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    setDragging(false);
    dragRef.current = null;
    if (d && !d.moved) {
      // Treat as a tap.
      setOpen(true);
    }
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <>
      <button
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Open dev state panel (drag to move)"
        className="fixed z-[2147483646] flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-popover px-3 font-mono text-[11px] font-medium text-popover-foreground shadow-lg backdrop-blur"
        style={{
          left: pos.x,
          top: pos.y,
          touchAction: "none",
          cursor: dragging ? "grabbing" : "grab",
          userSelect: "none",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-bagel" />
        dev
      </button>

      {open && (
        <div className="fixed inset-0 z-[2147483647] flex items-end justify-center sm:items-center">
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

            <p className="-mt-2 mb-4 rounded-lg bg-muted/40 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
              Every control here changes what you see. Hint text under each
              row says exactly which screen it affects. Use{" "}
              <span className="font-mono">Reset</span> to return to defaults.
            </p>

            <div className="space-y-6">
              {/* ====================== APP LIFECYCLE ====================== */}
              <DevSection label="App" sub="Theme + who-you-are during preview">
                <Field
                  label="Theme"
                  hint={state.themeMode === "system" ? `System → ${resolvedTheme}` : `Forced ${state.themeMode}`}
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
                  label="Splash routing"
                  hint={
                    state.userState === "new"
                      ? "Splash → Welcome (first-time)"
                      : "Splash → Discover or Sign in"
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
                      { value: "signed-in-no-session", label: "Signed in (needs unlock)" },
                      { value: "signed-in", label: "Signed in (valid session)" },
                      { value: "biometric-enrolled", label: "Biometric enrolled" },
                    ]}
                    onChange={(v) => set("authState", v)}
                  />
                </Field>

                <Field
                  label="Onboarding step"
                  hint="Only matters when auth = mid-signup — lands signup at this step"
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
              </DevSection>

              {/* ====================== CUSTOMER ====================== */}
              <DevSection label="Customer" sub="Drives Discover greeting + Quick Rebook + Notifications copy">
                <Field
                  label="History"
                  hint={
                    state.customerState === "new"
                      ? "No previous bookings, no Quick Rebook"
                      : state.customerState === "returning"
                        ? "Some favorites, 1+ past booking"
                        : "Heavy user, many past bookings"
                  }
                >
                  <Stacked<CustomerState>
                    value={state.customerState}
                    options={[
                      { value: "new", label: "New (no history)" },
                      { value: "returning", label: "Returning" },
                      { value: "power", label: "Power user" },
                    ]}
                    onChange={(v) => set("customerState", v)}
                  />
                </Field>

                <Field label="Profile completeness" hint="Drives /profile header pills + missing-info nudges">
                  <Segmented<ProfileState>
                    value={state.profileState}
                    options={[
                      { value: "new", label: "New" },
                      { value: "partial", label: "Partial" },
                      { value: "complete", label: "Complete" },
                    ]}
                    onChange={(v) => set("profileState", v)}
                  />
                </Field>
              </DevSection>

              {/* ====================== BOOKINGS ====================== */}
              <DevSection
                label="Bookings tab"
                sub="Volume + lifecycle stage of the 'happening now' hero"
              >
                <Field
                  label="Volume"
                  hint={
                    state.bookingsSeed === "empty"
                      ? "Empty state — no upcoming, no past"
                      : state.bookingsSeed === "few"
                        ? "1 upcoming + 1 past"
                        : "Full mock set across upcoming + past"
                  }
                >
                  <Segmented<BookingsSeed>
                    value={state.bookingsSeed}
                    options={[
                      { value: "empty", label: "Empty" },
                      { value: "few", label: "Few" },
                      { value: "many", label: "Many" },
                    ]}
                    onChange={(v) => set("bookingsSeed", v)}
                  />
                </Field>

                <Field
                  label="Active booking stage"
                  hint={
                    state.activeBooking === "none"
                      ? "No 'happening now' hero card"
                      : `Hero shows: ${state.activeBooking.replace("-", " ")}`
                  }
                >
                  <Stacked<ActiveBookingStage>
                    value={state.activeBooking}
                    options={[
                      { value: "none", label: "None — hero hidden" },
                      { value: "getting-ready", label: "Getting ready (on-demand prep)" },
                      { value: "enroute", label: "Enroute — on the way" },
                      { value: "arrived", label: "Arrived — PIN handover" },
                      { value: "in-progress", label: "In progress" },
                      { value: "completed", label: "Completed (→ Service Complete)" },
                    ]}
                    onChange={(v) => set("activeBooking", v)}
                  />
                </Field>
              </DevSection>

              {/* ====================== FAVORITES ====================== */}
              <DevSection label="Favorites tab" sub="Volume of saved stylists + collections">
                <Field
                  label="Seed"
                  hint="Resets the Favorites tab whenever this changes"
                >
                  <Segmented<FavoritesSeed>
                    value={state.favoritesSeed}
                    options={[
                      { value: "empty", label: "Empty" },
                      { value: "few", label: "Few" },
                      { value: "many", label: "Many" },
                    ]}
                    onChange={(v) => set("favoritesSeed", v)}
                  />
                </Field>
              </DevSection>

              {/* ====================== BOOKING FLOWS (advanced) ====================== */}
              <DevSection
                label="Booking flow variants"
                sub="Niche — only fires when you're inside the matching screen"
              >
                <Field label="Confirm screen" hint="/booking/confirm/$proId">
                  <Stacked<BookingConfirmState>
                    value={state.bookingConfirmState}
                    options={[
                      { value: "default", label: "Default (all pre-filled)" },
                      { value: "missing-payment", label: "Missing payment" },
                      { value: "missing-address", label: "Missing address" },
                      { value: "always-ask-tip", label: "Always-ask tip" },
                      { value: "custom-tip", label: "Custom tip 22%" },
                    ]}
                    onChange={(v) => set("bookingConfirmState", v)}
                  />
                </Field>

                <Field label="Searching screen" hint="/booking/searching/$bookingId">
                  <Stacked<SearchingStage>
                    value={state.searchingStage}
                    options={[
                      { value: "searching", label: "Searching (pulsing)" },
                      { value: "matched", label: "Matched (pro accepted)" },
                      { value: "declined", label: "Declined (pro passed)" },
                      { value: "timeout", label: "Timeout (no response)" },
                    ]}
                    onChange={(v) => set("searchingStage", v)}
                  />
                </Field>

                <Field label="Scheduled flow" hint="/booking/schedule/$proId outcomes">
                  <Stacked<ScheduleState>
                    value={state.scheduleState}
                    options={[
                      { value: "none", label: "None" },
                      { value: "slot-picked", label: "Slot picked" },
                      { value: "slot-expired", label: "Slot expired" },
                      { value: "pending-pro", label: "Pending pro" },
                      { value: "auto-accepted", label: "Auto-accepted" },
                      { value: "pro-declined", label: "Pro declined" },
                      { value: "24h-timeout", label: "24h timeout" },
                    ]}
                    onChange={(v) => set("scheduleState", v)}
                  />
                </Field>
              </DevSection>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 w-full rounded-full bg-bagel text-[14px] font-semibold text-bagel-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                Done
              </button>
              <button
                type="button"
                onClick={reset}
                className="h-9 w-full text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Reset to default
              </button>
            </div>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
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

function DevSection({
  label,
  sub,
  children,
}: {
  label: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-hairline bg-card/40 p-4">
      <header>
        <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
          {label}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{sub}</p>
      </header>
      {children}
    </section>
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
