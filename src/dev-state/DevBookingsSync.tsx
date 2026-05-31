/**
 * DevBookingsSync — bridges dev-state toggles to the BookingsProvider.
 *
 * NON-DESTRUCTIVE CONTRACT:
 *  - User-created bookings (ids NOT in SEED_BOOKINGS) are NEVER deleted by
 *    any toggle. They persist across every dev-state change.
 *  - The "Bookings seed" toggle controls the volume of MOCK seed bookings
 *    only. Empty/few/many swaps the mock pool while leaving user bookings
 *    in place.
 *  - The "Active booking" toggle finds the most recent active booking
 *    (user booking preferred over mock) and updates ONLY its status field.
 *    Never deletes the booking, never overwrites pro/service/address/notes/
 *    payment. If no active booking exists, falls back to seeding the mock
 *    "bk-active-amara" hero card.
 *  - Setting "Active booking" to "None" hides only the mock active hero
 *    card. User-created active bookings are preserved.
 *
 * When activeBooking is "completed", auto-navigates to the Service Complete
 * screen for the booking that was advanced.
 */
import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDevState } from "@/dev-state/devState";
import {
  useBookings,
  SEED_BOOKINGS,
  ACTIVE_STATUSES,
  type Booking,
  type BookingStatus,
} from "@/data/bookings-store";

const ACTIVE_HERO_ID = "bk-active-amara";
const SEED_IDS = new Set(SEED_BOOKINGS.map((b) => b.id));
const isUserBooking = (b: Booking) => !SEED_IDS.has(b.id);

function patchStatus(b: Booking, status: BookingStatus): Booking {
  const next: Booking = { ...b, status };
  if (status === "getting-ready") next.etaMinutes = 5;
  else if (status === "enroute") next.etaMinutes = 12;
  else if (status === "arrived") next.etaMinutes = undefined;
  else if (status === "in-progress") {
    next.startedAt = b.startedAt ?? Date.now() - 8 * 60 * 1000;
    next.etaMinutes = undefined;
  }
  return next;
}

