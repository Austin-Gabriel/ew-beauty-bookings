import { useMemo, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useDevState } from "@/dev-state/devState";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";
const INFO = "#3B82F6";
const FRAUNCES = '"Fraunces", "Times New Roman", serif';

type Offer = {
  id: string;
  title: string;
  subline: string;
  badge: string;
  badgeStyle: "percent" | "dollar" | "heart" | "bolt" | "initials";
  initials?: string;
  expiresIn?: string; // urgency text
};

type Notif = {
  id: string;
  kind: "booking" | "new-pro" | "offer" | "reminder";
  title: string;
  body: string;
  ago: string;
  route?: "bookings" | "pro" | "discover";
  proId?: string;
};

export function NotificationsPage() {
  const { state } = useDevState();
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const router = useRouter();

  const muted = isDark ? "rgba(240,235,216,0.55)" : "rgba(6,28,39,0.62)";
  const subtleSurface = isDark ? "rgba(240,235,216,0.06)" : "#FFFFFF";
  const subtleBorder = isDark ? "rgba(240,235,216,0.10)" : "rgba(6,28,39,0.10)";

  // -------- Promo code input --------
  const [promo, setPromo] = useState("");
  const onApplyPromo = () => {
    const code = promo.trim().toUpperCase();
    if (!code) return;
    if (code === "EWA10" || code === "WELCOME") {
      toast(`${code} applied — 10% off your next booking`);
    } else {
      toast("That code isn't valid");
    }
    setPromo("");
  };

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

  // -------- App notifications (top of page) --------
  const notifs: Notif[] = useMemo(() => {
    if (state.customerState === "new") return [];
    const amara = MOCK_PROS.find((p) => p.id === "amara-okafor") ?? MOCK_PROS[0]!;
    const newPro = MOCK_PROS.find((p) => p.newOnEwa) ?? MOCK_PROS[1]!;
    return [
      {
        id: "n1",
        kind: "booking",
        title: `${amara.name.split(" ")[0]} confirmed your booking`,
        body: "Tomorrow at 2:00 PM · Knotless braids",
        ago: "2h",
        route: "bookings",
      },
      {
        id: "n2",
        kind: "new-pro",
        title: "New braider near you",
        body: `${newPro.name.split(" ")[0]} just joined Ewà in ${newPro.neighborhood}`,
        ago: "yesterday",
        route: "pro",
        proId: newPro.id,
      },
      {
        id: "n3",
        kind: "reminder",
        title: "Booking reminder",
        body: `Don't forget your appointment with ${amara.name.split(" ")[0]} tomorrow.`,
        ago: "5h",
        route: "bookings",
      },
    ];
  }, [state.customerState]);

  const onTapNotif = (n: Notif) => {
    if (n.route === "bookings") navigate({ to: "/bookings" });
    else if (n.route === "discover") navigate({ to: "/discover" });
    else if (n.route === "pro" && n.proId) navigate({ to: "/pro/$proId", params: { proId: n.proId } });
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

        {/* Recent activity (notifications) ---------------------------- */}
        {notifs.length > 0 && (
          <section className="mt-7">
            <SectionHeader title="Recent activity" subtitle="Updates from your bookings and pros" />
            <ul className="mt-3 flex flex-col gap-1.5">
              {notifs.map((n) => {
                const dot = n.kind === "booking" ? SUCCESS : n.kind === "new-pro" ? ORANGE : INFO;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onTapNotif(n)}
                      className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors"
                      style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}` }}
                    >
                      <span aria-hidden className="mt-1.5 inline-block shrink-0" style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: dot }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span style={{ fontSize: 13.5, fontWeight: 700 }} className="truncate">{n.title}</span>
                          <span style={{ fontSize: 11, color: muted, flexShrink: 0 }}>{n.ago}</span>
                        </div>
                        <p className="mt-0.5" style={{ fontSize: 12.5, color: muted }}>{n.body}</p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
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
        {notifs.length === 0 && (
          <section className="mt-8 rounded-2xl px-5 py-6 text-center" style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}` }}>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full" style={{ backgroundColor: "rgba(22,163,74,0.12)", color: SUCCESS }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <p className="mt-3" style={{ fontSize: 14.5, fontWeight: 600 }}>You're all caught up</p>
            <p className="mt-1" style={{ fontSize: 13, color: muted }}>We'll let you know when something needs you.</p>
          </section>
        )}

        <div style={{ height: 16 }} />
      </div>
    </AppShell>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  const { text, isDark } = useAuthTheme();
  const muted = isDark ? "rgba(240,235,216,0.55)" : "rgba(6,28,39,0.62)";
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
          <p className="mt-1" style={{ fontSize: 12, color: muted, lineHeight: 1.35 }}>
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
