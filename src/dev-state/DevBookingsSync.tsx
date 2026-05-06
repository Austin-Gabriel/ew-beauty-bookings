/**
 * DevBookingsSync — bridges dev-state toggles (bookingsSeed, activeBooking,
 * searchingStage) to the shared BookingsProvider.
 * Runs as an effect child of both providers.
 *
 * IMPORTANT: Only reacts to booking-specific dev toggles (bookingsSeed,
 * activeBooking). Other dev toggles (theme, profile, customer state, etc.)
 * do NOT overwrite real bookings created via the booking flow.
 *
 * When activeBooking is "completed", auto-navigates to the Service Complete screen.
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDevState } from "@/dev-state/devState";
import {
  useBookings,
  SEED_BOOKINGS,
  type Booking,
  type BookingStatus,
} from "@/data/bookings-store";

export function DevBookingsSync() {
  const { state } = useDevState();
  const { setBookings, bookings } = useBookings();
  const navigate = useNavigate();
  const prevRef = useRef<string>("");

  useEffect(() => {
    // Only react to booking-specific toggles — NOT customerState or other fields
    const key = `${state.bookingsSeed}|${state.activeBooking}`;
    if (key === prevRef.current) return;
    prevRef.current = key;

    if (state.bookingsSeed === "empty") {
      setBookings([]);
      return;
    }

    // Volume filter
    let pool: Booking[] =
      state.bookingsSeed === "few"
        ? SEED_BOOKINGS.filter((b) => ["bk-jordan-sat", "bk-past-amara-apr"].includes(b.id))
        : [...SEED_BOOKINGS];

    // Active booking stage override
    pool = pool
      .map((b): Booking | null => {
        if (b.id !== "bk-active-amara") return b;
        if (state.activeBooking === "none") return null;
        const patched: Booking = { ...b, status: state.activeBooking as BookingStatus };
        if (state.activeBooking === "getting-ready") patched.etaMinutes = 5;
        else if (state.activeBooking === "enroute") patched.etaMinutes = 12;
        else if (state.activeBooking === "in-progress") patched.startedAt = Date.now() - 8 * 60 * 1000;
        return patched;
      })
      .filter((b): b is Booking => b !== null);

    // Preserve any user-created bookings (ids that don't start with seed prefixes)
    const seedIds = new Set(pool.map((b) => b.id));
    const userBookings = bookings.filter(
      (b) => !seedIds.has(b.id) && !b.id.startsWith("bk-active-amara") && !SEED_BOOKINGS.some((s) => s.id === b.id),
    );

    setBookings([...userBookings, ...pool]);

    // Auto-navigate to Service Complete screen when toggled to "completed"
    if (state.activeBooking === "completed") {
      navigate({ to: "/booking/complete/$bookingId", params: { bookingId: "bk-active-amara" } });
    }
  }, [state.bookingsSeed, state.activeBooking, setBookings, navigate, bookings]);

  return null;
}