export function DevBookingsSync() {
  const { state } = useDevState();
  const { setBookings, bookings } = useBookings();
  const navigate = useNavigate();
  const bookingsRef = useRef<Booking[]>([]);
  bookingsRef.current = bookings;
  const prevSeed = useRef<string | null>(null);
  const prevActive = useRef<string | null>(null);

  /* ---------- bookingsSeed: swap mock pool, preserve user bookings ---------- */
  useEffect(() => {
    if (prevSeed.current === state.bookingsSeed) return;
    prevSeed.current = state.bookingsSeed;

    // Functional update — read the LATEST bookings rather than a render-phase
    // snapshot so we don't clobber an interleaved update from another effect.
    setBookings((prev) => {
      const userBookings = prev.filter(isUserBooking);

      let mockPool: Booking[] = [];
      if (state.bookingsSeed === "few") {
        mockPool = SEED_BOOKINGS.filter((b) =>
          ["bk-jordan-sat", "bk-past-amara-apr"].includes(b.id),
        );
      } else if (state.bookingsSeed === "many") {
        mockPool = [...SEED_BOOKINGS];
      }
      // "empty" → mockPool stays []

      // If active stage was set, apply it to the freshly-seeded mock hero so
      // re-toggling bookingsSeed doesn't reset the lifecycle stage.
      if (state.activeBooking !== "none") {
        mockPool = mockPool.map((b) =>
          b.id === ACTIVE_HERO_ID
            ? patchStatus(b, state.activeBooking as BookingStatus)
            : b,
        );
      } else {
        // "None" hides only the mock hero — never user bookings.
        mockPool = mockPool.filter((b) => b.id !== ACTIVE_HERO_ID);
      }

      return [...userBookings, ...mockPool];
    });
  }, [state.bookingsSeed, state.activeBooking, setBookings]);

  /* ---------- activeBooking: update status of latest active booking ---------- */
  useEffect(() => {
    if (prevActive.current === state.activeBooking) return;
    prevActive.current = state.activeBooking;

    // Functional updates throughout so this effect doesn't clobber the
    // bookingsSeed effect when both fire on the same mount.
    let navigateTo: { bookingId: string } | null = null;

    setBookings((prev) => {
      const activeUser = prev
        .filter((b) => isUserBooking(b) && ACTIVE_STATUSES.includes(b.status))
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      const activeMock = prev.find((b) => b.id === ACTIVE_HERO_ID);
      const target = activeUser ?? activeMock;

      if (state.activeBooking === "none") {
        // Hide ONLY the mock hero. User active bookings are preserved.
        if (!activeUser && activeMock) {
          return prev.filter((b) => b.id !== ACTIVE_HERO_ID);
        }
        return prev;
      }

      if (state.activeBooking === "completed") {
        if (target) {
          navigateTo = { bookingId: target.id };
          return prev.map((b) =>
            b.id === target.id ? { ...b, status: "completed" as BookingStatus } : b,
          );
        }
        return prev;
      }

      if (!target) {
        // No active booking at all → seed the mock hero so the toggle has
        // something to control.
        const seed = SEED_BOOKINGS.find((b) => b.id === ACTIVE_HERO_ID);
        if (seed) {
          const seeded = patchStatus(seed, state.activeBooking as BookingStatus);
          return [seeded, ...prev];
        }
        return prev;
      }

      // Status-only patch.
      return prev.map((b) =>
        b.id === target.id ? patchStatus(b, state.activeBooking as BookingStatus) : b,
      );
    });

    if (navigateTo) {
      // When a live service ends, drop the customer into the rate flow first
      // (image: "How was it?" — stars + optional note + tip). Submitting the
      // review lands them on the completed booking detail.
      navigate({ to: "/booking/rate/$bookingId", params: navigateTo });
    }
  }, [state.activeBooking, setBookings, navigate]);

  /* ---------- scheduleState: drives scheduled / pending-approval flow ---------- */
  const prevSchedule = useRef<string | null>(null);
  useEffect(() => {
    if (prevSchedule.current === state.scheduleState) return;
    prevSchedule.current = state.scheduleState;
    if (state.scheduleState === "none") return;

    const all = bookingsRef.current;
    // Prefer most recent USER-created scheduled booking; fall back to mock seeds.
    const SCHEDULED_STATUSES: BookingStatus[] = [
      "pending_pro_approval",
      "confirmed",
      "declined",
      "cancelled",
    ];
    const userScheduled = all
      .filter(
        (b) =>
          isUserBooking(b) &&
          (b.bookingType === "scheduled" || SCHEDULED_STATUSES.includes(b.status)),
      )
      .sort((a, b) => b.createdAt - a.createdAt)[0];
    const mockScheduled =
      all.find((b) => b.id === "bk-renee-tue") ?? all.find((b) => b.id === "bk-jordan-sat");
    const target = userScheduled ?? mockScheduled;
    if (!target) return;

    let nextStatus: BookingStatus | null = null;
    let goPending = false;
    switch (state.scheduleState) {
      case "slot-picked":
        nextStatus = "pending_pro_approval";
        break;
      case "slot-expired":
        nextStatus = "cancelled";
        goPending = true;
        break;
      case "pending-pro":
        nextStatus = "pending_pro_approval";
        goPending = true;
        break;
      case "auto-accepted":
        nextStatus = "confirmed";
        goPending = true;
        break;
      case "pro-declined":
        nextStatus = "declined";
        goPending = true;
        break;
      case "24h-timeout":
        nextStatus = "cancelled";
        goPending = true;
        break;
    }

    if (nextStatus) {
      const status = nextStatus;
      setBookings(
        bookingsRef.current.map((b) =>
          b.id === target.id ? { ...b, status } : b,
        ),
      );
    }
    if (goPending) {
      navigate({ to: "/booking/pending/$bookingId", params: { bookingId: target.id } });
    }
  }, [state.scheduleState, setBookings, navigate]);

  return null;
}
