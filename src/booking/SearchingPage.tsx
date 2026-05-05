/**
 * SearchingPage — animated searching → matched / declined / timeout screen.
 * Driven by dev-state `searchingStage`. Pure mock, no real matching logic.
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Check, X, Clock } from "lucide-react";
import { MOCK_PROS } from "@/data/mock-pros";
import { useDevState } from "@/dev-state/devState";
import { useBookings } from "@/data/bookings-store";

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Formats a mock ETA like "~12 min". */
function mockEta() {
  return "~12 min";
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function SearchingPage({
  bookingId,
  proId,
}: {
  bookingId: string;
  proId?: string;
}) {
  const router = useRouter();
  const navigate = useNavigate();
  const { state } = useDevState();
  const { getBooking, updateBookingStatus, cancelBooking } = useBookings();
  const stage = state.searchingStage;

  const booking = getBooking(bookingId);
  const pro = proId ? MOCK_PROS.find((p) => p.id === proId) : MOCK_PROS[0];
  const proFirstName = pro ? pro.name.split(" ")[0] : "Your pro";

  /* Auto-transition: after 4s of "searching", jump to "matched" unless
     dev-state overrides. This simulates the real flow for demo. */
  const [autoMatched, setAutoMatched] = useState(false);
  useEffect(() => {
    if (stage !== "searching") {
      setAutoMatched(false);
      return;
    }
    const t = setTimeout(() => {
      setAutoMatched(true);
      // Update the booking in the store to "confirmed"
      if (booking) updateBookingStatus(bookingId, "confirmed");
    }, 4000);
    return () => clearTimeout(t);
  }, [stage, bookingId, booking, updateBookingStatus]);

  const effectiveStage = stage === "searching" && autoMatched ? "matched" : stage;

  // When dev-state forces declined/timeout, update booking accordingly
  useEffect(() => {
    if (!booking) return;
    if (stage === "declined") updateBookingStatus(bookingId, "declined");
    else if (stage === "timeout") updateBookingStatus(bookingId, "declined");
  }, [stage, bookingId, booking, updateBookingStatus]);

  const handleCancel = useCallback(() => {
    cancelBooking(bookingId);
    router.history.back();
  }, [router, bookingId, cancelBooking]);

  const handleTryAgain = useCallback(() => {
    setAutoMatched(false);
    if (booking) updateBookingStatus(bookingId, "searching");
  }, [bookingId, booking, updateBookingStatus]);

  const handleViewBooking = useCallback(() => {
    navigate({ to: "/bookings" });
  }, [navigate]);

  const handleGoHome = useCallback(() => {
    navigate({ to: "/discover" });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <div className="relative flex h-12 shrink-0 items-center px-4">
        {effectiveStage === "searching" && (
          <button
            type="button"
            onClick={handleCancel}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors active:bg-muted/30"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        {effectiveStage === "searching" && (
          <SearchingState proName={proFirstName} avatar={pro?.avatar} initials={pro ? initialsOf(pro.name) : "??"} />
        )}
        {effectiveStage === "matched" && (
          <MatchedState
            proName={proFirstName}
            proFullName={pro?.name ?? "Your pro"}
            avatar={pro?.avatar}
            initials={pro ? initialsOf(pro.name) : "??"}
            rating={pro?.rating ?? 4.9}
            eta={mockEta()}
            pin={booking?.pin}
            onViewBooking={handleViewBooking}
          />
        )}
        {effectiveStage === "declined" && (
          <DeclinedState proName={proFirstName} onTryAgain={handleTryAgain} onGoHome={handleGoHome} />
        )}
        {effectiveStage === "timeout" && (
          <TimeoutState onTryAgain={handleTryAgain} onGoHome={handleGoHome} />
        )}
      </div>

      {/* Bottom cancel for searching state */}
      {effectiveStage === "searching" && (
        <div className="shrink-0 px-6 pb-10 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="h-[52px] w-full rounded-2xl border border-hairline text-[15px] font-semibold text-foreground transition-colors active:bg-muted/30"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-states                                                          */
/* ------------------------------------------------------------------ */

function SearchingState({
  proName,
  avatar,
  initials,
}: {
  proName: string;
  avatar?: string;
  initials: string;
}) {
  /* Pulse ring animation */
  return (
    <div className="flex flex-col items-center">
      {/* Pulsing avatar */}
      <div className="relative mb-8">
        {/* Outer pulse rings */}
        <div className="absolute inset-0 -m-6 animate-ping rounded-full bg-bagel/10" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-0 -m-3 animate-ping rounded-full bg-bagel/15" style={{ animationDuration: "2s", animationDelay: "0.3s" }} />

        {/* Avatar */}
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-[3px] border-bagel shadow-lg">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cream-elevated text-[28px] font-semibold text-midnight">
              {initials}
            </div>
          )}
        </div>
      </div>

      <h1 className="mb-2 text-[22px] font-semibold leading-tight text-foreground">
        Reaching out to {proName}…
      </h1>
      <p className="max-w-[280px] text-[14px] leading-relaxed text-muted-foreground">
        We're letting them know about your booking. This&nbsp;usually takes less than a&nbsp;minute.
      </p>

      {/* Animated dots */}
      <div className="mt-6 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-bagel"
            style={{
              animation: "searchDot 1.4s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes searchDot {
          0%, 80%, 100% { opacity: 0.25; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

function MatchedState({
  proName,
  proFullName,
  avatar,
  initials,
  rating,
  eta,
  pin,
  onViewBooking,
}: {
  proName: string;
  proFullName: string;
  avatar?: string;
  initials: string;
  rating: number;
  eta: string;
  pin?: string;
  onViewBooking: () => void;
}) {
  /* Entry animation */
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      className="flex flex-col items-center transition-all duration-500 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.95)",
      }}
    >
      {/* Success check over avatar */}
      <div className="relative mb-6">
        <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-bagel shadow-lg">
          {avatar ? (
            <img src={avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cream-elevated text-[28px] font-semibold text-midnight">
              {initials}
            </div>
          )}
        </div>
        {/* Check badge */}
        <div className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-bagel shadow-md">
          <Check size={18} className="text-bagel-foreground" strokeWidth={3} />
        </div>
      </div>

      <h1 className="mb-1 text-[22px] font-semibold leading-tight text-foreground">
        {proName} accepted!
      </h1>
      <p className="mb-1 text-[15px] text-muted-foreground">
        {proFullName} · <span className="tabular">{rating.toFixed(1)} ★</span>
      </p>
      <p className="mb-6 text-[13px] text-muted-foreground">
        Estimated arrival {eta}
      </p>

      {/* PIN card */}
      {pin && (
      <div className="mb-8 w-full max-w-[300px] rounded-2xl bg-cream-elevated p-5 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-on-card-muted">
            Your PIN
          </p>
          <p className="mt-2 tabular text-[32px] font-semibold leading-none tracking-[0.2em] text-card-foreground">
            {pin}
          </p>
          <p className="mt-2 text-[14px] text-on-card-muted">
            Read this to {proName} when they arrive.
          </p>
        </div>
      )}

      {/* CTA */}
      <button
        type="button"
        onClick={onViewBooking}
        className="h-[52px] w-full max-w-[300px] rounded-2xl bg-bagel text-[15px] font-semibold text-bagel-foreground shadow-sm transition-opacity active:opacity-90"
      >
        View booking
      </button>
    </div>
  );
}

function DeclinedState({
  proName,
  onTryAgain,
  onGoHome,
}: {
  proName: string;
  onTryAgain: () => void;
  onGoHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-muted">
        <X size={28} className="text-muted-foreground" />
      </div>

      <h1 className="mb-2 text-[22px] font-semibold leading-tight text-foreground">
        {proName} can't take this one
      </h1>
      <p className="mb-8 max-w-[280px] text-[14px] leading-relaxed text-muted-foreground">
        They may be with another client right now. You can try again or browse other pros nearby.
      </p>

      <div className="flex w-full max-w-[300px] flex-col gap-3">
        <button
          type="button"
          onClick={onTryAgain}
          className="h-[52px] w-full rounded-2xl bg-bagel text-[15px] font-semibold text-bagel-foreground shadow-sm transition-opacity active:opacity-90"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={onGoHome}
          className="h-[52px] w-full rounded-2xl border border-hairline text-[15px] font-semibold text-foreground transition-colors active:bg-muted/30"
        >
          Browse other pros
        </button>
      </div>
    </div>
  );
}

function TimeoutState({
  onTryAgain,
  onGoHome,
}: {
  onTryAgain: () => void;
  onGoHome: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-6 grid h-16 w-16 place-items-center rounded-full bg-muted">
        <Clock size={28} className="text-muted-foreground" />
      </div>

      <h1 className="mb-2 text-[22px] font-semibold leading-tight text-foreground">
        No response yet
      </h1>
      <p className="mb-8 max-w-[280px] text-[14px] leading-relaxed text-muted-foreground">
        They didn't respond in time. This happens — try sending the booking again or find another pro.
      </p>

      <div className="flex w-full max-w-[300px] flex-col gap-3">
        <button
          type="button"
          onClick={onTryAgain}
          className="h-[52px] w-full rounded-2xl bg-bagel text-[15px] font-semibold text-bagel-foreground shadow-sm transition-opacity active:opacity-90"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={onGoHome}
          className="h-[52px] w-full rounded-2xl border border-hairline text-[15px] font-semibold text-foreground transition-colors active:bg-muted/30"
        >
          Browse other pros
        </button>
      </div>
    </div>
  );
}
