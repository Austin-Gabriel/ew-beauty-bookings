import { useState, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useCustomerProfile } from "@/data/customer-store";

/* ------------------------------------------------------------------ */
/*  Floating label input                                               */
/* ------------------------------------------------------------------ */

function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  const lifted = focused || filled;

  return (
    <div>
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
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-none bg-transparent px-4 pb-2.5 pt-6 text-[15px] font-medium text-card-foreground outline-none"
        />
      </div>
      {hint && (
        <p className="px-4 pb-3 pt-0.5 text-[13px] text-on-card-muted">{hint}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Masked phone input                                                  */
/* ------------------------------------------------------------------ */

function PhoneInput({
  value,
  onChange,
  hint,
}: {
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const [focused, setFocused] = useState(false);
  const filled = value.length > 0;
  const lifted = focused || filled;

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  function maskedDisplay(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.length < 4) return raw;
    return `(•••) •••-${digits.slice(-4)}`;
  }

  const displayValue = focused ? formatPhone(value) : maskedDisplay(value);

  return (
    <div>
      <div className="relative">
        <label
          className={`pointer-events-none absolute left-4 transition-all duration-200 ${
            lifted
              ? "top-2 text-[11px] font-medium text-on-card-muted"
              : "top-1/2 -translate-y-1/2 text-[15px] text-on-card-muted"
          }`}
        >
          Phone number
        </label>
        <input
          type="tel"
          value={displayValue}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
            onChange(digits);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-none bg-transparent px-4 pb-2.5 pt-6 text-[15px] font-medium text-card-foreground outline-none tabular"
        />
      </div>
      {hint && (
        <p className="px-4 pb-3 pt-0.5 text-[13px] text-on-card-muted">{hint}</p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Discard changes sheet                                               */
/* ------------------------------------------------------------------ */

function DiscardSheet({
  onKeep,
  onDiscard,
}: {
  onKeep: () => void;
  onDiscard: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9997] flex items-end justify-center">
      <button
        aria-label="Keep editing"
        onClick={onKeep}
        className="absolute inset-0 bg-midnight/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[420px] space-y-2 p-4 pb-8">
        <div className="overflow-hidden rounded-2xl border border-hairline bg-card">
          <div className="px-5 py-4 text-center">
            <p className="text-[17px] font-semibold text-card-foreground">
              Discard changes?
            </p>
          </div>
          <div className="border-t border-hairline" />
          <button
            onClick={onKeep}
            className="w-full px-5 py-3.5 text-[15px] font-semibold text-card-foreground transition-colors active:bg-muted/30"
          >
            Keep editing
          </button>
          <div className="border-t border-hairline" />
          <button
            onClick={onDiscard}
            className="w-full px-5 py-3.5 text-[15px] font-semibold text-destructive transition-colors active:bg-muted/30"
          >
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section card                                                        */
/* ------------------------------------------------------------------ */

function FormCard({
  eyebrow,
  children,
}: {
  eyebrow: string;
  children: React.ReactNode;
}) {
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

/* ------------------------------------------------------------------ */
/*  Edit Profile Page                                                   */
/* ------------------------------------------------------------------ */

export function EditProfilePage() {
  const navigate = useNavigate();
  const { profile, updateIdentity } = useCustomerProfile();

  const [name, setName] = useState(profile.identity.name);
  const [email, setEmail] = useState(profile.identity.email);
  const [phone, setPhone] = useState(profile.identity.phone);
  const [saving, setSaving] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);

  const origRef = useRef({
    name: profile.identity.name,
    email: profile.identity.email,
    phone: profile.identity.phone,
  });

  const hasChanges =
    name !== origRef.current.name ||
    email !== origRef.current.email ||
    phone !== origRef.current.phone;

  function handleBack() {
    if (hasChanges) {
      setShowDiscard(true);
    } else {
      navigate({ to: "/profile" });
    }
  }

  function handleSave() {
    setSaving(true);
    setTimeout(() => {
      updateIdentity({ name, email, phone });
      setSaving(false);
      navigate({ to: "/profile" });
    }, 600);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex h-12 shrink-0 items-center justify-between px-4">
        <button
          onClick={handleBack}
          className="grid h-9 w-9 place-items-center rounded-full transition-colors active:bg-muted/30"
          aria-label="Back"
        >
          <ChevronLeft size={22} className="text-foreground" />
        </button>
        <span className="text-[17px] font-semibold text-foreground">
          Edit profile
        </span>
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="text-[15px] font-semibold text-bagel transition-opacity disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-8 pt-4">
        <FormCard eyebrow="Name">
          <FloatingInput
            label="Full name"
            value={name}
            onChange={setName}
          />
        </FormCard>

        <FormCard eyebrow="Email">
          <FloatingInput
            label="Email address"
            value={email}
            onChange={setEmail}
            type="email"
            hint="We'll send a confirmation link to verify changes."
          />
        </FormCard>

        <FormCard eyebrow="Phone">
          <PhoneInput
            value={phone}
            onChange={setPhone}
            hint="We'll send a code to verify changes."
          />
        </FormCard>
      </div>

      {showDiscard && (
        <DiscardSheet
          onKeep={() => setShowDiscard(false)}
          onDiscard={() => navigate({ to: "/profile" })}
        />
      )}
    </div>
  );
}
