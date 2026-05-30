import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Share2,
  MapPin,
  PhoneCall,
  AlertOctagon,
} from "lucide-react";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "var(--bagel)";
const DANGER = "#DC2626";

type ToggleState = "on" | "off";

export function SafetyPage() {
  const router = useRouter();
  const { isDark, text } = useAuthTheme();
  const surfaceBg = isDark ? "transparent" : "var(--card)";
  const subtleBorder = "var(--border)";

  const [verifiedOnly, setVerifiedOnly] = useState<ToggleState>("on");
  const [liveLocation, setLiveLocation] = useState<ToggleState>("on");
  const [sosHolding, setSosHolding] = useState(false);

  const onSosHoldStart = () => {
    setSosHolding(true);
    const id = window.setTimeout(() => {
      setSosHolding(false);
      toast("SOS sent — Ewà support + your emergency contacts notified");
    }, 1200);
    const cancel = () => {
      window.clearTimeout(id);
      setSosHolding(false);
      window.removeEventListener("pointerup", cancel);
      window.removeEventListener("pointercancel", cancel);
    };
    window.addEventListener("pointerup", cancel, { once: true });
    window.addEventListener("pointercancel", cancel, { once: true });
  };

  return (
    <AppShell>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{
          backgroundColor: surfaceBg,
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
          Safety
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-5 pb-14" style={{ fontFamily: SANS_STACK }}>
        {/* SOS HERO ---------------------------------------------------- */}
        <div
          className="relative overflow-hidden rounded-3xl p-5"
          style={{
            background: "linear-gradient(135deg, #1A0E08 0%, #0B1220 100%)",
            color: "#fff",
            boxShadow: "0 1px 3px rgba(11,18,32,0.08)",
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 80% 20%, rgba(220,38,38,0.20) 0%, transparent 60%)" }}
          />
          <div className="relative">
            <p style={{ fontSize: 10.5, color: "rgba(255,200,200,0.70)", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              In an emergency
            </p>
            <h2 className="mt-1.5" style={{ fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Send SOS to Ewà
            </h2>
            <p className="mt-1.5" style={{ fontSize: 12.5, color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>
              Alerts Ewà support and your emergency contacts with your live location and appointment details.
            </p>
            <button
              type="button"
              onPointerDown={onSosHoldStart}
              className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-3 transition-transform active:scale-[0.97]"
              style={{
                backgroundColor: DANGER,
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                boxShadow: `0 0 0 ${sosHolding ? 6 : 4}px rgba(220,38,38,0.20)`,
                fontFamily: SANS_STACK,
              }}
            >
              <AlertOctagon size={15} />
              {sosHolding ? "Hold a sec…" : "Hold for SOS"}
            </button>
          </div>
        </div>

        {/* BEFORE ----------------------------------------------------- */}
        <SectionLabel>Before your appointment</SectionLabel>
        <SectionCard>
          <RowToggle
            icon={ShieldCheck}
            tone="success"
            label="Only book verified pros"
            desc="ID verified and background checked"
            value={verifiedOnly}
            onChange={setVerifiedOnly}
          />
          <RowNav
            icon={UserPlus}
            label="Emergency contacts"
            desc="2 contacts will be notified if you SOS"
            onClick={() => toast("Emergency contacts editor coming next")}
          />
          <RowNav
            icon={Share2}
            label="Share appointment"
            desc="Send pro's name, ETA, and license to a trusted person"
            onClick={() => toast("Pick a contact to share with")}
            last
          />
        </SectionCard>

        {/* DURING ----------------------------------------------------- */}
        <SectionLabel>During your appointment</SectionLabel>
        <SectionCard>
          <RowToggle
            icon={MapPin}
            label="Live location sharing"
            desc="Share your location during appointments"
            value={liveLocation}
            onChange={setLiveLocation}
          />
          <RowNav
            icon={PhoneCall}
            label="Discreet support call"
            desc="Connect to Ewà support disguised as a regular call"
            onClick={() => toast("Discreet call coming next")}
            last
          />
        </SectionCard>

        {/* AFTER ------------------------------------------------------ */}
        <SectionLabel>After your appointment</SectionLabel>
        <SectionCard>
          <RowNav
            icon={AlertOctagon}
            tone="danger"
            label="Report an issue"
            desc="Anonymously flag concerns about a pro"
            onClick={() => toast("Report flow coming next")}
            last
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}

/* ───────── atoms ───────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="pt-6 pb-2.5"
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--muted-foreground)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontFamily: SANS_STACK,
      }}
    >
      {children}
    </p>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-card"
      style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
    >
      {children}
    </div>
  );
}

type Tone = "neutral" | "success" | "danger";

function rowIconStyle(tone: Tone): React.CSSProperties {
  if (tone === "success") return { background: "rgba(22,163,74,0.12)", color: "#16A34A" };
  if (tone === "danger") return { background: "rgba(220,38,38,0.10)", color: DANGER };
  return { background: "var(--surface-elevated)", color: "#2A3544" };
}

function RowNav({
  icon: Icon,
  label,
  desc,
  onClick,
  last = false,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  desc: string;
  onClick: () => void;
  last?: boolean;
  tone?: Tone;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-muted/30"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={rowIconStyle(tone)}>
          <Icon size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>{label}</p>
          <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
            {desc}
          </p>
        </span>
        <ChevronRight size={14} style={{ color: "var(--on-card-muted)" }} />
      </button>
      {!last && <div className="ml-[60px] border-b" style={{ borderColor: "var(--border)" }} />}
    </>
  );
}

function RowToggle({
  icon: Icon,
  label,
  desc,
  value,
  onChange,
  tone = "neutral",
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  desc: string;
  value: ToggleState;
  onChange: (v: ToggleState) => void;
  tone?: Tone;
}) {
  const on = value === "on";
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={rowIconStyle(tone)}>
          <Icon size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>{label}</p>
          <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
            {desc}
          </p>
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          onClick={() => onChange(on ? "off" : "on")}
          className="relative shrink-0 rounded-full transition-colors"
          style={{
            width: 42,
            height: 24,
            backgroundColor: on ? "#16A34A" : "var(--border)",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              width: 20,
              height: 20,
              borderRadius: 9999,
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
              transform: on ? "translateX(18px)" : "translateX(0)",
              transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </button>
      </div>
      <div className="ml-[60px] border-b" style={{ borderColor: "var(--border)" }} />
    </>
  );
}

void ORANGE;
