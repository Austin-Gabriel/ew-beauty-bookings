import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, CreditCard } from "lucide-react";
import {
  useCustomerProfile,
  genId,
  type PaymentCard,
  type CardBrand,
} from "@/data/customer-store";

/* ------------------------------------------------------------------ */
/*  Card brand display                                                  */
/* ------------------------------------------------------------------ */

const BRAND_LABELS: Record<CardBrand, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
  discover: "Discover",
};

function BrandIcon({ brand, size = 28 }: { brand: CardBrand; size?: number }) {
  const colors: Record<CardBrand, { bg: string; text: string; letter: string }> = {
    visa: { bg: "#1A1F71", text: "#FFFFFF", letter: "V" },
    mastercard: { bg: "#EB001B", text: "#FFFFFF", letter: "M" },
    amex: { bg: "#006FCF", text: "#FFFFFF", letter: "A" },
    discover: { bg: "#FF6000", text: "#FFFFFF", letter: "D" },
  };
  const c = colors[brand];
  return (
    <div
      className="grid shrink-0 place-items-center rounded-md"
      style={{ width: size, height: size * 0.7, backgroundColor: c.bg }}
    >
      <span style={{ color: c.text, fontSize: size * 0.35, fontWeight: 700, lineHeight: 1 }}>
        {c.letter}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Expiry helpers                                                      */
/* ------------------------------------------------------------------ */

function expiryLabel(month: number, year: number): { text: string; className: string } {
  const mm = String(month).padStart(2, "0");
  const yy = String(year).slice(-2);
  const now = new Date();
  const expDate = new Date(year, month);
  if (now >= expDate) return { text: `Expired ${mm}/${yy}`, className: "text-destructive" };
  const sixtyDays = new Date(now.getTime() + 60 * 86400000);
  if (sixtyDays >= expDate)
    return { text: `Expires ${mm}/${yy} — Expiring soon`, className: "text-destructive" };
  return { text: `Expires ${mm}/${yy}`, className: "text-on-card-muted" };
}

/* ------------------------------------------------------------------ */
/*  Confirmation sheet                                                  */
/* ------------------------------------------------------------------ */

function RemoveSheet({
  onCancel,
  onRemove,
}: {
  onCancel: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9997] flex items-end justify-center">
      <button
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-midnight/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[420px] space-y-2 p-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-hairline bg-card">
          <div className="px-5 py-4 text-center">
            <p className="text-[17px] font-semibold text-card-foreground">
              Remove this card?
            </p>
          </div>
          <div className="border-t border-hairline" />
          <button
            onClick={onCancel}
            className="w-full px-5 py-3.5 text-[15px] font-semibold text-card-foreground transition-colors active:bg-muted/30"
          >
            Cancel
          </button>
          <div className="border-t border-hairline" />
          <button
            onClick={onRemove}
            className="w-full px-5 py-3.5 text-[15px] font-semibold text-destructive transition-colors active:bg-muted/30"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Add card sheet                                                      */
/* ------------------------------------------------------------------ */

function AddCardSheet({
  onSave,
  onCancel,
}: {
  onSave: (c: PaymentCard) => void;
  onCancel: () => void;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");

  function detectBrand(num: string): CardBrand {
    const d = num.replace(/\s/g, "");
    if (d.startsWith("4")) return "visa";
    if (d.startsWith("5") || d.startsWith("2")) return "mastercard";
    if (d.startsWith("3")) return "amex";
    if (d.startsWith("6")) return "discover";
    return "visa";
  }

  function formatCardNumber(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }

  function formatExpiry(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  const digits = cardNumber.replace(/\D/g, "");
  const expDigits = expiry.replace(/\D/g, "");
  const valid = digits.length >= 15 && expDigits.length === 4 && cvc.length >= 3;

  function handleSave() {
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
  }

  return (
    <div className="fixed inset-0 z-[9997] flex flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <button
          onClick={onCancel}
          className="text-[15px] font-medium text-foreground transition-opacity active:opacity-60"
        >
          Cancel
        </button>
        <span className="text-[17px] font-semibold text-foreground">
          Add card
        </span>
        <button
          onClick={handleSave}
          disabled={!valid}
          className="text-[15px] font-semibold text-bagel transition-opacity disabled:opacity-40"
        >
          Save
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">
        <div className="flex flex-col gap-6">
          <FormCard eyebrow="Card details">
            <FloatingInput
              label="Name on card"
              value={name}
              onChange={setName}
            />
            <div className="ml-4 border-b border-hairline" />
            <FloatingInput
              label="Card number"
              value={formatCardNumber(cardNumber)}
              onChange={(v) => setCardNumber(v.replace(/\D/g, "").slice(0, 16))}
            />
            <div className="ml-4 border-b border-hairline" />
            <div className="flex">
              <div className="flex-1">
                <FloatingInput
                  label="MM/YY"
                  value={formatExpiry(expiry)}
                  onChange={(v) => setExpiry(v.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
              <div className="w-px bg-hairline" />
              <div className="flex-1">
                <FloatingInput
                  label="CVC"
                  value={cvc}
                  onChange={(v) => setCvc(v.replace(/\D/g, "").slice(0, 4))}
                />
              </div>
            </div>
          </FormCard>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared UI                                                           */
/* ------------------------------------------------------------------ */

function FormCard({ eyebrow, children }: { eyebrow: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 pl-1 text-[11px] font-semibold tracking-[0.1em] text-muted-foreground uppercase">
        {eyebrow}
      </p>
      <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-sm">
        {children}
      </div>
    </div>
  );
}

function FloatingInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      <label
        className={`pointer-events-none absolute left-4 transition-all duration-200 ${
          lifted
            ? "top-2 text-[11px] font-medium text-on-card-muted"
            : "top-1/2 -translate-y-1/2 text-[15px] text-on-card-muted"
        }`}
      >
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-none bg-transparent px-4 pb-2.5 pt-6 text-[15px] font-medium text-card-foreground outline-none"
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Card row                                                            */
/* ------------------------------------------------------------------ */

function PaymentCardRow({
  card,
  onSetDefault,
  onRemove,
}: {
  card: PaymentCard;
  onSetDefault: () => void;
  onRemove: () => void;
}) {
  const exp = expiryLabel(card.expMonth, card.expYear);

  return (
    <div className="overflow-hidden rounded-2xl border border-hairline bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <BrandIcon brand={card.brand} />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-semibold text-card-foreground">
              {BRAND_LABELS[card.brand]} · {card.last4}
            </span>
            {card.isDefault && (
              <span className="rounded-full bg-bagel px-2 py-0.5 text-[11px] font-semibold text-bagel-foreground">
                Default
              </span>
            )}
          </div>
          <p className={`mt-0.5 text-[13px] tabular ${exp.className}`}>{exp.text}</p>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        {!card.isDefault && (
          <>
            <button
              onClick={onSetDefault}
              className="text-[13px] font-medium text-card-foreground"
            >
              Set as default
            </button>
            <span className="text-[13px] text-on-card-muted">·</span>
          </>
        )}
        <button onClick={onRemove} className="text-[13px] font-medium text-destructive">
          Remove
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function PaymentMethodsPage() {
  const navigate = useNavigate();
  const { profile, addCard, removeCard, setDefaultCard } = useCustomerProfile();
  const cards = profile.paymentMethods;
  const [showAdd, setShowAdd] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<PaymentCard | null>(null);

  function handleAddCard(c: PaymentCard) {
    addCard(c);
    setShowAdd(false);
  }

  function handleRemove(card: PaymentCard) {
    removeCard(card.id);
    setConfirmRemove(null);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="grid h-9 w-9 place-items-center rounded-full transition-colors active:bg-muted/30"
          aria-label="Back"
        >
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <span className="text-[17px] font-semibold text-foreground">
          Payment methods
        </span>
        <button
          onClick={() => setShowAdd(true)}
          className="text-[15px] font-semibold text-bagel transition-opacity active:opacity-60"
        >
          + Add
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8">
          <CreditCard size={32} className="text-muted-foreground" />
          <p className="text-[17px] font-semibold text-foreground">
            No payment methods yet
          </p>
          <p className="text-center text-[14px] text-muted-foreground">
            Add a card to book a pro. We'll save it securely for next time.
          </p>
          <button
            onClick={() => setShowAdd(true)}
            className="mt-2 w-full rounded-2xl bg-bagel px-4 py-4 text-[15px] font-semibold text-bagel-foreground shadow-sm transition-opacity active:opacity-90"
          >
            Add a card
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
          {cards.map((card) => (
            <PaymentCardRow
              key={card.id}
              card={card}
              onSetDefault={() => setDefaultCard(card.id)}
              onRemove={() => setConfirmRemove(card)}
            />
          ))}
        </div>
      )}

      {showAdd && (
        <AddCardSheet onSave={handleAddCard} onCancel={() => setShowAdd(false)} />
      )}

      {confirmRemove && (
        <RemoveSheet
          onCancel={() => setConfirmRemove(null)}
          onRemove={() => handleRemove(confirmRemove)}
        />
      )}
    </div>
  );
}
