import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useBookings } from "@/data/bookings-store";
import { useCustomerProfile } from "@/data/customer-store";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "var(--bagel)";
const STAR_FILLED = "var(--bagel)";
const STAR_EMPTY_LIGHT = "#D1D5DB";
const STAR_EMPTY_DARK = "rgba(240,235,216,0.3)";

const TIP_PRESETS = [
  { label: "15%", factor: 0.15 },
  { label: "18%", factor: 0.18 },
  { label: "20%", factor: 0.20 },
  { label: "25%", factor: 0.25 },
];

export function ServiceCompletePage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  const { getBooking, setBookings, bookings } = useBookings();
  const { profile } = useCustomerProfile();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const muted = "var(--muted-foreground)";
  const subtleBorder = "var(--border)";

  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");

  const tippingPref = profile.tippingPreference;
  const isAlwaysAsk = tippingPref.type === "ask";
  const servicePrice = booking?.service.price ?? 0;

  const defaultTipPercent =
    tippingPref.type === "percent" ? (tippingPref.value ?? 20) / 100
    : tippingPref.type === "custom" ? (tippingPref.value ?? 20) / 100
    : 0.20;

  const [selectedTipFactor, setSelectedTipFactor] = useState<number>(defaultTipPercent);
  const [customTip, setCustomTip] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [tipExpanded, setTipExpanded] = useState(isAlwaysAsk);

  const tipAmount = isCustom
    ? (parseFloat(customTip) || 0)
    : Math.round(servicePrice * selectedTipFactor);
  const total = servicePrice + tipAmount;

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
  const proFirstName = pro.name.split(" ")[0];

  const handleDone = () => {
    setBookings(
      bookings.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: "completed" as const,
              rating: rating > 0 ? rating : undefined,
              tipAmount,
              total,
            }
          : b
      )
    );
    navigate({ to: "/discover" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <div className="flex-1 px-5 pt-12 pb-32">
        {/* Pro avatar with checkmark badge */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <div
              className="grid h-20 w-20 place-items-center rounded-full"
              style={{ backgroundColor: "var(--cream-elevated)", color: "var(--midnight)", fontSize: 26, fontWeight: 700 }}
            >
              {initials}
            </div>
            <span
              className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full"
              style={{ backgroundColor: ORANGE, color: "#1A0E08", border: "3px solid var(--background)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          </div>

          <h1 style={{ marginTop: 20, fontSize: 28, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.025em" }}>
            All done!
          </h1>
          <p style={{ marginTop: 8, fontSize: 15, color: muted, textAlign: "center", maxWidth: 280 }}>
            How was your {booking.service.name.toLowerCase()} with {proFirstName}?
          </p>
        </div>

        {/* Star rating */}
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

        {/* Review text — expands when rating is given */}
        {rating > 0 && (
          <div className="mt-4 flex flex-col items-center">
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Add a note about your visit (optional)"
              rows={3}
              className="mt-2 w-full resize-none rounded-xl border-none px-3.5 py-3 outline-none"
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

        {/* Tip adjustment */}
        {isAlwaysAsk ? (
          <div className="mt-8">
            <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: muted, marginBottom: 10 }}>
              Tip
            </p>
            <TipSelector
              servicePrice={servicePrice}
              selectedFactor={selectedTipFactor}
              isCustom={isCustom}
              customTip={customTip}
              onSelectPreset={(f) => { setSelectedTipFactor(f); setIsCustom(false); }}
              onCustom={() => setIsCustom(true)}
              onCustomChange={setCustomTip}
              isDark={isDark}
              subtleBorder={subtleBorder}
            />
          </div>
        ) : (
          <div className="mt-8">
            {!tipExpanded ? (
              <p style={{ fontSize: 14, color: "var(--foreground)", textAlign: "center" }}>
                Tip: ${tipAmount}
                <span style={{ margin: "0 6px", color: muted }}>·</span>
                <button
                  type="button"
                  onClick={() => setTipExpanded(true)}
                  style={{ color: ORANGE, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontSize: 14, fontFamily: SANS_STACK }}
                >
                  Adjust
                </button>
              </p>
            ) : (
              <div>
                <p style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: muted, marginBottom: 10 }}>
                  Tip
                </p>
                <TipSelector
                  servicePrice={servicePrice}
                  selectedFactor={selectedTipFactor}
                  isCustom={isCustom}
                  customTip={customTip}
                  onSelectPreset={(f) => { setSelectedTipFactor(f); setIsCustom(false); }}
                  onCustom={() => setIsCustom(true)}
                  onCustomChange={setCustomTip}
                  isDark={isDark}
                  subtleBorder={subtleBorder}
                />
              </div>
            )}
          </div>
        )}

        {/* Total summary card */}
        <div
          className="mt-6 overflow-hidden rounded-2xl"
          style={{ backgroundColor: "var(--card)", border: `1px solid ${subtleBorder}` }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${subtleBorder}` }}>
            <span style={{ fontSize: 14, color: "var(--card-foreground)" }}>Service</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", fontVariantNumeric: "tabular-nums" }}>${servicePrice}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${subtleBorder}` }}>
            <span style={{ fontSize: 14, color: "var(--card-foreground)" }}>Tip</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", fontVariantNumeric: "tabular-nums" }}>${tipAmount}</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3.5">
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--card-foreground)" }}>Total</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "var(--card-foreground)", fontVariantNumeric: "tabular-nums" }}>${total}</span>
          </div>
        </div>

        {/* View receipt link */}
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => navigate({ to: "/booking/receipt/$bookingId", params: { bookingId } })}
            style={{ color: ORANGE, fontWeight: 600, fontSize: 13, background: "none", border: "none", cursor: "pointer", fontFamily: SANS_STACK }}
          >
            View receipt
          </button>
        </div>
      </div>

      {/* Sticky Done CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-5 pb-8 pt-4" style={{ backgroundColor: "var(--background)" }}>
        <button
          onClick={handleDone}
          className="w-full rounded-2xl py-3.5 text-center transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: SANS_STACK,
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

function TipSelector({
  servicePrice,
  selectedFactor,
  isCustom,
  customTip,
  onSelectPreset,
  onCustom,
  onCustomChange,
  _isDark,
  subtleBorder,
}: {
  servicePrice: number;
  selectedFactor: number;
  isCustom: boolean;
  customTip: string;
  onSelectPreset: (f: number) => void;
  onCustom: () => void;
  onCustomChange: (v: string) => void;
  _isDark?: boolean;
  subtleBorder: string;
}) {
  return (
    <div>
      <div className="flex gap-2">
        {TIP_PRESETS.map((p) => {
          const active = !isCustom && selectedFactor === p.factor;
          return (
            <button
              key={p.label}
              type="button"
              onClick={() => onSelectPreset(p.factor)}
              className="flex-1 rounded-xl py-2.5 text-center transition-colors"
              style={{
                backgroundColor: active ? ORANGE : "var(--surface-elevated)",
                color: active ? "#1A0E08" : "var(--foreground)",
                border: active ? "none" : `1px solid ${subtleBorder}`,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: SANS_STACK,
              }}
            >
              {p.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onCustom}
          className="flex-1 rounded-xl py-2.5 text-center transition-colors"
          style={{
            backgroundColor: isCustom ? ORANGE : "var(--surface-elevated)",
            color: isCustom ? "#1A0E08" : "var(--foreground)",
            border: isCustom ? "none" : `1px solid ${subtleBorder}`,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: SANS_STACK,
          }}
        >
          Custom
        </button>
      </div>
      {isCustom && (
        <div className="mt-3 flex items-center gap-2">
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>$</span>
          <input
            type="number"
            inputMode="numeric"
            value={customTip}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder="0"
            className="flex-1 rounded-xl border-none px-3 py-2.5 outline-none"
            style={{
              backgroundColor: "var(--surface-elevated)",
              color: "var(--foreground)",
              fontSize: 16,
              fontWeight: 600,
              fontFamily: SANS_STACK,
              fontVariantNumeric: "tabular-nums",
            }}
          />
        </div>
      )}
    </div>
  );
}
