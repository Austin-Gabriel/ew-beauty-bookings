import { useNavigate } from "@tanstack/react-router";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { useCustomerProfile } from "@/data/customer-store";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "var(--bagel)";

export function ReceiptPage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const { isDark } = useAuthTheme();
  const { getBooking } = useBookings();
  const { profile } = useCustomerProfile();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const muted = "var(--muted-foreground)";
  const subtleBorder = "var(--border)";

  if (!booking || !pro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5" style={{ fontFamily: SANS_STACK }}>
        <p style={{ color: "var(--card-foreground)", fontSize: 16, fontWeight: 600 }}>Booking not found</p>
        <button onClick={() => navigate({ to: "/bookings" })} className="mt-4" style={{ color: ORANGE, fontSize: 14, fontWeight: 600 }}>
          Back to Bookings
        </button>
      </div>
    );
  }

  const initials = pro.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const servicePrice = booking.service.price;
  const tip = booking.tipAmount ?? 0;
  const total = booking.total ?? servicePrice + tip;

  // Payment method from customer profile
  const defaultCard = profile.paymentMethods.find((c) => c.isDefault);
  const paymentLabel = defaultCard
    ? `${defaultCard.brand.charAt(0).toUpperCase() + defaultCard.brand.slice(1)} · ${defaultCard.last4}`
    : "Card on file";

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: "var(--background)", borderBottom: `1px solid ${subtleBorder}` }}
      >
        <button onClick={() => window.history.back()} className="shrink-0 p-1" style={{ color: "var(--card-foreground)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--card-foreground)" }}>Receipt</h1>
      </header>

      <div className="flex-1 px-5 pt-6 pb-10">
        {/* Pro + service header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
            style={{ backgroundColor: "var(--cream-elevated)", color: "var(--midnight)", fontSize: 15, fontWeight: 700 }}
          >
            {initials}
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--card-foreground)" }}>{pro.name}</p>
            <p style={{ fontSize: 12.5, color: muted }}>
              {booking.service.name} · {new Date(booking.when).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        {/* Line items */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: "var(--card)", border: `1px solid ${subtleBorder}` }}
        >
          <ReceiptRow label={booking.service.name} sublabel={booking.service.durationLabel} value={`$${servicePrice}`} muted={muted} subtleBorder={subtleBorder} />
          <ReceiptRow label="Tip" value={`$${tip}`} muted={muted} subtleBorder={subtleBorder} />
          <div className="flex items-center justify-between px-4 py-3.5">
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--card-foreground)" }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--card-foreground)", fontVariantNumeric: "tabular-nums" }}>
              ${total}
            </span>
          </div>
        </div>

        {/* Payment method */}
        <p className="mt-5" style={{ fontSize: 13, color: muted }}>
          Paid with {paymentLabel}
        </p>

        {/* Booking ID */}
        <p className="mt-4" style={{ fontSize: 11, color: muted }}>
          Booking ID: {booking.id}
        </p>
      </div>
    </div>
  );
}

function ReceiptRow({
  label,
  sublabel,
  value,
  muted,
  subtleBorder,
}: {
  label: string;
  sublabel?: string;
  value: string;
  muted: string;
  subtleBorder: string;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderBottom: `1px solid ${subtleBorder}` }}
    >
      <div>
        <span style={{ fontSize: 14, color: "var(--card-foreground)" }}>{label}</span>
        {sublabel && <span style={{ fontSize: 12, color: muted, marginLeft: 6 }}>{sublabel}</span>}
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
