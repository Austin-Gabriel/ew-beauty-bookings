import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Pencil,
  MapPin,
  CreditCard,
  Bell,
  Monitor,
  HelpCircle,
  MessageCircle,
  FileText,
  Shield,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { useDevState } from "@/dev-state/devState";
import { useCustomerProfile } from "@/data/customer-store";
import { AvatarActionSheet } from "./AvatarActionSheet";
import { ContactSupportSheet } from "./ContactSupportSheet";

function themeModeLabel(mode: string): string {
  if (mode === "system") return "System";
  if (mode === "light") return "Light";
  return "Dark";
}

function getInitials(name: string): string {
  // Locked rule: ALWAYS two letters. If only one name, pad with the second
  // character of that same name. Single-letter monograms are forbidden.
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
/*  Row                                                                 */
/* ------------------------------------------------------------------ */

function SettingsRow({
  icon: Icon,
  label,
  value,
  pill,
  to,
  onClick,
  trailingIcon,
  last = false,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value?: string;
  pill?: { label: string; variant: "bagel" };
  to?: string;
  onClick?: () => void;
  trailingIcon?: "chevron" | "external";
  last?: boolean;
}) {
  const TrailingIcon = trailingIcon === "external" ? ExternalLink : ChevronRight;

  const inner = (
    <>
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
          <TrailingIcon size={13} className="text-on-card-muted" />
        </span>
      </span>
    </>
  );

  const className = "flex items-center gap-3 px-4 py-3 transition-colors active:bg-muted/30";

  return (
    <>
      {onClick ? (
        <button type="button" onClick={onClick} className={`${className} w-full text-left`}>
          {inner}
        </button>
      ) : to ? (
        <Link to={to} className={className}>
          {inner}
        </Link>
      ) : (
        <div className={className}>{inner}</div>
      )}
      {!last && <div className="ml-[60px] border-b border-hairline" />}
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
/*  Sign-out confirmation sheet                                         */
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
      <div className="relative w-full max-w-[420px] space-y-3 p-4 pb-8">
        <div className="px-2 text-center">
          <p className="text-[18px] font-semibold text-foreground">Sign out?</p>
          <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
            You'll need to sign in again to book a pro or check your bookings.
          </p>
        </div>
        <button
          onClick={onConfirm}
          className="w-full rounded-2xl bg-destructive py-3.5 text-[15px] font-semibold text-destructive-foreground transition-opacity active:opacity-80"
        >
          Sign out
        </button>
        <button
          onClick={onCancel}
          className="w-full rounded-2xl border border-hairline bg-card py-3.5 text-[15px] font-semibold text-card-foreground transition-opacity active:opacity-80"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile Page                                                        */
/* ------------------------------------------------------------------ */

export function ProfilePage() {
  const { state, set } = useDevState();
  const navigate = useNavigate();
  const { profile, updateIdentity } = useCustomerProfile();
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [showSignOutSheet, setShowSignOutSheet] = useState(false);
  const [showSupportSheet, setShowSupportSheet] = useState(false);

  const { identity, savedAddresses, paymentMethods, themePreference } = profile;
  const hasPhoto = !!identity.avatarPhotoUrl;

  const addressCount = savedAddresses.length;
  const cardCount = paymentMethods.length;

  // Check if any card is expiring
  const hasExpiringCard = paymentMethods.some((c) => {
    const expDate = new Date(c.expYear, c.expMonth);
    const now = new Date();
    const sixtyDays = new Date(now.getTime() + 60 * 86400000);
    return now < expDate && sixtyDays >= expDate;
  });

  const displayName = identity.name;
  const displayEmail = identity.email;
  const displayPhone = identity.phone;
  const maskedPhone = displayPhone.length >= 4 ? `••• ${displayPhone.slice(-4)}` : "";
  const initials = getInitials(displayName);
  const showPhone = state.profileState !== "new";

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
    <div className="flex flex-col gap-6 px-5 pb-8 pt-12">
      {/* ----- Identity header ----- */}
      <div className="flex flex-col items-center gap-2.5">
        <div className="relative inline-flex">
          {hasPhoto ? (
            <img
              src={identity.avatarPhotoUrl!}
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

        <p className="tabular text-[13.5px] text-muted-foreground">
          {displayEmail}
          {showPhone && maskedPhone && ` · ${maskedPhone}`}
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
          icon={Monitor}
          label="Theme"
          value={themeModeLabel(themePreference)}
          to="/profile/theme"
          last
        />
      </SectionCard>

      {/* ----- SUPPORT ----- */}
      <SectionCard eyebrow="Support">
        <SettingsRow
          icon={HelpCircle}
          label="Help center"
          to="/profile/help"
        />
        <SettingsRow
          icon={MessageCircle}
          label="Contact support"
          onClick={() => setShowSupportSheet(true)}
          trailingIcon="chevron"
        />
        <SettingsRow
          icon={FileText}
          label="Terms of service"
          to="/profile/terms"
        />
        <SettingsRow
          icon={Shield}
          label="Privacy policy"
          to="/profile/privacy"
          last
        />
      </SectionCard>

      {/* ----- Sign out ----- */}
      <button
        type="button"
        className="mx-auto text-[15px] font-medium text-destructive transition-opacity active:opacity-60"
        onClick={() => setShowSignOutSheet(true)}
      >
        Sign out
      </button>

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
