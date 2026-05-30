import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { ChevronLeft, AlertTriangle, Check, Info } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";
import { useBookings, type Booking } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";
import { formatBookingDate } from "@/lib/format-booking-date";

const ORANGE = "#FF823F";
const DANGER = "#DC2626";
const SUCCESS = "#16A34A";

function hoursUntil(booking: Booking) {
  return (booking.when - Date.now()) / (1000 * 60 * 60);
}

const REASONS = [
  "Schedule conflict",
  "Found another stylist",
  "Price changed",
  "Don't need it anymore",
  "Other",
];

export function CancelBookingPage({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const navigate = useNavigate();
  const { getBooking, cancelBooking } = useBookings();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const [reason, setReason] = useState<string>("");
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);

  if (!booking || !pro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6" style={{ fontFamily: SANS_STACK }}>
        <p className="text-[17px] font-semibold text-foreground">Booking not found</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/bookings" })}
          className="mt-4 rounded-full bg-bagel px-5 py-2.5 text-[14px] font-semibold text-bagel-foreground"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const hrs = hoursUntil(booking);
  const free = hrs > 4;
  const late = hrs > 0 && hrs <= 4;
  const noShow = hrs <= 0;

  const policyTone = free ? SUCCESS : late ? "#B45309" : DANGER;
  const policyBg = free
    ? "rgba(22,163,74,0.10)"
    : late
      ? "rgba(180,83,9,0.10)"
      : "rgba(220,38,38,0.10)";
  const policyHead = free
    ? "Free cancellation"
    : late
      ? "Late cancellation"
      : "No-show fee may apply";
  const policyBody = free
    ? "You're more than 4 hours out. Your card hasn't been charged — you can rebook anytime."
    : late
      ? "You're within 4 hours of your booking. A cancellation fee of up to 50% of the service price may apply."
      : "Your booking has already started or passed. Cancelling now may incur the full service price.";

  const fee = late ? Math.round(booking.service.price * 0.5) : noShow ? booking.service.price : 0;

  const confirmCancel = () => {
    if (!reason) {
      toast.error("Pick a reason so your stylist can improve");
      return;
    }
    setConfirming(true);
    window.setTimeout(() => {
      cancelBooking(bookingId);
      toast.success("Booking cancelled");
      navigate({ to: "/booking/cancelled/$bookingId", params: { bookingId } });
    }, 700);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{ backgroundColor: "var(--bg, var(--background))", borderColor: "var(--border)" }}
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
          Cancel booking
        </h1>
        <span className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-5 pb-32">
        {/* Booking summary */}
        <div
          className="flex items-center gap-3 rounded-2xl border bg-card px-3.5 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full"
            style={{
              background: "linear-gradient(135deg, #FFD9C7 0%, #FF9270 100%)",
              color: "#7C2D12",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {pro.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p style={{ fontSize: 15, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
              {pro.name}
            </p>
            <p className="mt-0.5" style={{ fontSize: 12.5, color: "var(--on-card-muted)" }}>
              {booking.service.name}
            </p>
            <p style={{ fontSize: 12, color: "var(--on-card-muted)" }}>
              {formatBookingDate(booking.when)}
            </p>
          </div>
        </div>

        {/* Policy tile */}
        <div
          className="mt-4 rounded-2xl px-4 py-3.5"
          style={{ backgroundColor: policyBg, border: `1px solid ${policyTone}33` }}
        >
          <div className="flex items-start gap-2.5">
            {free ? (
              <Check size={16} style={{ color: policyTone, marginTop: 1, flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={16} style={{ color: policyTone, marginTop: 1, flexShrink: 0 }} />
            )}
            <div className="min-w-0 flex-1">
              <p style={{ fontSize: 13.5, fontWeight: 700, color: policyTone }}>{policyHead}</p>
              <p className="mt-1" style={{ fontSize: 12.5, color: "var(--foreground)", lineHeight: 1.5 }}>
                {policyBody}
              </p>
              {fee > 0 && (
                <p className="mt-2" style={{ fontSize: 12.5, fontWeight: 700, color: policyTone }}>
                  Estimated fee: ${fee}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate({ to: "/policies/cancellation" })}
          className="mt-2 flex w-full items-center justify-center gap-1 py-2"
          style={{
            background: "none",
            border: "none",
            color: ORANGE,
            fontSize: 12.5,
            fontWeight: 600,
            fontFamily: SANS_STACK,
          }}
        >
          <Info size={12} />
          See full cancellation policy
        </button>

        {/* Reason picker */}
        <p
          className="pt-5 pb-2"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Why are you cancelling?
        </p>
        <div
          className="overflow-hidden rounded-2xl border bg-card"
          style={{ borderColor: "var(--border)" }}
        >
          {REASONS.map((r, i) => {
            const active = reason === r;
            return (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted/30"
                style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)" }}
              >
                <span
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
                  style={{
                    border: active ? "none" : "1.5px solid var(--border)",
                    backgroundColor: active ? ORANGE : "transparent",
                  }}
                >
                  {active && <span style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: "#fff" }} />}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--card-foreground)" }}>
                  {r}
                </span>
              </button>
            );
          })}
        </div>

        <p
          className="pt-5 pb-2"
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Anything else?
        </p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional — only shared with Ewà support"
          rows={3}
          className="w-full resize-none rounded-2xl border bg-card px-3.5 py-3 outline-none"
          style={{
            borderColor: "var(--border)",
            color: "var(--card-foreground)",
            fontSize: 14,
            fontFamily: SANS_STACK,
            lineHeight: 1.5,
          }}
        />
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t px-5 py-3.5"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 14px)",
        }}
      >
        <button
          type="button"
          onClick={confirmCancel}
          disabled={confirming}
          className="w-full rounded-2xl py-3.5 transition-transform active:scale-[0.98] disabled:opacity-60"
          style={{
            backgroundColor: DANGER,
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            fontFamily: SANS_STACK,
          }}
        >
          {confirming ? "Cancelling…" : free ? "Cancel booking" : `Cancel and accept ${fee > 0 ? `$${fee} fee` : "policy"}`}
        </button>
        <button
          type="button"
          onClick={() => router.history.back()}
          className="mt-2 w-full py-2"
          style={{
            background: "none",
            border: "none",
            color: "var(--muted-foreground)",
            fontSize: 13,
            fontWeight: 500,
            fontFamily: SANS_STACK,
          }}
        >
          Keep booking
        </button>
      </div>
    </div>
  );
}
