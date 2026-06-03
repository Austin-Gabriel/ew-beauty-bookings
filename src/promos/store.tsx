/**
 * PromosProvider — booking-based loyalty incentives.
 *
 * Drives the Promotions section on /notifications and the reward
 * line-item on /booking/confirm. State is derived from the bookings
 * store (count of completed bookings) plus an internal counter of
 * rewards already consumed. Dev-state toggles can override the
 * displayed card and the computed completed count.
 *
 * Rules:
 *  - Welcome card: completedBookingsCount === 0
 *  - Reward card: customer has earned a reward that hasn't been redeemed
 *  - Loyalty card: otherwise, with progress = completed % 5
 *  - Only one pending reward at a time (no stacking)
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useBookings } from "@/data/bookings-store";
import { useDevState } from "@/dev-state/devState";

export type PromoCardType = "welcome" | "loyalty" | "reward" | "none";

export const LOYALTY_CYCLE = 5;
export const LOYALTY_DISCOUNT_PCT = 10;
export const WELCOME_DISCOUNT_PCT = 15;

type Ctx = {
  /** Effective completed-booking count (respects dev override). */
  completedBookingsCount: number;
  /** Card to render in the Promotions section. */
  cardType: PromoCardType;
  /** Progress within the current 5-booking cycle (0..LOYALTY_CYCLE). */
  loyaltyProgress: number;
  /** True when a reward is queued for the next booking. */
  hasPendingReward: boolean;
  /** Discount % to apply on next booking (0 when no pending reward / welcome). */
  pendingDiscountPct: number;
  /** Mark the pending reward as redeemed (called after booking confirm). */
  consumeReward: () => void;
};

const PromosCtx = createContext<Ctx | null>(null);

export function PromosProvider({ children }: { children: ReactNode }) {
  const { bookings } = useBookings();
  const { state } = useDevState();
  const [rewardsConsumed, setRewardsConsumed] = useState(0);

  // Real completed count from the bookings store
  const realCompleted = useMemo(
    () => bookings.filter((b) => b.status === "completed").length,
    [bookings],
  );

  // Dev override
  const overrideCount =
    state.completedBookingsOverride === "auto"
      ? null
      : parseInt(state.completedBookingsOverride, 10);
  const completedBookingsCount = overrideCount ?? realCompleted;

  // Derived loyalty math
  const earnedRewards = Math.floor(completedBookingsCount / LOYALTY_CYCLE);
  const realPending = earnedRewards > rewardsConsumed;
  const realProgress = realPending
    ? LOYALTY_CYCLE
    : completedBookingsCount % LOYALTY_CYCLE;

  // Auto card type from real state
  const autoCardType: PromoCardType =
    completedBookingsCount === 0
      ? "welcome"
      : realPending
        ? "reward"
        : "loyalty";

  // Dev override for displayed card
  const cardType: PromoCardType =
    state.promoCard === "auto" ? autoCardType : state.promoCard;

  // Loyalty progress respects dev sub-toggle when loyalty is forced
  const loyaltyProgress =
    state.promoCard === "loyalty" || (state.promoCard === "auto" && autoCardType === "loyalty")
      ? state.promoCard === "loyalty"
        ? state.loyaltyCount
        : realProgress
      : cardType === "reward"
        ? LOYALTY_CYCLE
        : realProgress;

  const hasPendingReward = cardType === "reward";
  const pendingDiscountPct = hasPendingReward
    ? LOYALTY_DISCOUNT_PCT
    : cardType === "welcome"
      ? WELCOME_DISCOUNT_PCT
      : 0;

  const consumeReward = useCallback(() => {
    if (realPending) setRewardsConsumed((n) => n + 1);
  }, [realPending]);

  const value = useMemo<Ctx>(
    () => ({
      completedBookingsCount,
      cardType,
      loyaltyProgress,
      hasPendingReward,
      pendingDiscountPct,
      consumeReward,
    }),
    [
      completedBookingsCount,
      cardType,
      loyaltyProgress,
      hasPendingReward,
      pendingDiscountPct,
      consumeReward,
    ],
  );

  return <PromosCtx.Provider value={value}>{children}</PromosCtx.Provider>;
}

export function usePromos() {
  const ctx = useContext(PromosCtx);
  if (!ctx) throw new Error("usePromos must be used within PromosProvider");
  return ctx;
}
