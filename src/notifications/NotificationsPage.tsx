import { useMemo } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useDevState } from "@/dev-state/devState";
import { MOCK_PROS } from "@/data/mock-pros";
import { usePromos, LOYALTY_CYCLE, LOYALTY_DISCOUNT_PCT, WELCOME_DISCOUNT_PCT } from "@/promos/store";
import { Lock, Check } from "lucide-react";


const ORANGE = "#FF823F";
const DANGER = "#DC2626";
const INFO = "#3B82F6";
const INK_900 = "#0B1220";

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


export function NotificationsPage() {
  const { state } = useDevState();
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const promos = usePromos();


  const muted = "var(--muted-foreground)";
  const subtleSurface = "var(--surface-elevated)";
  const subtleBorder = "var(--border)";


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
        ctas: [
          {
            label: `Rate ${amara.name.split(" ")[0]}`,
            primary: true,
            onTap: () => navigate({ to: "/booking/rate/$bookingId", params: { bookingId: "bk-past-amara-apr" } }),
          },
        ],
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
          Notifications
        </h1>
      </header>

      <div className="px-5 pt-4" style={{ fontFamily: SANS_STACK, color: text }}>
        {/* Promotions --------------------------------------------------- */}
        {promos.cardType !== "none" && (
          <section className="mt-2">
            <p
              className="pl-1"
              style={{
                fontFamily: SANS_STACK,
                fontSize: 11.5,
                fontWeight: 700,
                color: muted,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              Promotions
            </p>
            {promos.cardType === "welcome" && <WelcomeCard />}
            {promos.cardType === "loyalty" && (
              <LoyaltyCard progress={promos.loyaltyProgress} />
            )}
            {promos.cardType === "reward" && <RewardReadyCard />}
          </section>
        )}

        {/* Recent activity ---------------------------------------------- */}
        {activities.length > 0 && (

          <section className="-mx-5 mt-4">
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
                <ul className="flex flex-col gap-2.5 px-5">
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
  const buckets: Record<string, Activity[]> = { Today: [], Yesterday: [], "This week": [] };
  for (const a of activities) {
    if (a.ts >= today) buckets.Today!.push(a);
    else if (a.ts >= yesterday) buckets.Yesterday!.push(a);
    else if (a.ts >= weekAgo) buckets["This week"]!.push(a);
    // anything older is dropped — "Earlier" bucket removed per brief
  }
  return (["Today", "Yesterday", "This week"] as const)
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
  // Unread bg — soft accent wash; otherwise plain white card surface
  const unreadBg = "#FFF2EC";
  const rowBg = a.unread ? unreadBg : "var(--card)";
  const cardText = "var(--card-foreground)";
  const cardMuted = "var(--on-card-muted)";

  return (
    <button
      type="button"
      onClick={onTap}
      className="relative flex w-full items-start gap-3 px-4 py-3 text-left transition-transform active:scale-[0.99]"
      style={{
        backgroundColor: rowBg,
        border: `1px solid ${subtleBorder}`,
        borderRadius: 16,
        boxShadow: "0 1px 2px rgba(11,28,39,0.04)",
        fontFamily: SANS_STACK,
      }}
    >
      {a.unread && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            left: 8,
            top: 12,
            width: 6,
            height: 6,
            borderRadius: 9999,
            backgroundColor: ORANGE,
          }}
        />
      )}

      <ActivityAvatar a={a} unread={a.unread} isDark={isDark} />

      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 13.5, color: cardText, lineHeight: 1.45 }}>
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
          style={{ fontSize: 11.5, color: cardMuted }}
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
                  color: c.primary ? "#1A0E08" : cardText,
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

/* ───────── Promotion cards ───────── */

function WelcomeCard() {
  return (
    <div
      className="relative overflow-hidden rounded-2xl px-5 py-5"
      style={{
        backgroundColor: "var(--bagel)",
        color: "var(--bagel-foreground)",
        fontFamily: SANS_STACK,
      }}
    >
      <p
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--bagel-foreground)",
          opacity: 0.85,
        }}
      >
        Welcome offer
      </p>
      <h3
        style={{
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--bagel-foreground)",
          marginTop: 6,
          lineHeight: 1.15,
        }}
      >
        {WELCOME_DISCOUNT_PCT}% off your first booking
      </h3>
      <p
        style={{
          fontSize: 14,
          color: "var(--bagel-foreground)",
          opacity: 0.88,
          marginTop: 6,
          lineHeight: 1.45,
        }}
      >
        Welcome to Ewà. Your first booking is on us.
      </p>
      <div
        className="mt-4 inline-flex items-center gap-1.5"
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "var(--bagel-foreground)",
          opacity: 0.85,
        }}
      >
        <Lock size={11} />
        <span>Auto-applied</span>
      </div>
    </div>
  );
}

function LoyaltyCard({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(LOYALTY_CYCLE, progress)) / LOYALTY_CYCLE;
  return (
    <div
      className="rounded-2xl border px-5 py-5 shadow-sm"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        fontFamily: SANS_STACK,
      }}
    >
      <p
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--on-card-muted)",
        }}
      >
        Earn a reward
      </p>
      <h3
        style={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: "var(--card-foreground)",
          marginTop: 6,
          lineHeight: 1.2,
        }}
      >
        {LOYALTY_DISCOUNT_PCT}% off your next booking
      </h3>
      <p
        style={{
          fontSize: 13.5,
          color: "var(--on-card-muted)",
          marginTop: 6,
          lineHeight: 1.45,
        }}
      >
        Complete {LOYALTY_CYCLE} bookings to earn this reward.
      </p>

      {/* Progress bar */}
      <div
        className="mt-4 h-1.5 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <div
          style={{
            width: `${pct * 100}%`,
            height: "100%",
            backgroundColor: "var(--bagel)",
            borderRadius: 9999,
            transition: "width 300ms ease",
          }}
        />
      </div>
      <p
        className="tabular mt-2 text-right"
        style={{ fontSize: 12, color: "var(--on-card-muted)", fontVariantNumeric: "tabular-nums" }}
      >
        {progress} of {LOYALTY_CYCLE} completed
      </p>
    </div>
  );
}

function RewardReadyCard() {
  return (
    <div
      className="relative rounded-2xl border px-5 py-5 shadow-sm"
      style={{
        backgroundColor: "var(--card)",
        borderColor: "var(--border)",
        fontFamily: SANS_STACK,
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--bagel)",
            }}
          >
            Reward ready
          </p>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              color: "var(--card-foreground)",
              marginTop: 6,
              lineHeight: 1.2,
            }}
          >
            {LOYALTY_DISCOUNT_PCT}% off your next booking
          </h3>
          <p
            style={{
              fontSize: 13.5,
              color: "var(--on-card-muted)",
              marginTop: 6,
              lineHeight: 1.45,
            }}
          >
            You'll get this discount automatically when you book next.
          </p>
        </div>
        <span
          aria-hidden
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
          style={{ backgroundColor: "var(--bagel)", color: "var(--bagel-foreground)" }}
        >
          <Check size={18} strokeWidth={3} />
        </span>
      </div>
    </div>
  );
}

void __INK;
