import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Check } from "lucide-react";
import { useDevState, type TippingPreference } from "@/dev-state/devState";
import { useState, useEffect } from "react";

const OPTIONS: { value: TippingPreference; label: string; tabular?: boolean }[] = [
  { value: "15", label: "15%", tabular: true },
  { value: "18", label: "18%", tabular: true },
  { value: "20", label: "20%", tabular: true },
  { value: "25", label: "25%", tabular: true },
  { value: "custom", label: "Custom amount" },
  { value: "ask", label: "Always ask each time" },
];

export function TippingPage() {
  const { state, set } = useDevState();
  const navigate = useNavigate();
  const [customValue, setCustomValue] = useState(state.tippingCustomValue);

  useEffect(() => {
    setCustomValue(state.tippingCustomValue);
  }, [state.tippingCustomValue]);

  const handleCustomChange = (val: string) => {
    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 1 && num <= 50) {
      setCustomValue(num);
      set("tippingCustomValue", num);
    } else if (val === "") {
      setCustomValue(0);
    }
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-3">
      {/* Top bar */}
      <div className="relative flex h-11 items-center justify-center">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="absolute left-0 grid h-9 w-9 place-items-center rounded-full transition-colors active:bg-muted/30"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <span className="text-[17px] font-semibold text-foreground">
          Tipping preferences
        </span>
      </div>

      {/* Intro */}
      <p className="px-1 text-[14px] leading-relaxed text-muted-foreground">
        Set a default tip for your bookings. You can always adjust it after a service.
      </p>

      {/* Options card */}
      <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm">
        {OPTIONS.map((opt, i) => (
          <div key={opt.value}>
            <button
              onClick={() => set("tippingPreference", opt.value)}
              className="flex w-full items-center justify-between px-4 py-3.5 transition-colors active:bg-muted/30"
            >
              <span
                className={`text-[15px] font-medium text-card-foreground ${opt.tabular ? "tabular" : ""}`}
              >
                {opt.label}
              </span>
              {state.tippingPreference === opt.value && (
                <Check size={18} className="text-bagel" />
              )}
            </button>

            {/* Custom input row */}
            {opt.value === "custom" && state.tippingPreference === "custom" && (
              <>
                <div className="ml-4 border-b border-hairline" />
                <div className="flex items-center gap-3 px-4 py-3">
                  <span className="text-[14px] text-on-card-muted">Tip percentage</span>
                  <div className="ml-auto flex items-center gap-1">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={customValue || ""}
                      onChange={(e) => handleCustomChange(e.target.value)}
                      className="tabular w-14 rounded-lg border border-hairline bg-card-foreground/5 px-2 py-1.5 text-center text-[15px] font-medium text-card-foreground outline-none focus:border-bagel"
                    />
                    <span className="text-[14px] text-on-card-muted">%</span>
                  </div>
                </div>
              </>
            )}

            {i < OPTIONS.length - 1 && (
              <div className="ml-4 border-b border-hairline" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
