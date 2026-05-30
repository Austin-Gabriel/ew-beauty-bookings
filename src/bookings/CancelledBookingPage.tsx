import { useMemo } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, Check } from "lucide-react";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { useCustomerProfile } from "@/data/customer-store";
import { MOCK_PROS, type Pro } from "@/data/mock-pros";
import { formatProLocation, getLocationContext } from "@/lib/location";

const ORANGE = "var(--bagel)";
const DANGER = "#DC2626";
const SUCCESS = "#16A34A";
const STAR = "#F5A623";

export function CancelledBookingPage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { isDark, text } = useAuthTheme();
  const { getBooking } = useBookings();
  const { profile } = useCustomerProfile();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;
  const card = booking?.paymentMethodId
    ? profile.paymentMethods.find((c) => c.id === booking.paymentMethodId)
    : profile.paymentMethods.find((c) => c.isDefault) ?? profile.paymentMethods[0];
  const cardLabel = card ? `${brandTitle(card.brand)} ending ${card.last4}` : "your original payment method";

  const surfaceBg = isDark ? "transparent" : "var(--card)";

  // Alternatives — pros available today, excluding the cancelling pro
  const alternatives = useMemo(() => {
    if (!pro) return [];
    return MOCK_PROS.filter((p) => p.id !== pro.id && p.online)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [pro]);

  if (!booking || !pro) {
    return (
      <AppShell>
        <div className="flex flex-col items-center px-5 pt-16 text-center" style={{ fontFamily: SANS_STACK }}>
          <p style={{ fontSize: 16, fontWeight: 600, color: text }}>Booking not found</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/bookings" })}
            className="mt-4 rounded-full px-4 py-2"
            style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 13, fontWeight: 700 }}
          >
            Back to Bookings
          </button>
        </div>
      </AppShell>
    );
  }

  const proFirstName = pro.name.split(" ")[0] ?? pro.name;
  const initials = pro.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const when = new Date(booking.when);
  const whenLabel = `${when.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} at ${when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
  const refundUsd = booking.refundUsd ?? booking.service.price;
  const byPro = booking.cancelledBy !== "customer";

  return (
    <AppShell>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{
          backgroundColor: surfaceBg,
          borderColor: "var(--border)",
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
          Booking cancelled
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-2 pb-32" style={{ fontFamily: SANS_STACK }}>
        {/* HERO */}
        <div className="flex flex-col items-center pt-8 pb-6 text-center">
          <div
            className="grid place-items-center rounded-full"
            style={{ width: 84, height: 84, background: "rgba(220,38,38,0.12)" }}
          >
            <span
              className="grid place-items-center rounded-full"
              style={{ width: 54, height: 54, border: `2.5px solid ${DANGER}`, color: DANGER }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </span>
          </div>
          <h2 className="mt-5" style={{ fontSize: 26, fontWeight: 700, color: text, letterSpacing: "-0.025em" }}>
            {byPro ? `${proFirstName} cancelled` : "Booking cancelled"}
          </h2>
          <p className="mt-2 max-w-[300px]" style={{ fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
            {byPro
              ? "She had to cancel your appointment. Your full payment has been refunded."
              : "You cancelled this appointment. Your refund details are below."}
          </p>
        </div>

        {/* BOOKING SUMMARY */}
        <div
          className="mb-5 flex items-center gap-3 rounded-2xl p-4"
          style={{ backgroundColor: "var(--surface-elevated)" }}
        >
          <div
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full"
            style={{
              background: "linear-gradient(135deg, #FFD9C7 0%, #FF9270 100%)",
              color: "#7C2D12",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p style={{ fontSize: 14.5, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
              {pro.name}
            </p>
            <p className="mt-0.5" style={{ fontSize: 12, color: "var(--card-foreground)", opacity: 0.7 }}>
              {booking.service.name}
            </p>
            <p className="mt-1" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
              {whenLabel}
            </p>
          </div>
        </div>

        {/* REASON (pro side only) */}
        {byPro && booking.cancellationReason && (
          <div
            className="mb-5 rounded-2xl border p-4"
            style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
          >
            <p
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: "var(--on-card-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Reason from {proFirstName}
            </p>
            <p className="mt-2" style={{ fontSize: 14, fontWeight: 500, color: "var(--card-foreground)" }}>
              {booking.cancellationReason}
            </p>
            {booking.cancellationNote && (
              <p
                className="mt-3 border-t pt-3 italic"
                style={{ borderColor: "var(--border)", fontSize: 12.5, color: "var(--card-foreground)", opacity: 0.8, lineHeight: 1.5 }}
              >
                “{booking.cancellationNote}”
              </p>
            )}
          </div>
        )}

        {/* REFUND CONFIRMED */}
        <div
          className="mb-6 flex items-center gap-3 rounded-2xl p-4"
          style={{ backgroundColor: "rgba(22,163,74,0.12)" }}
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
            style={{ backgroundColor: SUCCESS, color: "#fff" }}
          >
            <Check size={17} strokeWidth={3} />
          </div>
          <div>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: SUCCESS, letterSpacing: "-0.01em" }}>${refundUsd} refunded</p>
            <p style={{ fontSize: 12.5, color: "var(--card-foreground)", opacity: 0.78, marginTop: 1 }}>
              Returned to {cardLabel}
            </p>
          </div>
        </div>

        {/* ALTERNATIVES */}
        {alternatives.length > 0 && (
          <>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: text, letterSpacing: "-0.015em" }}>
              Other stylists available today
            </h3>
            <p className="mt-1 mb-3.5" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
              Top-rated pros near you who can fit you in
            </p>
            <ul className="flex flex-col gap-2">
              {alternatives.map((alt) => (
                <li key={alt.id}>
                  <AlternativeRow
                    alt={alt}
                    onTap={() => navigate({ to: "/pro/$proId", params: { proId: alt.id } })}
                    onBook={() => navigate({ to: "/booking/confirm/$proId", params: { proId: alt.id } })}
                  />
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* STICKY CTA */}
      <div
        className="fixed inset-x-0 z-30 px-5 pt-3.5"
        style={{
          bottom: 0,
          backgroundColor: surfaceBg,
          borderTop: `1px solid var(--border)`,
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 18px)`,
          boxShadow: "0 -4px 12px rgba(20,25,40,0.04)",
        }}
      >
        <button
          type="button"
          onClick={() => navigate({ to: "/booking/message/$bookingId", params: { bookingId: booking.id } })}
          className="w-full rounded-2xl border py-3.5 transition-transform active:scale-[0.99]"
          style={{
            backgroundColor: "transparent",
            borderColor: "var(--border)",
            color: text,
            fontSize: 15,
            fontWeight: 600,
            fontFamily: SANS_STACK,
          }}
        >
          {byPro ? `Message ${proFirstName} to reschedule` : "Find another stylist"}
        </button>
      </div>
    </AppShell>
  );
}

