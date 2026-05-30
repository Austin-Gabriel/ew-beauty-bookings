import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  Calendar,
  DollarSign,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";

const PRO_TYPES = [
  "Hairdresser",
  "Barber",
  "Loctician",
  "Nail Tech",
  "Makeup Artist",
  "Lash Tech",
  "Esthetician",
  "Tattoo Artist",
] as const;
type ProType = (typeof PRO_TYPES)[number];

export const Route = createFileRoute("/join-as-pro")({
  head: () => ({
    meta: [
      { title: "Join as a Pro — Ewà" },
      { name: "description", content: "Bring your craft to Ewà — early access for verified beauty professionals." },
    ],
  }),
  component: JoinAsProPage,
});

function JoinAsProPage() {
  const { text } = useAuthTheme();
  const navigate = useNavigate();
  const muted = "var(--muted-foreground)";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState<ProType | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = name.trim().length > 1 && /.+@.+\..+/.test(email) && city.trim().length > 0 && type !== null;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitted(true);
    toast.success("You're on the waitlist. We'll reach out at " + email);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center" style={{ fontFamily: SANS_STACK }}>
        <div className="grid h-20 w-20 place-items-center rounded-full" style={{ backgroundColor: "rgba(22,163,74,0.10)", color: SUCCESS }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="mt-5" style={{ fontSize: 22, fontWeight: 700, color: text, letterSpacing: "-0.02em" }}>
          You're on the list
        </h1>
        <p className="mt-2 max-w-[300px]" style={{ fontSize: 14, color: muted, lineHeight: 1.5 }}>
          We'll email <strong style={{ color: text }}>{email}</strong> when Ewà Biz opens for {city.trim() || "your city"}. Until then, keep doing your thing.
        </p>
        <Link
          to="/welcome"
          className="mt-8 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-transform active:scale-95"
          style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 14, fontWeight: 600, fontFamily: SANS_STACK }}
        >
          Back to Ewà
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{ backgroundColor: "var(--bg, var(--background))", borderColor: "var(--border)" }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/welcome" })}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600, color: text, letterSpacing: "-0.01em" }}>
          Join as a Pro
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-5 pb-12">
        {/* Hero */}
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl" style={{ background: "linear-gradient(135deg, #FF823F 0%, #FF9F6B 100%)", color: "#1A0E08", boxShadow: "0 8px 24px rgba(255,130,63,0.25)" }}>
            <Sparkles size={28} />
          </div>
          <h2 className="mt-4" style={{ fontSize: 24, fontWeight: 700, color: text, letterSpacing: "-0.025em" }}>
            Your craft, on Ewà
          </h2>
          <p className="mt-2 mx-auto max-w-[300px]" style={{ fontSize: 13.5, color: muted, lineHeight: 1.5 }}>
            Ewà Biz is the dedicated app for beauty pros — join the waitlist for early access.
          </p>
        </div>

        {/* Benefits */}
        <ul className="mt-7 flex flex-col gap-3">
          <Benefit
            icon={DollarSign}
            label="Keep more of what you earn"
            sub="Low platform fee. 100% of every tip stays with you."
          />
          <Benefit
            icon={Calendar}
            label="Set your own rules"
            sub="Lead time, buffer, cancellation window — all configurable per service."
          />
          <Benefit
            icon={ShieldCheck}
            label="Verified clients"
            sub="ID-verified customers, arrival PINs, and SOS support during every appointment."
          />
        </ul>

        {/* Form */}
        <div
          className="mt-7 rounded-2xl border bg-card p-4"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
            Tell us about you
          </p>
          <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
            Takes 30 seconds. No commitment.
          </p>

          <div className="mt-4 flex flex-col gap-3">
            <FormField
              label="Full name"
              value={name}
              onChange={setName}
              placeholder="Amara Okafor"
            />
            <FormField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@studio.com"
            />
            <FormField
              label="City"
              value={city}
              onChange={setCity}
              placeholder="Brooklyn, NY"
            />

            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "var(--on-card-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: 6,
                }}
              >
                What you do
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRO_TYPES.map((t) => {
                  const active = type === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className="rounded-full border px-3 py-1.5"
                      style={{
                        backgroundColor: active ? ORANGE : "var(--surface-elevated)",
                        borderColor: active ? ORANGE : "transparent",
                        color: active ? "#1A0E08" : "var(--card-foreground)",
                        fontFamily: SANS_STACK,
                        fontSize: 12.5,
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="mt-5 inline-flex w-full items-center justify-center rounded-2xl py-3.5 transition-transform active:scale-[0.98] disabled:opacity-50"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontSize: 15,
            fontWeight: 600,
            fontFamily: SANS_STACK,
          }}
        >
          Join the waitlist
        </button>

        <p className="mt-3 text-center" style={{ fontSize: 11.5, color: muted, lineHeight: 1.5 }}>
          Already a pro on Ewà?{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/biz/signin" })}
            style={{ background: "none", border: "none", color: ORANGE, fontWeight: 600, cursor: "pointer", fontFamily: SANS_STACK, fontSize: "inherit" }}
          >
            Sign in to Ewà Biz
          </button>
        </p>
      </div>
    </div>
  );
}

function Benefit({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  sub: string;
}) {
  return (
    <li
      className="flex items-start gap-3 rounded-2xl border bg-card p-3.5"
      style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
    >
      <div
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ backgroundColor: "rgba(255,130,63,0.12)", color: ORANGE }}
      >
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>{label}</p>
        <p className="mt-0.5" style={{ fontSize: 12, color: "var(--on-card-muted)", lineHeight: 1.45 }}>
          {sub}
        </p>
      </div>
    </li>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span
        className="block"
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--on-card-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border-none px-3.5 py-3 outline-none"
        style={{
          backgroundColor: "var(--surface-elevated)",
          color: "var(--foreground)",
          fontSize: 14,
          fontFamily: SANS_STACK,
        }}
      />
    </label>
  );
}
