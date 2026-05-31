import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, Tag, Percent, Gift, Clock } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";

type Promo = {
  id: string;
  code: string;
  title: string;
  body: string;
  expires: string;
  icon: React.ComponentType<{ size?: number }>;
  accent: string;
  isNew?: boolean;
};

const PROMOS: Promo[] = [
  {
    id: "p1",
    code: "FIRST20",
    title: "20% off your first booking",
    body: "First-time customers — applies to any service over $80.",
    expires: "Expires in 14 days",
    icon: Percent,
    accent: "linear-gradient(135deg, #FF823F 0%, #FF9F66 100%)",
    isNew: true,
  },
  {
    id: "p2",
    code: "BRAIDS15",
    title: "$15 off knotless braids",
    body: "Valid on any braids appointment with verified pros.",
    expires: "Expires Jun 30",
    icon: Tag,
    accent: "linear-gradient(135deg, #6B3520 0%, #C97744 100%)",
    isNew: true,
  },
  {
    id: "p3",
    code: "TIPMATCH",
    title: "Ewà matches your tip up to $10",
    body: "We add an extra $10 to your stylist's tip on your next booking.",
    expires: "Expires in 7 days",
    icon: Gift,
    accent: "linear-gradient(135deg, #16A34A 0%, #15803D 100%)",
    isNew: true,
  },
  {
    id: "p4",
    code: "REBOOK10",
    title: "10% off rebooking",
    body: "Stay loyal — 10% off every appointment with a stylist you've booked before.",
    expires: "Always on",
    icon: Clock,
    accent: "linear-gradient(135deg, #2A1810 0%, #6B3520 100%)",
  },
  {
    id: "p5",
    code: "EWASUMMER",
    title: "Free silk press finish",
    body: "Add a complimentary silk press finish to any wash & style this summer.",
    expires: "Expires Aug 31",
    icon: Tag,
    accent: "linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)",
  },
];

export function PromotionsPage() {
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
          Promotions
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-4 pb-12">
        <div
          className="rounded-2xl px-4 py-3.5"
          style={{ backgroundColor: "rgba(255,130,63,0.10)" }}
        >
          <p style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)" }}>
            $245 saved with Ewà
          </p>
          <p className="mt-0.5" style={{ fontSize: 12, color: "var(--on-card-muted)", lineHeight: 1.5 }}>
            Across 23 bookings — Ewà credits and promo codes applied automatically at checkout.
          </p>
        </div>

        <p
          className="pt-5 pb-2.5"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Active offers
        </p>

        <ul className="flex flex-col gap-2.5">
          {PROMOS.map((p) => (
            <li key={p.id}>
              <div
                className="overflow-hidden rounded-2xl border bg-card"
                style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
              >
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <span
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                    style={{ background: p.accent, color: "#fff" }}
                  >
                    <p.icon size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>
                        {p.title}
                      </p>
                      {p.isNew && (
                        <span
                          className="rounded-full px-2 py-0.5"
                          style={{
                            backgroundColor: ORANGE,
                            color: "#1A0E08",
                            fontSize: 10,
                            fontWeight: 700,
                          }}
                        >
                          New
                        </span>
                      )}
                    </div>
                    <p className="mt-1" style={{ fontSize: 12, color: "var(--on-card-muted)", lineHeight: 1.5 }}>
                      {p.body}
                    </p>
                    <p className="mt-1.5" style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
                      {p.expires}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(p.code);
                      toast.success(`${p.code} copied to clipboard`);
                    } catch {
                      toast(p.code);
                    }
                  }}
                  className="flex w-full items-center justify-between border-t px-4 py-2.5"
                  style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-elevated)" }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--card-foreground)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {p.code}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: ORANGE }}>
                    Tap to copy →
                  </span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
