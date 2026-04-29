import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * Dev State — single source of truth for testing UI states without real data.
 * Every field MUST drive a UI change somewhere. Add fields as we build features.
 *
 * In production builds the floating toggle is hidden, but defaults still apply.
 */
export type DevState = {
  theme: "light" | "dark";
  authed: boolean;
  hasBookings: boolean;
};

const DEFAULTS: DevState = {
  theme: "light",
  authed: false,
  hasBookings: false,
};

const STORAGE_KEY = "ewa.devstate";

type Ctx = {
  state: DevState;
  set: <K extends keyof DevState>(key: K, value: DevState[K]) => void;
  reset: () => void;
};

const DevStateCtx = createContext<Ctx | null>(null);

export function DevStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DevState>(DEFAULTS);

  // Hydrate from localStorage after mount (SSR-safe)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}
  }, []);

  // Persist + apply theme class to <html>
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
    const root = document.documentElement;
    root.classList.toggle("dark", state.theme === "dark");
  }, [state]);

  const value: Ctx = {
    state,
    set: (k, v) => setState((s) => ({ ...s, [k]: v })),
    reset: () => setState(DEFAULTS),
  };

  return <DevStateCtx.Provider value={value}>{children}</DevStateCtx.Provider>;
}

export function useDevState() {
  const ctx = useContext(DevStateCtx);
  if (!ctx) throw new Error("useDevState must be used inside DevStateProvider");
  return ctx;
}
