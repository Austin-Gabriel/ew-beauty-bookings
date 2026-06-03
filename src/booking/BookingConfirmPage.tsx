import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  CreditCard,
  FileText,
  ShieldCheck,
  Tag,
  Sun,
  Sunrise,
  Moon,
  Check,
  X,
} from "lucide-react";
import { MOCK_PROS, PRO_SCHEDULES, type ProSchedule } from "@/data/mock-pros";
import { useCustomerProfile, genId, type Address, type PaymentCard } from "@/data/customer-store";
import { useBookings } from "@/data/bookings-store";
import { usePromos } from "@/promos/store";
import { SANS_STACK } from "@/auth/auth-shell";


const ORANGE = "#FF823F";
const BOOKING_FEE = 3;

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookingConfirmPage({
  proId,
  serviceId,
  scheduledWhen: scheduledWhenInitial,
}: {
  proId: string;
  serviceId?: string;
  scheduledWhen?: number;
}) {
  const pro = MOCK_PROS.find((p) => p.id === proId);
  const router = useRouter();
  const navigate = useNavigate();
  const { profile, addAddress, addCard } = useCustomerProfile();
  const { createBooking, updateBookingStatus } = useBookings();
  const { hasPendingReward, pendingDiscountPct, consumeReward } = usePromos();


  const addresses = profile.savedAddresses;
  const cards = profile.paymentMethods;

  const initialServiceIdx = serviceId && pro
    ? Math.max(0, pro.services.findIndex((s) => s.name === serviceId))
    : 0;
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(initialServiceIdx);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    return def?.id ?? null;
  });
  const [selectedCardId, setSelectedCardId] = useState<string | null>(() => {
    const def = cards.find((c) => c.isDefault) ?? cards[0];
    return def?.id ?? null;
  });

  // Sheets / inline panes
  const [whenExpanded, setWhenExpanded] = useState(!scheduledWhenInitial);
  const [showServiceSheet, setShowServiceSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showCardSheet, setShowCardSheet] = useState(false);
  const [showNotesSheet, setShowNotesSheet] = useState(false);
  const [showPromoSheet, setShowPromoSheet] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);

  const [notes, setNotes] = useState("");
  const [scheduledWhen, setScheduledWhen] = useState<number | null>(scheduledWhenInitial ?? null);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number } | null>(null);
  const [confirming, setConfirming] = useState(false);

  // Slot reservation timer (5 min countdown)
  const reservationEnd = useRef<number | null>(
    scheduledWhen ? Date.now() + 5 * 60 * 1000 : null,
  );

  useEffect(() => {
    if (!scheduledWhen || !reservationEnd.current) return;
    const interval = setInterval(() => {
      if (Date.now() >= reservationEnd.current!) {
        clearInterval(interval);
        toast.error("Your slot expired. Pick another time.");
        setScheduledWhen(null);
        setWhenExpanded(true);
        reservationEnd.current = null;
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [scheduledWhen]);

  const selectedAddress = useMemo(() => {
    const found = addresses.find((a) => a.id === selectedAddressId);
    if (found) return found;
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    return def ?? null;
  }, [addresses, selectedAddressId]);

  const selectedCard = useMemo(() => {
    const found = cards.find((c) => c.id === selectedCardId);
    if (found) return found;
    const def = cards.find((c) => c.isDefault) ?? cards[0];
    return def ?? null;
  }, [cards, selectedCardId]);

  if (!pro) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6" style={{ fontFamily: SANS_STACK }}>
        <p className="text-[17px] font-semibold text-foreground">Pro not found</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/discover" })}
          className="mt-4 rounded-full px-5 py-2.5 text-[14px] font-semibold"
          style={{ backgroundColor: ORANGE, color: "#1A0E08" }}
        >
          Back to Discover
        </button>
      </div>
    );
  }

  const selectedService = pro.services[selectedServiceIdx] ?? pro.services[0];
  const servicePrice = selectedService?.priceFrom ?? 0;
  const proFirstName = pro.name.split(" ")[0] ?? pro.name;
  const initials = initialsOf(pro.name);

  // Pricing
  const promoDiscount = appliedPromo?.discount ?? 0;
  const rewardDiscountValue = hasPendingReward
    ? Math.round(servicePrice * pendingDiscountPct) / 100
    : 0;
  const subtotal = Math.max(0, servicePrice - promoDiscount - rewardDiscountValue);
  const total = subtotal + BOOKING_FEE;



  const canConfirm = !!selectedAddress && !!selectedCard && !!scheduledWhen && !confirming;

  const handleConfirm = () => {
    if (!pro || !selectedService || !scheduledWhen) return;
    setConfirming(true);
    window.setTimeout(() => {
      if (!pro.autoAccept) {
        const newId = createBooking({
          proId,
          service: {
            name: selectedService.name,
            durationLabel: "90 min",
            price: servicePrice,
          },
          location: selectedAddress
            ? { type: "mobile", label: selectedAddress.label || selectedAddress.street }
            : { type: "mobile", label: "Your home" },
          bookingType: "scheduled",
          total,
          tipAmount: undefined,
          addressId: selectedAddress?.id,
          paymentMethodId: selectedCard?.id,
          when: scheduledWhen,
          notes: notes.trim() || undefined,
        });
        updateBookingStatus(newId, "pending_pro_approval");
        navigate({ to: "/booking/pending/$bookingId", params: { bookingId: newId } });
      } else {
        const newId = createBooking({
          proId,
          service: {
            name: selectedService.name,
            durationLabel: "90 min",
            price: servicePrice,
          },
          location: selectedAddress
            ? { type: "mobile", label: selectedAddress.label || selectedAddress.street }
            : { type: "mobile", label: "Your home" },
          bookingType: "scheduled",
          total,
          tipAmount: undefined,
          addressId: selectedAddress?.id,
          paymentMethodId: selectedCard?.id,
          when: scheduledWhen,
          notes: notes.trim() || undefined,
        });
        updateBookingStatus(newId, "confirmed");
        toast.success("Booking confirmed instantly!");
        navigate({ to: "/bookings/$bookingId", params: { bookingId: newId } });
      }
    }, 800);
  };

  const whenLabel = scheduledWhen
    ? formatWhenLabel(scheduledWhen)
    : "Pick a date and time";
  const whenSub = scheduledWhen ? formatTimeOnly(scheduledWhen) : null;
  const addressLabel = selectedAddress
    ? selectedAddress.label || selectedAddress.street
    : null;
  const addressSub = selectedAddress
    ? `${selectedAddress.street}, ${selectedAddress.city}`
    : null;
  const cardLabel = selectedCard ? brandLabel(selectedCard.brand) : null;
  const cardSub = selectedCard ? `Ending in ${selectedCard.last4}` : null;

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      {/* HEADER --------------------------------------------------------- */}
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3.5"
        style={{ backgroundColor: "var(--card)", borderColor: "var(--border)" }}
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
        <h1 className="flex-1 text-center" style={{ fontSize: 17, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
          Review & confirm
        </h1>
        <span className="w-9" />
      </header>

      <div className="flex-1 overflow-y-auto pb-36">
        {/* HERO ------------------------------------------------------- */}
        <div
          className="border-b px-5 pt-6 pb-5 text-center"
          style={{ borderColor: "var(--border)" }}
        >
          <p
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: "var(--foreground)",
              letterSpacing: "-0.035em",
              lineHeight: 1,
            }}
          >
            ${servicePrice}
          </p>
          <button
            type="button"
            onClick={() => setShowServiceSheet(true)}
            className="mt-2 inline-flex items-center gap-1"
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
              {selectedService?.name ?? "Service"}
            </span>
            {pro.services.length > 1 && (
              <ChevronDown size={13} style={{ color: "var(--muted-foreground)" }} />
            )}
          </button>
          <p className="mt-0.5" style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>
            90 minutes
          </p>

          {/* Stylist chip */}
          <div
            className="mt-4 inline-flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-3.5"
            style={{ backgroundColor: "var(--surface-elevated)" }}
          >
            <span
              className="grid h-7 w-7 place-items-center rounded-full"
              style={{
                background: "linear-gradient(135deg, #FFD9C7 0%, #FF9270 100%)",
                color: "#7C2D12",
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {initials}
            </span>
            <span className="text-left">
              <p style={{ fontSize: 12.5, fontWeight: 700, color: "var(--foreground)", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
                {pro.name}
              </p>
              <p className="mt-0.5 inline-flex items-center gap-1" style={{ fontSize: 10.5, color: "var(--muted-foreground)" }}>
                <span style={{ color: "#F5A623", fontSize: 9 }}>★</span>
                <span>{pro.rating.toFixed(2)} ({pro.reviewCount})</span>
              </p>
            </span>
          </div>
        </div>

        {/* DETAILS ---------------------------------------------------- */}
        <div className="px-5 pt-2 pb-2">
          {/* WHEN — expandable inline */}
          <DetailRow
            icon={<Clock size={15} />}
            label="When"
            value={whenLabel}
            sub={whenSub ?? undefined}
            placeholder={!scheduledWhen}
            expandable
            expanded={whenExpanded}
            onClick={() => setWhenExpanded((v) => !v)}
          />
          {whenExpanded && (
            <InlineWhenPicker
              proId={proId}
              selected={scheduledWhen}
              onSelect={(when) => {
                setScheduledWhen(when);
                reservationEnd.current = Date.now() + 5 * 60 * 1000;
                setWhenExpanded(false);
              }}
            />
          )}

          <Divider />

          <DetailRow
            icon={<MapPin size={15} />}
            label="Address"
            value={addressLabel ?? "Add an address"}
            sub={addressSub ?? undefined}
            placeholder={!selectedAddress}
            onClick={() => setShowAddressSheet(true)}
          />

          <Divider />

          <DetailRow
            icon={<CreditCard size={15} />}
            label="Payment"
            value={cardLabel ?? "Add a card to book"}
            sub={cardSub ?? undefined}
            placeholder={!selectedCard}
            onClick={() => setShowCardSheet(true)}
          />

          <Divider />

          <DetailRow
            icon={<FileText size={15} />}
            label={`Note for ${proFirstName}`}
            value={notes.trim() || "Add a note (optional)"}
            placeholder={!notes.trim()}
            onClick={() => setShowNotesSheet(true)}
          />
        </div>

        {/* PROMO BANNER ----------------------------------------------- */}
        <div className="px-5 pt-3">
          <button
            type="button"
            onClick={() => setShowPromoSheet(true)}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-transform active:scale-[0.99]"
            style={{ backgroundColor: "rgba(255,130,63,0.10)" }}
          >
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
              style={{ backgroundColor: ORANGE, color: "#1A0E08" }}
            >
              <Tag size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>
                {appliedPromo ? `${appliedPromo.code} applied` : "Apply a promo or credits"}
              </p>
              <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--card-foreground)", opacity: 0.78 }}>
                {appliedPromo
                  ? `Saved $${appliedPromo.discount} on this booking`
                  : <>You have <strong style={{ color: ORANGE }}>$20 in credits</strong> and 3 offers</>}
              </p>
            </span>
            <ChevronRight size={14} style={{ color: "var(--on-card-muted)" }} />
          </button>
        </div>

        {/* COST CARD -------------------------------------------------- */}
        <div className="px-5 pt-4">
          <div
            className="rounded-2xl px-4 py-4"
            style={{ backgroundColor: "var(--surface-elevated)" }}
          >
            <div className="flex items-baseline justify-between">
              <span style={{ fontSize: 13, color: "var(--card-foreground)" }}>{selectedService?.name}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>
                ${servicePrice.toFixed(2)}
              </span>
            </div>
            {appliedPromo && (
              <div className="mt-2 flex items-baseline justify-between">
                <span style={{ fontSize: 13, color: ORANGE, fontWeight: 600 }}>{appliedPromo.code}</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: ORANGE }}>
                  −${promoDiscount.toFixed(2)}
                </span>
              </div>
            )}
            {hasPendingReward && (
              <div className="mt-2 flex items-baseline justify-between">
                <span style={{ fontSize: 13, color: "var(--bagel)", fontWeight: 600 }}>
                  Reward — {pendingDiscountPct}% off
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--bagel)" }}>
                  −${rewardDiscountValue.toFixed(2)}
                </span>
              </div>
            )}

            <div className="mt-2 flex items-baseline justify-between">
              <span style={{ fontSize: 13, color: "var(--card-foreground)" }}>Booking fee</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>
                ${BOOKING_FEE.toFixed(2)}
              </span>
            </div>
            <div className="my-3" style={{ height: 1, backgroundColor: "var(--border)" }} />
            <div className="flex items-baseline justify-between">
              <span style={{ fontSize: 14.5, fontWeight: 700, color: "var(--card-foreground)" }}>
                Total today
              </span>
              <span style={{ fontSize: 19, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.02em" }}>
                ${total.toFixed(2)}
              </span>
            </div>
            <p className="mt-2.5 text-center" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
              Tip your stylist after your appointment
            </p>
          </div>
        </div>

        {/* TRUST CARD ------------------------------------------------- */}
        <div className="px-5 pt-4">
          <div
            className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
            style={{ backgroundColor: "#0B1220", color: "#fff" }}
          >
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
              style={{ backgroundColor: "rgba(255,255,255,0.10)" }}
            >
              <ShieldCheck size={14} />
            </span>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.85)", lineHeight: 1.5 }}>
              Your card is <strong style={{ color: "#fff", fontWeight: 600 }}>held, not charged</strong>.
              {" "}{proFirstName} has 30 minutes to accept your request. If she doesn't, you won't be charged a thing.
            </p>
          </div>
        </div>

        {/* TERMS ------------------------------------------------------ */}
        <p className="px-6 pt-4 text-center" style={{ fontSize: 11, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          By tapping Confirm, you agree to Ewà's{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/profile/terms" })}
            style={{ background: "none", border: "none", color: "var(--foreground)", textDecoration: "underline", padding: 0, fontSize: 11, fontFamily: SANS_STACK }}
          >
            Booking Terms
          </button>{" "}
          and{" "}
          <button
            type="button"
            onClick={() => navigate({ to: "/policies/cancellation" })}
            style={{ background: "none", border: "none", color: "var(--foreground)", textDecoration: "underline", padding: 0, fontSize: 11, fontFamily: SANS_STACK }}
          >
            Cancellation Policy
          </button>
          .
        </p>
      </div>

      {/* STICKY CTA ----------------------------------------------------- */}
      <div
        className="fixed inset-x-0 z-30 border-t px-5 pt-3.5"
        style={{
          bottom: 0,
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 14px)",
        }}
      >
        <button
          type="button"
          disabled={!canConfirm}
          onClick={handleConfirm}
          className="flex w-full flex-col items-center justify-center rounded-2xl py-3 transition-transform active:scale-[0.98]"
          style={{
            backgroundColor: canConfirm ? ORANGE : "var(--surface-elevated)",
            color: canConfirm ? "#1A0E08" : "var(--muted-foreground)",
          }}
        >
          {confirming ? (
            <div
              className="h-5 w-5 animate-spin rounded-full"
              style={{ border: "2px solid #1A0E08", borderTopColor: "transparent" }}
            />
          ) : !scheduledWhen ? (
            <span style={{ fontSize: 15, fontWeight: 700 }}>Pick a time to continue</span>
          ) : !selectedAddress ? (
            <span style={{ fontSize: 15, fontWeight: 700 }}>Add an address</span>
          ) : !selectedCard ? (
            <span style={{ fontSize: 15, fontWeight: 700 }}>Add a payment method</span>
          ) : (
            <>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Confirm booking</span>
              <span className="mt-0.5" style={{ fontSize: 11.5, fontWeight: 500, opacity: 0.78 }}>
                ${total.toFixed(0)} will be held · {formatShortWhen(scheduledWhen)}
              </span>
            </>
          )}
        </button>
      </div>

      {/* SHEETS --------------------------------------------------------- */}
      {showServiceSheet && (
        <Sheet title="Choose a service" onClose={() => setShowServiceSheet(false)}>
          {pro.services.map((s, i) => (
            <SheetOption
              key={i}
              label={s.name}
              detail={`$${s.priceFrom}`}
              selected={i === selectedServiceIdx}
              onTap={() => {
                setSelectedServiceIdx(i);
                setShowServiceSheet(false);
              }}
            />
          ))}
        </Sheet>
      )}

      {showAddressSheet && !showAddAddressForm && (
        <Sheet title="Choose an address" onClose={() => setShowAddressSheet(false)}>
          {addresses.map((a) => (
            <SheetOption
              key={a.id}
              label={a.label || a.street}
              detail={`${a.city}, ${a.state} ${a.zip}`}
              selected={a.id === (selectedAddress?.id ?? null)}
              onTap={() => {
                setSelectedAddressId(a.id);
                setShowAddressSheet(false);
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              setShowAddressSheet(false);
              setShowAddAddressForm(true);
            }}
            className="w-full px-4 py-3 text-left"
            style={{ fontSize: 15, fontWeight: 600, color: ORANGE, fontFamily: SANS_STACK }}
          >
            + Add a new address
          </button>
        </Sheet>
      )}

      {showAddAddressForm && (
        <InlineAddressForm
          onSave={(addr) => {
            addAddress(addr);
            setSelectedAddressId(addr.id);
            setShowAddAddressForm(false);
          }}
          onCancel={() => setShowAddAddressForm(false)}
        />
      )}

      {showCardSheet && !showAddCardForm && (
        <Sheet title="Choose a card" onClose={() => setShowCardSheet(false)}>
          {cards.map((c) => (
            <SheetOption
              key={c.id}
              label={`${brandLabel(c.brand)} · ${c.last4}`}
              detail={`Exp ${String(c.expMonth).padStart(2, "0")}/${c.expYear}`}
              selected={c.id === (selectedCard?.id ?? null)}
              onTap={() => {
                setSelectedCardId(c.id);
                setShowCardSheet(false);
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => {
              setShowCardSheet(false);
              setShowAddCardForm(true);
            }}
            className="w-full px-4 py-3 text-left"
            style={{ fontSize: 15, fontWeight: 600, color: ORANGE, fontFamily: SANS_STACK }}
          >
            + Add a new card
          </button>
        </Sheet>
      )}

      {showAddCardForm && (
        <InlineAddCardForm
          onSave={(card) => {
            addCard(card);
            setSelectedCardId(card.id);
            setShowAddCardForm(false);
          }}
          onCancel={() => setShowAddCardForm(false)}
        />
      )}

      {showNotesSheet && (
        <Sheet title={`Note for ${proFirstName}`} onClose={() => setShowNotesSheet(false)}>
          <div className="px-4 pb-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Parking info, gate codes, preferences…"
              rows={4}
              className="w-full resize-none rounded-xl border px-3 py-2.5 outline-none"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--card)",
                color: "var(--card-foreground)",
                fontSize: 15,
                fontFamily: SANS_STACK,
              }}
            />
            <button
              type="button"
              onClick={() => setShowNotesSheet(false)}
              className="mt-3 h-[44px] w-full rounded-2xl"
              style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 15, fontWeight: 700, fontFamily: SANS_STACK }}
            >
              Save
            </button>
          </div>
        </Sheet>
      )}

      {showPromoSheet && (
        <PromoSheet
          onClose={() => setShowPromoSheet(false)}
          appliedCode={appliedPromo?.code ?? null}
          servicePrice={servicePrice}
          onApply={(code, discount) => {
            setAppliedPromo({ code, discount });
            setShowPromoSheet(false);
            toast.success(`${code} applied — you saved $${discount}`);
          }}
          onRemove={() => {
            setAppliedPromo(null);
            setShowPromoSheet(false);
            toast("Promo removed");
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline When picker                                                  */
/* ------------------------------------------------------------------ */

type QuickKey = "asap" | "today" | "tomorrow" | "weekend" | "custom";

function InlineWhenPicker({
  proId,
  selected,
  onSelect,
}: {
  proId: string;
  selected: number | null;
  onSelect: (when: number) => void;
}) {
  const schedule = PRO_SCHEDULES[proId] ?? {
    hours: { 0: null, 1: { start: 9, end: 18 }, 2: { start: 9, end: 18 }, 3: { start: 9, end: 18 }, 4: { start: 9, end: 18 }, 5: { start: 9, end: 18 }, 6: null },
    blockedDates: [],
    bookedSlots: [],
  };

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Build a rolling 14-day strip
  const dayStrip = useMemo(() => {
    const out: Date[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      out.push(d);
    }
    return out;
  }, [today]);

  const [quick, setQuick] = useState<QuickKey>(selected ? "custom" : "custom");
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (selected) {
      const d = new Date(selected);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return today;
  });

  const slotsForDay = (date: Date) => {
    const dow = date.getDay();
    const hours = schedule.hours[dow];
    if (!hours) return [];
    const dateKey = date.toISOString().slice(0, 10);
    const isBlocked = schedule.blockedDates.includes(dateKey);
    if (isBlocked) return [];
    const slots: { hour: number; minute: number; available: boolean }[] = [];
    const now = new Date();
    for (let h = hours.start; h < hours.end; h++) {
      for (const m of [0, 30]) {
        const slotDate = new Date(date);
        slotDate.setHours(h, m, 0, 0);
        const tooSoon = slotDate.getTime() - now.getTime() < 60 * 60 * 1000;
        const hh = String(h).padStart(2, "0");
        const mm = String(m).padStart(2, "0");
        const slotKey = `${dateKey} ${hh}:${mm}`;
        const isBooked = schedule.bookedSlots.includes(slotKey);
        slots.push({ hour: h, minute: m, available: !isBooked && !tooSoon });
      }
    }
    return slots;
  };

  const isDateDisabled = (d: Date) => {
    const day = new Date(d);
    day.setHours(0, 0, 0, 0);
    if (day < today) return true;
    const dow = d.getDay();
    if (!schedule.hours[dow]) return true;
    if (schedule.blockedDates.includes(day.toISOString().slice(0, 10))) return true;
    return false;
  };

  const slotCountForDay = (d: Date) =>
    isDateDisabled(d) ? 0 : slotsForDay(d).filter((s) => s.available).length;

  const slots = slotsForDay(selectedDate);
  const morning = slots.filter((s) => s.hour < 12);
  const afternoon = slots.filter((s) => s.hour >= 12 && s.hour < 17);
  const evening = slots.filter((s) => s.hour >= 17);

  const applyQuick = (key: QuickKey) => {
    setQuick(key);
    if (key === "asap") {
      // Pick first available slot today
      const todaySlots = slotsForDay(today);
      const first = todaySlots.find((s) => s.available);
      if (first) {
        const d = new Date(today);
        d.setHours(first.hour, first.minute, 0, 0);
        setSelectedDate(today);
        onSelect(d.getTime());
      } else {
        toast("No more slots today — pick another day");
      }
    } else if (key === "today") {
      setSelectedDate(today);
    } else if (key === "tomorrow") {
      const tmrw = new Date(today);
      tmrw.setDate(tmrw.getDate() + 1);
      setSelectedDate(tmrw);
    } else if (key === "weekend") {
      // Find next Saturday
      const sat = new Date(today);
      const daysToSat = (6 - sat.getDay() + 7) % 7 || 7;
      sat.setDate(sat.getDate() + daysToSat);
      setSelectedDate(sat);
    }
  };

  const pickSlot = (s: { hour: number; minute: number; available: boolean }) => {
    if (!s.available) return;
    const d = new Date(selectedDate);
    d.setHours(s.hour, s.minute, 0, 0);
    onSelect(d.getTime());
  };

  const QUICK_OPTS: { key: QuickKey; label: string }[] = [
    { key: "asap", label: "ASAP" },
    { key: "today", label: "Today" },
    { key: "tomorrow", label: "Tomorrow" },
    { key: "weekend", label: "This weekend" },
    { key: "custom", label: "Pick a date" },
  ];

  const monthLabel = selectedDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="px-2 pb-4">
      {/* Quick options strip */}
      <div className="flex gap-2 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        {QUICK_OPTS.map((q) => {
          const active = quick === q.key;
          return (
            <button
              key={q.key}
              type="button"
              onClick={() => applyQuick(q.key)}
              className="shrink-0 rounded-full border px-3.5 py-2 transition-colors"
              style={{
                backgroundColor: active ? "#0B1220" : "var(--card)",
                borderColor: active ? "#0B1220" : "var(--border)",
                color: active ? "#fff" : "var(--card-foreground)",
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: SANS_STACK,
              }}
            >
              {q.label}
            </button>
          );
        })}
      </div>

      {/* Month label */}
      <div className="flex items-center justify-between pb-2.5">
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
          {monthLabel}
        </span>
      </div>

      {/* Day strip */}
      <div className="flex gap-1.5 overflow-x-auto pb-3" style={{ scrollbarWidth: "none" }}>
        {dayStrip.map((d) => {
          const disabled = isDateDisabled(d);
          const isSelected = isSameDay(d, selectedDate);
          const isToday = isSameDay(d, today);
          const count = slotCountForDay(d);
          return (
            <button
              key={d.getTime()}
              type="button"
              disabled={disabled}
              onClick={() => setSelectedDate(d)}
              className="relative shrink-0 rounded-xl border px-2 py-2.5 text-center transition-colors"
              style={{
                width: 52,
                backgroundColor: isSelected ? "#0B1220" : "var(--card)",
                borderColor: isSelected ? "#0B1220" : "var(--border)",
                color: isSelected ? "#fff" : disabled ? "var(--on-card-muted)" : "var(--card-foreground)",
                opacity: disabled ? 0.4 : 1,
              }}
            >
              <p
                style={{
                  fontSize: 9.5,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: isSelected ? "rgba(255,255,255,0.65)" : "var(--muted-foreground)",
                }}
              >
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </p>
              <p
                className="mt-0.5"
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {d.getDate()}
              </p>
              <p
                className="mt-1"
                style={{
                  fontSize: 9,
                  fontWeight: 500,
                  color: isSelected ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)",
                }}
              >
                {disabled ? "Off" : count > 0 ? count : "—"}
              </p>
              {isToday && (
                <span
                  aria-hidden
                  className="absolute"
                  style={{
                    bottom: 4,
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: 3,
                    height: 3,
                    borderRadius: 9999,
                    backgroundColor: isSelected ? "#fff" : ORANGE,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day info */}
      <p className="pb-2" style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>
        <strong style={{ color: "var(--card-foreground)", fontWeight: 700 }}>
          {selectedDate.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </strong>{" "}
        ·{" "}
        {slotCountForDay(selectedDate) === 0
          ? "No availability"
          : `${slotCountForDay(selectedDate)} times available`}
      </p>

      {morning.length > 0 && (
        <TimeSection icon={<Sunrise size={11} />} label="Morning" slots={morning} selected={selected} pickSlot={pickSlot} selectedDate={selectedDate} />
      )}
      {afternoon.length > 0 && (
        <TimeSection icon={<Sun size={11} />} label="Afternoon" slots={afternoon} selected={selected} pickSlot={pickSlot} selectedDate={selectedDate} />
      )}
      {evening.length > 0 && (
        <TimeSection icon={<Moon size={11} />} label="Evening" slots={evening} selected={selected} pickSlot={pickSlot} selectedDate={selectedDate} />
      )}
      {slots.length === 0 && (
        <p className="py-6 text-center" style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}>
          {proId} doesn't take bookings on this day. Pick another date.
        </p>
      )}
    </div>
  );
}

function TimeSection({
  icon,
  label,
  slots,
  selected,
  pickSlot,
  selectedDate,
}: {
  icon: React.ReactNode;
  label: string;
  slots: { hour: number; minute: number; available: boolean }[];
  selected: number | null;
  pickSlot: (s: { hour: number; minute: number; available: boolean }) => void;
  selectedDate: Date;
}) {
  return (
    <div className="mb-3">
      <div className="mb-2 flex items-center gap-1.5">
        <span style={{ color: "var(--muted-foreground)" }}>{icon}</span>
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: "var(--muted-foreground)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {slots.map((s) => {
          const slotDate = new Date(selectedDate);
          slotDate.setHours(s.hour, s.minute, 0, 0);
          const isSelected = selected === slotDate.getTime();
          return (
            <button
              key={`${s.hour}-${s.minute}`}
              type="button"
              disabled={!s.available}
              onClick={() => pickSlot(s)}
              className="rounded-xl border py-2.5 text-center transition-colors"
              style={{
                backgroundColor: isSelected
                  ? ORANGE
                  : s.available
                    ? "var(--card)"
                    : "var(--surface-elevated)",
                borderColor: isSelected ? ORANGE : "var(--border)",
                color: isSelected
                  ? "#1A0E08"
                  : s.available
                    ? "var(--card-foreground)"
                    : "var(--on-card-muted)",
                fontSize: 12.5,
                fontWeight: 600,
                fontFamily: SANS_STACK,
                opacity: s.available ? 1 : 0.6,
                cursor: s.available ? "pointer" : "not-allowed",
              }}
            >
              {formatSlotTime(s.hour, s.minute)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DetailRow                                                           */
/* ------------------------------------------------------------------ */

function DetailRow({
  icon,
  label,
  value,
  sub,
  placeholder,
  expandable,
  expanded,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  placeholder?: boolean;
  expandable?: boolean;
  expanded?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3.5 py-3.5 text-left"
    >
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
        style={{
          backgroundColor: expanded ? "rgba(255,130,63,0.12)" : "var(--surface-elevated)",
          color: expanded ? ORANGE : "var(--card-foreground)",
          transition: "background-color 0.2s, color 0.2s",
        }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <p
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: "var(--on-card-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {label}
        </p>
        <p
          className="mt-0.5"
          style={{
            fontSize: 14.5,
            fontWeight: placeholder ? 500 : 600,
            color: placeholder ? "var(--on-card-muted)" : "var(--card-foreground)",
            letterSpacing: "-0.005em",
          }}
        >
          {value}
        </p>
        {sub && (
          <p className="mt-0.5" style={{ fontSize: 12.5, color: "var(--on-card-muted)" }}>
            {sub}
          </p>
        )}
      </span>
      {expandable ? (
        <ChevronDown
          size={14}
          style={{
            color: expanded ? ORANGE : "var(--on-card-muted)",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 0.2s, color 0.2s",
          }}
        />
      ) : (
        <ChevronRight size={14} style={{ color: "var(--on-card-muted)" }} />
      )}
    </button>
  );
}

function Divider() {
  return <div className="ml-[60px]" style={{ borderTop: "1px solid var(--border)" }} />;
}

/* ------------------------------------------------------------------ */
/*  Promo sheet                                                         */
/* ------------------------------------------------------------------ */

const AVAILABLE_PROMOS: { code: string; label: string; description: string; discount: number }[] = [
  { code: "EWA_CREDITS", label: "Apply $20 in credits", description: "Use your full credit balance toward this booking", discount: 20 },
  { code: "FIRST20", label: "20% off first booking", description: "Valid on any service over $80", discount: 26 },
  { code: "REBOOK10", label: "10% off rebooking", description: "Save when you book a stylist you've used before", discount: 13 },
  { code: "EWASUMMER", label: "Free silk press finish", description: "Complimentary silk press touch-up", discount: 0 },
];

function PromoSheet({
  onClose,
  appliedCode,
  servicePrice,
  onApply,
  onRemove,
}: {
  onClose: () => void;
  appliedCode: string | null;
  servicePrice: number;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
}) {
  void servicePrice;
  return (
    <Sheet title="Apply promo or credits" onClose={onClose}>
      <div className="px-4 pb-2">
        {AVAILABLE_PROMOS.map((p) => {
          const isApplied = appliedCode === p.code;
          return (
            <button
              key={p.code}
              type="button"
              onClick={() => (isApplied ? onRemove() : onApply(p.code, p.discount))}
              className="flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors active:bg-muted/30"
              style={{
                borderColor: isApplied ? ORANGE : "var(--border)",
                backgroundColor: isApplied ? "rgba(255,130,63,0.06)" : "var(--card)",
                marginBottom: 8,
              }}
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
                style={{ backgroundColor: "rgba(255,130,63,0.12)", color: ORANGE }}
              >
                <Tag size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <p style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)" }}>{p.label}</p>
                <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
                  {p.description}
                </p>
              </span>
              {isApplied ? (
                <span
                  className="grid h-6 w-6 place-items-center rounded-full"
                  style={{ backgroundColor: ORANGE, color: "#1A0E08" }}
                >
                  <Check size={13} strokeWidth={3} />
                </span>
              ) : (
                <span style={{ fontSize: 12.5, fontWeight: 700, color: ORANGE }}>
                  {p.discount > 0 ? `−$${p.discount}` : "Free"}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

/* ------------------------------------------------------------------ */
/*  Sheet helpers (kept from previous version)                         */
/* ------------------------------------------------------------------ */

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(11,18,32,0.40)", backdropFilter: "blur(4px)" }}
      />
      <div
        className="relative w-full max-w-[420px] rounded-t-3xl pb-[max(env(safe-area-inset-bottom,0px),16px)]"
        style={{ backgroundColor: "var(--card)", boxShadow: "0 -12px 32px rgba(11,18,32,0.18)" }}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(127,127,127,0.2)" }} />
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <p style={{ fontSize: 17, fontWeight: 700, color: "var(--card-foreground)" }}>{title}</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-7 w-7 place-items-center rounded-full"
            style={{ backgroundColor: "var(--surface-elevated)", color: "var(--card-foreground)" }}
          >
            <X size={13} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SheetOption({
  label,
  detail,
  selected,
  onTap,
}: {
  label: string;
  detail?: string;
  selected: boolean;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-center justify-between px-4 py-3 text-left"
      style={{ backgroundColor: selected ? "rgba(255,130,63,0.08)" : "transparent" }}
    >
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 15, fontWeight: 500, color: "var(--card-foreground)" }}>{label}</p>
        {detail && (
          <p className="mt-0.5" style={{ fontSize: 13, color: "var(--on-card-muted)" }}>{detail}</p>
        )}
      </div>
      {selected && (
        <div
          className="grid h-5 w-5 shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: ORANGE, color: "#1A0E08" }}
        >
          <Check size={12} strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline Add Address Form                                            */
/* ------------------------------------------------------------------ */

function InlineAddressForm({
  onSave,
  onCancel,
}: {
  onSave: (a: Address) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [apt, setApt] = useState("");
  const [city, setCity] = useState("Brooklyn");
  const [st, setSt] = useState("NY");
  const [zip, setZip] = useState("");
  const valid = label.trim() && street.trim() && city.trim() && st.trim() && zip.trim();

  return (
    <div className="fixed inset-0 z-[9997] flex flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <button type="button" onClick={onCancel} className="text-[15px] font-medium text-foreground">
          Cancel
        </button>
        <span className="text-[17px] font-semibold text-foreground">Add address</span>
        <button
          type="button"
          onClick={() => {
            if (!valid) return;
            onSave({
              id: genId("addr"),
              label: label.trim(),
              street: street.trim(),
              apt: apt.trim(),
              city: city.trim(),
              state: st.trim(),
              zip: zip.trim(),
              isDefault: false,
            });
          }}
          disabled={!valid}
          className="text-[15px] font-semibold disabled:opacity-40"
          style={{ color: ORANGE }}
        >
          Save
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
        <div className="flex flex-col gap-4">
          <MiniInput label="Label" value={label} onChange={setLabel} placeholder="Home, Work" />
          <MiniInput label="Street" value={street} onChange={setStreet} />
          <MiniInput label="Apt/Suite" value={apt} onChange={setApt} />
          <MiniInput label="City" value={city} onChange={setCity} />
          <div className="flex gap-3">
            <MiniInput label="State" value={st} onChange={setSt} />
            <MiniInput label="ZIP" value={zip} onChange={setZip} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InlineAddCardForm({
  onSave,
  onCancel,
}: {
  onSave: (c: PaymentCard) => void;
  onCancel: () => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  function detectBrand(num: string): "visa" | "mastercard" | "amex" | "discover" {
    const d = num.replace(/\s/g, "");
    if (d.startsWith("4")) return "visa";
    if (d.startsWith("5") || d.startsWith("2")) return "mastercard";
    if (d.startsWith("3")) return "amex";
    if (d.startsWith("6")) return "discover";
    return "visa";
  }

  const digits = cardNumber.replace(/\D/g, "");
  const expDigits = expiry.replace(/\D/g, "");
  const valid = digits.length >= 15 && expDigits.length === 4 && cvc.length >= 3;

  return (
    <div className="fixed inset-0 z-[9997] flex flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <button type="button" onClick={onCancel} className="text-[15px] font-medium text-foreground">
          Cancel
        </button>
        <span className="text-[17px] font-semibold text-foreground">Add card</span>
        <button
          type="button"
          onClick={() => {
            if (!valid) return;
            const month = parseInt(expDigits.slice(0, 2), 10);
            const year = 2000 + parseInt(expDigits.slice(2), 10);
            onSave({
              id: genId("card"),
              brand: detectBrand(digits),
              last4: digits.slice(-4),
              expMonth: month,
              expYear: year,
              isDefault: false,
            });
          }}
          disabled={!valid}
          className="text-[15px] font-semibold disabled:opacity-40"
          style={{ color: ORANGE }}
        >
          Save
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
        <div className="flex flex-col gap-4">
          <MiniInput
            label="Card number"
            value={cardNumber}
            onChange={(v) => setCardNumber(v.replace(/\D/g, "").slice(0, 16))}
          />
          <div className="flex gap-3">
            <MiniInput
              label="MM/YY"
              value={expiry}
              onChange={(v) => setExpiry(v.replace(/\D/g, "").slice(0, 4))}
            />
            <MiniInput
              label="CVC"
              value={cvc}
              onChange={(v) => setCvc(v.replace(/\D/g, "").slice(0, 4))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[12px] font-medium text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-xl border bg-card px-3 py-2.5 text-[15px] font-medium text-card-foreground outline-none"
        style={{ borderColor: "var(--border)", fontFamily: SANS_STACK }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

function brandLabel(brand: string): string {
  switch (brand.toLowerCase()) {
    case "visa":
      return "Visa";
    case "mastercard":
      return "Mastercard";
    case "amex":
      return "Amex";
    case "discover":
      return "Discover";
    default:
      return brand;
  }
}

function formatSlotTime(h: number, m: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mm = m === 0 ? "00" : String(m).padStart(2, "0");
  return `${h12}:${mm} ${ampm}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatWhenLabel(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTimeOnly(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatShortWhen(ts: number): string {
  const d = new Date(ts);
  const date = d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  return `${date} at ${time}`;
}
