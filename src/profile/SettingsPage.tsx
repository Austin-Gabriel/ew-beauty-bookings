import { useState } from "react";
import { useRouter, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ChevronLeft,
  ChevronRight,
  Bell,
  Globe,
  Sun,
  Lock,
  Fingerprint,
  Eye,
  Mail,
  ShieldCheck,
  Database,
  Trash2,
} from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const DANGER = "#DC2626";

type Toggle = { id: string; label: string; meta?: string; default: boolean };

const SECURITY_TOGGLES: Toggle[] = [
  { id: "biometrics", label: "Face ID at unlock", meta: "Confirm with Face ID when opening Ewà", default: true },
  { id: "booking-confirm", label: "Biometric on booking", meta: "Confirm with Face ID before placing a booking", default: true },
  { id: "hide-history", label: "Hide booking history", meta: "Blurs the bookings tab until unlocked", default: false },
];

const PRIVACY_TOGGLES: Toggle[] = [
  { id: "share-rating", label: "Share my client rating with pros", meta: "Pros see your 4.9 rating before accepting", default: true },
  { id: "marketing", label: "Marketing emails", meta: "Tips, promos, and stylist features", default: false },
  { id: "analytics", label: "Anonymous analytics", meta: "Help us improve Ewà — we never share personal data", default: true },
];

export function SettingsPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const [security, setSecurity] = useState<Record<string, boolean>>(
    Object.fromEntries(SECURITY_TOGGLES.map((t) => [t.id, t.default])),
  );
  const [privacy, setPrivacy] = useState<Record<string, boolean>>(
    Object.fromEntries(PRIVACY_TOGGLES.map((t) => [t.id, t.default])),
  );

  return (
    <div className="flex min-h-full flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      <header
        className="sticky top-0 z-30 flex items-center gap-3 border-b px-5 py-3.5"
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
        <h1 className="flex-1 text-center" style={{ fontSize: 16, fontWeight: 600, color: "var(--foreground)", letterSpacing: "-0.01em" }}>
          Settings
        </h1>
        <span className="w-9" />
      </header>

      <div className="px-5 pt-4 pb-12">
        <SectionLabel>General</SectionLabel>
        <Card>
          <NavRow
            icon={Bell}
            label="Notifications"
            meta="Push, email, SMS"
            onClick={() => navigate({ to: "/profile/notifications" })}
          />
          <NavRow
            icon={Globe}
            label="Language"
            value="English"
            onClick={() => navigate({ to: "/profile/language" })}
          />
          <NavRow
            icon={Sun}
            label="Appearance"
            value="System"
            onClick={() => navigate({ to: "/profile/theme" })}
            last
          />
        </Card>

        <SectionLabel>Security</SectionLabel>
        <Card>
          {SECURITY_TOGGLES.map((t, i) => (
            <ToggleRow
              key={t.id}
              icon={t.id === "biometrics" || t.id === "booking-confirm" ? Fingerprint : Eye}
              label={t.label}
              meta={t.meta}
              value={security[t.id] ?? false}
              onChange={(v) => setSecurity((s) => ({ ...s, [t.id]: v }))}
              last={i === SECURITY_TOGGLES.length - 1}
            />
          ))}
        </Card>

        <SectionLabel>Privacy</SectionLabel>
        <Card>
          {PRIVACY_TOGGLES.map((t, i) => (
            <ToggleRow
              key={t.id}
              icon={t.id === "share-rating" ? ShieldCheck : t.id === "marketing" ? Mail : Database}
              label={t.label}
              meta={t.meta}
              value={privacy[t.id] ?? false}
              onChange={(v) => setPrivacy((p) => ({ ...p, [t.id]: v }))}
              last={i === PRIVACY_TOGGLES.length - 1}
            />
          ))}
        </Card>

        <SectionLabel>Account</SectionLabel>
        <Card>
          <NavRow
            icon={Lock}
            label="Change password"
            onClick={() => toast("Password reset email sent")}
          />
          <NavRow
            icon={Database}
            label="Download my data"
            meta="We'll email a CSV within 24 hours"
            onClick={() => toast.success("Data export started — check your email")}
            last
          />
        </Card>

        <Card>
          <DangerRow
            icon={Trash2}
            label="Delete account"
            meta="This is permanent — your bookings and reviews are removed"
            onClick={() => toast("Contact support@ewatheapp.com to delete your account")}
          />
        </Card>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="pt-5 pb-2.5"
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--muted-foreground)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
      }}
    >
      {children}
    </p>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden rounded-2xl border bg-card"
      style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
    >
      {children}
    </div>
  );
}

function NavRow({
  icon: Icon,
  label,
  meta,
  value,
  onClick,
  last = false,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  meta?: string;
  value?: string;
  onClick: () => void;
  last?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted/30"
      >
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--card-foreground)" }}
        >
          <Icon size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--card-foreground)" }}>{label}</p>
          {meta && (
            <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
              {meta}
            </p>
          )}
        </span>
        {value && (
          <span style={{ fontSize: 12.5, color: "var(--on-card-muted)", fontWeight: 500 }}>{value}</span>
        )}
        <ChevronRight size={14} style={{ color: "var(--on-card-muted)" }} />
      </button>
      {!last && <div className="ml-[58px] border-b" style={{ borderColor: "var(--border)" }} />}
    </>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  meta,
  value,
  onChange,
  last = false,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  meta?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--card-foreground)" }}
        >
          <Icon size={14} />
        </span>
        <span className="min-w-0 flex-1">
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--card-foreground)" }}>{label}</p>
          {meta && (
            <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
              {meta}
            </p>
          )}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={value}
          aria-label={label}
          onClick={() => onChange(!value)}
          className="relative shrink-0 rounded-full transition-colors"
          style={{
            width: 42,
            height: 24,
            backgroundColor: value ? "#16A34A" : "var(--border)",
          }}
        >
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: 2,
              left: 2,
              width: 20,
              height: 20,
              borderRadius: 9999,
              backgroundColor: "#fff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.10)",
              transform: value ? "translateX(18px)" : "translateX(0)",
              transition: "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </button>
      </div>
      {!last && <div className="ml-[58px] border-b" style={{ borderColor: "var(--border)" }} />}
    </>
  );
}

function DangerRow({
  icon: Icon,
  label,
  meta,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  meta?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-muted/30"
    >
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: "rgba(220,38,38,0.10)", color: DANGER }}
      >
        <Icon size={14} />
      </span>
      <span className="min-w-0 flex-1">
        <p style={{ fontSize: 14, fontWeight: 600, color: DANGER }}>{label}</p>
        {meta && (
          <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
            {meta}
          </p>
        )}
      </span>
      <ChevronRight size={14} style={{ color: "var(--on-card-muted)" }} />
    </button>
  );
}
