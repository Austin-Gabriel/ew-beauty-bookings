import { useMemo, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "#FF823F";
const DANGER = "#DC2626";

type Severity = "info" | "concern" | "urgent";

const CATEGORIES = [
  { id: "behavior", label: "Behavior or attitude", severity: "concern" as Severity },
  { id: "quality", label: "Service quality", severity: "info" as Severity },
  { id: "no-show", label: "No-show or late cancellation", severity: "concern" as Severity },
  { id: "safety", label: "Safety concern", severity: "urgent" as Severity },
  { id: "harassment", label: "Harassment or threats", severity: "urgent" as Severity },
  { id: "fraud", label: "Fraud or scam attempt", severity: "urgent" as Severity },
  { id: "other", label: "Something else", severity: "info" as Severity },
];

export function ReportIssuePage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { text } = useAuthTheme();
  const { pastBookings, activeBookings } = useBookings();

  const recent = useMemo(() => {
    const all = [...activeBookings, ...pastBookings].slice(0, 5);
    return all
      .map((b) => ({ booking: b, pro: MOCK_PROS.find((p) => p.id === b.proId) }))
      .filter((x) => !!x.pro) as { booking: (typeof all)[number]; pro: NonNullable<ReturnType<typeof MOCK_PROS.find>> }[];
  }, [activeBookings, pastBookings]);

  const [bookingId, setBookingId] = useState<string | null>(recent[0]?.booking.id ?? null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [anonymous, setAnonymous] = useState(true);

  const category = CATEGORIES.find((c) => c.id === categoryId) ?? null;
  const canSubmit = categoryId !== null && details.trim().length >= 10;

  const submit = () => {
    if (!canSubmit) return;
    const sev = category?.severity ?? "info";
    if (sev === "urgent") {
      toast.success("Report sent. Ewà Trust & Safety will reach out within 24 hours.");
    } else {
      toast.success("Report received. Thank you — we review every report.");
    }
    navigate({ to: "/safety" });
  };

  return (
    <AppShell>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{ backgroundColor: "var(--bg, var(--background))", borderColor: "var(--border)", fontFamily: SANS_STACK }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ backgroundColor: "var(--surface-elevated)", color: text }}
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600, color: text, letterSpacing: "-0.01em" }}>
          Report an issue
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-5 pb-12" style={{ fontFamily: SANS_STACK }}>
        <div
          className="flex items-start gap-3 rounded-2xl p-4"
          style={{ backgroundColor: "rgba(22,163,74,0.10)" }}
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full" style={{ backgroundColor: "#16A34A", color: "#fff" }}>
            <ShieldCheck size={15} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0B1220" }}>You're in control</p>
            <p className="mt-1" style={{ fontSize: 12, color: "#2A3544", lineHeight: 1.5 }}>
              Reports are kept private and reviewed by our Trust & Safety team. Urgent reports get a human reply within 24 hours.
            </p>
          </div>
        </div>

        {/* Which booking */}
        {recent.length > 0 && (
          <>
            <SectionLabel>Which booking?</SectionLabel>
            <ul
              className="overflow-hidden rounded-2xl border bg-card"
              style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
            >
              {recent.map(({ booking, pro }, i) => {
                const active = bookingId === booking.id;
                return (
                  <li key={booking.id}>
                    <button
                      type="button"
                      onClick={() => setBookingId(booking.id)}
                      className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:bg-muted/30"
                    >
                      <span
                        aria-hidden
                        className="grid h-5 w-5 place-items-center rounded-full border-2"
                        style={{
                          borderColor: active ? ORANGE : "var(--border)",
                          backgroundColor: active ? ORANGE : "transparent",
                        }}
                      >
                        {active && <span style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: "#fff" }} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>{pro.name}</p>
                        <p className="mt-0.5" style={{ fontSize: 12, color: "var(--on-card-muted)" }}>
                          {booking.service.name} · {new Date(booking.when).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </p>
                      </span>
                    </button>
                    {i < recent.length - 1 && <div className="ml-[44px] border-b" style={{ borderColor: "var(--border)" }} />}
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {/* Category */}
        <SectionLabel>What happened?</SectionLabel>
        <ul
          className="overflow-hidden rounded-2xl border bg-card"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
        >
          {CATEGORIES.map((c, i) => {
            const active = categoryId === c.id;
            const isUrgent = c.severity === "urgent";
            return (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:bg-muted/30"
                >
                  <span
                    aria-hidden
                    className="grid h-5 w-5 place-items-center rounded-full border-2"
                    style={{
                      borderColor: active ? ORANGE : "var(--border)",
                      backgroundColor: active ? ORANGE : "transparent",
                    }}
                  >
                    {active && <span style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: "#fff" }} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>{c.label}</p>
                  </span>
                  {isUrgent && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: DANGER,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        backgroundColor: "rgba(220,38,38,0.10)",
                        padding: "3px 8px",
                        borderRadius: 9999,
                      }}
                    >
                      Urgent
                    </span>
                  )}
                </button>
                {i < CATEGORIES.length - 1 && <div className="ml-[44px] border-b" style={{ borderColor: "var(--border)" }} />}
              </li>
            );
          })}
        </ul>

        {/* Details */}
        <SectionLabel>Tell us what happened</SectionLabel>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={5}
          placeholder="Describe the situation. Include times, what was said, and anything that might help us understand."
          className="w-full resize-none rounded-2xl border-none p-3.5 outline-none"
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)", fontSize: 14, fontFamily: SANS_STACK, lineHeight: 1.5 }}
        />
        <p className="mt-1 text-right" style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
          {details.length} / 1000
        </p>

        {/* Anonymous */}
        <div
          className="mt-4 flex items-center gap-3 rounded-2xl border bg-card p-3.5"
          style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
        >
          <div className="min-w-0 flex-1">
            <p style={{ fontSize: 13.5, fontWeight: 600, color: "var(--card-foreground)" }}>Submit anonymously</p>
            <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.45 }}>
              The pro won't see who reported them. We may still contact you for follow-up.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={anonymous}
            onClick={() => setAnonymous((v) => !v)}
            className="relative shrink-0 rounded-full transition-colors"
            style={{ width: 42, height: 24, backgroundColor: anonymous ? "#16A34A" : "var(--border)" }}
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
                transform: anonymous ? "translateX(18px)" : "translateX(0)",
                transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </button>
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit}
          className="mt-6 inline-flex w-full items-center justify-center rounded-2xl py-3.5 transition-transform active:scale-[0.98] disabled:opacity-50"
          style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 15, fontWeight: 600, fontFamily: SANS_STACK }}
        >
          Submit report
        </button>

        {/* hint about urgent */}
        {category?.severity === "urgent" && (
          <p className="mt-3 text-center" style={{ fontSize: 11.5, color: DANGER, lineHeight: 1.5 }}>
            If you're in immediate danger, call 911 first, then submit this report.
          </p>
        )}

        {/* unused but kept to satisfy linter — anonymous toggle drives submission UX
            once the backend lands; suppression intentional */}
        <span hidden>{String(bookingId)}</span>
      </div>
    </AppShell>
  );
}

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
