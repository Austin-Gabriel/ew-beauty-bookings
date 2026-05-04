/**
 * BookingsProvider — single source of truth for all booking data.
 * Pure in-session React state. Dev-state toggles seed this store.
 * Mirrors the CustomerProfileProvider pattern.
 */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export type BookingStatus =
  | "searching"
  | "pending_pro_approval"
  | "confirmed"
  | "getting-ready"
  | "enroute"
  | "arrived"
  | "in-progress"
  | "completed"
  | "declined"
  | "cancelled";

export const ACTIVE_STATUSES: BookingStatus[] = [
  "searching",
  "pending_pro_approval",
  "confirmed",
  "getting-ready",
  "enroute",
  "arrived",
  "in-progress",
];

export const PAST_STATUSES: BookingStatus[] = ["completed", "declined", "cancelled"];

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
  /** Customer's PIN — surfaced on upcoming booking cards. */
  pin?: string;
  /** Star rating (1–5). */
  rating?: number;
  /** ETA minutes — present while getting-ready or enroute. */
  etaMinutes?: number;
  /** Service start time, unix ms. */
  startedAt?: number;
  /** Refund on cancelled bookings. */
  refundUsd?: number;
  /** "scheduled" | "on-demand" */
  bookingType: "scheduled" | "on-demand";
  /** Total price including tip. */
  total?: number;
  /** Tip amount. */
  tipAmount?: number;
  /** Address id from customer store. */
  addressId?: string;
  /** Payment method id from customer store. */
  paymentMethodId?: string;
  /** Customer notes for the pro. */
  notes?: string;
  /** Creation timestamp, unix ms. */
  createdAt: number;
};

/* ------------------------------------------------------------------ */
/*  Seed data (matches old mock-bookings)                               */
/* ------------------------------------------------------------------ */

const now = Date.now();
const min = 60 * 1000;
const hr = 60 * min;
const day = 24 * hr;

function generatePin() {
  return String(1000 + Math.floor(Math.random() * 9000));
}

export const SEED_BOOKINGS: Booking[] = [
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
    createdAt: now - 20 * min,
  },
  {
    id: "bk-jordan-sat",
    proId: "joelle-pierre",
    service: { name: "Knotless braids", durationLabel: "4 hr", price: 280 },
    when: now + 3 * day + 11 * hr,
    location: { type: "mobile", label: "Your home" },
    status: "confirmed",
    pin: "2196",
    bookingType: "scheduled",
    createdAt: now - 2 * day,
  },
  {
    id: "bk-renee-tue",
    proId: "kemi-adesanya",
    service: { name: "Retwist", durationLabel: "75 min", price: 95 },
    when: now + 8 * day + 6 * hr,
    location: { type: "studio", label: "Studio", distanceMi: 3.4 },
    status: "pending_pro_approval",
    pin: "5503",
    bookingType: "scheduled",
    createdAt: now - 5 * day,
  },
  {
    id: "bk-past-amara-apr",
    proId: "amara-okafor",
    service: { name: "Silk press", durationLabel: "90 min", price: 180 },
    when: now - 12 * day,
    location: { type: "mobile", label: "Your home" },
    status: "completed",
    rating: 5,
    bookingType: "scheduled",
    createdAt: now - 13 * day,
  },
  {
    id: "bk-past-jordan-apr",
    proId: "joelle-pierre",
    service: { name: "Knotless braids", durationLabel: "4 hr", price: 280 },
    when: now - 26 * day,
    location: { type: "mobile", label: "Your home" },
    status: "completed",
    bookingType: "scheduled",
    createdAt: now - 27 * day,
  },
  {
    id: "bk-past-renee-mar",
    proId: "kemi-adesanya",
    service: { name: "Retwist", durationLabel: "75 min", price: 95 },
    when: now - 41 * day,
    location: { type: "studio", label: "Studio", distanceMi: 3.4 },
    status: "completed",
    rating: 5,
    bookingType: "scheduled",
    createdAt: now - 42 * day,
  },
  {
    id: "bk-past-amara-mar",
    proId: "amara-okafor",
    service: { name: "Silk press", durationLabel: "90 min", price: 180 },
    when: now - 55 * day,
    location: { type: "mobile", label: "Your home" },
    status: "cancelled",
    refundUsd: 180,
    bookingType: "scheduled",
    createdAt: now - 56 * day,
  },
];

/* ------------------------------------------------------------------ */
/*  Context                                                             */
/* ------------------------------------------------------------------ */

export type CreateBookingInput = {
  proId: string;
  service: { name: string; durationLabel: string; price: number };
  location: BookingLocation;
  bookingType: "scheduled" | "on-demand";
  total?: number;
  tipAmount?: number;
  addressId?: string;
  paymentMethodId?: string;
  when?: number;
  notes?: string;
};

type BookingsCtx = {
  bookings: Booking[];
  activeBookings: Booking[];
  pastBookings: Booking[];
  getBooking: (id: string) => Booking | undefined;
  createBooking: (input: CreateBookingInput) => string;
  updateBookingStatus: (id: string, status: BookingStatus) => void;
  cancelBooking: (id: string) => void;
  /** Replace all bookings (used by dev-state sync). */
  setBookings: (bookings: Booking[]) => void;
};

const BookingsContext = createContext<BookingsCtx | null>(null);

export function BookingsProvider({ children }: { children: ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const activeBookings = useMemo(
    () => bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)),
    [bookings],
  );

  const pastBookings = useMemo(
    () => bookings.filter((b) => PAST_STATUSES.includes(b.status)),
    [bookings],
  );

  const getBooking = useCallback(
    (id: string) => bookings.find((b) => b.id === id),
    [bookings],
  );

  const createBooking = useCallback((input: CreateBookingInput) => {
    const id = `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const booking: Booking = {
      id,
      proId: input.proId,
      service: input.service,
      when: input.when ?? Date.now(),
      location: input.location,
      status: "searching",
      pin: generatePin(),
      bookingType: input.bookingType,
      total: input.total,
      tipAmount: input.tipAmount,
      addressId: input.addressId,
      paymentMethodId: input.paymentMethodId,
      notes: input.notes,
      createdAt: Date.now(),
    };
    setBookings((prev) => [booking, ...prev]);
    return id;
  }, []);

  const updateBookingStatus = useCallback((id: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, status };
        // Generate PIN on confirmation if not already set
        if (status === "confirmed" && !updated.pin) {
          updated.pin = generatePin();
        }
        // Tweak time-sensitive fields per lifecycle stage
        if (status === "getting-ready") updated.etaMinutes = 5;
        else if (status === "enroute") updated.etaMinutes = 12;
        else if (status === "arrived") updated.etaMinutes = undefined;
        else if (status === "in-progress") updated.startedAt = Date.now();
        return updated;
      }),
    );
  }, []);

  const cancelBooking = useCallback((id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b)),
    );
  }, []);

  const value: BookingsCtx = useMemo(
    () => ({
      bookings,
      activeBookings,
      pastBookings,
      getBooking,
      createBooking,
      updateBookingStatus,
      cancelBooking,
      setBookings,
    }),
    [bookings, activeBookings, pastBookings, getBooking, createBooking, updateBookingStatus, cancelBooking],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider");
  return ctx;
}
