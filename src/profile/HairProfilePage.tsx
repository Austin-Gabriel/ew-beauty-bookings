import { useEffect, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, Sparkles } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";
const STORAGE_KEY = "ewa.hair-profile.v1";

type HairProfile = {
  type: string;
  length: string;
  density: string;
  porosity: string;
  history: string[];
  allergies: string;
  notes: string;
};

const TYPES = ["3A", "3B", "3C", "4A", "4B", "4C", "Mixed"];
const LENGTHS = ["Short", "Chin", "Shoulder", "BSL", "MBL", "Waist"];
const DENSITY = ["Fine", "Medium", "Thick"];
const POROSITY = ["Low", "Medium", "High"];
const HISTORY_OPTS = [
  "Color treated",
  "Bleached",
  "Relaxer in past",
  "Henna",
  "Heat damage",
  "No chemical history",
];

const DEFAULTS: HairProfile = {
  type: "4C",
  length: "BSL",
  density: "Thick",
  porosity: "Low",
  history: ["No chemical history"],
  allergies: "",
  notes: "",
};

function loadProfile(): HairProfile {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as HairProfile) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

function saveProfile(p: HairProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

export function HairProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<HairProfile>(DEFAULTS);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  const update = <K extends keyof HairProfile>(key: K, value: HairProfile[K]) => {
    setProfile((p) => ({ ...p, [key]: value }));
  };

  const toggleHistory = (item: string) => {
    setProfile((p) => ({
      ...p,
      history: p.history.includes(item)
        ? p.history.filter((h) => h !== item)
        : [...p.history.filter((h) => h !== "No chemical history" || item === "No chemical history"), item],
    }));
  };

  const onSave = () => {
    saveProfile(profile);
    toast.success("Hair profile saved");
    router.history.back();
  };

  return (
    <div className="flex min-h-full flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ backgroundColor: "rgba(11,28,39,0.06)", color: "var(--card-foreground)" }}
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
          Hair profile
        </h1>
        <span className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32">
        <div className="flex items-start gap-3 rounded-2xl px-4 py-3.5" style={{ backgroundColor: "rgba(255,130,63,0.10)" }}>
          <Sparkles size={16} style={{ color: ORANGE, marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 12.5, color: "var(--foreground)", lineHeight: 1.5 }}>
            Stylists see this before your appointment so they can show up with the right products and a plan.
          </p>
        </div>

        <Section label="Hair type">
          <ChipRow options={TYPES} value={profile.type} onChange={(v) => update("type", v)} />
        </Section>

        <Section label="Length">
          <ChipRow options={LENGTHS} value={profile.length} onChange={(v) => update("length", v)} />
        </Section>

        <Section label="Density">
          <ChipRow options={DENSITY} value={profile.density} onChange={(v) => update("density", v)} />
        </Section>

        <Section label="Porosity">
          <ChipRow options={POROSITY} value={profile.porosity} onChange={(v) => update("porosity", v)} />
        </Section>

        <Section label="Chemical history">
          <div className="flex flex-wrap gap-1.5">
            {HISTORY_OPTS.map((opt) => {
              const active = profile.history.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleHistory(opt)}
                  className="rounded-full border px-3 py-1.5"
                  style={{
                    backgroundColor: active ? ORANGE : "var(--surface-elevated)",
                    borderColor: active ? ORANGE : "var(--border)",
                    color: active ? "#1A0E08" : "var(--card-foreground)",
                    fontSize: 12.5,
                    fontWeight: active ? 600 : 500,
                    fontFamily: SANS_STACK,
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </Section>

        <Section label="Allergies or sensitivities">
          <input
            value={profile.allergies}
            onChange={(e) => update("allergies", e.target.value)}
            placeholder="e.g. coconut oil, latex gloves"
            className="w-full rounded-xl px-3.5 py-3 outline-none"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--foreground)",
              fontSize: 14,
              fontFamily: SANS_STACK,
            }}
          />
        </Section>

        <Section label="Notes for your stylist">
          <textarea
            value={profile.notes}
            onChange={(e) => update("notes", e.target.value)}
            rows={3}
            placeholder="Tension headaches, scalp sensitivity, edges to be careful with…"
            className="w-full resize-none rounded-xl px-3.5 py-3 outline-none"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--foreground)",
              fontSize: 14,
              fontFamily: SANS_STACK,
              lineHeight: 1.5,
            }}
          />
        </Section>
      </div>

      <div
        className="sticky bottom-0 border-t px-5 py-3.5"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)",
        }}
      >
        <button
          type="button"
          onClick={onSave}
          className="w-full rounded-2xl py-3.5 transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: SANS_STACK,
          }}
        >
          Save profile
        </button>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="pt-5">
      <p
        className="pb-2"
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--muted-foreground)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function ChipRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="rounded-full border px-3 py-1.5"
            style={{
              backgroundColor: active ? ORANGE : "var(--surface-elevated)",
              borderColor: active ? ORANGE : "var(--border)",
              color: active ? "#1A0E08" : "var(--card-foreground)",
              fontSize: 12.5,
              fontWeight: active ? 600 : 500,
              fontFamily: SANS_STACK,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
