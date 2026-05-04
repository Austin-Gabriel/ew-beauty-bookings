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
  type TippingPreference,
  type NotificationsProfile,
} from "./devState";

const POS_KEY = "ewa.devstate.pos.v1";
const BUTTON_SIZE = 36; // h-9
const EDGE_PAD = 12;

type Pos = { x: number; y: number };

function readInitialPos(): Pos {
  if (typeof window === "undefined") return { x: 16, y: 16 };
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Default: top-right, well clear of the bottom tab bar.
  const x = window.innerWidth - 70;
  return { x, y: 80 };
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
        className="fixed z-[9998] flex h-9 items-center gap-1.5 rounded-full border border-hairline bg-popover px-3 font-mono text-[11px] font-medium text-popover-foreground shadow-lg backdrop-blur"
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

              <div
                className="my-2 border-t"
                style={{ borderColor: "rgba(127,127,127,0.2)" }}
              />
              <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                Discover
              </p>

              <Field label="Customer state" hint="Drives greeting + Quick Rebook">
                <Stacked<CustomerState>
                  value={state.customerState}
                  options={[
                    { value: "new", label: "New (no history)" },
                    { value: "returning", label: "Returning (favs + 1 booking)" },
                    { value: "power", label: "Power user (many bookings)" },
                  ]}
                  onChange={(v) => set("customerState", v)}
                />
              </Field>

              <Field label="Favorites seed" hint="Resets the Favorites tab on change">
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

              <Field label="Bookings seed" hint="Volume of cards in the Bookings tab">
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

              <Field label="Active booking" hint="Drives the 'happening now' hero card">
                <Stacked<ActiveBookingStage>
                  value={state.activeBooking}
                  options={[
                    { value: "none", label: "None — no active booking" },
                    { value: "getting-ready", label: "Getting ready (on-demand prep)" },
                    { value: "enroute", label: "Enroute — on the way" },
                    { value: "arrived", label: "Arrived — PIN entry" },
                    { value: "in-progress", label: "In progress" },
                  ]}
                  onChange={(v) => set("activeBooking", v)}
                />
              </Field>

              <div
                className="my-2 border-t"
                style={{ borderColor: "rgba(127,127,127,0.2)" }}
              />
              <p className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                Profile
              </p>

              <Field label="Profile state" hint="Drives identity header + addresses + pill">
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

              <Field label="Theme preference" hint="Syncs with /profile/theme">
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

              <Field label="Tipping preference" hint="Syncs with /profile/tipping">
                <Stacked<TippingPreference>
                  value={state.tippingPreference}
                  options={[
                    { value: "15", label: "15%" },
                    { value: "18", label: "18%" },
                    { value: "20", label: "20%" },
                    { value: "25", label: "25%" },
                    { value: "custom", label: "Custom 22%" },
                    { value: "ask", label: "Always ask" },
                  ]}
                  onChange={(v) => set("tippingPreference", v)}
                />
              </Field>

              <Field label="Notifications profile" hint="Resets toggle states on subscreen">
                <Segmented<NotificationsProfile>
                  value={state.notificationsProfile}
                  options={[
                    { value: "all-on", label: "All on" },
                    { value: "booking-only", label: "Booking" },
                    { value: "all-off", label: "All off" },
                  ]}
                  onChange={(v) => set("notificationsProfile", v)}
                />
              </Field>
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
