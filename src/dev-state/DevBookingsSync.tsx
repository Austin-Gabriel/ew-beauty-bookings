/**
 * DevBookingsSync — bridges dev-state toggles (bookingsSeed, activeBooking,
 * searchingStage) to the shared BookingsProvider.
 * Runs as an effect child of both providers.
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
  const { setBookings } = useBookings();
  const navigate = useNavigate();
  const prevRef = useRef<string>("");

  useEffect(() => {
    const key = `${state.customerState}|${state.bookingsSeed}|${state.activeBooking}`;
    if (key === prevRef.current) return;
    prevRef.current = key;

    if (state.customerState === "new" || state.bookingsSeed === "empty") {
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

    setBookings(pool);

    // Auto-navigate to Service Complete screen when toggled to "completed"
    if (state.activeBooking === "completed") {
      navigate({ to: "/booking/complete/$bookingId", params: { bookingId: "bk-active-amara" } });
    }
  }, [state.customerState, state.bookingsSeed, state.activeBooking, setBookings, navigate]);

  return null;
}
