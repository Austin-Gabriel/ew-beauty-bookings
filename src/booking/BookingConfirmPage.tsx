import { useState, useMemo } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Scissors,
  MapPin,
  CreditCard,
  Star,
} from "lucide-react";
import { MOCK_PROS } from "@/data/mock-pros";
import { useCustomerProfile, genId, type Address, type PaymentCard } from "@/data/customer-store";
import { useBookings } from "@/data/bookings-store";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookingConfirmPage({ proId, serviceId }: { proId: string; serviceId?: string }) {
  const pro = MOCK_PROS.find((p) => p.id === proId);
  const router = useRouter();
  const navigate = useNavigate();
  const {
    profile,
    addAddress,
    addCard,
  } = useCustomerProfile();
  const { createBooking } = useBookings();

  const addresses = profile.savedAddresses;
  const cards = profile.paymentMethods;

  // Selected service index — pre-select from serviceId query param if provided
  const initialServiceIdx = serviceId && pro
    ? Math.max(0, pro.services.findIndex((s) => s.name === serviceId))
    : 0;
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(initialServiceIdx);
  // Selected address id — default to the default address
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(() => {
    const def = addresses.find((a) => a.isDefault) ?? addresses[0];
    return def?.id ?? null;
  });
  // Selected card id — default to the default card
  const [selectedCardId, setSelectedCardId] = useState<string | null>(() => {
    const def = cards.find((c) => c.isDefault) ?? cards[0];
    return def?.id ?? null;
  });
  // Sheets
  const [showWhenSheet, setShowWhenSheet] = useState(false);
  const [showServiceSheet, setShowServiceSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showCardSheet, setShowCardSheet] = useState(false);
  const [showScheduledStub, setShowScheduledStub] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  // Loading
  const [confirming, setConfirming] = useState(false);

  // Auto-select newly added address/card if none selected
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
        <p className="text-[17px] font-semibold text-foreground">Pro not found</p>
        <button
          type="button"
          onClick={() => navigate({ to: "/discover" })}
          className="mt-4 rounded-full bg-bagel px-5 py-2.5 text-[14px] font-semibold text-bagel-foreground"
        >
          Back to Discover
        </button>
      </div>
    );
  }

  const selectedService = pro.services[selectedServiceIdx] ?? pro.services[0];

  // Tipping logic — read from shared store
  const tipPref = profile.tippingPreference;
  const tipPct =
    tipPref.type === "ask"
      ? null
      : tipPref.value ?? 20;

  const servicePrice = selectedService?.priceFrom ?? 0;
  const tipAmount = tipPct != null ? (servicePrice * tipPct) / 100 : null;
  const total = tipAmount != null ? servicePrice + tipAmount : servicePrice;

  const canConfirm = !!selectedAddress && !!selectedCard && !confirming;

  const initials = initialsOf(pro.name);
  const proFirstName = pro.name.split(" ")[0];

  const handleConfirm = () => {
    if (!pro || !selectedService) return;
    setConfirming(true);
    setTimeout(() => {
      const newId = createBooking({
        proId,
        service: {
          name: selectedService.name,
          durationLabel: "60 min",
          price: selectedService.priceFrom,
        },
        location: selectedAddress
          ? { type: "mobile", label: selectedAddress.label || selectedAddress.street }
          : { type: "mobile", label: "Your home" },
        bookingType: "on-demand",
        total,
        tipAmount: tipAmount ?? undefined,
        addressId: selectedAddress?.id,
        paymentMethodId: selectedCard?.id,
      });
      navigate({
        to: "/booking/searching/$bookingId",
        params: { bookingId: newId },
        search: { proId },
      });
    }, 600);
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream dark:bg-midnight">
      {/* Top bar */}
      <div className="relative flex h-12 shrink-0 items-center px-4">
        <button
          type="button"
          onClick={() => router.history.back()}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="pointer-events-none absolute inset-x-0 text-center text-[17px] font-semibold text-foreground">
          Confirm booking
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        {/* Pro summary card */}
        <div className="rounded-2xl bg-card p-4">
          <div className="flex items-center gap-3.5">
            <div
              className="grid h-14 w-14 shrink-0 place-items-center rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.9 0.04 60) 0%, oklch(0.82 0.08 45) 100%)",
                color: "var(--midnight)",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-semibold text-card-foreground">
                {pro.name}
              </p>
              <p className="truncate text-[14px] text-on-card-muted">
                {pro.specializations[0]} · {pro.neighborhood}
              </p>
              <div className="mt-0.5 flex items-center gap-1 text-[13px] text-on-card-muted">
                <Star size={12} className="text-bagel" fill="currentColor" />
                <span className="tabular font-medium text-card-foreground">
                  {pro.rating.toFixed(2)}
                </span>
                <span className="tabular">({pro.reviewCount})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking details card */}
        <div className="mt-3 rounded-2xl bg-card">
          <DetailRow
            icon={<Clock size={18} />}
            label="When"
            value="Now — earliest available"
            onTap={() => setShowWhenSheet(true)}
          />
          <Divider />
          <DetailRow
            icon={<Scissors size={18} />}
            label="Service"
            value={
              selectedService
                ? `${selectedService.name} · $${selectedService.priceFrom}`
                : "Select a service"
            }
            valueTabular
            onTap={() => setShowServiceSheet(true)}
          />
          <Divider />
          <DetailRow
            icon={<MapPin size={18} />}
            label="Address"
            value={
              selectedAddress
                ? selectedAddress.label
                  ? `${selectedAddress.label} — ${selectedAddress.city}`
                  : selectedAddress.street
                : undefined
            }
            placeholder="Add an address"
            onTap={() => setShowAddressSheet(true)}
          />
        </div>

        {/* Payment card */}
        <div className="mt-3 rounded-2xl bg-card">
          <DetailRow
            icon={<CreditCard size={18} />}
            label="Payment"
            value={
              selectedCard
                ? `${brandLabel(selectedCard.brand)} · ${selectedCard.last4}`
                : undefined
            }
            valueTabular={!!selectedCard}
            placeholder="Add a card to book"
            onTap={() => setShowCardSheet(true)}
          />
        </div>

        {/* Total breakdown */}
        <div className="mt-3 rounded-2xl bg-card p-4">
          <div className="flex items-center justify-between text-[15px] text-card-foreground">
            <span>Service</span>
            <span className="tabular font-medium">${servicePrice.toFixed(2)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[15px]">
            {tipPct != null ? (
              <>
                <span className="text-card-foreground">
                  Estimated tip ({tipPct}%)
                </span>
                <span className="tabular font-medium text-card-foreground">
                  ${tipAmount!.toFixed(2)}
                </span>
              </>
            ) : (
              <>
                <span className="text-on-card-muted">
                  Tip — added after service
                </span>
                <span />
              </>
            )}
          </div>
          <div
            className="my-3"
            style={{ height: 1, backgroundColor: "var(--hairline)" }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-semibold text-card-foreground">Total</span>
            <span className="tabular text-[17px] font-semibold text-card-foreground">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        <p className="mt-3 px-1 text-[13px] text-muted-foreground">
          Your card is held now and charged when {proFirstName} accepts.
        </p>
      </div>

      {/* Sticky confirm button */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-cream px-4 pb-[max(env(safe-area-inset-bottom,0px),12px)] pt-3 dark:bg-midnight">
        <button
          type="button"
          disabled={!canConfirm}
          onClick={handleConfirm}
          className="flex h-[52px] w-full items-center justify-center rounded-2xl bg-bagel text-[16px] font-semibold text-bagel-foreground transition-opacity disabled:opacity-40"
        >
          {confirming ? (
            <div className="h-5 w-5 rounded-full border-2 border-bagel-foreground border-t-transparent animate-spin" />
          ) : (
            "Confirm booking"
          )}
        </button>
      </div>

      {/* ── Sheets ────────────────────────────────── */}

      {showWhenSheet && (
        <Sheet title="When" onClose={() => setShowWhenSheet(false)}>
          <SheetOption label="Now — earliest available" selected onTap={() => setShowWhenSheet(false)} />
          <SheetOption
            label="Schedule for later"
            selected={false}
            onTap={() => {
              setShowWhenSheet(false);
              setShowScheduledStub(true);
            }}
          />
        </Sheet>
      )}

      {showScheduledStub && (
        <Sheet title="Schedule for later" onClose={() => setShowScheduledStub(false)}>
          <div className="px-4 py-8 text-center">
            <p className="text-[17px] font-semibold text-card-foreground">
              Scheduled bookings — coming soon
            </p>
            <p className="mt-2 text-[14px] text-on-card-muted">
              We're building scheduled booking support. For now, choose "Now" to
              book with the earliest available slot.
            </p>
          </div>
        </Sheet>
      )}

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

      {/* Address picker sheet */}
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
            className="w-full px-4 py-3 text-left text-[15px] font-medium text-bagel"
          >
            + Add a new address
          </button>
        </Sheet>
      )}

      {/* Inline add address form */}
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

      {/* Card picker sheet */}
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
            className="w-full px-4 py-3 text-left text-[15px] font-medium text-bagel"
          >
            + Add a new card
          </button>
        </Sheet>
      )}

      {/* Inline add card form */}
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Inline Add Address Form (within booking flow)                      */
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
    <div className="fixed inset-0 z-[9997] flex flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <button onClick={onCancel} className="text-[15px] font-medium text-foreground">Cancel</button>
        <span className="text-[17px] font-semibold text-foreground">Add address</span>
        <button
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
          className="text-[15px] font-semibold text-bagel disabled:opacity-40"
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

