import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";
import { formatBookingDate } from "@/lib/format-booking-date";

const ORANGE = "var(--bagel)";
const STAR_FILLED = "var(--bagel)";
const STAR_EMPTY_LIGHT = "#D1D5DB";
const STAR_EMPTY_DARK = "rgba(240,235,216,0.3)";

export function RatePage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  const { getBooking, setBookings, bookings } = useBookings();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const muted = "var(--muted-foreground)";
  const subtleBorder = "var(--border)";

  const [rating, setRating] = useState(booking?.rating ?? 0);
  const [review, setReview] = useState("");
  // Tip lives on the review surface (not in checkout) so customers tip after
  // seeing the result. Default to 20% pre-selected.
  const [tipPreset, setTipPreset] = useState<15 | 20 | 25 | 30 | "custom" | "skip" | null>(20);
  const [customTip, setCustomTip] = useState<string>("");

  if (!booking || !pro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-5" style={{ fontFamily: SANS_STACK }}>
        <p style={{ color: text, fontSize: 16, fontWeight: 600 }}>Booking not found</p>
        <button onClick={() => navigate({ to: "/bookings" })} className="mt-4" style={{ color: ORANGE, fontSize: 14, fontWeight: 600 }}>
          Back to Bookings
        </button>
      </div>
    );
  }

  const initials = pro.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  const serviceTotal = booking?.service.price ?? 0;
  const tipAmount = (() => {
    if (tipPreset === "skip" || tipPreset === null) return 0;
    if (tipPreset === "custom") {
      const n = parseFloat(customTip);
      return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
    }
    return Math.round((serviceTotal * tipPreset) / 100);
  })();

  const handleSubmit = () => {
    if (rating > 0) {
      setBookings(
        bookings.map((b) => b.id === bookingId ? { ...b, rating, tipAmount } : b)
      );
    }
    if (tipAmount > 0) {
      toast.success(`Thanks! $${tipAmount} tip sent to ${pro?.name.split(" ")[0] ?? "your pro"}.`);
    } else {
      toast.success("Thanks for your review!");
    }
    navigate({ to: "/bookings" });
  };

  const ratingLabels = ["", "Not great", "Could be better", "Good", "Great", "Amazing"];

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
        style={{ backgroundColor: "var(--card)", borderBottom: `1px solid ${subtleBorder}` }}
      >
        <button onClick={() => navigate({ to: "/bookings" })} className="shrink-0 p-1" style={{ color: text }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground)" }}>Rate your experience</h1>
      </header>

      <div className="flex-1 px-5 pt-8 pb-28">
        <div className="flex flex-col items-center">
          <div
            className="grid h-20 w-20 place-items-center rounded-full"
            style={{ backgroundColor: "var(--cream-elevated)", color: "var(--midnight)", fontSize: 26, fontWeight: 700 }}
          >
            {initials}
          </div>
          <p style={{ marginTop: 12, fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>{pro.name}</p>
          <p style={{ marginTop: 4, fontSize: 13, color: muted }}>
            {booking.service.name} · {formatBookingDate(booking.when)}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          {[1, 2, 3, 4, 5].map((star) => {
            const filled = star <= rating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="transition-transform active:scale-110"
                style={{ padding: 4 }}
              >
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill={filled ? STAR_FILLED : "none"}
                  stroke={filled ? STAR_FILLED : isDark ? STAR_EMPTY_DARK : STAR_EMPTY_LIGHT}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
            );
          })}
        </div>
        {rating > 0 && (
          <p className="mt-2 text-center" style={{ fontSize: 14, fontWeight: 600, color: ORANGE }}>
            {ratingLabels[rating]}
          </p>
        )}

        {rating > 0 && (
          <div className="mt-8">
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Add a note about your visit (optional)"
              rows={3}
              className="w-full resize-none rounded-xl border-none px-3.5 py-3 outline-none"
              style={{
                backgroundColor: "var(--surface-elevated)",
                color: "var(--foreground)",
                fontSize: 14,
                fontFamily: SANS_STACK,
                lineHeight: 1.5,
              }}
            />
            <p style={{ marginTop: 6, fontSize: 11.5, color: muted, textAlign: "center" }}>
              Your rating helps other customers find great pros.
            </p>
          </div>
        )}

        {/* TIP SECTION ------------------------------------------------- */}
        {rating > 0 && (
          <div className="mt-8 border-t pt-6" style={{ borderColor: subtleBorder }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.015em" }}>
              Add a tip
            </h2>
            <p className="mt-1" style={{ fontSize: 12.5, color: muted, lineHeight: 1.5 }}>
              100% of tips go directly to {pro.name.split(" ")[0]}. Service was ${serviceTotal}.
            </p>

            <div className="mt-4 grid grid-cols-4 gap-2">
              {([15, 20, 25, 30] as const).map((pct) => {
                const selected = tipPreset === pct;
                const amount = Math.round((serviceTotal * pct) / 100);
                return (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setTipPreset(pct)}
                    className="rounded-xl border py-3 text-center transition-all"
                    style={{
                      backgroundColor: selected ? ORANGE : "var(--card)",
                      borderColor: selected ? ORANGE : subtleBorder,
                      borderWidth: 1.5,
                    }}
                  >
                    <div style={{ fontSize: 15, fontWeight: 700, color: selected ? "#1A0E08" : "var(--card-foreground)", letterSpacing: "-0.01em" }}>
                      {pct}%
                    </div>
                    <div className="mt-0.5" style={{ fontSize: 11, fontWeight: 500, color: selected ? "rgba(26,14,8,0.7)" : "var(--on-card-muted)" }}>
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
                border: `1.5px solid ${tipPreset === "custom" ? ORANGE : "transparent"}`,
              }}
            >
              <span style={{ fontSize: 14, color: muted, fontWeight: 500 }}>$</span>
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
              className="mt-4 w-full"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                color: tipPreset === "skip" ? "var(--foreground)" : muted,
                fontFamily: SANS_STACK,
              }}
            >
              Skip tip this time
            </button>
          </div>
        )}
      </div>

      <div
        className="fixed inset-x-0 z-30 px-5 pt-3.5"
        style={{
          bottom: 0,
          backgroundColor: "var(--background)",
          borderTop: `1px solid ${subtleBorder}`,
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + 18px)`,
        }}
      >
        <button
          onClick={handleSubmit}
          disabled={rating === 0}
          className="flex w-full flex-col items-center justify-center rounded-2xl py-3 transition-transform active:scale-[0.98] disabled:opacity-40"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontFamily: SANS_STACK,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 700 }}>Submit review</span>
          {tipAmount > 0 && (
            <span className="mt-0.5" style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.75 }}>
              ${tipAmount} tip will be charged
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
