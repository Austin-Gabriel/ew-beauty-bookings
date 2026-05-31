import { useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { useCustomerProfile } from "@/data/customer-store";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "#FF823F";
const STAR = "#F5A623";
const STAR_EMPTY = "#E5E7EB";

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

function formatShortDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function RatePage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { getBooking, setBookings, bookings } = useBookings();
  const { profile } = useCustomerProfile();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;
  const card = booking?.paymentMethodId
    ? profile.paymentMethods.find((c) => c.id === booking.paymentMethodId)
    : profile.paymentMethods.find((c) => c.isDefault) ?? profile.paymentMethods[0];

  const [rating, setRating] = useState(booking?.rating ?? 0);
  const [review, setReview] = useState("");
  const [tipPreset, setTipPreset] = useState<15 | 20 | 25 | 30 | "custom" | "skip" | null>(20);
  const [customTip, setCustomTip] = useState<string>("");

  if (!booking || !pro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5" style={{ fontFamily: SANS_STACK }}>
        <p style={{ color: "var(--foreground)", fontSize: 16, fontWeight: 600 }}>Booking not found</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/bookings" })}
          className="mt-4"
          style={{ color: ORANGE, fontSize: 14, fontWeight: 600 }}
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const initials = pro.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
  const proFirstName = pro.name.split(" ")[0] ?? pro.name;

  const serviceTotal = booking.service.price;
  const tipAmount = (() => {
    if (tipPreset === "skip" || tipPreset === null) return 0;
    if (tipPreset === "custom") {
      const n = parseFloat(customTip);
      return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
    }
    return Math.round((serviceTotal * tipPreset) / 100);
  })();

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Tap a star to rate your time");
      return;
    }
    setBookings(
      bookings.map((b) =>
        b.id === bookingId ? { ...b, rating, tipAmount, status: "completed" as const } : b,
      ),
    );
    if (tipAmount > 0) {
      toast.success(`Thanks! $${tipAmount} tip sent to ${proFirstName}.`);
    } else {
      toast.success("Thanks for your review!");
    }
    navigate({ to: "/bookings/$bookingId", params: { bookingId } });
  };

  const cardLabel = card ? `${brandTitle(card.brand)} ${card.last4}` : "your card";

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      {/* Header */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3.5"
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
        <h1 className="flex-1 text-center" style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
          How was it?
        </h1>
        <span className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-7 pb-36">
        {/* HERO --------------------------------------------------------- */}
        <div className="flex flex-col items-center text-center">
          <div
            className="grid place-items-center rounded-full"
            style={{
              width: 88,
              height: 88,
              background: "linear-gradient(135deg, #FFD9C7 0%, #FF9F7A 100%)",
              color: "#7C2D12",
              fontSize: 26,
              fontWeight: 700,
              border: "3px solid var(--card)",
              boxShadow: "0 0 0 1px var(--border)",
            }}
          >
            {initials}
          </div>
          <h2 className="mt-5" style={{ fontSize: 24, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.025em" }}>
            Rate your time with {proFirstName}
          </h2>
          <p className="mt-1.5" style={{ fontSize: 14, color: "var(--muted-foreground)" }}>
            {booking.service.name} · {formatShortDate(booking.when)}
          </p>
        </div>

        {/* STARS -------------------------------------------------------- */}
        <div className="mt-7">
          <p className="text-center" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
            Tap to rate
          </p>
          <div className="mt-3 flex items-center justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
                  className="transition-transform active:scale-110"
                  style={{ padding: 2 }}
                >
                  <svg
                    width="38"
                    height="38"
                    viewBox="0 0 24 24"
                    fill={filled ? STAR : "none"}
                    stroke={filled ? STAR : STAR_EMPTY}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>

        {/* TEXTAREA ----------------------------------------------------- */}
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows={4}
          placeholder={`What did you love? Anything ${proFirstName === pro.name ? "they" : "she"} could improve? (Optional)`}
          className="mt-7 w-full resize-none rounded-2xl border-none px-4 py-3.5 outline-none"
          style={{
            backgroundColor: "var(--surface-elevated)",
            color: "var(--foreground)",
            fontSize: 14,
            fontFamily: SANS_STACK,
            lineHeight: 1.55,
          }}
        />

        {/* TIP ---------------------------------------------------------- */}
        <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--border)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.015em" }}>
            Add a tip
          </h3>
          <p className="mt-1.5" style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
            100% of tips go directly to {proFirstName}. Service was ${serviceTotal}.
          </p>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {([15, 20, 25, 30] as const).map((pct) => {
              const selected = tipPreset === pct;
              const amount = Math.round((serviceTotal * pct) / 100);
              return (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    setTipPreset(pct);
                    setCustomTip("");
                  }}
                  className="rounded-xl border py-3 text-center transition-colors"
                  style={{
                    backgroundColor: selected ? ORANGE : "var(--card)",
                    borderColor: selected ? ORANGE : "var(--border)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: selected ? "#1A0E08" : "var(--card-foreground)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {pct}%
                  </div>
                  <div
                    className="mt-0.5"
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      color: selected ? "rgba(26,14,8,0.78)" : "var(--on-card-muted)",
                    }}
                  >
                    ${amount}
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className="mt-3 flex items-center gap-2 rounded-xl px-3.5 py-3"
            style={{
              backgroundColor: tipPreset === "custom" ? "var(--card)" : "var(--surface-elevated)",
              border: `1px solid ${tipPreset === "custom" ? ORANGE : "transparent"}`,
            }}
          >
            <span style={{ fontSize: 14, color: "var(--muted-foreground)", fontWeight: 500 }}>$</span>
            <input
              type="text"
              inputMode="decimal"
              value={customTip}
              onChange={(e) => {
                setCustomTip(e.target.value);
                setTipPreset("custom");
              }}
              onFocus={() => setTipPreset("custom")}
              placeholder="Custom amount"
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 14, color: "var(--foreground)", fontFamily: SANS_STACK }}
            />
          </div>

          <button
            type="button"
            onClick={() => {
              setTipPreset("skip");
              setCustomTip("");
            }}
            className="mt-4 block w-full text-center"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 500,
              color: tipPreset === "skip" ? "var(--foreground)" : "var(--muted-foreground)",
              fontFamily: SANS_STACK,
            }}
          >
            Skip tip this time
          </button>
        </div>
      </div>

      {/* STICKY CTA ------------------------------------------------------- */}
      <div
        className="fixed inset-x-0 z-30 border-t px-5 pt-3.5"
        style={{
          bottom: 0,
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
        }}
      >
        <button
          type="button"
          onClick={handleSubmit}
          className="flex w-full flex-col items-center justify-center rounded-2xl py-3 transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontFamily: SANS_STACK,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700 }}>Submit review</span>
          <span
            className="mt-0.5"
            style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.78 }}
          >
            {tipAmount > 0
              ? `$${tipAmount} tip will be charged to ${cardLabel}`
              : "No tip — your service charge is unchanged"}
          </span>
        </button>
      </div>
    </div>
  );
}
