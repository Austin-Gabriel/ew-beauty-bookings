import { useNavigate } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "./AppShell";
import { useFavorites } from "./useFavorites";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { EwaMark } from "@/components/ewa-logo";
import { MOCK_PROS, PROFESSIONAL_TYPES, type Pro } from "@/data/mock-pros";
import { useDevState } from "@/dev-state/devState";
import {
  NEW_CUSTOMER,
  RETURNING_CUSTOMER,
  POWER_CUSTOMER,
} from "@/data/mock-customer-profile";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";
const INFO = "#3B82F6";

type ChipId = "All" | (typeof PROFESSIONAL_TYPES)[number];
type PriceFilter = "any" | "$" | "$$" | "$$$";
type RatingFilter = 0 | 4.0 | 4.5 | 4.8;
type AvailFilter = "any" | "today" | "week" | "weekend";
type RadiusMi = 1 | 3 | 5 | 10 | 25;

const RADIUS_OPTIONS: { value: RadiusMi; label: string }[] = [
  { value: 1, label: "Just my block" },
  { value: 3, label: "My neighborhood" },
  { value: 5, label: "Nearby" },
  { value: 10, label: "Across Brooklyn" },
  { value: 25, label: "All boroughs" },
];

export function DiscoverPage() {
  const { state } = useDevState();
  const { isDark, text, borderCol } = useAuthTheme();
  const navigate = useNavigate();
  const favorites = useFavorites();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<"now" | "later">("later");
  const isNow = mode === "now";
  const accent = isNow ? SUCCESS : ORANGE;
  const [activeChip, setActiveChip] = useState<ChipId>("All");
  const [search, setSearch] = useState("");

  // Sheet open state
  const [savedSheetOpen, setSavedSheetOpen] = useState(false);
  const [notifSheetOpen, setNotifSheetOpen] = useState(false);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const [radiusSheetOpen, setRadiusSheetOpen] = useState(false);

  // Filter state (committed)
  const [radiusMi, setRadiusMi] = useState<RadiusMi>(5);
  const [priceFilter, setPriceFilter] = useState<PriceFilter>("any");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<AvailFilter>("any");
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  const customer =
    state.customerState === "power"
      ? POWER_CUSTOMER
      : state.customerState === "returning"
        ? RETURNING_CUSTOMER
        : NEW_CUSTOMER;

  const initials = customer.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const activeFilterCount =
    (priceFilter !== "any" ? 1 : 0) +
    (ratingFilter !== 0 ? 1 : 0) +
    (availabilityFilter !== "any" ? 1 : 0);

  const filtered = useMemo(() => {
    let list = MOCK_PROS;
    if (activeChip !== "All") list = list.filter((p) => p.professionalType === activeChip);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.headline.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.specializations.some((s) => s.toLowerCase().includes(q)),
      );
    }
    if (priceFilter !== "any") {
      list = list.filter((p) => {
        if (priceFilter === "$") return p.priceFrom < 80;
        if (priceFilter === "$$") return p.priceFrom >= 80 && p.priceFrom <= 150;
        return p.priceFrom > 150;
      });
    }
    if (ratingFilter !== 0) {
      list = list.filter((p) => p.rating >= ratingFilter);
    }
    if (availabilityFilter === "today") {
      list = list.filter((p) => p.online);
    }
    return list;
  }, [activeChip, search, priceFilter, ratingFilter, availabilityFilter]);

  const onlineList = useMemo(() => filtered.filter((p) => p.online), [filtered]);
  const spotlight = useMemo(
    () => [...filtered].sort((a, b) => b.rating - a.rating)[0],
    [filtered],
  );
  const newInArea = useMemo(() => filtered.filter((p) => p.newOnEwa), [filtered]);

  const goToPro = (pro: Pro) => navigate({ to: "/pro/$proId", params: { proId: pro.id } });

  const handleFavorite = (pro: Pro) => {
    const nowFavorite = favorites.toggle(pro.id);
    toast(nowFavorite ? `Saved ${pro.name}` : `Removed ${pro.name}`);
  };

  const savedPros = useMemo(
    () => MOCK_PROS.filter((p) => favorites.isFavorite(p.id)),
    [favorites],
  );

  // Notifications — keyed off mock data so taps go to real pros
  const allNotifications = useMemo(
    () =>
      buildNotifications(state.customerState, MOCK_PROS).map((n) => ({
        ...n,
        unread: !readNotifIds.has(n.id),
      })),
    [state.customerState, readNotifIds],
  );
  const unreadCount = allNotifications.filter((n) => n.unread).length;

  // Theme tokens
  const subtleSurface = isDark ? "rgba(240,235,216,0.06)" : "#FFFFFF";
  const subtleBorder = isDark ? "rgba(240,235,216,0.10)" : "rgba(6,28,39,0.14)";
  const muted = isDark ? "rgba(240,235,216,0.55)" : "rgba(6,28,39,0.62)";
  const faint = isDark ? "rgba(240,235,216,0.32)" : "rgba(6,28,39,0.42)";

  const handleTrendingTap = (label: string) => {
    if (label === "Knotless braids") {
      setActiveChip("Hairdresser");
      setSearch("knotless");
      toast("Showing hairdressers for knotless");
    } else if (label === "Silk press") {
      setActiveChip("Hairdresser");
      setSearch("silk press");
      toast("Showing hairdressers for silk press");
    } else if (label === "Locs") {
      setActiveChip("Loctician");
      setSearch("");
      toast("Showing locticians");
    } else {
      navigate({ to: "/see-all/$category", params: { category: "trending" } });
      return;
    }
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell editorial>
      {/* HEADER ------------------------------------------------------------ */}
      <header className="px-5 pt-4">
        <div className="mb-2.5 flex items-center justify-between">
          <EwaMark size={32} />
          <div className="flex items-center gap-2">
            <IconButton
              ariaLabel="Saved"
              onClick={() => setSavedSheetOpen(true)}
              bg={subtleSurface}
              border={subtleBorder}
              color={text}
              dot={favorites.count > 0}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </IconButton>
            <IconButton
              ariaLabel="Notifications"
              onClick={() => setNotifSheetOpen(true)}
              bg={subtleSurface}
              border={subtleBorder}
              color={text}
              dot={unreadCount > 0}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </IconButton>
            <button
              type="button"
              onClick={() => navigate({ to: "/profile" })}
              aria-label="Profile"
              className="grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #FFD9C7 0%, #FFBBA0 100%)",
                color: "#9A3412",
                fontSize: 11,
                fontWeight: 600,
                fontFamily: SANS_STACK,
              }}
            >
              {initials}
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div
          className="flex h-11 items-center gap-2.5 rounded-2xl border pl-4 pr-1.5"
          style={{ borderColor: subtleBorder, backgroundColor: subtleSurface }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search styles, stylists, neighborhoods…"
            className="flex-1 border-0 bg-transparent outline-none placeholder:text-current/50"
            style={{
              color: text,
              fontFamily: SANS_STACK,
              fontSize: 13.5,
              fontWeight: 400,
              minWidth: 0,
            }}
          />
          <button
            type="button"
            aria-label={activeFilterCount > 0 ? `Filters (${activeFilterCount} active)` : "Filters"}
            onClick={() => setFiltersSheetOpen(true)}
            className="relative grid h-8 w-8 place-items-center rounded-xl transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: ORANGE, color: "#1A0E08" }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="20" y2="12" />
              <line x1="10" y1="18" x2="20" y2="18" />
              <circle cx="7" cy="6" r="2" fill="currentColor" />
              <circle cx="13" cy="12" r="2" fill="currentColor" />
              <circle cx="16" cy="18" r="2" fill="currentColor" />
            </svg>
            {activeFilterCount > 0 && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  minWidth: 16,
                  height: 16,
                  padding: "0 4px",
                  borderRadius: 9999,
                  backgroundColor: "#1A0E08",
                  color: ORANGE,
                  fontFamily: SANS_STACK,
                  fontSize: 10,
                  fontWeight: 700,
                  display: "grid",
                  placeItems: "center",
                  border: `2px solid ${isDark ? "#061C27" : "#F0EBD8"}`,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mode switch + compact location */}
        <div className="mt-2 flex items-stretch gap-2">
          <ModeSwitch mode={mode} onChange={setMode} subtleSurface={subtleSurface} subtleBorder={subtleBorder} />
          <button
            type="button"
            onClick={() => setRadiusSheetOpen(true)}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl border px-3 transition-transform active:scale-95"
            style={{
              borderColor: subtleBorder,
              backgroundColor: subtleSurface,
              color: text,
              fontFamily: SANS_STACK,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {radiusMi} mi
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={faint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </header>

      {/* LIVE CONTEXT STRIP (only in Now mode) */}
      {isNow && (
        <div
          className="mx-5 mt-2 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2"
          style={{
            backgroundColor: "rgba(22,163,74,0.10)",
            color: SUCCESS,
            fontFamily: SANS_STACK,
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          <span aria-hidden className="ewa-pulse" style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: SUCCESS }} />
          {onlineList.length} stylists ready in Brooklyn
        </div>
      )}

      {/* SERVICE CHIPS ----------------------------------------------------- */}
      <div ref={scrollRef} className="mt-3.5 flex gap-2 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
        <Chip active={activeChip === "All"} accent={accent} onClick={() => setActiveChip("All")} text={text} subtleSurface={subtleSurface} subtleBorder={subtleBorder}>
          All
        </Chip>
        {PROFESSIONAL_TYPES.map((type) => (
          <Chip
            key={type}
            active={activeChip === type}
            accent={accent}
            onClick={() => setActiveChip(type)}
            text={text}
            subtleSurface={subtleSurface}
            subtleBorder={subtleBorder}
          >
            {type}
          </Chip>
        ))}
      </div>

      {/* CONTENT ----------------------------------------------------------- */}
      <div className="mt-4 flex flex-col gap-7 px-5 pb-6">
        {/* Available right now (only in Now mode) */}
        {isNow && onlineList.length > 0 && (
          <Section
            title="Available right now"
            subtitle={`${onlineList.length} stylists ready in next 2 hours`}
            seeAll
            onAction={() => navigate({ to: "/see-all/$category", params: { category: "online" } })}
            accent={accent}
            muted={muted}
            text={text}
            badge={<LiveBadge />}
          >
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
              {onlineList.map((pro) => (
                <OnlineCard
                  key={pro.id}
                  pro={pro}
                  favorited={favorites.isFavorite(pro.id)}
                  onTap={() => goToPro(pro)}
                  onFavorite={() => handleFavorite(pro)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Available today — hero card */}
        {spotlight && (
          <Section
            title="Available today"
            subtitle={isNow ? "Other open spots later today" : "Top-rated stylists with open spots"}
            seeAll
            onAction={() => navigate({ to: "/see-all/$category", params: { category: "available" } })}
            accent={accent}
            muted={muted}
            text={text}
          >
            <HeroCard
              pro={spotlight}
              favorited={favorites.isFavorite(spotlight.id)}
              onTap={() => goToPro(spotlight)}
              onFavorite={() => handleFavorite(spotlight)}
            />
          </Section>
        )}

        {/* New in your area */}
        {newInArea.length > 0 && (
          <Section
            title="New in your area"
            subtitle="Stylists who recently joined"
            seeAll
            onAction={() => navigate({ to: "/see-all/$category", params: { category: "new" } })}
            accent={accent}
            muted={muted}
            text={text}
          >
            <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
              {newInArea.map((pro) => (
                <CompactCard
                  key={pro.id}
                  pro={pro}
                  favorited={favorites.isFavorite(pro.id)}
                  onTap={() => goToPro(pro)}
                  onFavorite={() => handleFavorite(pro)}
                />
              ))}
            </div>
          </Section>
        )}

        {/* Trending styles */}
        <Section
          title="Trending styles"
          subtitle="What clients are booking this week"
          accent={accent}
          muted={muted}
          text={text}
          actionLabel="Explore"
          onAction={() => navigate({ to: "/see-all/$category", params: { category: "trending" } })}
        >
          <TrendingGrid onTap={handleTrendingTap} />
        </Section>
      </div>

      {/* SHEETS ------------------------------------------------------------ */}
      <SavedSheet
        open={savedSheetOpen}
        onOpenChange={setSavedSheetOpen}
        savedPros={savedPros}
        onUnfavorite={(p) => favorites.toggle(p.id)}
        onTapPro={(p) => {
          setSavedSheetOpen(false);
          goToPro(p);
        }}
      />
      <NotificationsSheet
        open={notifSheetOpen}
        onOpenChange={setNotifSheetOpen}
        notifications={allNotifications}
        onMarkAllRead={() =>
          setReadNotifIds(new Set(allNotifications.map((n) => n.id)))
        }
        onTapNotif={(n) => {
          setReadNotifIds((prev) => new Set(prev).add(n.id));
          setNotifSheetOpen(false);
          if (n.route === "bookings") navigate({ to: "/bookings" });
          else if (n.route === "messages") navigate({ to: "/messages" });
          else if (n.route === "pro" && n.proId) navigate({ to: "/pro/$proId", params: { proId: n.proId } });
        }}
      />
      <FiltersSheet
        open={filtersSheetOpen}
        onOpenChange={setFiltersSheetOpen}
        price={priceFilter}
        rating={ratingFilter}
        availability={availabilityFilter}
        onApply={(p, r, a) => {
          setPriceFilter(p);
          setRatingFilter(r);
          setAvailabilityFilter(a);
          setFiltersSheetOpen(false);
          // small nicety — count after applying
          setTimeout(() => {
            const count = MOCK_PROS.filter((pro) => {
              if (p !== "any") {
                if (p === "$" && pro.priceFrom >= 80) return false;
                if (p === "$$" && (pro.priceFrom < 80 || pro.priceFrom > 150)) return false;
                if (p === "$$$" && pro.priceFrom <= 150) return false;
              }
              if (r !== 0 && pro.rating < r) return false;
              if (a === "today" && !pro.online) return false;
              return true;
            }).length;
            toast(`Showing ${count} pros`);
          }, 0);
        }}
        onReset={() => {
          setPriceFilter("any");
          setRatingFilter(0);
          setAvailabilityFilter("any");
        }}
      />
      <RadiusSheet
        open={radiusSheetOpen}
        onOpenChange={setRadiusSheetOpen}
        value={radiusMi}
        onChange={(v) => {
          setRadiusMi(v);
          setRadiusSheetOpen(false);
          toast(`Showing pros within ${v} mi`);
        }}
      />
    </AppShell>
  );
}

/* ───────────────────────── Sub-components ───────────────────────── */

function IconButton({
  children,
  onClick,
  ariaLabel,
  bg,
  border,
  color,
  dot = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  bg: string;
  border: string;
  color: string;
  dot?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="relative grid h-8 w-8 place-items-center rounded-full border transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: bg, borderColor: border, color }}
    >
      {children}
      {dot && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: 5,
            right: 5,
            width: 7,
            height: 7,
            borderRadius: 9999,
            backgroundColor: ORANGE,
            border: `2px solid ${bg}`,
          }}
        />
      )}
    </button>
  );
}

function ModeSwitch({
  mode,
  onChange,
  subtleSurface,
  subtleBorder,
}: {
  mode: "now" | "later";
  onChange: (m: "now" | "later") => void;
  subtleSurface: string;
  subtleBorder: string;
}) {
  return (
    <div
      className="grid min-w-0 flex-1 grid-cols-2 rounded-xl border p-0.5"
      style={{ backgroundColor: subtleSurface, borderColor: subtleBorder, fontFamily: SANS_STACK }}
    >
      {(["now", "later"] as const).map((m) => {
        const active = mode === m;
        const isNow = m === "now";
        const activeBg = isNow ? SUCCESS : ORANGE;
        const activeColor = isNow ? "#fff" : "#1A0E08";
        return (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className="inline-flex items-center justify-center gap-1.5 rounded-[9px] px-2 py-2 transition-colors"
            style={{
              backgroundColor: active ? activeBg : "transparent",
              color: active ? activeColor : "var(--muted-foreground)",
              fontSize: 12.5,
              fontWeight: 600,
              boxShadow: active ? (isNow ? "0 1px 3px rgba(22,163,74,0.4)" : "0 1px 3px rgba(255,130,63,0.3)") : "none",
              minWidth: 0,
            }}
          >
            {isNow ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            )}
            {isNow ? "Book now" : "Book later"}
          </button>
        );
      })}
    </div>
  );
}

function Chip({
  children,
  active,
  accent,
  onClick,
  text,
  subtleSurface,
  subtleBorder,
}: {
  children: React.ReactNode;
  active: boolean;
  accent: string;
  onClick: () => void;
  text: string;
  subtleSurface: string;
  subtleBorder: string;
}) {
  const activeText = accent === SUCCESS ? "#fff" : "#1A0E08";
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border px-3.5 py-2 transition-colors"
      style={{
        backgroundColor: active ? accent : subtleSurface,
        borderColor: active ? accent : subtleBorder,
        color: active ? activeText : text,
        fontFamily: SANS_STACK,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  subtitle,
  badge,
  seeAll = false,
  actionLabel,
  onAction,
  accent = ORANGE,
  text,
  muted,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  seeAll?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  accent?: string;
  text: string;
  muted: string;
  children: React.ReactNode;
}) {
  const action = actionLabel ?? (seeAll ? "See all" : null);
  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2
              style={{
                fontFamily: SANS_STACK,
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: "-0.015em",
                color: text,
                margin: 0,
              }}
            >
              {title}
            </h2>
            {badge}
          </div>
          {subtitle && (
            <p style={{ fontFamily: SANS_STACK, fontSize: 12, color: muted, marginTop: 2 }}>{subtitle}</p>
          )}
        </div>
        {action && onAction && (
          <button
            type="button"
            onClick={onAction}
            style={{
              fontFamily: SANS_STACK,
              fontSize: 13,
              fontWeight: 600,
              color: accent,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {action}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function LiveBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5"
      style={{
        backgroundColor: "rgba(22,163,74,0.18)",
        color: SUCCESS,
        fontFamily: SANS_STACK,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      <span aria-hidden className="ewa-pulse" style={{ width: 5, height: 5, borderRadius: 9999, backgroundColor: SUCCESS }} />
      Live
    </span>
  );
}

/* ───────── Cards ───────── */

const CARD_BG = "#FFFFFF";
const INK_900 = "#0B1220";
const INK_500 = "#6B7684";
const LINE = "#EEF1F4";

function HeroCard({
  pro,
  favorited,
  onTap,
  onFavorite,
}: {
  pro: Pro;
  favorited: boolean;
  onTap: () => void;
  onFavorite: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="cursor-pointer overflow-hidden rounded-3xl"
      style={{ backgroundColor: CARD_BG, fontFamily: SANS_STACK }}
    >
      <div className="relative h-[220px] overflow-hidden">
        <img src={pro.portfolio[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.5) 100%)" }}
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          <SmallTag bg={ORANGE} color="#1A0E08">★ Top rated</SmallTag>
          <SmallTag bg="rgba(10,22,40,0.7)" color="#fff">{pro.category}</SmallTag>
        </div>
        <FavoriteButton favorited={favorited} onClick={onFavorite} size={36} />
        <div
          className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full px-2 py-1"
          style={{ backgroundColor: "rgba(10,22,40,0.6)", color: "#fff", backdropFilter: "blur(10px)", fontSize: 11, fontWeight: 600 }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {pro.portfolio.length * 8}
        </div>
      </div>

      <div className="px-4 pb-4 pt-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar pro={pro} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1" style={{ fontSize: 15, fontWeight: 700, color: INK_900, letterSpacing: "-0.015em" }}>
              <span className="truncate">{pro.name}</span>
              {pro.certified && <VerifiedTick />}
            </div>
            <div className="mt-0.5 flex items-center gap-1" style={{ fontSize: 12, color: INK_500 }}>
              <span style={{ color: "#FFC107" }}>★</span>
              <span style={{ color: INK_900, fontWeight: 600 }}>{pro.rating.toFixed(1)}</span>
              <span>· {pro.reviewCount} reviews · {pro.headline}</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3" style={{ borderColor: LINE }}>
          <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11.5, fontWeight: 600, color: SUCCESS }}>
            <span aria-hidden className="ewa-pulse" style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: SUCCESS }} />
            Available 2:00 PM
          </span>
          <span className="inline-flex items-center gap-1" style={{ fontSize: 11.5, fontWeight: 500, color: "#2A3544" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INK_500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {pro.travelRadiusMi - 3.8 < 0 ? "1.2" : (pro.travelRadiusMi - 3.8).toFixed(1)} mi
          </span>
          <span className="ml-auto" style={{ fontSize: 14, fontWeight: 700, color: INK_900 }}>
            <span style={{ fontSize: 10, fontWeight: 500, color: INK_500, textTransform: "uppercase", letterSpacing: "0.06em", marginRight: 3 }}>
              From
            </span>
            ${pro.priceFrom}
          </span>
        </div>
      </div>
    </div>
  );
}

function OnlineCard({
  pro,
  favorited,
  onTap,
  onFavorite,
}: {
  pro: Pro;
  favorited: boolean;
  onTap: () => void;
  onFavorite: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="shrink-0 cursor-pointer overflow-hidden rounded-2xl"
      style={{
        backgroundColor: CARD_BG,
        width: 220,
        border: `1.5px solid rgba(22,163,74,0.3)`,
        fontFamily: SANS_STACK,
      }}
    >
      <div className="relative h-32 overflow-hidden">
        <img src={pro.portfolio[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span
          className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
          style={{
            backgroundColor: SUCCESS,
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          <span aria-hidden className="ewa-pulse" style={{ width: 4, height: 4, borderRadius: 9999, backgroundColor: "#fff" }} />
          Online
        </span>
        <FavoriteButton favorited={favorited} onClick={onFavorite} size={28} />
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <div className="flex items-center gap-1" style={{ fontSize: 13.5, fontWeight: 600, color: INK_900, letterSpacing: "-0.01em" }}>
          <span className="truncate">{pro.name}</span>
          {pro.certified && <VerifiedTick small />}
        </div>
        <div className="mt-0.5 flex items-center gap-1" style={{ fontSize: 11.5, color: INK_500 }}>
          <span style={{ color: "#FFC107", fontSize: 10 }}>★</span>
          <span style={{ color: INK_900, fontWeight: 600 }}>{pro.rating.toFixed(1)}</span>
          <span className="truncate">· {pro.reviewCount} reviews · {pro.category}</span>
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2" style={{ borderColor: LINE }}>
          <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11.5, fontWeight: 600, color: SUCCESS }}>
            <span aria-hidden className="ewa-pulse" style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: SUCCESS }} />
            Available now
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: INK_900 }}>${pro.priceFrom}+</span>
        </div>
      </div>
    </div>
  );
}

function CompactCard({
  pro,
  favorited,
  onTap,
  onFavorite,
}: {
  pro: Pro;
  favorited: boolean;
  onTap: () => void;
  onFavorite: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="shrink-0 cursor-pointer overflow-hidden rounded-2xl"
      style={{ backgroundColor: CARD_BG, width: 200, fontFamily: SANS_STACK }}
    >
      <div className="relative h-36 overflow-hidden">
        <img src={pro.portfolio[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <FavoriteButton favorited={favorited} onClick={onFavorite} size={28} />
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <div className="flex items-center gap-1" style={{ fontSize: 13.5, fontWeight: 600, color: INK_900, letterSpacing: "-0.01em" }}>
          <span className="truncate">{pro.name}</span>
          {pro.certified && <VerifiedTick small />}
        </div>
        <div className="mt-0.5 flex items-center gap-1" style={{ fontSize: 11.5, color: INK_500 }}>
          <span style={{ color: "#FFC107", fontSize: 10 }}>★</span>
          <span style={{ color: INK_900, fontWeight: 600 }}>{pro.rating.toFixed(1)}</span>
          <span>· {pro.reviewCount} reviews</span>
          <span className="ml-auto" style={{ color: INK_900, fontWeight: 700 }}>${pro.priceFrom}+</span>
        </div>
      </div>
    </div>
  );
}

function FavoriteButton({
  favorited,
  onClick,
  size,
}: {
  favorited: boolean;
  onClick: () => void;
  size: number;
}) {
  const iconSize = Math.round(size * 0.46);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      aria-label={favorited ? "Unsave" : "Save"}
      className="absolute right-2 top-2 grid place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
      style={{
        width: size,
        height: size,
        backgroundColor: "rgba(10,22,40,0.6)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        color: favorited ? ORANGE : "#fff",
      }}
    >
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill={favorited ? ORANGE : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

function Avatar({ pro }: { pro: Pro }) {
  const initials = pro.name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
      style={{
        background: "linear-gradient(135deg, #FFD9C7 0%, #FFBBA0 100%)",
        color: "#9A3412",
        fontSize: 12,
        fontWeight: 600,
        border: "2px solid #fff",
        boxShadow: `0 0 0 1px ${LINE}`,
      }}
    >
      {initials}
    </div>
  );
}

function VerifiedTick({ small = false }: { small?: boolean }) {
  const s = small ? 11 : 14;
  return (
    <span
      aria-hidden
      className="inline-grid shrink-0 place-items-center rounded-full"
      style={{ width: s, height: s, backgroundColor: SUCCESS, color: "#fff" }}
    >
      <svg width={s - 4} height={s - 4} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

function SmallTag({ bg, color, children }: { bg: string; color: string; children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5"
      style={{
        backgroundColor: bg,
        color,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.04em",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {children}
    </span>
  );
}

/* ───────── Trending grid ───────── */

const TRENDING = [
  { label: "Knotless braids", count: 142, photo: "1522337360788-8b13dee7a37e", tall: true },
  { label: "Silk press", count: 89, photo: "1503342217505-b0a15ec3261c", tall: false },
  { label: "Locs", count: 54, photo: "1504703395950-b89145a5425b", tall: false },
];

function TrendingGrid({ onTap }: { onTap: (label: string) => void }) {
  const [first, ...rest] = TRENDING;
  return (
    <div className="grid grid-cols-2 gap-2">
      <TrendingTile {...first!} onTap={() => onTap(first!.label)} />
      <div className="flex flex-col gap-2">
        {rest.map((t) => (
          <TrendingTile key={t.label} {...t} onTap={() => onTap(t.label)} />
        ))}
      </div>
    </div>
  );
}

function TrendingTile({
  label,
  count,
  photo,
  tall,
  onTap,
}: {
  label: string;
  count: number;
  photo: string;
  tall: boolean;
  onTap: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onTap}
      className="relative cursor-pointer overflow-hidden rounded-2xl text-left transition-transform active:scale-[0.98]"
      style={{ aspectRatio: tall ? "3 / 4" : "1 / 1", fontFamily: SANS_STACK, width: "100%" }}
    >
      <img
        src={`https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=600&q=70`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 55%, rgba(0,0,0,0.55) 100%)" }}
      />
      <span
        className="absolute right-2.5 top-2.5 inline-flex items-center rounded-full px-2 py-1"
        style={{ backgroundColor: "rgba(10,22,40,0.6)", color: "#fff", backdropFilter: "blur(10px)", fontSize: 10, fontWeight: 600 }}
      >
        {count} stylists
      </span>
      <span
        className="absolute bottom-2.5 left-3"
        style={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}
      >
        {label}
      </span>
    </button>
  );
}

/* ─────────────────────────  Sheets  ───────────────────────── */

function SheetShell({
  title,
  description,
  headerRight,
  footer,
  children,
}: {
  title: string;
  description?: string;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex h-full flex-col"
      style={{ fontFamily: SANS_STACK, color: "var(--foreground)" }}
    >
      <div className="flex items-start justify-between gap-3 px-1 pb-3">
        <SheetHeader className="flex-1 space-y-1 p-0 text-left">
          <SheetTitle style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.015em" }}>
            {title}
          </SheetTitle>
          {description && (
            <SheetDescription style={{ fontSize: 13 }}>{description}</SheetDescription>
          )}
        </SheetHeader>
        {headerRight}
      </div>
      <div
        className="-mx-6 flex-1 overflow-y-auto px-6"
        style={{ paddingBottom: footer ? 16 : "calc(env(safe-area-inset-bottom) + 88px)" }}
      >
        {children}
      </div>
      {footer && (
        <div
          className="-mx-6 border-t px-6 pt-3"
          style={{
            borderColor: "var(--border)",
            paddingBottom: "calc(env(safe-area-inset-bottom) + 88px)",
            backgroundColor: "var(--background)",
          }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

function SavedSheet({
  open,
  onOpenChange,
  savedPros,
  onUnfavorite,
  onTapPro,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  savedPros: Pro[];
  onUnfavorite: (p: Pro) => void;
  onTapPro: (p: Pro) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetShell title="Saved pros" description={savedPros.length > 0 ? `${savedPros.length} saved` : undefined}>
          {savedPros.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--muted-foreground)", opacity: 0.4 }}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <p className="mt-4" style={{ fontSize: 15, fontWeight: 600 }}>Nothing saved yet</p>
              <p className="mt-1" style={{ fontSize: 13, color: "var(--muted-foreground)", maxWidth: 260 }}>
                Tap the heart on any pro to keep them close.
              </p>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="mt-5 rounded-full px-5 py-2.5 transition-transform active:scale-95"
                style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 13.5, fontWeight: 600 }}
              >
                Browse pros
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-1.5 pt-1">
              {savedPros.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => onTapPro(p)}
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-[var(--accent)]"
                  >
                    <img
                      src={p.portfolio[0]}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1" style={{ fontSize: 14.5, fontWeight: 600 }}>
                        <span className="truncate">{p.name}</span>
                        {p.certified && <VerifiedTick small />}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 truncate" style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
                        <span>{p.category}</span>
                        <span>·</span>
                        <span>{p.neighborhood}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5" style={{ fontSize: 12 }}>
                        <span style={{ color: "#FFC107" }}>★</span>
                        <span style={{ fontWeight: 600 }}>{p.rating.toFixed(1)}</span>
                        <span style={{ color: "var(--muted-foreground)" }}>· from ${p.priceFrom}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUnfavorite(p);
                      }}
                      aria-label={`Remove ${p.name} from saved`}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full transition-transform active:scale-95"
                      style={{ backgroundColor: "var(--accent)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={ORANGE} stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </SheetShell>
      </SheetContent>
    </Sheet>
  );
}

type Notif = {
  id: string;
  kind: "booking" | "new-pro" | "message";
  title: string;
  body: string;
  ago: string;
  route: "bookings" | "messages" | "pro";
  proId?: string;
  unread?: boolean;
};

function buildNotifications(
  customerState: string,
  pros: Pro[],
): Notif[] {
  if (customerState === "new") return [];
  const amara = pros.find((p) => p.id === "amara-okafor") ?? pros[0];
  const newPro = pros.find((p) => p.newOnEwa) ?? pros[1];
  const msgPro = pros.find((p) => p.id === "joelle-pierre") ?? pros[2];
  return [
    {
      id: "n1",
      kind: "booking",
      title: `${amara!.name.split(" ")[0]} confirmed your booking`,
      body: "Tomorrow at 2:00 PM · Knotless braids",
      ago: "2h",
      route: "bookings",
    },
    {
      id: "n2",
      kind: "new-pro",
      title: "New braider near you",
      body: `${newPro!.name.split(" ")[0]} just joined Ewà in ${newPro!.neighborhood}`,
      ago: "yesterday",
      route: "pro",
      proId: newPro!.id,
    },
    {
      id: "n3",
      kind: "message",
      title: `Message from ${msgPro!.name.split(" ")[0]}`,
      body: "Sounds good, see you Saturday!",
      ago: "2d",
      route: "messages",
    },
  ];
}

function NotificationsSheet({
  open,
  onOpenChange,
  notifications,
  onMarkAllRead,
  onTapNotif,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  notifications: (Notif & { unread: boolean })[];
  onMarkAllRead: () => void;
  onTapNotif: (n: Notif) => void;
}) {
  const hasUnread = notifications.some((n) => n.unread);
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetShell
          title="Notifications"
          headerRight={
            notifications.length > 0 && hasUnread ? (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="shrink-0 rounded-full px-3 py-1.5 transition-colors"
                style={{
                  fontFamily: SANS_STACK,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: ORANGE,
                  backgroundColor: "transparent",
                }}
              >
                Mark all read
              </button>
            ) : undefined
          }
        >
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="grid h-14 w-14 place-items-center rounded-full"
                style={{ backgroundColor: "rgba(22,163,74,0.12)", color: SUCCESS }}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="mt-4" style={{ fontSize: 15, fontWeight: 600 }}>You're all caught up</p>
              <p className="mt-1" style={{ fontSize: 13, color: "var(--muted-foreground)" }}>
                We'll let you know when something needs you.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-1 pt-1">
              {notifications.map((n) => {
                const dot = n.kind === "booking" ? SUCCESS : n.kind === "new-pro" ? ORANGE : INFO;
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => onTapNotif(n)}
                      className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-left transition-colors"
                      style={{
                        backgroundColor: n.unread ? "var(--accent)" : "transparent",
                      }}
                    >
                      <span
                        aria-hidden
                        className="mt-1.5 inline-block shrink-0"
                        style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: dot }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span style={{ fontSize: 13.5, fontWeight: n.unread ? 700 : 600 }} className="truncate">
                            {n.title}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0 }}>
                            {n.ago}
                          </span>
                        </div>
                        <p
                          className="mt-0.5"
                          style={{ fontSize: 12.5, color: "var(--muted-foreground)" }}
                        >
                          {n.body}
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SheetShell>
      </SheetContent>
    </Sheet>
  );
}

function FiltersSheet({
  open,
  onOpenChange,
  price,
  rating,
  availability,
  onApply,
  onReset,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  price: PriceFilter;
  rating: RatingFilter;
  availability: AvailFilter;
  onApply: (p: PriceFilter, r: RatingFilter, a: AvailFilter) => void;
  onReset: () => void;
}) {
  const [draftPrice, setDraftPrice] = useState<PriceFilter>(price);
  const [draftRating, setDraftRating] = useState<RatingFilter>(rating);
  const [draftAvail, setDraftAvail] = useState<AvailFilter>(availability);

  // Sync drafts when sheet opens
  useMemoSync(open, () => {
    setDraftPrice(price);
    setDraftRating(rating);
    setDraftAvail(availability);
  });

  const draftCount =
    (draftPrice !== "any" ? 1 : 0) +
    (draftRating !== 0 ? 1 : 0) +
    (draftAvail !== "any" ? 1 : 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetShell
          title="Filters"
          headerRight={
            draftCount > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setDraftPrice("any");
                  setDraftRating(0);
                  setDraftAvail("any");
                  onReset();
                }}
                className="shrink-0 rounded-full px-3 py-1.5"
                style={{
                  fontFamily: SANS_STACK,
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "var(--muted-foreground)",
                }}
              >
                Reset
              </button>
            ) : undefined
          }
          footer={
            <button
              type="button"
              onClick={() => onApply(draftPrice, draftRating, draftAvail)}
              className="w-full rounded-full py-3.5 transition-transform active:scale-[0.99]"
              style={{
                backgroundColor: ORANGE,
                color: "#1A0E08",
                fontFamily: SANS_STACK,
                fontSize: 14.5,
                fontWeight: 700,
              }}
            >
              {draftCount > 0 ? `Apply ${draftCount} filter${draftCount === 1 ? "" : "s"}` : "Apply filters"}
            </button>
          }
        >
          <div className="flex flex-col gap-6 pt-2">
            <FilterGroup label="Price">
              <FilterChip active={draftPrice === "any"} onClick={() => setDraftPrice("any")}>Any</FilterChip>
              <FilterChip active={draftPrice === "$"} onClick={() => setDraftPrice("$")}>$ · under $80</FilterChip>
              <FilterChip active={draftPrice === "$$"} onClick={() => setDraftPrice("$$")}>$$ · $80–150</FilterChip>
              <FilterChip active={draftPrice === "$$$"} onClick={() => setDraftPrice("$$$")}>$$$ · $150+</FilterChip>
            </FilterGroup>

            <FilterGroup label="Rating">
              <FilterChip active={draftRating === 0} onClick={() => setDraftRating(0)}>Any</FilterChip>
              <FilterChip active={draftRating === 4.0} onClick={() => setDraftRating(4.0)}>★ 4.0+</FilterChip>
              <FilterChip active={draftRating === 4.5} onClick={() => setDraftRating(4.5)}>★ 4.5+</FilterChip>
              <FilterChip active={draftRating === 4.8} onClick={() => setDraftRating(4.8)}>★ 4.8+</FilterChip>
            </FilterGroup>

            <FilterGroup label="Availability">
              <FilterChip active={draftAvail === "any"} onClick={() => setDraftAvail("any")}>Anytime</FilterChip>
              <FilterChip active={draftAvail === "today"} onClick={() => setDraftAvail("today")}>Today</FilterChip>
              <FilterChip active={draftAvail === "week"} onClick={() => setDraftAvail("week")}>This week</FilterChip>
              <FilterChip active={draftAvail === "weekend"} onClick={() => setDraftAvail("weekend")}>This weekend</FilterChip>
            </FilterGroup>
          </div>
        </SheetShell>
      </SheetContent>
    </Sheet>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p
        className="mb-2.5"
        style={{
          fontFamily: SANS_STACK,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--muted-foreground)",
        }}
      >
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border px-3.5 py-2 transition-colors"
      style={{
        backgroundColor: active ? ORANGE : "transparent",
        borderColor: active ? ORANGE : "var(--border)",
        color: active ? "#1A0E08" : "var(--foreground)",
        fontFamily: SANS_STACK,
        fontSize: 13,
        fontWeight: active ? 600 : 500,
      }}
    >
      {children}
    </button>
  );
}

function RadiusSheet({
  open,
  onOpenChange,
  value,
  onChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  value: RadiusMi;
  onChange: (v: RadiusMi) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-3xl">
        <SheetShell
          title="Search radius"
          description="How far should we look from your spot in Bed-Stuy?"
        >
          <ul className="flex flex-col gap-1 pt-2">
            {RADIUS_OPTIONS.map((opt) => {
              const active = value === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className="flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors"
                    style={{
                      borderColor: active ? ORANGE : "var(--border)",
                      backgroundColor: active ? "rgba(255,130,63,0.08)" : "transparent",
                    }}
                  >
                    <div>
                      <div style={{ fontFamily: SANS_STACK, fontSize: 14.5, fontWeight: 600 }}>
                        Within {opt.value} mi
                      </div>
                      <div style={{ fontFamily: SANS_STACK, fontSize: 12, color: "var(--muted-foreground)", marginTop: 1 }}>
                        {opt.label}
                      </div>
                    </div>
                    {active && (
                      <span
                        className="grid h-6 w-6 place-items-center rounded-full"
                        style={{ backgroundColor: ORANGE, color: "#1A0E08" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </SheetShell>
      </SheetContent>
    </Sheet>
  );
}

/** Tiny helper — runs the callback when `trigger` becomes true (sheet opening). */
function useMemoSync(trigger: boolean, fn: () => void) {
  const last = useRef(false);
  if (trigger && !last.current) {
    last.current = true;
    fn();
  }
  if (!trigger && last.current) {
    last.current = false;
  }
}
