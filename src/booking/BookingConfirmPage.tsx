import { useState, useEffect, useMemo } from "react";
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
import { MOCK_PROS, type Pro } from "@/data/mock-pros";
import {
  useDevState,
  type BookingConfirmState,
} from "@/dev-state/devState";

/* ------------------------------------------------------------------ */
/*  Session helpers (reuse same storage keys as profile subscreens)     */
/* ------------------------------------------------------------------ */

type Address = {
  id: string;
  label: string;
  street: string;
  apt: string;
  city: string;
  state: string;
  zip: string;
  isDefault: boolean;
};

type PaymentCard = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

function readAddresses(): Address[] {
  try {
    const raw = sessionStorage.getItem("ewa.profile.addresses");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function readCards(): PaymentCard[] {
  try {
    const raw = sessionStorage.getItem("ewa.profile.paymentMethods");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function BookingConfirmPage({ proId, serviceId }: { proId: string; serviceId?: string }) {
  const pro = MOCK_PROS.find((p) => p.id === proId);
  const router = useRouter();
  const navigate = useNavigate();
  const { state: devState } = useDevState();
  const confirmState = devState.bookingConfirmState;

  // Selected service index — pre-select from serviceId query param if provided
  const initialServiceIdx = serviceId && pro
    ? Math.max(0, pro.services.findIndex((s) => s.name === serviceId))
    : 0;
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(initialServiceIdx);
  // Selected address id
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  // Selected card id
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  // Sheets
  const [showWhenSheet, setShowWhenSheet] = useState(false);
  const [showServiceSheet, setShowServiceSheet] = useState(false);
  const [showAddressSheet, setShowAddressSheet] = useState(false);
  const [showCardSheet, setShowCardSheet] = useState(false);
  const [showScheduledStub, setShowScheduledStub] = useState(false);
  // Loading
  const [confirming, setConfirming] = useState(false);

  // Resolve addresses & cards based on devState
  const addresses = useMemo(() => {
    if (confirmState === "missing-address") return [];
    const stored = readAddresses();
    if (stored.length > 0) return stored;
    // Provide mock defaults from customer profile
    if (devState.profileState === "new") return [];
    return [
      {
        id: "mock-home",
        label: "Home",
        street: "456 Halsey St",
        apt: "",
        city: "Brooklyn",
        state: "NY",
        zip: "11233",
        isDefault: true,
      },
    ];
  }, [confirmState, devState.profileState]);

  const cards = useMemo(() => {
    if (confirmState === "missing-payment") return [];
    const stored = readCards();
    if (stored.length > 0) return stored;
    if (devState.profileState === "new") return [];
    return [
      {
        id: "mock-visa",
        brand: "visa",
        last4: "4421",
        expMonth: 12,
        expYear: 2027,
        isDefault: true,
      },
    ];
  }, [confirmState, devState.profileState]);

  // Auto-select defaults
  useEffect(() => {
    const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
    setSelectedAddressId(defaultAddr?.id ?? null);
  }, [addresses]);

  useEffect(() => {
    const defaultCard = cards.find((c) => c.isDefault) ?? cards[0];
    setSelectedCardId(defaultCard?.id ?? null);
  }, [cards]);

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
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const selectedCard = cards.find((c) => c.id === selectedCardId);

  // Tipping logic
  const tipPref =
    confirmState === "always-ask-tip"
      ? "ask"
      : confirmState === "custom-tip"
        ? "custom"
        : devState.tippingPreference;
  const tipCustomVal =
    confirmState === "custom-tip" ? 22 : devState.tippingCustomValue;
  const tipPct =
    tipPref === "ask"
      ? null
      : tipPref === "custom"
        ? tipCustomVal
        : parseInt(tipPref, 10);

  const servicePrice = selectedService?.priceFrom ?? 0;
  const tipAmount = tipPct != null ? (servicePrice * tipPct) / 100 : null;
  const total = tipAmount != null ? servicePrice + tipAmount : servicePrice;

  const canConfirm = !!selectedAddress && !!selectedCard && !confirming;

  const initials = initialsOf(pro.name);
  const proFirstName = pro.name.split(" ")[0];

  const handleConfirm = () => {
    setConfirming(true);
    setTimeout(() => {
      const bookingId = `bk-${Date.now()}`;
      navigate({
        to: "/booking/searching/$bookingId",
        params: { bookingId },
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
                <Star
                  size={12}
                  className="text-bagel"
                  fill="currentColor"
                />
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
          {/* When */}
          <DetailRow
            icon={<Clock size={18} />}
            label="When"
            value="Now — earliest available"
            onTap={() => setShowWhenSheet(true)}
          />
          <Divider />
          {/* What */}
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
          {/* Where */}
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
            <span className="tabular font-medium">
              ${servicePrice.toFixed(2)}
            </span>
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
            style={{
              height: 1,
              backgroundColor: "var(--hairline)",
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-[17px] font-semibold text-card-foreground">
              Total
            </span>
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
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-hairline bg-cream px-4 pb-[max(env(safe-area-inset-bottom,0px),12px)] pt-3 dark:bg-midnight"
      >
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

      {/* When sheet */}
      {showWhenSheet && (
        <Sheet title="When" onClose={() => setShowWhenSheet(false)}>
          <SheetOption
            label="Now — earliest available"
            selected
            onTap={() => setShowWhenSheet(false)}
          />
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

      {/* Scheduled stub sheet */}
      {showScheduledStub && (
        <Sheet
          title="Schedule for later"
          onClose={() => setShowScheduledStub(false)}
        >
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

      {/* Service sheet */}
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

      {/* Address sheet */}
      {showAddressSheet && (
        <Sheet
          title="Choose an address"
          onClose={() => setShowAddressSheet(false)}
        >
          {addresses.map((a) => (
            <SheetOption
              key={a.id}
              label={a.label || a.street}
              detail={`${a.city}, ${a.state} ${a.zip}`}
              selected={a.id === selectedAddressId}
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
              navigate({ to: "/profile/addresses" });
            }}
            className="w-full px-4 py-3 text-left text-[15px] font-medium text-bagel"
          >
            + Add a new address
          </button>
        </Sheet>
      )}

      {/* Card sheet */}
      {showCardSheet && (
        <Sheet
          title="Choose a card"
          onClose={() => setShowCardSheet(false)}
        >
          {cards.map((c) => (
            <SheetOption
              key={c.id}
              label={`${brandLabel(c.brand)} · ${c.last4}`}
              detail={`Exp ${String(c.expMonth).padStart(2, "0")}/${c.expYear}`}
              selected={c.id === selectedCardId}
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
              navigate({ to: "/profile/payment-methods" });
            }}
            className="w-full px-4 py-3 text-left text-[15px] font-medium text-bagel"
          >
            + Add a new card
          </button>
        </Sheet>
      )}
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
          <p className="mt-0.5 text-[13px] tabular text-on-card-muted">
            {detail}
          </p>
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
