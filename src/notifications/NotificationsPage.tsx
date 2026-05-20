import { useMemo, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useDevState } from "@/dev-state/devState";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "#FF823F";
const DANGER = "#DC2626";
const INFO = "#3B82F6";
const INK_900 = "#0B1220";
const FRAUNCES = '"Fraunces", "Times New Roman", serif';

// Status tone palette — brand system uses bagel orange for positive states.
type StatusTone = "success" | "danger" | "accent" | "info" | "neutral";

const TONE_BG: Record<StatusTone, string> = {
  success: "rgba(255,130,63,0.14)",
  danger: "rgba(220,38,38,0.14)",
  accent: "rgba(255,130,63,0.14)",
  info: "rgba(59,130,246,0.14)",
  neutral: "rgba(11,18,32,0.06)",
};
const TONE_FG: Record<StatusTone, string> = {
  success: ORANGE,
  danger: DANGER,
  accent: ORANGE,
  info: INFO,
  neutral: "#2A3544",
};

type AvatarTint = "peach" | "blue" | "green" | "pink" | "promo" | "system" | "gift";
type StatusBadgeKind = "confirmed" | "declined" | "on-the-way" | "info" | "none";

type Activity = {
  id: string;
  ts: number; // unix ms
  unread: boolean;
  /** Avatar block — initials + tint, OR a system glyph */
  avatar:
    | { kind: "initials"; initials: string; tint: AvatarTint }
    | { kind: "promo-percent"; pct: string }
    | { kind: "system" };
  badge?: StatusBadgeKind;
  /** Notification copy — supports inline highlights via segments */
  body: { text: string; bold?: boolean; accent?: boolean }[];
  label?: { text: string; tone: StatusTone };
  ctas?: { label: string; primary?: boolean; onTap: () => void }[];
  thumbUrl?: string; // right-side thumbnail for portfolio updates
  route?: "bookings" | "discover" | "pro";
  proId?: string;
};

type Offer = {
  id: string;
  title: string;
  subline: string;
  badge: string;
  badgeStyle: "percent" | "dollar" | "heart" | "bolt" | "initials";
  initials?: string;
  expiresIn?: string; // urgency text
};


