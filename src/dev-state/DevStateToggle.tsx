import { useState } from "react";
import { useDevState, type DevState } from "./devState";

/**
 * Floating dev-only toggle. Hidden in production builds via import.meta.env.PROD.
 * Tap the badge to expand. Add a row per new field as features land.
 */
export function DevStateToggle() {
  const { state, set, reset } = useDevState();
  const [open, setOpen] = useState(false);

  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] font-sans text-xs">
      {open ? (
        <div className="w-64 rounded-2xl border border-hairline bg-popover p-3 text-popover-foreground shadow-2xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-semibold tracking-tight">Dev state</span>
            <div className="flex items-center gap-2">
              <button
                onClick={reset}
                className="rounded-md px-2 py-0.5 text-muted-foreground hover:bg-muted"
              >
                reset
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-0.5 text-muted-foreground hover:bg-muted"
              >
                ×
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Row
              label="Theme"
              value={state.theme}
              options={["light", "dark"] as const}
              onChange={(v) => set("theme", v as DevState["theme"])}
            />
            <Toggle
              label="Authenticated"
              value={state.authed}
              onChange={(v) => set("authed", v)}
            />
            <Toggle
              label="Has bookings"
              value={state.hasBookings}
              onChange={(v) => set("hasBookings", v)}
            />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-bagel px-3 py-1.5 font-semibold text-bagel-foreground shadow-lg"
        >
          dev
        </button>
      )}
    </div>
  );
}

function Row<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <div className="flex rounded-md border border-hairline p-0.5">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded px-2 py-0.5 capitalize ${
              value === opt ? "bg-foreground text-background" : "text-muted-foreground"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-muted-foreground">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          value ? "bg-bagel" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-background transition-all ${
            value ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