/* ------------------------------------------------------------------ */
/*  Inline Add Card Form (within booking flow)                         */
/* ------------------------------------------------------------------ */

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
    <div className="fixed inset-0 z-[9997] flex flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <button onClick={onCancel} className="text-[15px] font-medium text-foreground">Cancel</button>
        <span className="text-[17px] font-semibold text-foreground">Add card</span>
        <button
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
          className="text-[15px] font-semibold text-bagel disabled:opacity-40"
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
        className="rounded-xl border border-hairline bg-card px-3 py-2.5 text-[15px] font-medium text-card-foreground outline-none placeholder:text-on-card-muted/50 focus:border-bagel"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function DetailRow({
  icon,
  label,
  value,
  valueTabular,
  placeholder,
  onTap,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
  valueTabular?: boolean;
  placeholder?: string;
  onTap: () => void;
}) {
  const hasValue = !!value;
  return (
    <button
      type="button"
      onClick={onTap}
      className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-card-foreground/5 text-card-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-on-card-muted">{label}</p>
        <p
          className={`mt-0.5 truncate text-[15px] font-medium ${
            hasValue
              ? `text-card-foreground ${valueTabular ? "tabular" : ""}`
              : "text-bagel"
          }`}
        >
          {value ?? placeholder ?? "Select"}
        </p>
      </div>
      <ChevronRight size={16} className="shrink-0 text-on-card-muted" />
    </button>
  );
}

function Divider() {
  return (
    <div className="mx-4" style={{ height: 1, backgroundColor: "var(--hairline)" }} />
  );
}

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
        className="absolute inset-0 bg-midnight/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[420px] rounded-t-3xl bg-card pb-[max(env(safe-area-inset-bottom,0px),16px)] shadow-2xl">
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-card-foreground/15" />
        <p className="px-4 pt-4 pb-2 text-[17px] font-semibold text-card-foreground">
          {title}
        </p>
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
      className={`flex w-full items-center justify-between px-4 py-3 text-left ${
        selected ? "bg-bagel/8" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-card-foreground">{label}</p>
        {detail && (
          <p className="mt-0.5 text-[13px] tabular text-on-card-muted">{detail}</p>
        )}
      </div>
      {selected && (
        <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-bagel text-bagel-foreground">
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
      )}
    </button>
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
    case "visa": return "Visa";
    case "mastercard": return "Mastercard";
    case "amex": return "Amex";
    case "discover": return "Discover";
    default: return brand;
  }
}
