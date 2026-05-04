import { useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useCustomerProfile, type NotificationToggles } from "@/data/customer-store";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative h-[30px] w-[50px] shrink-0 rounded-full transition-colors"
      style={{
        backgroundColor: checked ? "var(--bagel)" : "var(--muted)",
      }}
    >
      <span
        className="absolute top-[2px] block h-[26px] w-[26px] rounded-full bg-white shadow-sm transition-transform"
        style={{
          transform: checked ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  last = false,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-medium text-card-foreground">{label}</span>
          {description && (
            <span className="text-[12.5px] text-on-card-muted">{description}</span>
          )}
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {!last && <div className="ml-4 border-b border-hairline" />}
    </>
  );
}

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

export function NotificationsPage() {
  const navigate = useNavigate();
  const { profile, setNotificationPreferences } = useCustomerProfile();
  const toggles = profile.notificationPreferences;

  const setToggle = (key: keyof NotificationToggles) => (v: boolean) => {
    setNotificationPreferences({ ...toggles, [key]: v });
  };

  return (
    <div className="flex flex-col gap-5 px-5 pb-8 pt-3">
      <div className="relative flex h-11 items-center justify-center">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="absolute left-0 grid h-9 w-9 place-items-center rounded-full transition-colors active:bg-muted/30"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <span className="text-[17px] font-semibold text-foreground">Notifications</span>
      </div>

      <SectionCard eyebrow="Booking updates">
        <ToggleRow
          label="Confirmations"
          checked={toggles.confirmations}
          onChange={setToggle("confirmations")}
        />
        <ToggleRow
          label="Status updates"
          description="En route, arrived, in progress"
          checked={toggles.statusUpdates}
          onChange={setToggle("statusUpdates")}
        />
        <ToggleRow
          label="Reminders before your booking"
          checked={toggles.reminders}
          onChange={setToggle("reminders")}
          last
        />
      </SectionCard>

      <SectionCard eyebrow="Messages">
        <ToggleRow
          label="Messages from your pro"
          checked={toggles.messages}
          onChange={setToggle("messages")}
          last
        />
      </SectionCard>

      <SectionCard eyebrow="Activity">
        <ToggleRow
          label="Rating prompts after a booking"
          checked={toggles.ratingPrompts}
          onChange={setToggle("ratingPrompts")}
        />
        <ToggleRow
          label="New pros and recommendations near you"
          checked={toggles.newPros}
          onChange={setToggle("newPros")}
          last
        />
      </SectionCard>
    </div>
  );
}
