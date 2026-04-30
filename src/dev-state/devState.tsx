import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Dev State — single source of truth for testing UI states without real data.
 * Every field MUST drive a UI change somewhere. Add fields as features land.
 *
 * Hidden in production (toggle won't render), but defaults still apply.
 */
export type ThemeMode = "system" | "light" | "dark";
export type UserState = "new" | "returning";

/**
 * AuthState — what the splash router and protected routes should believe
 * about the current "user" so we can flip between flows without real auth.
 */
export type AuthState =
  | "signed-out"
  | "mid-signup"
  | "signed-in-no-session"
  | "signed-in"
  | "biometric-enrolled";

/**
 * OnboardingProgress — how far through signup the dev "user" has gotten.
 * Used by the signup flow to deep-link to the next missing step when the
 * auth state is "mid-signup".
 */
export type OnboardingProgress =
  | "none"
  | "after-identifier"
  | "after-verification"
  | "after-name"
  | "after-address"
  | "complete";

/** Customer history density — drives Quick Rebook + greeting. */
export type CustomerState = "new" | "returning" | "power";

/** Seeded favorites/collections in the Favorites tab. */
export type FavoritesSeed = "empty" | "few" | "many";

/** Seeded bookings volume in the Bookings tab. */
export type BookingsSeed = "empty" | "few" | "many";

/** Lifecycle stage of the "happening now" booking — lets us preview each
 *  state of the active-booking hero card without faking timestamps. */
export type ActiveBookingStage =
  | "none"
  | "getting-ready"
  | "enroute"
  | "arrived"
  | "in-progress";

export type DevState = {
  themeMode: ThemeMode;
  userState: UserState;
  authState: AuthState;
  onboardingProgress: OnboardingProgress;
  customerState: CustomerState;
  favoritesSeed: FavoritesSeed;
  bookingsSeed: BookingsSeed;
  activeBooking: ActiveBookingStage;
};

const DEFAULTS: DevState = {
  themeMode: "system",
  userState: "returning",
  authState: "signed-in",
  onboardingProgress: "complete",
  customerState: "returning",
  favoritesSeed: "few",
  bookingsSeed: "many",
  activeBooking: "enroute",
};

const STORAGE_KEY = "ewa.devstate.v1";

type Ctx = {
  state: DevState;
  /** The actual applied theme after resolving "system". */
  resolvedTheme: "light" | "dark";
  set: <K extends keyof DevState>(key: K, value: DevState[K]) => void;
  reset: () => void;
};

const DevStateCtx = createContext<Ctx | null>(null);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readInitialState(): DevState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULTS;
}

export function DevStateProvider({ children }: { children: ReactNode }) {
  // SSR renders defaults; client hydrates from localStorage immediately.
  const [state, setState] = useState<DevState>(DEFAULTS);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">("light");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readInitialState());
    setSystemTheme(getSystemTheme());
    setHydrated(true);

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const resolvedTheme = state.themeMode === "system" ? systemTheme : state.themeMode;

  // Persist + apply theme class once we've read localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
  }, [state, resolvedTheme, hydrated]);

  // Re-seed favorites when the toggle changes
  useEffect(() => {
    if (!hydrated) return;
    // Lazy import to avoid SSR + circular dep
    Promise.all([import("@/favorites/store"), import("@/data/mock-pros")]).then(
      ([{ seedFavorites }, { MOCK_PROS }]) => {
        seedFavorites(state.favoritesSeed, MOCK_PROS);
      },
    );
  }, [state.favoritesSeed, hydrated]);

  const value: Ctx = useMemo(
    () => ({
      state,
      resolvedTheme,
      set: (k, v) => setState((s) => ({ ...s, [k]: v })),
      reset: () => setState(DEFAULTS),
    }),
    [state, resolvedTheme],
  );

  return <DevStateCtx.Provider value={value}>{children}</DevStateCtx.Provider>;
}

export function useDevState() {
  const ctx = useContext(DevStateCtx);
  if (!ctx) {
    // Allow EwaLockup etc. to be rendered in storybook-ish previews without a provider
    return {
      state: DEFAULTS,
      resolvedTheme: "light" as const,
      set: () => {},
      reset: () => {},
    };
  }
  return ctx;
}
