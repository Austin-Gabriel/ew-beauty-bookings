import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft, MapPin } from "lucide-react";
import {
  useCustomerProfile,
  genId,
  type Address,
} from "@/data/customer-store";

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
              Remove this address?
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
/*  Add / Edit sheet                                                    */
/* ------------------------------------------------------------------ */

function AddressFormSheet({
  address,
  isOnlyDefault,
  onSave,
  onCancel,
}: {
  address: Address | null;
  isOnlyDefault: boolean;
  onSave: (a: Address) => void;
  onCancel: () => void;
}) {
  const isEdit = address !== null;
  const [label, setLabel] = useState(address?.label ?? "");
  const [street, setStreet] = useState(address?.street ?? "");
  const [apt, setApt] = useState(address?.apt ?? "");
  const [city, setCity] = useState(address?.city ?? "Brooklyn");
  const [st, setSt] = useState(address?.state ?? "NY");
  const [zip, setZip] = useState(address?.zip ?? "");
  const [isDefault, setIsDefault] = useState(address?.isDefault ?? false);

  const valid = label.trim() && street.trim() && city.trim() && st.trim() && zip.trim();

  function handleSave() {
    if (!valid) return;
    onSave({
      id: address?.id ?? genId("addr"),
      label: label.trim(),
      street: street.trim(),
      apt: apt.trim(),
      city: city.trim(),
      state: st.trim(),
      zip: zip.trim(),
      isDefault,
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
          {isEdit ? "Edit address" : "Add address"}
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
          <FormCard eyebrow="Label">
            <FloatingInput label="Label" value={label} onChange={setLabel} placeholder="Home, Work, Mom's place" />
          </FormCard>

          <FormCard eyebrow="Address">
            <FloatingInput label="Street address" value={street} onChange={setStreet} />
            <div className="ml-4 border-b border-hairline" />
            <FloatingInput label="Apartment, suite, etc." value={apt} onChange={setApt} />
            <div className="ml-4 border-b border-hairline" />
            <FloatingInput label="City" value={city} onChange={setCity} />
            <div className="ml-4 border-b border-hairline" />
            <div className="flex">
              <div className="flex-1">
                <FloatingInput label="State" value={st} onChange={setSt} />
              </div>
              <div className="w-px bg-hairline" />
              <div className="flex-1">
                <FloatingInput label="ZIP" value={zip} onChange={setZip} />
              </div>
            </div>
          </FormCard>

          {isEdit && (
            <FormCard eyebrow="Options">
              <div className="flex items-center justify-between px-4 py-3.5">
                <span className="text-[15px] font-medium text-card-foreground">
                  Set as default address
                </span>
                <ToggleSwitch
                  checked={isDefault}
                  onChange={setIsDefault}
                  disabled={isOnlyDefault && isDefault}
                />
              </div>
            </FormCard>
          )}
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
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
        placeholder={lifted ? placeholder : undefined}
        className="w-full rounded-none bg-transparent px-4 pb-2.5 pt-6 text-[15px] font-medium text-card-foreground outline-none placeholder:text-on-card-muted/50"
      />
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-[30px] w-[50px] shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-bagel" : "bg-muted"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className="absolute top-[3px] left-[3px] block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: checked ? "translateX(20px)" : "translateX(0)" }}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Address card                                                        */
/* ------------------------------------------------------------------ */

function AddressCard({
  address,
  onEdit,
  onRemove,
  onTap,
}: {
  address: Address;
  onEdit: () => void;
  onRemove: () => void;
  onTap: () => void;
}) {
  const line2 = [address.city, address.state].filter(Boolean).join(", ");
  const line2Full = address.zip ? `${line2} ${address.zip}` : line2;

  return (
    <button
      type="button"
      onClick={onTap}
      className="w-full overflow-hidden rounded-2xl border border-hairline bg-card p-4 text-left shadow-sm transition-colors active:bg-muted/20"
    >
      <div className="flex items-center justify-between">
        <span className="text-[16px] font-semibold text-card-foreground">
          {address.label}
        </span>
        {address.isDefault && (
          <span className="rounded-full bg-bagel px-2 py-0.5 text-[11px] font-semibold text-bagel-foreground">
            Default
          </span>
        )}
      </div>

      <p className="mt-1 text-[15px] text-card-foreground">
        {address.street}
        {address.apt ? `, ${address.apt}` : ""}
      </p>
      <p className="text-[14px] text-on-card-muted">{line2Full}</p>

      <div className="mt-2.5 flex items-center gap-2">
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="text-[13px] font-medium text-card-foreground"
        >
          Edit
        </span>
        <span className="text-[13px] text-on-card-muted">·</span>
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="text-[13px] font-medium text-destructive"
        >
          Remove
        </span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function SavedAddressesPage() {
  const navigate = useNavigate();
  const { profile, addAddress, updateAddress, removeAddress } = useCustomerProfile();
  const addresses = profile.savedAddresses;
  const [showForm, setShowForm] = useState<"add" | Address | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<Address | null>(null);

  function handleSave(a: Address) {
    const exists = addresses.find((x) => x.id === a.id);
    if (exists) {
      updateAddress(a);
    } else {
      addAddress(a);
    }
    setShowForm(null);
  }

  function handleRemove(addr: Address) {
    removeAddress(addr.id);
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
          Saved addresses
        </span>
        <button
          onClick={() => setShowForm("add")}
          className="text-[15px] font-semibold text-bagel transition-opacity active:opacity-60"
        >
          + Add
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8">
          <MapPin size={32} className="text-muted-foreground" />
          <p className="text-[17px] font-semibold text-foreground">
            No saved addresses yet
          </p>
          <p className="text-center text-[14px] text-muted-foreground">
            Add your home, work, or anywhere you'd like a pro to come.
          </p>
          <button
            onClick={() => setShowForm("add")}
            className="mt-2 w-full rounded-2xl bg-bagel px-4 py-4 text-[15px] font-semibold text-bagel-foreground shadow-sm transition-opacity active:opacity-90"
          >
            Add an address
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 pb-8 pt-4">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.id}
              address={addr}
              onTap={() => setShowForm(addr)}
              onEdit={() => setShowForm(addr)}
              onRemove={() => setConfirmRemove(addr)}
            />
          ))}
        </div>
      )}

      {showForm !== null && (
        <AddressFormSheet
          address={showForm === "add" ? null : showForm}
          isOnlyDefault={
            showForm !== "add" &&
            showForm.isDefault &&
            addresses.length === 1
          }
          onSave={handleSave}
          onCancel={() => setShowForm(null)}
        />
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
