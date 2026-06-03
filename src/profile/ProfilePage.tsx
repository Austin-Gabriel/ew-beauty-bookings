import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Camera,
  CreditCard,
  Bell,
  Sun,
  Globe,
  HelpCircle,
  MessageCircle,
  FileText,
  ChevronRight,
  Settings,
  Star,
  Info,
  Tag,
  Gift,
  Sparkles,
  MapPin,
  LogOut,
  User,
} from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";
import { useDevState } from "@/dev-state/devState";
import { useCustomerProfile } from "@/data/customer-store";
import { useBookings } from "@/data/bookings-store";
import { AvatarActionSheet } from "./AvatarActionSheet";
import { ContactSupportSheet } from "./ContactSupportSheet";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";
const DANGER = "#DC2626";

function themeModeLabel(mode: string): string {
  if (mode === "system") return "System";
  if (mode === "light") return "Light";
  return "Dark";
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  const first = parts[0]?.[0] ?? "";
  if (parts.length === 1) {
    const second = parts[0]?.[1] ?? first;
    return (first + second).toUpperCase();
  }
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

/* ------------------------------------------------------------------ */
/*  Profile Page                                                        */
/* ------------------------------------------------------------------ */

export function ProfilePage() {
  const { set } = useDevState();
  const navigate = useNavigate();
  const { profile, updateIdentity } = useCustomerProfile();
  const { bookings } = useBookings();
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [showSignOutSheet, setShowSignOutSheet] = useState(false);
  const [showSupportSheet, setShowSupportSheet] = useState(false);

  const { identity, paymentMethods, themePreference, savedAddresses } = profile;
  const hasPhoto = !!identity.avatarPhotoUrl;

  // Stats — bookings count comes from real store; saved/credits are presentational.
  const bookingsCount = bookings.length;
  const savedUsd = 245;
  const creditsUsd = 60;

  // Card "expiring" within 60 days
  const hasExpiringCard = paymentMethods.some((c) => {
    const expDate = new Date(c.expYear, c.expMonth);
    const now = new Date();
    const sixtyDays = new Date(now.getTime() + 60 * 86400000);
    return now < expDate && sixtyDays >= expDate;
  });
  const defaultCard = paymentMethods.find((c) => c.isDefault) ?? paymentMethods[0];

  const displayName = identity.name;
  const displayEmail = identity.email;
  const initials = getInitials(displayName);

  function handleTakePhoto() {
    updateIdentity({
      avatarPhotoUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    });
    set("avatarState", "photo");
    setShowAvatarSheet(false);
  }
  function handleChooseFromLibrary() {
    updateIdentity({
      avatarPhotoUrl:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    });
    set("avatarState", "photo");
    setShowAvatarSheet(false);
  }
  function handleRemovePhoto() {
    updateIdentity({ avatarPhotoUrl: null });
    set("avatarState", "monogram");
    setShowAvatarSheet(false);
  }
  function handleSignOut() {
    set("authState", "signed-out");
    navigate({ to: "/welcome" });
  }

  return (
    <div className="flex min-h-full flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      {/* STICKY HEADER ----------------------------------------------------- */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b px-5 py-3.5"
        style={{
          backgroundColor: "var(--card)",
          borderColor: "var(--border)",
        }}
      >
        <h1 style={{ fontSize: 17, fontWeight: 600, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
          Account
        </h1>
        <button
          type="button"
          onClick={() => navigate({ to: "/profile/settings" })}
          aria-label="Settings"
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ backgroundColor: "var(--surface-elevated)", color: "var(--card-foreground)" }}
        >
          <Settings size={15} />
        </button>
      </header>

      {/* IDENTITY HERO ----------------------------------------------------- */}
      <div className="px-5 pt-6 pb-5 text-center">
        <div className="relative inline-block">
          {hasPhoto ? (
            <img
              src={identity.avatarPhotoUrl!}
              alt={displayName}
              className="h-22 w-22 rounded-full object-cover"
              style={{ width: 88, height: 88, border: "3px solid var(--card)", boxShadow: "0 0 0 1px var(--border), 0 1px 3px rgba(11,18,32,0.06)" }}
            />
          ) : (
            <div
              className="grid place-items-center rounded-full"
              style={{
                width: 88,
                height: 88,
                background: "linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)",
                color: "#1E3A8A",
                fontSize: 28,
                fontWeight: 700,
                letterSpacing: "-0.02em",
                border: "3px solid var(--card)",
                boxShadow: "0 0 0 1px var(--border), 0 1px 3px rgba(11,18,32,0.06)",
              }}
            >
              {initials}
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowAvatarSheet(true)}
            aria-label="Change avatar"
            className="absolute grid place-items-center rounded-full"
            style={{
              bottom: -2,
              right: -2,
              width: 28,
              height: 28,
              backgroundColor: "#0B1220",
              color: "#fff",
              border: "3px solid var(--card)",
            }}
          >
            <Camera size={12} />
          </button>
        </div>

        <h2 className="mt-3.5" style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.025em" }}>
          {displayName}
        </h2>
        <p className="mt-0.5" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
          {displayEmail}
        </p>

        <button
          type="button"
          onClick={() => navigate({ to: "/profile/rating" })}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style={{
            backgroundColor: "var(--surface-elevated)",
            color: "var(--card-foreground)",
          }}
        >
          <Star size={12} fill="#F5A623" style={{ color: "#F5A623" }} />
          <span style={{ fontSize: 12, fontWeight: 600 }}>4.9 client rating</span>
          <Info size={11} style={{ color: "var(--muted-foreground)" }} />
        </button>
      </div>

      {/* STATS ------------------------------------------------------------- */}
      <div className="grid grid-cols-3 gap-2 px-5 pb-6">
        <StatCard
          value={String(bookingsCount)}
          label="Bookings"
          onClick={() => navigate({ to: "/bookings" })}
        />
        <StatCard
          value={`$${savedUsd}`}
          label="Saved"
          accent
          onClick={() => navigate({ to: "/profile/promotions" })}
        />
        <StatCard
          value={`$${creditsUsd}`}
          label="Credits"
          onClick={() => navigate({ to: "/profile/credits" })}
        />
      </div>

      {/* QUICK ACCESS ------------------------------------------------------ */}
      <SectionLabel>Quick access</SectionLabel>
      <div
        className="flex gap-2.5 overflow-x-auto px-5 pb-5"
        style={{ scrollbarWidth: "none" }}
      >
        <QuickCard
          icon={Gift}
          iconBg="linear-gradient(135deg, #6B3520 0%, #C97744 100%)"
          iconColor="#fff"
          title="Refer friends"
          subHead={<>Give $20, <span style={{ color: SUCCESS, fontWeight: 600 }}>get $20</span></>}
          onClick={() => navigate({ to: "/profile/refer" })}
        />
        <QuickCard
          icon={Sparkles}
          iconBg="linear-gradient(135deg, #FFD9C7 0%, #FF9270 100%)"
          iconColor="#7C2D12"
          title="Hair profile"
          subHead="4C · BSL · No relaxer"
          onClick={() => navigate({ to: "/profile/hair-profile" })}
        />
        <QuickCard
          icon={MapPin}
          iconBg="linear-gradient(135deg, #2A1810 0%, #6B3520 100%)"
          iconColor="#fff"
          title="Addresses"
          subHead={`${savedAddresses.length} saved`}
          onClick={() => navigate({ to: "/profile/addresses" })}
        />
      </div>

      {/* ACCOUNT ----------------------------------------------------------- */}
      <SectionLabel>Account</SectionLabel>
      <SettingsListContainer>
        <SettingsRow
          icon={User}
          label="Personal info"
          meta="Name, phone, email"
          onClick={() => navigate({ to: "/profile/edit" })}
        />
        <SettingsRow
          icon={CreditCard}
          label="Payment methods"
          meta={defaultCard ? `${brandTitle(defaultCard.brand)} ··· ${defaultCard.last4}` : "Add a card"}
          badge={hasExpiringCard ? "Expiring" : undefined}
          onClick={() => navigate({ to: "/profile/payment-methods" })}
          last
        />
      </SettingsListContainer>

      {/* PREFERENCES ------------------------------------------------------- */}
      <SectionLabel>Preferences</SectionLabel>
      <SettingsListContainer>
        <SettingsRow
          icon={Bell}
          label="Notifications"
          meta="Push, email, SMS"
          onClick={() => navigate({ to: "/profile/notifications" })}
        />
        <SettingsRow
          icon={Globe}
          label="Language"
          value="English"
          onClick={() => navigate({ to: "/profile/language" })}
        />
        <SettingsRow
          icon={Sun}
          label="Appearance"
          value={themeModeLabel(themePreference)}
          onClick={() => navigate({ to: "/profile/theme" })}
          last
        />
      </SettingsListContainer>

      {/* SUPPORT ----------------------------------------------------------- */}
      <SectionLabel>Support</SectionLabel>
      <SettingsListContainer>
        <SettingsRow
          icon={HelpCircle}
          label="Help center"
          onClick={() => navigate({ to: "/profile/help" })}
        />
        <SettingsRow
          icon={MessageCircle}
          label="Contact support"
          onClick={() => setShowSupportSheet(true)}
        />
        <SettingsRow
          icon={FileText}
          label="Terms & privacy"
          onClick={() => navigate({ to: "/profile/legal" })}
          last
        />
      </SettingsListContainer>

      {/* SIGN OUT ---------------------------------------------------------- */}
      <div className="px-5 pb-3 pt-1">
        <button
          type="button"
          onClick={() => setShowSignOutSheet(true)}
          className="flex w-full items-center gap-3 rounded-2xl border bg-card px-4 py-3.5 text-left transition-colors active:bg-muted/30"
          style={{ borderColor: "var(--border)" }}
        >
          <span
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg"
            style={{ backgroundColor: "rgba(220,38,38,0.10)", color: DANGER }}
          >
            <LogOut size={15} />
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: DANGER }}>Sign out</span>
        </button>
      </div>

      {/* FOOTER ------------------------------------------------------------ */}
      <div className="px-5 pt-3 pb-8 text-center">
        <p
          style={{
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            color: "var(--muted-foreground)",
            opacity: 0.55,
          }}
        >
          Ewà<span style={{ color: ORANGE }}>.</span>
        </p>
        <p className="mt-1" style={{ fontSize: 11, color: "var(--muted-foreground)", opacity: 0.6 }}>
          Version 1.0.0
        </p>
      </div>

      {showAvatarSheet && (
        <AvatarActionSheet
          hasPhoto={hasPhoto}
          onTakePhoto={handleTakePhoto}
          onChooseFromLibrary={handleChooseFromLibrary}
          onRemovePhoto={handleRemovePhoto}
          onDismiss={() => setShowAvatarSheet(false)}
        />
      )}

      {showSignOutSheet && (
        <SignOutSheet
          onCancel={() => setShowSignOutSheet(false)}
          onConfirm={handleSignOut}
        />
      )}

      {showSupportSheet && (
        <ContactSupportSheet onDismiss={() => setShowSupportSheet(false)} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Atoms                                                               */
/* ------------------------------------------------------------------ */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="px-5 pb-2.5 pt-2"
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--muted-foreground)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontFamily: SANS_STACK,
      }}
    >
      {children}
    </p>
  );
}

