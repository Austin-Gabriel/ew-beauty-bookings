/**
 * BookingDetailPage — /bookings/[bookingId]
 *
 * Single source of truth: reads from BookingsProvider, formats dates
 * via formatBookingDate. No local copies of state.
 */
import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
  ChevronLeft,
  Clock,
  MapPin,
  Scissors,
  CreditCard,
  FileText,
} from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";
import { useBookings, type BookingStatus } from "@/data/bookings-store";
import { MOCK_PROS } from "@/data/mock-pros";
import { useCustomerProfile } from "@/data/customer-store";
import { formatBookingDate } from "@/lib/format-booking-date";
import { CancelSheet } from "@/bookings/CancelSheet";

const ORANGE = "var(--bagel)";

/* ------------------------------------------------------------------ */
/*  Status pill (same logic as BookingsPage — single source)           */
/* ------------------------------------------------------------------ */

function statusPillFor(status: BookingStatus): { text: string; bg: string; fg: string } {
  const BAGEL_PILL = { bg: "rgba(255,130,63,0.14)", fg: ORANGE };
  const NEUTRAL_PILL = { bg: "rgba(11,18,32,0.06)", fg: "var(--on-card-muted)" };

  switch (status) {
    case "searching": return { text: "Searching", ...BAGEL_PILL };
    case "pending_pro_approval": return { text: "Pending", ...BAGEL_PILL };
    case "confirmed": return { text: "Confirmed", ...BAGEL_PILL };
    case "getting-ready": return { text: "Getting ready", ...BAGEL_PILL };
    case "enroute": return { text: "On the way", ...BAGEL_PILL };
    case "arrived": return { text: "Arrived", ...BAGEL_PILL };
    case "in-progress": return { text: "In progress", ...BAGEL_PILL };
    case "completed": return { text: "Completed", ...NEUTRAL_PILL };
    case "cancelled": return { text: "Cancelled", ...NEUTRAL_PILL };
    case "declined": return { text: "Declined", ...NEUTRAL_PILL };
    default: return { text: String(status), ...NEUTRAL_PILL };
  }
}

/* ------------------------------------------------------------------ */
/*  Edit rules                                                          */
/* ------------------------------------------------------------------ */

/** Can the customer edit notes for this booking? Only while it's upcoming and not yet in-progress. */
function canEditNotes(status: BookingStatus): boolean {
  return ["pending_pro_approval", "confirmed", "getting-ready", "enroute"].includes(status);
}

/** Can the customer cancel this booking? Any active status before in-progress. */
function canCancel(status: BookingStatus): boolean {
  return ["pending_pro_approval", "confirmed", "getting-ready", "enroute", "arrived"].includes(status);
}

/* ------------------------------------------------------------------ */
/*  Component                                                           */
/* ------------------------------------------------------------------ */

