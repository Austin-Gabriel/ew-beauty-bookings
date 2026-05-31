import { useRouter } from "@tanstack/react-router";
import { ChevronLeft, Star, Clock, Sparkles, MessageCircle } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const STAR = "#F5A623";
const SUCCESS = "#16A34A";

type Factor = {
  label: string;
  detail: string;
  good: boolean;
  icon: React.ComponentType<{ size?: number }>;
};

const FACTORS: Factor[] = [
  {
    label: "On time",
    detail: "You've been on time for 96% of your bookings",
    good: true,
    icon: Clock,
  },
  {
    label: "Communication",
    detail: "Pros say you message clearly and respond quickly",
    good: true,
    icon: MessageCircle,
  },
  {
    label: "Hair profile",
    detail: "Up to date — pros come prepared for 4C natural hair",
    good: true,
    icon: Sparkles,
  },
];

export function RatingPage() {
  const router = useRouter();

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
          Your client rating
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-8 pb-12">
        <div className="flex flex-col items-center text-center">
          <span
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{ backgroundColor: "rgba(245,166,35,0.14)" }}
          >
            <Star size={32} fill={STAR} style={{ color: STAR }} />
          </span>
          <p className="mt-4" style={{ fontSize: 44, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.035em", lineHeight: 1 }}>
            4.9
          </p>
          <p className="mt-1" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Based on 23 ratings from 18 stylists
          </p>
        </div>

        <div
          className="mt-6 rounded-2xl px-4 py-3.5"
          style={{ backgroundColor: "rgba(22,163,74,0.10)" }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: SUCCESS }}>You're a top-rated client</p>
          <p className="mt-1" style={{ fontSize: 12, color: "var(--card-foreground)", lineHeight: 1.55 }}>
            Stylists are more likely to accept your bookings, and you may unlock priority slots with sought-after pros.
          </p>
        </div>

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
          What pros notice
        </p>
        <ul
          className="overflow-hidden rounded-2xl border bg-card"
          style={{ borderColor: "var(--border)" }}
        >
          {FACTORS.map((f, i) => (
            <li
              key={f.label}
              className="flex items-center gap-3 px-4 py-3"
              style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: "rgba(22,163,74,0.12)", color: SUCCESS }}
              >
                <f.icon size={15} />
              </span>
              <div className="min-w-0 flex-1">
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>{f.label}</p>
                <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
                  {f.detail}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-center" style={{ fontSize: 11.5, color: "var(--muted-foreground)", lineHeight: 1.55 }}>
          Pros only see your overall rating — not individual reviews. We hide it during booking confirmation to keep things fair.
        </p>
      </div>
    </div>
  );
}
