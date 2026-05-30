import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  Phone,
  Plus,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";

type EmergencyContact = {
  id: string;
  name: string;
  phone: string;
  relationship: string;
};

const STORAGE_KEY = "ewa.safety.emergency-contacts.v1";

function readContacts(): EmergencyContact[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED_CONTACTS;
    return JSON.parse(raw) as EmergencyContact[];
  } catch {
    return SEED_CONTACTS;
  }
}

const SEED_CONTACTS: EmergencyContact[] = [
  { id: "ec-1", name: "Mom", phone: "(917) 555-2941", relationship: "Family" },
  { id: "ec-2", name: "Tasha B.", phone: "(917) 555-8104", relationship: "Friend" },
];

export function EmergencyContactsPage() {
  const router = useRouter();
  const { text } = useAuthTheme();
  const [contacts, setContacts] = useState<EmergencyContact[]>(readContacts);
  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const persist = (next: EmergencyContact[]) => {
    setContacts(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const remove = (id: string) => {
    const next = contacts.filter((c) => c.id !== id);
    persist(next);
    toast("Contact removed");
  };

  const upsert = (c: EmergencyContact) => {
    const exists = contacts.find((x) => x.id === c.id);
    const next = exists ? contacts.map((x) => (x.id === c.id ? c : x)) : [...contacts, c];
    persist(next);
    toast.success(exists ? "Contact updated" : "Contact added");
    setEditing(null);
    setAddOpen(false);
  };

  return (
    <AppShell>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
        style={{ backgroundColor: "var(--bg, var(--background))", borderColor: "var(--border)", fontFamily: SANS_STACK }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ backgroundColor: "var(--surface-elevated)", color: text }}
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600, color: text, letterSpacing: "-0.01em" }}>
          Emergency contacts
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-5 pb-12" style={{ fontFamily: SANS_STACK }}>
        <p style={{ fontSize: 13.5, color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          These contacts will be notified with your live location and appointment details if you trigger an SOS. We'll never share their info back to anyone else.
        </p>

        {contacts.length === 0 ? (
          <div
            className="mt-6 grid place-items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center"
            style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
          >
            <UserPlus size={28} />
            <p className="mt-3" style={{ fontSize: 14, fontWeight: 600, color: text }}>
              No contacts yet
            </p>
            <p className="mt-1 max-w-[260px]" style={{ fontSize: 12.5, lineHeight: 1.5 }}>
              Add 1–3 trusted people. We recommend at least one local contact.
            </p>
          </div>
        ) : (
          <ul
            className="mt-5 overflow-hidden rounded-2xl border bg-card"
            style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
          >
            {contacts.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setEditing(c)}
                  className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left transition-colors active:bg-muted/30"
                >
                  <div
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                    style={{ background: "linear-gradient(135deg, #FFD9C7 0%, #FFBBA0 100%)", color: "#7C2D12", fontSize: 13, fontWeight: 700 }}
                  >
                    {c.name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <span className="min-w-0 flex-1">
                    <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>{c.name}</p>
                    <p className="mt-0.5" style={{ fontSize: 12, color: "var(--on-card-muted)" }}>
                      {c.relationship} · {c.phone}
                    </p>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(c.id);
                    }}
                    aria-label={`Remove ${c.name}`}
                    className="grid h-8 w-8 place-items-center rounded-full"
                    style={{ backgroundColor: "rgba(220,38,38,0.10)", color: "#DC2626" }}
                  >
                    <Trash2 size={13} />
                  </button>
                </button>
                {i < contacts.length - 1 && <div className="ml-[60px] border-b" style={{ borderColor: "var(--border)" }} />}
              </li>
            ))}
          </ul>
        )}

        {contacts.length < 5 && (
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-3.5"
            style={{ borderColor: "var(--border)", color: ORANGE, fontSize: 14, fontWeight: 600, fontFamily: SANS_STACK }}
          >
            <Plus size={16} />
            Add a contact
          </button>
        )}
      </div>

      {(addOpen || editing) && (
        <ContactSheet
          initial={editing}
          onClose={() => {
            setAddOpen(false);
            setEditing(null);
          }}
          onSave={upsert}
        />
      )}
    </AppShell>
  );
}

function ContactSheet({
  initial,
  onClose,
  onSave,
}: {
  initial: EmergencyContact | null;
  onClose: () => void;
  onSave: (c: EmergencyContact) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [relationship, setRelationship] = useState(initial?.relationship ?? "Family");

  const RELATIONSHIPS = ["Family", "Friend", "Partner", "Roommate", "Other"];
  const canSave = name.trim().length > 1 && phone.trim().length >= 7;

  const save = () => {
    if (!canSave) return;
    onSave({
      id: initial?.id ?? `ec-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      relationship,
    });
  };

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        role="dialog"
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-[420px] flex-col rounded-t-3xl bg-card"
        style={{
          maxHeight: "92vh",
          fontFamily: SANS_STACK,
        }}
      >
        <div className="shrink-0 px-5 pt-2">
          <div className="mx-auto mb-3 mt-2 h-1 w-10 rounded-full" style={{ backgroundColor: "rgba(127,127,127,0.2)" }} />
          <div className="flex items-center justify-between">
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.015em" }}>
              {initial ? "Edit contact" : "Add a contact"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full"
              style={{ backgroundColor: "var(--surface-elevated)", color: "var(--card-foreground)" }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
          <div className="flex flex-col gap-3">
            <Field label="Name">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mom"
                className="w-full rounded-xl border-none px-3.5 py-3 outline-none"
                style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)", fontSize: 14, fontFamily: SANS_STACK }}
              />
            </Field>
            <Field label="Phone">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(917) 555-1234"
                className="w-full rounded-xl border-none px-3.5 py-3 outline-none"
                style={{ backgroundColor: "var(--surface-elevated)", color: "var(--foreground)", fontSize: 14, fontFamily: SANS_STACK }}
              />
            </Field>
            <Field label="Relationship">
              <div className="flex flex-wrap gap-1.5">
                {RELATIONSHIPS.map((r) => {
                  const active = relationship === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRelationship(r)}
                      className="rounded-full border px-3 py-1.5"
                      style={{
                        backgroundColor: active ? ORANGE : "var(--surface-elevated)",
                        borderColor: active ? ORANGE : "transparent",
                        color: active ? "#1A0E08" : "var(--card-foreground)",
                        fontFamily: SANS_STACK,
                        fontSize: 12.5,
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </div>

        <div
          className="shrink-0 border-t bg-card px-5 pt-3"
          style={{
            borderColor: "var(--border)",
            paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)",
          }}
        >
          <button
            type="button"
            onClick={save}
            disabled={!canSave}
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl py-3.5 transition-transform active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 15, fontWeight: 600, fontFamily: SANS_STACK }}
          >
            <Phone size={15} />
            {initial ? "Save changes" : "Add contact"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span
        className="block"
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--on-card-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
