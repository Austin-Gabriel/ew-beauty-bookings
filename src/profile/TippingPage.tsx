import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Check } from "lucide-react";
import { useCustomerProfile, type TippingPref } from "@/data/customer-store";
import { useDevState } from "@/dev-state/devState";
import { useState, useEffect } from "react";

type TipOption = { value: string; label: string; tabular?: boolean };

const OPTIONS: TipOption[] = [
  { value: "15", label: "15%", tabular: true },
  { value: "18", label: "18%", tabular: true },
  { value: "20", label: "20%", tabular: true },
  { value: "25", label: "25%", tabular: true },
  { value: "custom", label: "Custom amount" },
  { value: "ask", label: "Always ask each time" },
];

function prefToKey(p: TippingPref): string {
  if (p.type === "ask") return "ask";
  if (p.type === "custom") return "custom";
  return String(p.value ?? 20);
}

export function TippingPage() {
  const navigate = useNavigate();
  const { profile, setTippingPreference } = useCustomerProfile();
  const { set } = useDevState();
  const pref = profile.tippingPreference;
  const selectedKey = prefToKey(pref);
  const [customValue, setCustomValue] = useState(pref.type === "custom" ? (pref.value ?? 22) : 22);

  useEffect(() => {
    if (pref.type === "custom" && pref.value) setCustomValue(pref.value);
  }, [pref]);

  function selectOption(val: string) {
    let newPref: TippingPref;
    if (val === "ask") {
      newPref = { type: "ask" };
      set("tippingPreference", "ask");
    } else if (val === "custom") {
      newPref = { type: "custom", value: customValue };
      set("tippingPreference", "custom");
      set("tippingCustomValue", customValue);
    } else {
      newPref = { type: "percent", value: parseInt(val, 10) };
      set("tippingPreference", val as any);
    }
    setTippingPreference(newPref);
  }

  function handleCustomChange(val: string) {
    if (val === "" || val === "-") {
      setCustomValue(0);
      return;
    }
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) {
      setCustomValue(0);
      setTippingPreference({ type: "custom", value: 0 });
      set("tippingCustomValue", 0);
    } else if (num > 100) {
      setCustomValue(100);
      setTippingPreference({ type: "custom", value: 100 });
      set("tippingCustomValue", 100);
    } else {
      setCustomValue(num);
      setTippingPreference({ type: "custom", value: num });
      set("tippingCustomValue", num);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-3">
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

      <p className="px-1 text-[14px] leading-relaxed text-muted-foreground">
        Set a default tip for your bookings. You can always adjust it after a service.
      </p>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm">
        {OPTIONS.map((opt, i) => (
          <div key={opt.value}>
            <button
              onClick={() => selectOption(opt.value)}
              className="flex w-full items-center justify-between px-4 py-3.5 transition-colors active:bg-muted/30"
            >
              <span
                className={`text-[15px] font-medium text-card-foreground ${opt.tabular ? "tabular" : ""}`}
              >
                {opt.label}
              </span>
              {selectedKey === opt.value && (
                <Check size={18} className="text-bagel" />
              )}
            </button>

            {opt.value === "custom" && selectedKey === "custom" && (
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
