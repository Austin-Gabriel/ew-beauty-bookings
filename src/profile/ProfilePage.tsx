import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Camera,
  Pencil,
  MapPin,
  CreditCard,
  Bell,
  Percent,
  Monitor,
  HelpCircle,
  MessageCircle,
  FileText,
  Shield,
  ChevronRight,
} from "lucide-react";
import { useDevState, type ProfileState, type TippingPreference } from "@/dev-state/devState";
import { AvatarActionSheet } from "./AvatarActionSheet";

const MOCK_PHOTO_URL =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face";

function tippingLabel(pref: TippingPreference, customVal: number): string {
  if (pref === "ask") return "Ask each time";
  if (pref === "custom") return `Default ${customVal}%`;
  return `Default ${pref}%`;
}

function themeModeLabel(mode: string): string {
  if (mode === "system") return "System";
  if (mode === "light") return "Light";
  return "Dark";
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function profileData(ps: ProfileState) {
  return {
    showPhone: ps !== "new",
    addressCount: ps === "new" ? 0 : ps === "partial" ? 1 : 2,
    showExpiringPill: ps === "complete",
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "??";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Read saved profile edits from sessionStorage                        */
/* ------------------------------------------------------------------ */

function useSessionValue<T>(key: string): T | null {
  const [val, setVal] = useState<T | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const raw = sessionStorage.getItem(key);
        if (raw) setVal(JSON.parse(raw));
        else setVal(null);
      } catch {}
    };
    read();
    window.addEventListener("focus", read);
    return () => window.removeEventListener("focus", read);
  }, [key]);

  return val;
}

/* ------------------------------------------------------------------ */
/*  Row                                                                 */
/* ------------------------------------------------------------------ */