export function BookingDetailPage({ bookingId }: { bookingId: string }) {
  const navigate = useNavigate();
  const router = useRouter();
  const { getBooking, setBookings, bookings } = useBookings();
  const { profile } = useCustomerProfile();
  const booking = getBooking(bookingId);
  const pro = booking ? MOCK_PROS.find((p) => p.id === booking.proId) : undefined;

  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);

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

  const status = booking.status;
  const proFirst = pro.name.split(" ")[0];
  const pill = statusPillFor(status);
  const initials = pro.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();

  // Payment card info
  const card = booking.paymentMethodId
    ? profile.paymentMethods.find((c) => c.id === booking.paymentMethodId)
    : profile.paymentMethods.find((c) => c.isDefault) ?? profile.paymentMethods[0];

  const servicePrice = booking.service.price;
  const tipAmount = booking.tipAmount ?? 0;
  const total = booking.total ?? servicePrice + tipAmount;

  // Active = not completed/cancelled/declined
  const isActive = !["completed", "cancelled", "declined"].includes(status);
  const isComplete = status === "completed";
  const isCancelled = status === "cancelled" || status === "declined";
  const isPending = status === "pending_pro_approval";

  // PIN visible only after pro accepted (confirmed or later, not pending)
  const showPin = booking.pin && !["searching", "pending_pro_approval"].includes(status) && isActive;

  // Reschedule available for confirmed/scheduled bookings before in-progress
  const canReschedule = ["confirmed", "getting-ready"].includes(status);

  const handleSaveNotes = () => {
    setBookings(
      bookings.map((b) => b.id === bookingId ? { ...b, notes: notesValue.trim() || undefined } : b)
    );
    setEditingNotes(false);
  };

  const handleStartEditNotes = () => {
    setNotesValue(booking.notes ?? "");
    setEditingNotes(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      {/* Top bar — back chevron only */}
      <div className="relative flex h-12 shrink-0 items-center px-4">
        <button
          type="button"
          onClick={() => router.history.back()}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground"
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-36">
        {/* Pro summary card — tappable to open pro profile */}
        <button
          type="button"
          onClick={() => navigate({ to: "/pro/$proId", params: { proId: pro.id } })}
          className="w-full rounded-2xl bg-card p-4 text-left"
          style={{ border: "1px solid var(--hairline)" }}
        >
          <div className="flex items-center gap-3.5">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
              style={{
                backgroundColor: "var(--cream-elevated)",
                color: "var(--midnight)",
                fontSize: 18,
                fontWeight: 700,
                border: "0.5px solid rgba(6,28,39,0.08)",
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-semibold" style={{ color: "var(--card-foreground)" }}>
                {pro.name}
              </p>
              <p className="text-[14px]" style={{ color: "var(--on-card-muted)" }}>
                {booking.service.name} · {booking.service.durationLabel}
              </p>
            </div>
            <span
              className="shrink-0 rounded-full"
              style={{
                backgroundColor: pill.bg,
                color: pill.fg,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "4px 9px",
              }}
            >
              {pill.text}
            </span>
          </div>
        </button>

        {/* Detail rows */}
        <div className="mt-3 rounded-2xl bg-card" style={{ border: "1px solid var(--hairline)" }}>
          {/* When */}
          <DetailRow
            icon={<Clock size={18} />}
            label="When"
            value={formatBookingDate(booking.when)}
          />
          <Hairline />

          {/* Address */}
          <DetailRow
            icon={<MapPin size={18} />}
            label="Address"
            value={booking.location.label}
          />
          <Hairline />

          {/* Service */}
          <DetailRow
            icon={<Scissors size={18} />}
            label="Service"
            value={`${booking.service.name} · $${servicePrice}`}
            tabular
          />
          <Hairline />

          {/* Payment */}
          <DetailRow
            icon={<CreditCard size={18} />}
            label="Payment"
            value={card ? `${brandLabel(card.brand)} · ${card.last4}` : "—"}
            tabular={!!card}
          />
          <Hairline />

          {/* Notes — editable */}
          {editingNotes ? (
            <div className="px-4 py-3.5">
              <div className="flex items-center gap-3">
                <span style={{ color: "var(--on-card-muted)", flexShrink: 0 }}><FileText size={18} /></span>
                <p style={{ fontSize: 11, color: "var(--on-card-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Notes
                </p>
              </div>
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                placeholder={`Add notes for ${proFirst}`}
                rows={3}
                autoFocus
                className="mt-2 w-full resize-none rounded-xl border-none px-3 py-2.5 outline-none"
                style={{
                  backgroundColor: "var(--surface-elevated)",
                  color: "var(--foreground)",
                  fontSize: 14,
                  fontFamily: SANS_STACK,
                  lineHeight: 1.5,
                }}
              />
              <div className="mt-2 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setEditingNotes(false)}
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--muted-foreground)", background: "none", border: "none", cursor: "pointer", fontFamily: SANS_STACK }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  style={{ fontSize: 13, fontWeight: 600, color: ORANGE, background: "none", border: "none", cursor: "pointer", fontFamily: SANS_STACK }}
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={canEditNotes(status) ? handleStartEditNotes : undefined}
              disabled={!canEditNotes(status)}
              className="w-full text-left"
              style={{ background: "none", border: "none", cursor: canEditNotes(status) ? "pointer" : "default" }}
            >
              <DetailRow
                icon={<FileText size={18} />}
                label="Notes"
                value={booking.notes || undefined}
                placeholder={canEditNotes(status) ? `Add notes for ${proFirst}` : "—"}
                action={canEditNotes(status) ? "Edit" : undefined}
              />
            </button>
          )}
        </div>

        {/* PIN card */}
        {showPin && (
          <div
            className="mt-3 rounded-2xl bg-card p-4"
            style={{ border: "1px solid var(--hairline)" }}
          >
            <p
              style={{
                fontSize: 10,
                color: "var(--on-card-muted)",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Arrival PIN
            </p>
            <p
              className="tabular"
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "var(--card-foreground)",
                letterSpacing: "0.18em",
                marginTop: 4,
              }}
            >
              {booking.pin}
            </p>
            <p style={{ fontSize: 12, color: "var(--on-card-muted)", marginTop: 4 }}>
              Read this to {proFirst} when they arrive
            </p>
          </div>
        )}

        {/* Total summary card */}
        <div className="mt-3 rounded-2xl bg-card p-4" style={{ border: "1px solid var(--hairline)" }}>
          <div className="flex items-center justify-between text-[15px]" style={{ color: "var(--card-foreground)" }}>
            <span>Service</span>
            <span className="tabular font-medium">${servicePrice.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[15px]">
            <span style={{ color: "var(--card-foreground)" }}>
              {isComplete ? "Tip" : "Estimated tip"}
            </span>
            <span className="tabular font-medium" style={{ color: "var(--card-foreground)" }}>
              ${tipAmount.toFixed(2)}
            </span>
          </div>
          <div className="my-3" style={{ height: 1, backgroundColor: "var(--hairline)" }} />
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-semibold" style={{ color: "var(--card-foreground)" }}>Total</span>
            <span className="tabular text-[17px] font-semibold" style={{ color: "var(--card-foreground)" }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Cancel link — visible for any cancellable status */}
        {canCancel(status) && (
          <button
            type="button"
            onClick={() => setCancelOpen(true)}
            className="mt-4 w-full text-center"
            style={{ color: "#DC2626", fontSize: 13, fontWeight: 600, fontFamily: SANS_STACK, background: "none", border: "none", cursor: "pointer" }}
          >
            Cancel booking
          </button>
        )}
      </div>

      {/* Sticky bottom action row */}
      {isActive && !["pending_pro_approval", "searching"].includes(status) && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-background px-4 pb-[max(env(safe-area-inset-bottom,0px),12px)] pt-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/booking/message/$bookingId", params: { bookingId } })}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3"
              style={{
                backgroundColor: "var(--surface-elevated)",
                border: "1px solid var(--hairline)",
                color: "var(--foreground)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Message
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/booking/call/$bookingId", params: { bookingId } })}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-3 transition-transform active:scale-95"
              style={{
                backgroundColor: "var(--bagel)",
                color: "var(--bagel-foreground)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Call
            </button>
          </div>
        </div>
      )}

      {/* Complete state: View receipt + Rate */}
      {isComplete && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-background px-4 pb-[max(env(safe-area-inset-bottom,0px),12px)] pt-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate({ to: "/booking/receipt/$bookingId", params: { bookingId } })}
              className="inline-flex flex-1 items-center justify-center rounded-2xl py-3"
              style={{
                backgroundColor: "var(--surface-elevated)",
                border: "1px solid var(--hairline)",
                color: "var(--foreground)",
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              View receipt
            </button>
            {!booking.rating && (
              <button
                type="button"
                onClick={() => navigate({ to: "/booking/rate/$bookingId", params: { bookingId } })}
                className="inline-flex flex-1 items-center justify-center rounded-2xl py-3 transition-transform active:scale-95"
                style={{
                  backgroundColor: "var(--bagel)",
                  color: "var(--bagel-foreground)",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                Rate this booking
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cancel sheet */}
      <CancelSheet
        bookingId={bookingId}
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
      />
    </div>
  );
}

/* ── Shared detail row ─────────────────────────────── */

function DetailRow({
  icon,
  label,
  value,
  placeholder,
  tabular,
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  placeholder?: string;
  tabular?: boolean;
  action?: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <span style={{ color: "var(--on-card-muted)", flexShrink: 0 }}>{icon}</span>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 11, color: "var(--on-card-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </p>
        <p
          className={tabular ? "tabular" : ""}
          style={{
            fontSize: 15,
            color: value ? "var(--card-foreground)" : "var(--on-card-muted)",
            fontWeight: value ? 500 : 400,
            marginTop: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {value || placeholder || "—"}
        </p>
      </div>
      {action && (
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--bagel)", flexShrink: 0 }}>
          {action}
        </span>
      )}
    </div>
  );
}

function Hairline() {
  return <div className="mx-4" style={{ height: 1, backgroundColor: "var(--hairline)" }} />;
}

function brandLabel(brand: string): string {
  switch (brand.toLowerCase()) {
    case "visa": return "Visa";
    case "mastercard": return "Mastercard";
    case "amex": return "Amex";
    default: return brand;
  }
}
