/**
 * CancelSheet — shared cancel confirmation bottom sheet.
 * Used from BookingsPage (cards) and BookingDetailPage.
 * Shows cancellation policy summary + link to full policy.
 */
import { useNavigate } from "@tanstack/react-router";
import { SANS_STACK } from "@/auth/auth-shell";
import { useBookings, type Booking } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";
import { formatBookingDate } from "@/lib/format-booking-date";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const DANGER = "#DC2626";

/**
 * Returns true if the booking is within the free-cancel window (>4 h before start).
 */
function isFreeCancelWindow(booking: Booking): boolean {
  const hoursUntil = (booking.when - Date.now()) / (1000 * 60 * 60);
  return hoursUntil > 4;
}

export function CancelSheet({
  bookingId,
  open,
  onClose,
}: {
  bookingId: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const navigate = useNavigate();
  const { getBooking, cancelBooking } = useBookings();
  const booking = bookingId ? getBooking(bookingId) : undefined;
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const freeCancellation = booking ? isFreeCancelWindow(booking) : true;

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <div className="flex flex-col items-center px-2 pb-6 pt-2" style={{ fontFamily: SANS_STACK }}>
          {/* Title */}
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--card-foreground)", marginBottom: 6 }}>
            Cancel this booking?
          </h2>

          {/* Booking summary */}
          {booking && pro && (
            <p style={{ fontSize: 13, color: "var(--muted-foreground)", textAlign: "center", lineHeight: 1.5 }}>
              {booking.service.name} with {pro.name.split(" ")[0]} · {formatBookingDate(booking.when)}
            </p>
          )}

          {/* Policy summary */}
          <div
            className="mt-4 w-full rounded-xl px-3.5 py-3"
            style={{ backgroundColor: "var(--surface-elevated)", border: "1px solid var(--hairline)" }}
          >
            {freeCancellation ? (
              <p style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.55, textAlign: "center" }}>
                <strong style={{ fontWeight: 600 }}>Free cancellation.</strong>{" "}
                Your card hasn't been charged. You can rebook anytime.
              </p>
            ) : (
              <p style={{ fontSize: 13, color: "var(--foreground)", lineHeight: 1.55, textAlign: "center" }}>
                <strong style={{ fontWeight: 600, color: DANGER }}>Late cancellation.</strong>{" "}
                Cancelling within 4 hours of your booking may incur a fee.
              </p>
            )}
          </div>

          {/* Link to full policy */}
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate({ to: "/policies/cancellation" });
            }}
            className="mt-2"
            style={{ fontSize: 12, fontWeight: 600, color: "var(--bagel)", background: "none", border: "none", cursor: "pointer", fontFamily: SANS_STACK }}
          >
            View cancellation policy
          </button>

          {/* Cancel CTA */}
          <button
            type="button"
            onClick={() => {
              if (bookingId) {
                cancelBooking(bookingId);
                onClose();
              }
            }}
            className="mt-5 w-full rounded-2xl py-3.5 text-center transition-transform active:scale-[0.98]"
            style={{ backgroundColor: DANGER, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: SANS_STACK }}
          >
            Cancel booking
          </button>

          {/* Keep */}
          <button
            type="button"
            onClick={onClose}
            className="mt-2 w-full rounded-2xl py-3.5 text-center transition-transform active:scale-[0.98]"
            style={{
              backgroundColor: "var(--cream-elevated)",
              color: "var(--midnight)",
              fontSize: 15,
              fontWeight: 700,
              fontFamily: SANS_STACK,
            }}
          >
            Keep booking
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
