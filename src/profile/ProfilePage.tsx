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
        {/* Icon tile — light surface, so use card-foreground */}
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
  const { state } = useDevState();
  const data = profileData(state.profileState);

  return (
    <div className="flex flex-col gap-6 px-5 pb-8 pt-12">
      {/* ----- Identity header ----- */}
      <Link
        to="/profile/edit"
        className="flex flex-col items-center gap-2.5 active:opacity-80"
      >
        {/* Avatar */}
        <div className="relative inline-flex">
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
              IO
            </span>
          </div>
          {/* Camera badge — overlaps bottom-right edge of avatar */}
          <span
            className="absolute grid h-8 w-8 place-items-center rounded-full bg-midnight"
            style={{
              bottom: 2,
              right: 2,
              boxShadow: "0 0 0 2.5px var(--cream-elevated)",
            }}
          >
            <Camera size={14} className="text-cream" />
          </span>
        </div>

        {/* Name + pencil */}
        <div className="flex items-center gap-1.5">
          <span className="text-[22px] font-semibold text-foreground">
            Imani Okafor
          </span>
          <Pencil
            size={15}
            className="text-foreground"
            style={{ opacity: 0.4 }}
          />
        </div>

        {/* Email + phone */}
        <p className="tabular text-[13.5px] text-muted-foreground">
          imani@example.com
          {data.showPhone && " · ••• 1234"}
        </p>
      </Link>

      {/* ----- PERSONAL ----- */}
      <SectionCard eyebrow="Personal">
        <SettingsRow
          icon={MapPin}
          label="Saved addresses"
          value={`${data.addressCount} address${data.addressCount !== 1 ? "es" : ""}`}
          to="/profile/addresses"
        />
        <SettingsRow
          icon={CreditCard}
          label="Payment methods"
          pill={data.showExpiringPill ? { label: "Expiring", variant: "bagel" } : undefined}
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
          value="Default 20%"
          to="/profile/tipping"
        />
        <SettingsRow
          icon={Monitor}
          label="Theme"
          value="System"
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
    </div>
  );
}
