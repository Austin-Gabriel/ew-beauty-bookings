import { useRouter, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Sparkles, Gift, Tag, Calendar } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";

type Activity = {
  id: string;
  label: string;
  meta: string;
  amount: number; // positive = added, negative = used
  icon: React.ComponentType<{ size?: number }>;
};

const ACTIVITY: Activity[] = [
  { id: "a1", label: "Referral bonus — Tasha B.", meta: "Apr 28", amount: 20, icon: Gift },
  { id: "a2", label: "Used on booking", meta: "Apr 18 · Amara Okafor", amount: -10, icon: Calendar },
  { id: "a3", label: "Welcome credit", meta: "Apr 02", amount: 25, icon: Sparkles },
  { id: "a4", label: "Promo: FIRST20", meta: "Mar 30", amount: 15, icon: Tag },
  { id: "a5", label: "Used on booking", meta: "Mar 22 · Joelle Pierre", amount: -10, icon: Calendar },
  { id: "a6", label: "Referral bonus — Kelechi A.", meta: "Apr 12", amount: 20, icon: Gift },
];

export function CreditsPage() {
  const router = useRouter();
  const navigate = useNavigate();

  const balance = ACTIVITY.reduce((acc, a) => acc + a.amount, 0);

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
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)" }}
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
          Ewà credits
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-6 pb-12">
        {/* Balance hero */}
        <div
          className="rounded-3xl px-5 py-6 text-center"
          style={{
            background: "linear-gradient(135deg, #1A0E08 0%, #2A1810 100%)",
            color: "#fff",
            boxShadow: "0 8px 24px rgba(11,18,32,0.16)",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: ORANGE,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Current balance
          </p>
          <p
            className="mt-1"
            style={{
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              lineHeight: 1,
            }}
          >
            ${balance}
          </p>
          <p className="mt-1.5" style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)" }}>
            Applied automatically at checkout, $1 at a time.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/discover" })}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2"
            style={{
              backgroundColor: ORANGE,
              color: "#1A0E08",
              fontSize: 13,
              fontWeight: 700,
              fontFamily: SANS_STACK,
            }}
          >
            Book a stylist →
          </button>
        </div>

        {/* Ways to earn */}
        <p
          className="pt-6 pb-2.5"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Ways to earn more
        </p>
        <div className="flex flex-col gap-2">
          <EarnRow
            icon={Gift}
            iconBg="linear-gradient(135deg, #6B3520 0%, #C97744 100%)"
            label="Refer a friend"
            sub="$20 when they complete their first booking"
            cta="Invite →"
            onClick={() => navigate({ to: "/profile/refer" })}
          />
          <EarnRow
            icon={Sparkles}
            iconBg="linear-gradient(135deg, #FF823F 0%, #FF9F66 100%)"
            label="Rate your stylist"
            sub="$2 in credits for every honest review"
            cta="Open bookings →"
            onClick={() => navigate({ to: "/bookings" })}
          />
        </div>

        {/* Activity */}
        <p
          className="pt-6 pb-2.5"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Activity
        </p>
        <ul
          className="overflow-hidden rounded-2xl border bg-card"
          style={{ borderColor: "var(--border)" }}
        >
          {ACTIVITY.map((a, i) => (
            <li
              key={a.id}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: "var(--surface-elevated)", color: "var(--card-foreground)" }}
              >
                <a.icon size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--card-foreground)" }}>{a.label}</p>
                <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
                  {a.meta}
                </p>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: a.amount >= 0 ? SUCCESS : "var(--card-foreground)",
                }}
              >
                {a.amount >= 0 ? `+$${a.amount}` : `-$${Math.abs(a.amount)}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function EarnRow({
  icon: Icon,
  iconBg,
  label,
  sub,
  cta,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  iconBg: string;
  label: string;
  sub: string;
  cta: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3 text-left transition-colors active:bg-muted/30"
      style={{ borderColor: "var(--border)" }}
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{ background: iconBg, color: "#fff" }}
      >
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--card-foreground)" }}>{label}</p>
        <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
          {sub}
        </p>
      </span>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: ORANGE }}>{cta}</span>
    </button>
  );
}