function AlternativeRow({
  alt,
  onTap,
  onBook,
}: {
  alt: Pro;
  onTap: () => void;
  onBook: () => void;
}) {
  const initials = alt.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  // Stable tint per pro id
  const tints = [
    { bg: "linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)", fg: "#1E3A8A" },
    { bg: "linear-gradient(135deg, #DCFCE7 0%, #86EFAC 100%)", fg: "#166534" },
    { bg: "linear-gradient(135deg, #FCE7F3 0%, #F9A8D4 100%)", fg: "#9D174D" },
    { bg: "linear-gradient(135deg, #FFD9C7 0%, #FFBBA0 100%)", fg: "#9A3412" },
  ];
  const h = alt.id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const tint = tints[h % tints.length]!;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="flex cursor-pointer items-center gap-3 rounded-2xl border p-3"
      style={{ backgroundColor: "var(--card)", borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
    >
      <div
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
        style={{ background: tint.bg, color: tint.fg, fontSize: 12, fontWeight: 700 }}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>
          {alt.name}
        </p>
        <div className="mt-1 flex items-center gap-3" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
          <span className="inline-flex items-center gap-1">
            <span style={{ color: STAR, fontSize: 10 }}>★</span>
            <strong style={{ color: "var(--card-foreground)", fontWeight: 600 }}>{alt.rating.toFixed(1)}</strong>
          </span>
          <span>{formatProLocation(alt, getLocationContext())}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onBook();
        }}
        className="rounded-full px-3.5 py-1.5 transition-transform active:scale-95"
        style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 12, fontWeight: 600, fontFamily: SANS_STACK }}
      >
        Book
      </button>
    </div>
  );
}

function brandTitle(brand: string) {
  const map: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "Amex",
    discover: "Discover",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
  };
  return map[brand.toLowerCase()] ?? brand;
}

// Suppress unused-warning when toast isn't referenced this turn
void toast;
