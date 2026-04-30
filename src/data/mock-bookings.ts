/**
 * Mock bookings — single source of truth for the Bookings tab in dev mode.
 *
 * Lifecycle for an active booking (in chronological order):
 *
 *   pending           → awaiting pro confirmation
 *   confirmed         → upcoming, locked in
 *   ─── service window opens ───
 *   getting-ready     → ON-DEMAND ONLY: pro is prepping; gives them time
 *                       before they have to start moving
 *   enroute           → pro has started traveling to you (or is walking
 *                       to their studio for studio bookings); auto-flips
 *                       here when start time approaches OR when the pro
 *                       taps "I'm leaving" manually
 *   arrived           → pro is at the location; PIN handover happens here
 *   in-progress       → service is underway
 *   completed         → service done
 *
 *   declined / cancelled — terminal exit states
 *
 * Every upcoming booking has a 4-digit PIN that the customer reveals to
 * the pro at the door (or before the service kicks off in studio).
 */
export type BookingStatus =
  | "pending"
  | "confirmed"
  | "getting-ready"
  | "enroute"
  | "arrived"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "declined";

/** Statuses that put a booking in the "happening now" hero treatment. */
export const ACTIVE_STATUSES: BookingStatus[] = [
  "getting-ready",
  "enroute",
  "arrived",
  "in-progress",
];

export type BookingLocation =
  | { type: "mobile"; label: string }
  | { type: "studio"; label: string; distanceMi: number };

export type Booking = {
  id: string;
  proId: string;
  service: { name: string; durationLabel: string; price: number };
  /** Appointment start time, unix ms. */
  when: number;
  location: BookingLocation;
  status: BookingStatus;
  /** Customer's PIN — surfaced on upcoming booking cards and required at arrival. */
  pin?: string;
  /** Star rating left after completion (1–5). */
  rating?: number;
  /** Estimated minutes until arrival — present while getting-ready or enroute. */
  etaMinutes?: number;
  /** Time the service actually started, unix ms. Present from in-progress onward. */
  startedAt?: number;
  /** Refund amount in dollars, present on cancelled bookings if refunded. */
  refundUsd?: number;
  /** "scheduled" = booked in advance; "on-demand" = booked-now flow. */
  bookingType: "scheduled" | "on-demand";
};

const now = Date.now();
const min = 60 * 1000;
const hr = 60 * min;
const day = 24 * hr;

export const MOCK_BOOKINGS: Booking[] = [
  // ── Active: on-demand booking with Amara, currently enroute ───────────
  {
    id: "bk-active-amara",
    proId: "amara-okafor",
    service: { name: "Silk press", durationLabel: "90 min", price: 180 },
    when: now + 12 * min,
    location: { type: "mobile", label: "Your home" },
    status: "enroute",
    pin: "4837",
    etaMinutes: 12,
    bookingType: "on-demand",
  },

  // ── Upcoming: confirmed Saturday with Jordan ─────────────────────────
  {
    id: "bk-jordan-sat",
    proId: "joelle-pierre",
    service: { name: "Knotless braids", durationLabel: "4 hr", price: 280 },
    when: now + 3 * day + 11 * hr,
    location: { type: "mobile", label: "Your home" },
    status: "confirmed",
    pin: "2196",
    bookingType: "scheduled",
  },

  // ── Upcoming: pending studio booking next week with Renée ────────────
  {
    id: "bk-renee-tue",
    proId: "kemi-adesanya",
    service: { name: "Retwist", durationLabel: "75 min", price: 95 },
    when: now + 8 * day + 6 * hr,
    location: { type: "studio", label: "Studio", distanceMi: 3.4 },
    status: "pending",
    pin: "5503",
    bookingType: "scheduled",
  },

  // ── Past: April — Amara silk press, completed and rated ──────────────
  {
    id: "bk-past-amara-apr",
    proId: "amara-okafor",
    service: { name: "Silk press", durationLabel: "90 min", price: 180 },
    when: now - 12 * day,
    location: { type: "mobile", label: "Your home" },
    status: "completed",
    rating: 5,
    bookingType: "scheduled",
  },

  // ── Past: April — Jordan knotless, completed but not rated yet ───────
  {
    id: "bk-past-jordan-apr",
    proId: "joelle-pierre",
    service: { name: "Knotless braids", durationLabel: "4 hr", price: 280 },
    when: now - 26 * day,
    location: { type: "mobile", label: "Your home" },
    status: "completed",
    bookingType: "scheduled",
  },

  // ── Past: March — Renée retwist, rated ───────────────────────────────
  {
    id: "bk-past-renee-mar",
    proId: "kemi-adesanya",
    service: { name: "Retwist", durationLabel: "75 min", price: 95 },
    when: now - 41 * day,
    location: { type: "studio", label: "Studio", distanceMi: 3.4 },
    status: "completed",
    rating: 5,
    bookingType: "scheduled",
  },

  // ── Past: March — Amara cancelled and refunded ───────────────────────
  {
    id: "bk-past-amara-mar",
    proId: "amara-okafor",
    service: { name: "Silk press", durationLabel: "90 min", price: 180 },
    when: now - 55 * day,
    location: { type: "mobile", label: "Your home" },
    status: "cancelled",
    refundUsd: 180,
    bookingType: "scheduled",
  },
];