export function NotificationsPage() {
  const { state } = useDevState();
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const router = useRouter();

  const muted = "var(--muted-foreground)";
  const subtleSurface = "var(--surface-elevated)";
  const subtleBorder = "var(--border)";

  // Promo code input removed pre-MVP — offer cards below cover all promotions.

  // -------- Offers --------
  const baseOffers: Offer[] = useMemo(
    () => [
      {
        id: "off-amara",
        title: "$20 off your first booking with Amara",
        subline: "Save $20 · Silk press, braids · Expires May 14",
        badge: "AO",
        badgeStyle: "initials",
        initials: "AO",
      },
      {
        id: "off-silk",
        title: "15% off any silk press",
        subline: "Save up to $30 · Expires May 6",
        badge: "15%",
        badgeStyle: "percent",
      },
      {
        id: "off-loyal",
        title: "$30 off your 5th booking",
        subline: "3 of 5 completed · No expiry",
        badge: "♥",
        badgeStyle: "heart",
      },
      {
        id: "off-weekend",
        title: "25% off this weekend only",
        subline: "Save up to $40 · Any service",
        badge: "⚡",
        badgeStyle: "bolt",
        expiresIn: "Expires in 36 hours",
      },
    ],
    [],
  );

  const offers = state.customerState === "new" ? baseOffers.slice(0, 2) : baseOffers;
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const onClaim = (id: string, title: string) => {
    setClaimed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    toast(`Claimed — ${title}`);
  };

  // -------- Recent activity --------
  const activities: Activity[] = useMemo(() => {
    if (state.customerState === "new") return [];
    const amara = MOCK_PROS.find((p) => p.id === "amara-okafor") ?? MOCK_PROS[0]!;
    const jordan = MOCK_PROS.find((p) => p.id.startsWith("jordan")) ?? MOCK_PROS[1]!;
    const renee = MOCK_PROS.find((p) => p.name.toLowerCase().includes("ren")) ?? MOCK_PROS[2]!;
    const sade = MOCK_PROS.find((p) => p.id.startsWith("sade")) ?? MOCK_PROS[3]!;
    const now = Date.now();
    const min = 60 * 1000;
    const hr = 60 * min;
    const day = 24 * hr;

    const goPro = (id: string) => () => navigate({ to: "/pro/$proId", params: { proId: id } });
    const goBookings = () => navigate({ to: "/bookings" });

    return [
      // ── Today ──────────────────────────────────────────────────────
      {
        id: "a1",
        ts: now - 2 * min,
        unread: true,
        avatar: { kind: "initials", initials: initialsOf(amara.name), tint: "peach" },
        badge: "on-the-way",
        body: [
          { text: amara.name.split(" ")[0] ?? amara.name, bold: true },
          { text: " is on her way to your appointment. Estimated arrival: 12 min." },
        ],
        label: { text: "On the way", tone: "accent" },
        route: "bookings",
      },
      {
        id: "a2",
        ts: now - 34 * min,
        unread: true,
        avatar: { kind: "promo-percent", pct: "15%" },
        body: [
          { text: jordan.name, bold: true },
          { text: " is offering " },
          { text: "15% off knotless braids", accent: true },
          { text: " this week. You saved her last month — grab a slot." },
        ],
        label: { text: "Saved stylist", tone: "accent" },
        ctas: [
          { label: "Book now", primary: true, onTap: goPro(jordan.id) },
          { label: "View deal", onTap: () => toast("Deal details coming soon") },
        ],
      },
      {
        id: "a3",
        ts: now - 1 * hr,
        unread: true,
        avatar: { kind: "initials", initials: initialsOf(amara.name), tint: "peach" },
        badge: "confirmed",
        body: [
          { text: amara.name, bold: true },
          { text: " confirmed your silk press appointment for Saturday at 2:00 PM." },
        ],
        label: { text: "Confirmed", tone: "success" },
        route: "bookings",
      },
      {
        id: "a4",
        ts: now - 2 * hr,
        unread: false,
        avatar: { kind: "initials", initials: initialsOf(jordan.name), tint: "blue" },
        badge: "declined",
        body: [
          { text: jordan.name, bold: true },
          { text: " couldn't take your braids appointment for Friday — her schedule just filled up." },
        ],
        label: { text: "Declined", tone: "danger" },
        ctas: [
          { label: "Find another time", primary: true, onTap: goBookings },
        ],
        route: "bookings",
      },
      {
        id: "a5",
        ts: now - 3 * hr,
        unread: false,
        avatar: { kind: "initials", initials: initialsOf(jordan.name), tint: "blue" },
        body: [
          { text: jordan.name, bold: true },
          { text: " posted 3 new looks to her portfolio." },
        ],
        thumbUrl: jordan.portfolio[0],
        route: "pro",
        proId: jordan.id,
      },

      // ── Yesterday ──────────────────────────────────────────────────
      {
        id: "a6",
        ts: now - 1 * day - 4 * hr,
        unread: false,
        avatar: { kind: "initials", initials: initialsOf(amara.name), tint: "peach" },
        body: [
          { text: "How was your silk press with " },
          { text: amara.name.split(" ")[0] ?? amara.name, bold: true },
          { text: "? Leave a review to help other clients." },
        ],
        ctas: [{ label: `Rate ${amara.name.split(" ")[0]}`, primary: true, onTap: () => toast("Review flow coming soon") }],
      },
      {
        id: "a7",
        ts: now - 1 * day - 7 * hr,
        unread: false,
        avatar: { kind: "system" },
        body: [
          { text: "Payment of " },
          { text: "$180.00", bold: true },
          { text: " processed for your silk press appointment." },
        ],
      },

      // ── This week ──────────────────────────────────────────────────
      {
        id: "a8",
        ts: now - 3 * day,
        unread: false,
        avatar: { kind: "initials", initials: initialsOf(sade.name), tint: "pink" },
        body: [
          { text: sade.name.split(" ")[0] ?? sade.name, bold: true },
          { text: " just booked her first appointment using your referral code. " },
          { text: "$20 credit added", accent: true },
          { text: " to your account." },
        ],
        label: { text: "Referral", tone: "success" },
      },
      {
        id: "a9",
        ts: now - 4 * day,
        unread: false,
        avatar: { kind: "initials", initials: initialsOf(renee.name), tint: "green" },
        body: [
          { text: renee.name, bold: true },
          { text: " just opened up new slots this Saturday. You saved her — grab one before they go." },
        ],
        label: { text: "New slots", tone: "neutral" },
        route: "pro",
        proId: renee.id,
      },

      // ── Earlier ────────────────────────────────────────────────────
      {
        id: "a10",
        ts: now - 9 * day,
        unread: false,
        avatar: { kind: "system" },
        body: [
          { text: "Your card ending in " },
          { text: "4421", bold: true },
          { text: " is expiring next month. Update payment method." },
        ],
        label: { text: "Action needed", tone: "danger" },
      },
    ];
  }, [state.customerState, navigate]);

  // Bucket by relative day so the section eyebrows mirror the mockup.
  const buckets = useMemo(() => groupByBucket(activities), [activities]);

  const onTapActivity = (a: Activity) => {
    if (a.route === "bookings") navigate({ to: "/bookings" });
    else if (a.route === "discover") navigate({ to: "/discover" });
    else if (a.route === "pro" && a.proId) navigate({ to: "/pro/$proId", params: { proId: a.proId } });
  };

  // -------- More ways to save (carousel) --------
  const ways = [
    {
      id: "refer",
      eyebrow: "Refer a friend",
      title: "Give $20,\nget $20.",
      cta: "Invite friends",
      gradient: "linear-gradient(135deg, #8B3A1A 0%, #FF823F 120%)",
      onClick: () => {
        if (typeof navigator !== "undefined" && "share" in navigator) {
          (navigator as Navigator & { share: (data: ShareData) => Promise<void> })
            .share({ title: "Ewà", text: "Join me on Ewà — $20 off your first booking.", url: "https://ewatheapp.lovable.app" })
            .catch(() => toast("Invite link copied"));
        } else {
          toast("Invite link copied");
        }
      },
    },
    {
      id: "city-deals",
      eyebrow: "Brooklyn picks",
      title: "Top stylists,\nhandpicked.",
      cta: "Explore",
      gradient: "linear-gradient(135deg, #2C1810 0%, #6B3A1A 120%)",
      onClick: () => navigate({ to: "/discover" }),
    },
    {
      id: "first-book",
      eyebrow: "First booking",
      title: "Get $15\non us.",
      cta: "Book now",
      gradient: "linear-gradient(135deg, #061C27 0%, #2A4A5E 120%)",
      onClick: () => navigate({ to: "/discover" }),
    },
  ];

  return (
    <AppShell>
      {/* Header — back arrow + centered title (Uber pattern) */}
      <header className="relative flex items-center justify-center px-5 pb-2 pt-4">
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="absolute left-5 grid h-9 w-9 place-items-center rounded-full transition-transform active:scale-95"
          style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}`, color: text }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1
          style={{
            fontFamily: SANS_STACK,
            fontSize: 17,
            fontWeight: 700,
            color: text,
            margin: 0,
          }}
        >
          Notifications & Offers
        </h1>
      </header>

      <div className="px-5 pt-4" style={{ fontFamily: SANS_STACK, color: text }}>
        {/* Promo code input ------------------------------------------- */}
        <div
          className="flex items-center gap-2 rounded-2xl px-3.5 py-3"
          style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}` }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: muted, flexShrink: 0 }}>
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onApplyPromo();
            }}
            placeholder="Enter promo code"
            className="flex-1 bg-transparent outline-none"
            style={{ fontSize: 14, color: text }}
          />
          <button
            type="button"
            onClick={onApplyPromo}
            className="shrink-0 rounded-full px-3 py-1 transition-opacity"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: ORANGE,
              opacity: promo.trim() ? 1 : 0.5,
            }}
            disabled={!promo.trim()}
          >
            Apply
          </button>
        </div>

        {/* Recent activity ---------------------------------------------- */}
        {activities.length > 0 && (
          <section className="-mx-5 mt-7">
            <div className="px-5">
              <SectionHeader title="Recent activity" subtitle="Updates from your bookings and pros" />
            </div>
            {buckets.map((bucket) => (
              <div key={bucket.label}>
                <div
                  className="px-5 pb-2 pt-5"
                  style={{
                    fontFamily: SANS_STACK,
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {bucket.label}
                </div>
                <ul>
                  {bucket.items.map((a) => (
                    <li key={a.id}>
                      <ActivityItem
                        a={a}
                        onTap={() => onTapActivity(a)}
                        muted={muted}
                        text={text}
                        isDark={isDark}
                        subtleBorder={subtleBorder}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* Available offers ------------------------------------------- */}
        <section className="mt-7">
          <SectionHeader title="Available offers" subtitle="Tap claim to save these to your account" />
          <ul className="mt-3 flex flex-col gap-3">
            {offers.map((o) => (
              <OfferCard key={o.id} offer={o} claimed={claimed.has(o.id)} onClaim={() => onClaim(o.id, o.title)} muted={muted} />
            ))}
          </ul>
        </section>

        {/* More ways to save (horizontal scroll) ---------------------- */}
        <section className="mt-8">
          <h2 className="px-0.5" style={{ fontFamily: FRAUNCES, fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em", color: text, margin: 0 }}>
            More ways to save
          </h2>
          <div className="-mx-5 mt-4 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            <div className="flex gap-3 px-5 pb-2">
              {ways.map((w) => (
                <WayCard key={w.id} way={w} />
              ))}
            </div>
          </div>
        </section>

        {/* Empty state for "new" customers with no notifs */}
        {activities.length === 0 && (
          <section className="mt-8 rounded-2xl px-5 py-6 text-center" style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}` }}>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: "rgba(255,130,63,0.12)", color: ORANGE }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="mt-3" style={{ fontSize: 14.5, fontWeight: 600 }}>You're all caught up</p>
            <p className="mt-1" style={{ fontSize: 13, color: "var(--on-card-muted)" }}>We'll let you know when something needs you.</p>
          </section>
        )}

        <div style={{ height: 16 }} />
      </div>
    </AppShell>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { text, isDark } = useAuthTheme();
  const muted = "var(--muted-foreground)";
  return (
    <div>
      <h2 style={{ fontFamily: SANS_STACK, fontSize: 22, fontWeight: 700, letterSpacing: "-0.01em", color: text, margin: 0 }}>{title}</h2>
      <p style={{ fontFamily: SANS_STACK, fontSize: 13, color: muted, marginTop: 4 }}>{subtitle}</p>
    </div>
  );
}

function OfferCard({
  offer,
  claimed,
  onClaim,
  muted,
}: {
  offer: Offer;
  claimed: boolean;
  onClaim: () => void;
  muted: string;
}) {
  const isUrgent = !!offer.expiresIn;
  return (
    <li className="relative overflow-hidden rounded-2xl bg-card text-card-foreground shadow-sm">
      {/* Left orange rail */}
      <span aria-hidden className="absolute left-0 top-2 bottom-2 w-1 rounded-full" style={{ backgroundColor: ORANGE }} />
      <div className="flex items-center gap-3 px-3.5 py-3.5">
        <OfferBadge offer={offer} />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2" style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.25, color: "var(--card-foreground)" }}>
            {offer.title}
          </p>
          <p className="mt-1" style={{ fontSize: 12, color: "var(--on-card-muted)", lineHeight: 1.35 }}>
            {offer.subline}
          </p>
          {isUrgent && (
            <p className="mt-1 flex items-center gap-1" style={{ fontSize: 12, fontWeight: 600, color: ORANGE }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              {offer.expiresIn}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClaim}
          disabled={claimed}
          className="shrink-0 rounded-full px-4 py-2 transition-transform active:scale-95 disabled:active:scale-100"
          style={{
            backgroundColor: claimed ? "rgba(6,28,39,0.08)" : ORANGE,
            color: claimed ? "rgba(6,28,39,0.55)" : "#1A0E08",
            fontSize: 13.5,
            fontWeight: 700,
          }}
        >
          {claimed ? "Claimed ✓" : "Claim"}
        </button>
      </div>
    </li>
  );
}

function OfferBadge({ offer }: { offer: Offer }) {
  const sz = 48;
  const baseStyle = {
    width: sz,
    height: sz,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
    fontFamily: SANS_STACK,
  } as const;

  if (offer.badgeStyle === "percent") {
    return (
      <div style={{ ...baseStyle, background: "linear-gradient(135deg, #FF9F6B 0%, #FF823F 100%)", color: "#FFF" }}>
        <span style={{ fontSize: 13, fontWeight: 800, lineHeight: 1, textAlign: "center" }}>
          {offer.badge}
          <br />
          <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.04em" }}>OFF</span>
        </span>
      </div>
    );
  }
  if (offer.badgeStyle === "heart") {
    return (
      <div style={{ ...baseStyle, background: "linear-gradient(135deg, #6B3A1A 0%, #8B3A1A 100%)", color: "#FFF" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
    );
  }
  if (offer.badgeStyle === "bolt") {
    return (
      <div style={{ ...baseStyle, background: "linear-gradient(135deg, #6B3A1A 0%, #8B3A1A 100%)", color: "#FFF" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      </div>
    );
  }
  // initials
  return (
    <div style={{ ...baseStyle, background: "linear-gradient(135deg, #FFD9C7 0%, #FFBBA0 100%)", color: "#9A3412" }}>
      <span style={{ fontSize: 14, fontWeight: 700 }}>{offer.initials}</span>
    </div>
  );
}

function WayCard({
  way,
}: {
  way: { id: string; eyebrow: string; title: string; cta: string; gradient: string; onClick: () => void };
}) {
  return (
    <button
      type="button"
      onClick={way.onClick}
      className="relative shrink-0 overflow-hidden rounded-3xl text-left transition-transform active:scale-[0.98]"
      style={{
        width: 280,
        height: 220,
        background: way.gradient,
        color: "#FFF",
        fontFamily: SANS_STACK,
      }}
    >
      {/* Decorative star */}
      <svg
        aria-hidden
        className="absolute -right-6 -bottom-2"
        width="220"
        height="220"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
        strokeLinejoin="round"
        style={{ opacity: 0.18 }}
      >
        <polygon points="12 2 15 9 22 9.3 16.5 13.7 18.5 21 12 17 5.5 21 7.5 13.7 2 9.3 9 9 12 2" />
      </svg>
      <div className="flex h-full flex-col justify-between p-5">
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.85 }}>
            {way.eyebrow}
          </div>
          <p
            className="mt-2 whitespace-pre-line"
            style={{ fontFamily: FRAUNCES, fontSize: 30, fontWeight: 400, lineHeight: 1.05, letterSpacing: "-0.02em" }}
          >
            {way.title}
          </p>
        </div>
        <span
          className="inline-flex w-fit items-center gap-1 rounded-full px-4 py-2"
          style={{ backgroundColor: "#F0EBD8", color: "#061C27", fontSize: 13, fontWeight: 700 }}
        >
          {way.cta}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
    </button>
  );
}

/* ───────── Activity helpers ───────── */

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function relativeTimeLabel(ts: number, now = Date.now()): string {
  const diff = now - ts;
  const min = 60 * 1000;
  const hr = 60 * min;
  const day = 24 * hr;
  if (diff < min) return "just now";
  if (diff < hr) return `${Math.floor(diff / min)} min ago`;
  if (diff < day) return `${Math.floor(diff / hr)} hr ago`;
  const days = Math.floor((startOfDay(now) - startOfDay(ts)) / day);
  if (days === 1) {
    const d = new Date(ts);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `Yesterday · ${h12}:${m} ${ampm}`;
  }
  if (days < 7) {
    const weekday = new Date(ts).toLocaleDateString(undefined, { weekday: "short" });
    const d = new Date(ts);
    const h = d.getHours();
    const m = d.getMinutes().toString().padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${weekday} · ${h12}:${m} ${ampm}`;
  }
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function groupByBucket(activities: Activity[]): { label: string; items: Activity[] }[] {
  const now = Date.now();
  const today = startOfDay(now);
  const yesterday = today - 24 * 60 * 60 * 1000;
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
  const buckets: Record<string, Activity[]> = { Today: [], Yesterday: [], "This week": [], Earlier: [] };
  for (const a of activities) {
    if (a.ts >= today) buckets.Today!.push(a);
    else if (a.ts >= yesterday) buckets.Yesterday!.push(a);
    else if (a.ts >= weekAgo) buckets["This week"]!.push(a);
    else buckets.Earlier!.push(a);
  }
  return (["Today", "Yesterday", "This week", "Earlier"] as const)
    .map((label) => ({ label, items: buckets[label]! }))
    .filter((b) => b.items.length > 0);
}

/* ───────── ActivityItem ───────── */

function ActivityItem({
  a,
  onTap,
  muted,
  text,
  isDark,
  subtleBorder,
}: {
  a: Activity;
  onTap: () => void;
  muted: string;
  text: string;
  isDark: boolean;
  subtleBorder: string;
}) {
  // Unread bg — soft accent in light mode, faint accent wash on dark
  const unreadBg = isDark ? "rgba(255,130,63,0.10)" : "#FFF2EC";
  const rowBg = a.unread ? unreadBg : "transparent";

  return (
    <button
      type="button"
      onClick={onTap}
      className="relative flex w-full items-start gap-3 px-5 py-3 text-left transition-colors"
      style={{
        backgroundColor: rowBg,
        borderBottom: `1px solid ${subtleBorder}`,
        fontFamily: SANS_STACK,
      }}
    >
      {a.unread && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 6,
            height: 6,
            borderRadius: 9999,
            backgroundColor: ORANGE,
          }}
        />
      )}

      <ActivityAvatar a={a} unread={a.unread} isDark={isDark} />

      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 13.5, color: text, lineHeight: 1.45 }}>
          {a.body.map((seg, i) => (
            <span
              key={i}
              style={{
                fontWeight: seg.bold ? 600 : 400,
                color: seg.accent ? ORANGE : undefined,
              }}
            >
              {seg.text}
            </span>
          ))}
        </p>

        <div
          className="mt-1.5 flex flex-wrap items-center gap-2"
          style={{ fontSize: 11.5, color: muted }}
        >
          {a.label && (
            <span
              className="inline-flex items-center rounded-full"
              style={{
                padding: "2px 8px",
                backgroundColor: TONE_BG[a.label.tone],
                color: TONE_FG[a.label.tone],
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {a.label.text}
            </span>
          )}
          <span>{relativeTimeLabel(a.ts)}</span>
        </div>

        {a.ctas && a.ctas.length > 0 && (
          <div className="mt-3 flex gap-2">
            {a.ctas.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  c.onTap();
                }}
                className="rounded-full transition-transform active:scale-95"
                style={{
                  padding: "7px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: SANS_STACK,
                  backgroundColor: c.primary ? ORANGE : "transparent",
                  color: c.primary ? "#1A0E08" : text,
                  border: c.primary ? "none" : `1px solid ${subtleBorder}`,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {a.thumbUrl && (
        <div
          className="shrink-0 overflow-hidden rounded-lg"
          style={{ width: 50, height: 50, boxShadow: "0 1px 2px rgba(20,25,40,0.04)" }}
        >
          <img src={a.thumbUrl} alt="" className="h-full w-full object-cover" />
        </div>
      )}
    </button>
  );
}

function ActivityAvatar({ a, unread, isDark }: { a: Activity; unread: boolean; isDark: boolean }) {
  const surfaceBg = isDark ? "#061C27" : unread ? "#FFF2EC" : "#FFFFFF";
  const sz = 44;
  let inner: React.ReactNode;
  let style: React.CSSProperties = { width: sz, height: sz, fontSize: 14, fontWeight: 700, borderRadius: 9999 };

  if (a.avatar.kind === "initials") {
    const tints: Record<AvatarTint, { bg: string; fg: string }> = {
      peach: { bg: "linear-gradient(135deg, #FFD9C7 0%, #FFBBA0 100%)", fg: "#9A3412" },
      blue: { bg: "linear-gradient(135deg, #DBEAFE 0%, #93C5FD 100%)", fg: "#1E3A8A" },
      green: { bg: "linear-gradient(135deg, #DCFCE7 0%, #86EFAC 100%)", fg: "#166534" },
      pink: { bg: "linear-gradient(135deg, #FCE7F3 0%, #F9A8D4 100%)", fg: "#9D174D" },
      promo: { bg: "linear-gradient(135deg, #FF823F 0%, #FF8C5A 100%)", fg: "#fff" },
      system: { bg: "#F4F6F8", fg: "#6B7684" },
      gift: { bg: "linear-gradient(135deg, #FFD9C7 0%, #FF9270 100%)", fg: "#7C2D12" },
    };
    const t = tints[a.avatar.tint];
    style = { ...style, background: t.bg, color: t.fg };
    inner = a.avatar.initials;
  } else if (a.avatar.kind === "promo-percent") {
    style = {
      ...style,
      background: "linear-gradient(135deg, #FF823F 0%, #FF8C5A 100%)",
      color: "#fff",
      borderRadius: 12,
      fontSize: 11,
      fontWeight: 800,
      flexDirection: "column",
      gap: 1,
      lineHeight: 1,
    };
    inner = (
      <>
        <span>{a.avatar.pct}</span>
        <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: "0.04em" }}>OFF</span>
      </>
    );
  } else {
    style = { ...style, backgroundColor: "#F4F6F8", color: "#6B7684", borderRadius: 12, border: "1px solid #EEF1F4" };
    inner = (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    );
  }

  return (
    <div className="relative flex shrink-0 items-center justify-center" style={style}>
      {inner}
      {a.badge && a.badge !== "none" && <StatusBadge kind={a.badge} ringColor={surfaceBg} />}
    </div>
  );
}

function StatusBadge({ kind, ringColor }: { kind: StatusBadgeKind; ringColor: string }) {
  const map: Record<Exclude<StatusBadgeKind, "none">, { bg: string; icon: React.ReactNode }> = {
    confirmed: {
      bg: ORANGE,
      icon: (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    },
    declined: {
      bg: DANGER,
      icon: (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      ),
    },
    "on-the-way": {
      bg: ORANGE,
      icon: (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    },
    info: {
      bg: INFO,
      icon: (
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ),
    },
  };
  if (kind === "none") return null;
  const conf = map[kind];
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        bottom: -2,
        right: -2,
        width: 18,
        height: 18,
        borderRadius: 9999,
        border: `2.5px solid ${ringColor}`,
        backgroundColor: conf.bg,
        color: "#fff",
        display: "grid",
        placeItems: "center",
      }}
    >
      {conf.icon}
    </span>
  );
}

// Suppress unused-warning for INK_900 if not consumed elsewhere
const __INK = INK_900;
void __INK;
