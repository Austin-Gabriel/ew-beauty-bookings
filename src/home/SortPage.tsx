import { useEffect, useState } from "react";
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  Check,
  Clock,
  Star,
  Sparkles,
  ArrowDown,
  ArrowUp,
  MapPin,
} from "lucide-react";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";
const SORT_KEY = "ewa.sort.preference.v1";

type SortOption = {
  id: string;
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number }>;
};

const SORT_OPTIONS: SortOption[] = [
  { id: "recommended", label: "Recommended", desc: "Our best blend of distance, rating, and availability", icon: Sparkles },
  { id: "soonest", label: "Soonest available", desc: "Earliest open appointment first", icon: Clock },
  { id: "top-rated", label: "Top rated", desc: "Highest review score first", icon: Star },
  { id: "newest", label: "Newest to Ewà", desc: "Recently joined stylists first", icon: Sparkles },
  { id: "distance", label: "Closest to you", desc: "Shortest distance from your search area", icon: MapPin },
  { id: "price-low", label: "Price: low to high", desc: "Starting price ascending", icon: ArrowDown },
  { id: "price-high", label: "Price: high to low", desc: "Starting price descending", icon: ArrowUp },
];

function loadSort(): string {
  if (typeof window === "undefined") return "recommended";
  try {
    return window.localStorage.getItem(SORT_KEY) ?? "recommended";
  } catch {
    return "recommended";
  }
}

function saveSort(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SORT_KEY, id);
  } catch {}
}

export function SortPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { from?: string };
  const { isDark, text } = useAuthTheme();

  const [selected, setSelected] = useState<string>("recommended");

  useEffect(() => {
    setSelected(loadSort());
  }, []);

  const subtleSurface = isDark ? "rgba(255,255,255,0.04)" : "var(--card)";
  const subtleBorder = "var(--border)";

  const apply = () => {
    saveSort(selected);
    const label = SORT_OPTIONS.find((s) => s.id === selected)?.label ?? "Sort";
    toast(`Sorted by ${label.toLowerCase()}`);
    if (search?.from) {
      router.history.back();
    } else {
      router.history.back();
    }
  };

  return (
    <AppShell>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{
          backgroundColor: isDark ? "transparent" : "var(--card)",
          borderColor: subtleBorder,
          fontFamily: SANS_STACK,
        }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full bg-surface-elevated"
          style={{ color: text }}
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600, color: text, letterSpacing: "-0.01em" }}>
          Sort
        </h1>
        <button
          type="button"
          onClick={() => {
            setSelected("recommended");
            toast("Reset to recommended");
          }}
          style={{
            background: "none",
            border: "none",
            color: ORANGE,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: SANS_STACK,
          }}
        >
          Reset
        </button>
      </header>

      <div className="px-5 pt-4 pb-32" style={{ fontFamily: SANS_STACK }}>
        <p style={{ fontSize: 12.5, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          Choose how stylists are ordered in your feed. We'll remember your pick across sessions.
        </p>

        <div
          className="mt-4 overflow-hidden rounded-2xl border bg-card"
          style={{ borderColor: subtleBorder }}
        >
          {SORT_OPTIONS.map((opt, i) => {
            const active = selected === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/30"
                style={{
                  borderTop: i === 0 ? "none" : `1px solid ${subtleBorder}`,
                }}
              >
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                  style={{
                    backgroundColor: active ? "rgba(255,130,63,0.12)" : "var(--surface-elevated)",
                    color: active ? ORANGE : "#2A3544",
                  }}
                >
                  <Icon size={15} />
                </span>
                <span className="min-w-0 flex-1">
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>
                    {opt.label}
                  </p>
                  <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
                    {opt.desc}
                  </p>
                </span>
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                  style={{
                    backgroundColor: active ? ORANGE : "transparent",
                    border: active ? "none" : `1.5px solid ${subtleBorder}`,
                    color: "#fff",
                  }}
                >
                  {active && <Check size={12} strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t px-5 py-3.5"
        style={{
          backgroundColor: "var(--card)",
          borderColor: subtleBorder,
          paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)",
        }}
      >
        <button
          type="button"
          onClick={apply}
          className="w-full rounded-2xl py-3.5 transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: ORANGE,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: SANS_STACK,
            boxShadow: "0 8px 24px rgba(255,130,63,0.28)",
          }}
        >
          Apply sort
        </button>
        <button
          type="button"
          onClick={() => {
            navigate({ to: "/discover" });
          }}
          className="mt-2 w-full py-2"
          style={{ background: "none", border: "none", color: "var(--muted-foreground)", fontSize: 13, fontWeight: 500, fontFamily: SANS_STACK }}
        >
          Cancel
        </button>
      </div>
    </AppShell>
  );
}
