import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Check } from "lucide-react";
import { useCustomerProfile, type ThemePref } from "@/data/customer-store";
import { useDevState } from "@/dev-state/devState";

const OPTIONS: { value: ThemePref; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function ThemePage() {
  const { profile, setThemePreference } = useCustomerProfile();
  const { set } = useDevState();
  const navigate = useNavigate();

  function handleSelect(v: ThemePref) {
    setThemePreference(v);
    set("themeMode", v);
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
        <span className="text-[17px] font-semibold text-foreground">Appearance</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm">
        {OPTIONS.map((opt, i) => (
          <div key={opt.value}>
            <button
              onClick={() => handleSelect(opt.value)}
              className="flex w-full items-center justify-between px-4 py-3.5 transition-colors active:bg-muted/30"
            >
              <span className="text-[15px] font-medium text-card-foreground">
                {opt.label}
              </span>
              {profile.themePreference === opt.value && (
                <Check size={18} className="text-bagel" />
              )}
            </button>
            {i < OPTIONS.length - 1 && (
              <div className="ml-4 border-b border-hairline" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