function SettingsRow({
  icon: Icon,
  label,
  value,
  pill,
  to,
  last = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string;
  pill?: { label: string; variant: "bagel" };
  to: string;
  last?: boolean;
}) {
  return (
    <>
      <Link
        to={to}
        className="flex items-center gap-3 px-4 py-3 transition-colors active:bg-muted/30"
      >
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-cream-elevated/60">
          <Icon size={17} className="text-card-foreground" />
        </span>

        <span className="flex flex-1 items-center justify-between gap-2">
          <span className="text-[15px] font-medium text-card-foreground">
            {label}
          </span>
          <span className="flex items-center gap-1.5">
            {pill && (
              <span className="rounded-full bg-bagel px-2 py-0.5 text-[11px] font-semibold text-bagel-foreground">
                {pill.label}
              </span>
            )}
            {value && (
              <span className="text-[13px] text-on-card-muted">{value}</span>
            )}
            <ChevronRight size={13} className="text-on-card-muted" />
          </span>
        </span>
      </Link>

      {!last && (
        <div className="ml-[60px] border-b border-hairline" />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Section card                                                        */
/* ------------------------------------------------------------------ */

function SectionCard({
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
/*  Profile Page                                                        */
/* ------------------------------------------------------------------ */

export function ProfilePage() {
  const { state, set } = useDevState();
  const data = profileData(state.profileState);
  const savedEdits = useSessionValue<{ name: string; email: string; phone: string }>("ewa.profile.edits");
  const savedAddresses = useSessionValue<{ id: string; isDefault: boolean }[]>("ewa.profile.addresses");
  const savedCards = useSessionValue<{ id: string; expMonth: number; expYear: number }[]>("ewa.profile.paymentMethods");
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);

  const hasPhoto = state.avatarState === "photo";

  // Dynamic counts from session
  const addressCount = savedAddresses?.length ?? data.addressCount;
  const cardCount = savedCards?.length ?? 0;

  // Check if any card is expiring
  const hasExpiringCard = savedCards
    ? savedCards.some((c) => {
        const expDate = new Date(c.expYear, c.expMonth);
        const now = new Date();
        const sixtyDays = new Date(now.getTime() + 60 * 86400000);
        return now < expDate && sixtyDays >= expDate;
      })
    : data.showExpiringPill;

  // Derive display values
  const displayName = savedEdits?.name ?? "Imani Okafor";
  const displayEmail = savedEdits?.email ?? "imani@example.com";
  const displayPhone = savedEdits?.phone ?? "5551234";
  const maskedPhone = displayPhone.length >= 4 ? `••• ${displayPhone.slice(-4)}` : "";
  const initials = getInitials(displayName);

  function handleTakePhoto() {
    set("avatarState", "photo");
    setShowAvatarSheet(false);
  }

  function handleChooseFromLibrary() {
    set("avatarState", "photo");
    setShowAvatarSheet(false);
  }

  function handleRemovePhoto() {
    set("avatarState", "monogram");
    setShowAvatarSheet(false);
  }

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-12">
      {/* ----- Identity header ----- */}
      <div className="flex flex-col items-center gap-2.5">
        {/* Avatar — tap camera badge for action sheet */}
        <div className="relative inline-flex">
          {hasPhoto ? (
            <img
              src={MOCK_PHOTO_URL}
              alt={displayName}
              className="h-[104px] w-[104px] rounded-full object-cover"
            />
          ) : (
            <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-cream-elevated">
              <span
                className="text-midnight"
                style={{
                  fontSize: 34,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                {initials}
              </span>
            </div>
          )}
          {/* Camera badge */}
          <button
            onClick={() => setShowAvatarSheet(true)}
            className="absolute grid h-8 w-8 place-items-center rounded-full bg-midnight"
            style={{
              bottom: 2,
              right: 2,
              boxShadow: "0 0 0 2.5px var(--cream-elevated)",
            }}
            aria-label="Change avatar"
          >
            <Camera size={14} className="text-cream" />
          </button>
        </div>

        {/* Name + pencil — link to edit */}
        <Link
          to="/profile/edit"
          className="flex items-center gap-1.5 active:opacity-80"
        >
          <span className="text-[22px] font-semibold text-foreground">
            {displayName}
          </span>
          <Pencil
            size={15}
            className="text-foreground"
            style={{ opacity: 0.4 }}
          />
        </Link>

        {/* Email + phone */}
        <p className="tabular text-[13.5px] text-muted-foreground">
          {displayEmail}
          {data.showPhone && maskedPhone && ` · ${maskedPhone}`}
        </p>
      </div>

      {/* ----- PERSONAL ----- */}
      <SectionCard eyebrow="Personal">
        <SettingsRow
          icon={MapPin}
          label="Saved addresses"
          value={`${addressCount} address${addressCount !== 1 ? "es" : ""}`}
          to="/profile/addresses"
        />
        <SettingsRow
          icon={CreditCard}
          label="Payment methods"
          value={cardCount > 0 ? `${cardCount} card${cardCount !== 1 ? "s" : ""}` : undefined}
          pill={hasExpiringCard ? { label: "Expiring", variant: "bagel" } : undefined}
          to="/profile/payment-methods"
          last
        />
      </SectionCard>

      {/* ----- PREFERENCES ----- */}
      <SectionCard eyebrow="Preferences">
        <SettingsRow
          icon={Bell}
          label="Notifications"
          to="/profile/notifications"
        />
        <SettingsRow
          icon={Percent}
          label="Tipping preferences"
          value={tippingLabel(state.tippingPreference, state.tippingCustomValue)}
          to="/profile/tipping"
        />
        <SettingsRow
          icon={Monitor}
          label="Theme"
          value={themeModeLabel(state.themeMode)}
          to="/profile/theme"
          last
        />
      </SectionCard>

      {/* ----- SUPPORT ----- */}
      <SectionCard eyebrow="Support">
        <SettingsRow
          icon={HelpCircle}
          label="Help center"
          to="/profile/notifications"
        />
        <SettingsRow
          icon={MessageCircle}
          label="Contact support"
          to="/profile/notifications"
        />
        <SettingsRow
          icon={FileText}
          label="Terms of service"
          to="/profile/notifications"
        />
        <SettingsRow
          icon={Shield}
          label="Privacy policy"
          to="/profile/notifications"
          last
        />
      </SectionCard>

      {/* ----- Sign out ----- */}
      <button
        type="button"
        className="mx-auto text-[15px] font-medium text-destructive transition-opacity active:opacity-60"
        onClick={() => {
          // TODO: confirmation sheet + actual sign-out
        }}
      >
        Sign out
      </button>

      {/* Avatar action sheet */}
      {showAvatarSheet && (
        <AvatarActionSheet
          hasPhoto={hasPhoto}
          onTakePhoto={handleTakePhoto}
          onChooseFromLibrary={handleChooseFromLibrary}
          onRemovePhoto={handleRemovePhoto}
          onDismiss={() => setShowAvatarSheet(false)}
        />
      )}
    </div>
  );
}