function StatCard({
  value,
  label,
  accent,
  onClick,
}: {
  value: string;
  label: string;
  accent?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border bg-card px-3 py-3.5 text-center transition-colors active:bg-muted/30"
      style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
    >
      <p
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: accent ? ORANGE : "var(--card-foreground)",
          letterSpacing: "-0.025em",
          lineHeight: 1,
        }}
      >
        {value}
      </p>
      <p
        className="mt-1"
        style={{
          fontSize: 10.5,
          color: "var(--muted-foreground)",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </p>
    </button>
  );
}

function QuickCard({
  icon: Icon,
  iconBg,
  iconColor,
  badge,
  title,
  subHead,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  iconBg: string;
  iconColor: string;
  badge?: string;
  title: string;
  subHead: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex shrink-0 flex-col justify-between rounded-2xl border bg-card p-3.5 text-left transition-transform active:scale-[0.98]"
      style={{
        width: 165,
        minHeight: 132,
        borderColor: "var(--border)",
        boxShadow: "0 1px 2px rgba(20,25,40,0.04)",
      }}
    >
      <div className="flex items-start justify-between">
        <span
          className="grid h-9 w-9 place-items-center rounded-xl"
          style={{ background: iconBg, color: iconColor }}
        >
          <Icon size={16} />
        </span>
        {badge && (
          <span
            className="rounded-full px-2 py-0.5"
            style={{
              backgroundColor: ORANGE,
              color: "#1A0E08",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <div className="mt-7">
        <p style={{ fontSize: 13.5, fontWeight: 700, color: "var(--card-foreground)", letterSpacing: "-0.01em" }}>
          {title}
        </p>
        <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)", lineHeight: 1.4 }}>
          {subHead}
        </p>
      </div>
    </button>
  );
}

function SettingsListContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-5 pb-4">
      <div
        className="overflow-hidden rounded-2xl border bg-card"
        style={{ borderColor: "var(--border)", boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
      >
        {children}
      </div>
    </div>
  );
}

function SettingsRow({
  icon: Icon,
  label,
  meta,
  value,
  badge,
  onClick,
  last = false,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  meta?: string;
  value?: string;
  badge?: string;
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
          <p style={{ fontSize: 14, fontWeight: 500, color: "var(--card-foreground)", letterSpacing: "-0.005em" }}>
            {label}
          </p>
          {meta && (
            <p className="mt-0.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
              {meta}
            </p>
          )}
        </span>
        {badge && (
          <span
            className="rounded-full px-2 py-0.5"
            style={{
              backgroundColor: ORANGE,
              color: "#1A0E08",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.02em",
            }}
          >
            {badge}
          </span>
        )}
        {value && (
          <span style={{ fontSize: 12.5, color: "var(--on-card-muted)", fontWeight: 500 }}>{value}</span>
        )}
        <ChevronRight size={14} style={{ color: "var(--on-card-muted)" }} />
      </button>
      {!last && <div className="ml-[58px] border-b" style={{ borderColor: "var(--border)" }} />}
    </>
  );
}

function brandTitle(brand: string) {
  const map: Record<string, string> = {
    visa: "Visa",
    mastercard: "Mastercard",
    amex: "Amex",
    discover: "Discover",
    apple_pay: "Apple Pay",
    google_pay: "Google Pay",
  };
  return map[brand.toLowerCase()] ?? brand;
}

/* ------------------------------------------------------------------ */
/*  Sign-out sheet                                                      */
/* ------------------------------------------------------------------ */

function SignOutSheet({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9997] flex items-end justify-center">
      <button
        aria-label="Cancel"
        onClick={onCancel}
        className="absolute inset-0 bg-midnight/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[420px] space-y-3 p-4 pb-8" style={{ fontFamily: SANS_STACK }}>
        <div className="px-2 text-center">
          <p className="text-[18px] font-semibold text-foreground">Sign out?</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
            You'll need to sign in again to book a pro or check your bookings.
          </p>
        </div>
        <button
          onClick={onConfirm}
          className="w-full rounded-2xl py-3.5 text-[15px] font-semibold transition-opacity active:opacity-80"
          style={{ backgroundColor: DANGER, color: "#fff" }}
        >
          Sign out
        </button>
        <button
          onClick={onCancel}
          className="w-full rounded-2xl border bg-card py-3.5 text-[15px] font-semibold text-card-foreground transition-opacity active:opacity-80"
          style={{ borderColor: "var(--border)" }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
