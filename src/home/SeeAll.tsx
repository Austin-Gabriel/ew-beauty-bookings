import { useNavigate, useParams } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "./AppShell";
import { useFavorites } from "./useFavorites";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { MOCK_PROS, type Pro } from "@/data/mock-pros";
import { formatProLocation, getLocationContext } from "@/lib/location";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";
const CARD_BG = "#FFFFFF";
const INK_900 = "#0B1220";
const INK_500 = "#6B7684";
const INK_700 = "#2A3544";
const INK_400 = "#8D97A3";
const LINE = "#EEF1F4";

type Category = "online" | "available" | "new" | "trending";

const TITLE_MAP: Record<Category, { title: string; subtitle: string; live?: boolean }> = {
  online: {
    title: "Online now",
    subtitle: "Stylists ready to book today",
    live: true,
  },
  available: {
    title: "Available today",
    subtitle: "Stylists with open spots in Brooklyn",
  },
  new: {
    title: "New in your area",
    subtitle: "Stylists who joined recently",
  },
  trending: {
    title: "Trending styles",
    subtitle: "Discover what to book next",
  },
};

export function SeeAllPage() {
  const { category } = useParams({ from: "/see-all/$category" });
  const cat = (category as Category) in TITLE_MAP ? (category as Category) : "available";
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const favorites = useFavorites();

  const subtleSurface = "var(--surface-elevated)";
  const subtleBorder = "var(--border)";
  const muted = "var(--muted-foreground)";
  const faint = "var(--muted-foreground)";
  const cardShadow = isDark ? "none" : "0 1px 3px rgba(11,18,32,0.06), 0 1px 2px rgba(11,18,32,0.04)";
  const onlineBorder = isDark ? "rgba(22,163,74,0.30)" : "rgba(22,163,74,0.50)";

  const meta = TITLE_MAP[cat];

  const onlinePros = useMemo(() => MOCK_PROS.filter((p) => p.online), []);
  const availablePros = useMemo(
    () => [...MOCK_PROS].sort((a, b) => b.rating - a.rating),
    [],
  );
  const newPros = useMemo(() => MOCK_PROS.filter((p) => p.newOnEwa), []);

  const handleFavorite = (pro: Pro) => {
    const nowFavorite = favorites.toggle(pro.id);
    toast(nowFavorite ? `Saved ${pro.name}` : `Removed ${pro.name}`);
  };
  const goToPro = (pro: Pro) => navigate({ to: "/pro/$proId", params: { proId: pro.id } });

  return (
    <AppShell editorial>
      {/* TOP NAV ----------------------------------------------------------- */}
      <header
        className="sticky top-0 z-30 px-5 pt-4"
        style={{ backgroundColor: isDark ? "#061C27" : "#F0EBD8" }}
      >
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/discover" })}
            aria-label="Back"
            className="grid h-9 w-9 place-items-center rounded-full border transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: subtleSurface, borderColor: subtleBorder, color: text }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1
                className="truncate"
                style={{
                  fontFamily: SANS_STACK,
                  fontSize: 18,
                  fontWeight: 700,
                  letterSpacing: "-0.015em",
                  color: text,
                  lineHeight: 1.15,
                }}
              >
                {meta.title}
              </h1>
              {meta.live && <LiveBadge />}
            </div>
            <p style={{ fontFamily: SANS_STACK, fontSize: 12, color: muted, marginTop: 2 }}>
              {cat === "online"
                ? `Updated just now · ${onlinePros.length} stylist${onlinePros.length === 1 ? "" : "s"} ready`
                : cat === "available"
                  ? meta.subtitle
                  : cat === "new"
                    ? `${newPros.length} stylists who joined recently`
                    : meta.subtitle}
            </p>
          </div>

          <button
            type="button"
            onClick={() => toast("Search coming soon")}
            aria-label="Search"
            className="grid h-9 w-9 place-items-center rounded-full border transition-transform hover:scale-105 active:scale-95"
            style={{ backgroundColor: subtleSurface, borderColor: subtleBorder, color: text }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
        </div>

        {cat !== "trending" && (
          <FilterRow cat={cat} text={text} muted={muted} faint={faint} subtleSurface={subtleSurface} subtleBorder={subtleBorder} />
        )}
      </header>

      {/* BODY -------------------------------------------------------------- */}
      {cat === "online" && (
        <OnlineNowList pros={onlinePros} muted={muted} text={text} onTap={goToPro} onFavorite={handleFavorite} favorites={favorites} cardShadow={cardShadow} onlineBorder={onlineBorder} />
      )}
      {cat === "available" && (
        <AvailableTodayList pros={availablePros} muted={muted} text={text} subtleSurface={subtleSurface} subtleBorder={subtleBorder} onTap={goToPro} onFavorite={handleFavorite} favorites={favorites} cardShadow={cardShadow} cardBorder={!isDark ? subtleBorder : undefined} />
      )}
      {cat === "new" && (
        <NewStylistsGrid pros={newPros} muted={muted} text={text} onTap={goToPro} onFavorite={handleFavorite} cardShadow={cardShadow} cardBorder={!isDark ? subtleBorder : undefined} />
      )}
      {cat === "trending" && <TrendingStyles muted={muted} text={text} navigate={navigate} />}
    </AppShell>
  );
}

/* ───────── FilterRow ───────── */

function FilterRow({
  cat,
  text,
  muted,
  faint,
  subtleSurface,
  subtleBorder,
}: {
  cat: Category;
  text: string;
  muted: string;
  faint: string;
  subtleSurface: string;
  subtleBorder: string;
}) {
  return (
    <div className="-mx-5 flex items-center gap-2 overflow-x-auto px-5 pb-3" style={{ scrollbarWidth: "none" }}>
      {cat === "online" && (
        <FilterPill
          active
          label="Online now"
          dot={SUCCESS}
          activeBg="rgba(22,163,74,0.14)"
          activeColor={SUCCESS}
          activeBorder="rgba(22,163,74,0.30)"
          subtleSurface={subtleSurface}
          subtleBorder={subtleBorder}
          text={text}
        />
      )}
      <FilterPill
        label="Brooklyn · 5 mi"
        leadingIcon={
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={ORANGE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
        }
        subtleSurface={subtleSurface}
        subtleBorder={subtleBorder}
        text={text}
      />
      <FilterPill
        label="All services"
        trailingIcon={
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={faint} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        }
        subtleSurface={subtleSurface}
        subtleBorder={subtleBorder}
        text={text}
      />
      {cat === "available" && (
        <FilterPill label="Any price" subtleSurface={subtleSurface} subtleBorder={subtleBorder} text={text} />
      )}
      {cat === "new" && (
        <FilterPill label="Joined past 30 days" subtleSurface={subtleSurface} subtleBorder={subtleBorder} text={text} />
      )}
      <button
        type="button"
        onClick={() => toast("Sort options coming soon")}
        className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5"
        style={{
          backgroundColor: subtleSurface,
          borderColor: subtleBorder,
          color: text,
          fontFamily: SANS_STACK,
          fontSize: 12,
          fontWeight: 500,
          whiteSpace: "nowrap",
        }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 12 15 21 6" />
        </svg>
        {cat === "online" ? "Soonest" : cat === "available" ? "Top rated" : "Newest"}
      </button>
    </div>
  );
}

function FilterPill({
  label,
  leadingIcon,
  trailingIcon,
  dot,
  active = false,
  activeBg,
  activeColor,
  activeBorder,
  subtleSurface,
  subtleBorder,
  text,
}: {
  label: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  dot?: string;
  active?: boolean;
  activeBg?: string;
  activeColor?: string;
  activeBorder?: string;
  subtleSurface: string;
  subtleBorder: string;
  text: string;
}) {
  return (
    <button
      type="button"
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5"
      style={{
        backgroundColor: active ? activeBg : subtleSurface,
        borderColor: active ? activeBorder : subtleBorder,
        color: active ? activeColor : text,
        fontFamily: SANS_STACK,
        fontSize: 12,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {dot && (
        <span
          aria-hidden
          className="ewa-pulse"
          style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: dot }}
        />
      )}
      {leadingIcon}
      {label}
      {trailingIcon}
    </button>
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

/* ───────── Online now list (split horizontal cards) ───────── */

function OnlineNowList({
  pros,
  muted,
  text,
  onTap,
  onFavorite,
  favorites,
  cardShadow,
  onlineBorder,
}: {
  pros: Pro[];
  muted: string;
  text: string;
  onTap: (p: Pro) => void;
  onFavorite: (p: Pro) => void;
  favorites: ReturnType<typeof useFavorites>;
  cardShadow: string;
  onlineBorder: string;
}) {
  return (
    <>
      <ResultMeta countLabel={`${pros.length} stylists`} suffix="available within 2 hours" muted={muted} text={text} />
      <div className="flex flex-col gap-3 px-5 pb-6">
        {pros.length === 0 ? (
          <EmptyState text={text} muted={muted} message="No stylists online right now." />
        ) : (
          pros.map((pro, idx) => (
            <OnlineCardSplit
              key={pro.id}
              pro={pro}
              onTap={() => onTap(pro)}
              onFavorite={() => onFavorite(pro)}
              favorited={favorites.isFavorite(pro.id)}
              when={idx === 0 ? "Now" : `${(idx + 1) * 30} min`}
              shadow={cardShadow}
              border={onlineBorder}
            />
          ))
        )}
      </div>
    </>
  );
}

function OnlineCardSplit({
  pro,
  onTap,
  onFavorite,
  favorited,
  when,
  shadow = "none",
  border = "rgba(22,163,74,0.30)",
}: {
  pro: Pro;
  onTap: () => void;
  onFavorite: () => void;
  favorited: boolean;
  when: string;
  shadow?: string;
  border?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="flex cursor-pointer overflow-hidden rounded-2xl"
      style={{
        backgroundColor: CARD_BG,
        border: `1.5px solid ${border}`,
        boxShadow: shadow,
        fontFamily: SANS_STACK,
      }}
    >
      <div className="relative w-[110px] shrink-0 overflow-hidden">
        <img src={pro.portfolio[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span
          className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
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
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-between px-3.5 py-3">
        <div>
          <div className="flex items-center gap-1" style={{ fontSize: 14.5, fontWeight: 700, color: INK_900, letterSpacing: "-0.01em" }}>
            <span className="truncate">{pro.name}</span>
            {pro.certified && <VerifiedTick small />}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite();
              }}
              aria-label={favorited ? "Unsave" : "Save"}
              className="ml-auto grid h-7 w-7 place-items-center rounded-full transition-transform active:scale-95"
              style={{ color: favorited ? ORANGE : INK_400 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill={favorited ? ORANGE : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </div>
          <div style={{ fontSize: 11.5, color: INK_500, marginTop: 1 }}>
            {pro.category} · {pro.headline}
          </div>
          <div className="mt-1 flex items-center gap-1" style={{ fontSize: 11.5, color: INK_500 }}>
            <span style={{ color: "#F5A623", fontSize: 10 }}>★</span>
            <span style={{ color: INK_900, fontWeight: 600 }}>{pro.rating.toFixed(1)}</span>
            <span>· {pro.reviewCount} reviews</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2" style={{ borderColor: LINE }}>
          <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11.5, fontWeight: 600, color: SUCCESS }}>
            <span aria-hidden className="ewa-pulse" style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: SUCCESS }} />
            {when} · {formatProLocation(pro, getLocationContext())}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: INK_900 }}>${pro.priceFrom}+</span>
        </div>
      </div>
    </div>
  );
}

/* ───────── Available today list (hero cards) ───────── */

function AvailableTodayList({
  pros,
  muted,
  text,
  subtleSurface,
  subtleBorder,
  onTap,
  onFavorite,
  favorites,
  cardShadow,
  cardBorder,
}: {
  pros: Pro[];
  muted: string;
  text: string;
  subtleSurface: string;
  subtleBorder: string;
  onTap: (p: Pro) => void;
  onFavorite: (p: Pro) => void;
  favorites: ReturnType<typeof useFavorites>;
  cardShadow: string;
  cardBorder?: string;
}) {
  const [view, setView] = useState<"list" | "map">("list");
  return (
    <>
      <div className="flex items-center justify-between px-5 py-3">
        <span style={{ fontFamily: SANS_STACK, fontSize: 12, color: muted }}>
          <strong style={{ color: text, fontWeight: 600 }}>{pros.length} stylists</strong> available today
        </span>
        <ViewToggle view={view} onChange={setView} subtleSurface={subtleSurface} subtleBorder={subtleBorder} text={text} muted={muted} />
      </div>

      {view === "map" ? (
        <div className="px-5 pb-6">
          <div
            className="grid place-items-center rounded-3xl border-2 border-dashed text-center"
            style={{ borderColor: subtleBorder, color: muted, height: 360, fontFamily: SANS_STACK, fontSize: 13 }}
          >
            Map view — coming soon
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3 px-5 pb-6">
          {pros.length === 0 ? (
            <EmptyState text={text} muted={muted} message="No stylists with open spots today." />
          ) : (
            pros.map((pro, idx) => (
              <HeroResultCard
                key={pro.id}
                pro={pro}
                favorited={favorites.isFavorite(pro.id)}
                onTap={() => onTap(pro)}
                onFavorite={() => onFavorite(pro)}
                isTop={idx === 0}
                slot={["2:00 PM", "4:30 PM", "6:00 PM", "Tomorrow 9:00 AM", "Tomorrow 11:00 AM"][idx % 5]!}
                shadow={cardShadow}
                border={cardBorder}
              />
            ))
          )}
        </div>
      )}
    </>
  );
}

function ViewToggle({
  view,
  onChange,
  subtleSurface,
  subtleBorder,
  text,
  muted,
}: {
  view: "list" | "map";
  onChange: (v: "list" | "map") => void;
  subtleSurface: string;
  subtleBorder: string;
  text: string;
  muted: string;
}) {
  return (
    <div
      className="flex rounded-full border p-0.5"
      style={{ backgroundColor: subtleSurface, borderColor: subtleBorder }}
    >
      {(["list", "map"] as const).map((v) => {
        const active = view === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-1"
            style={{
              backgroundColor: active ? "var(--muted)" : "transparent",
              color: active ? text : muted,
              fontFamily: SANS_STACK,
              fontSize: 11,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {v === "list" ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 20l-5.45-2.72A1 1 0 0 1 3 16.38V5.62a1 1 0 0 1 1.45-.9L9 7m0 13l6-3m-6 3V7m6 10l4.55 2.28A1 1 0 0 0 21 18.38V7.62a1 1 0 0 0-.55-.9L15 4m0 13V4" />
              </svg>
            )}
            {v}
          </button>
        );
      })}
    </div>
  );
}

function HeroResultCard({
  pro,
  favorited,
  onTap,
  onFavorite,
  isTop,
  slot,
  shadow = "none",
  border,
}: {
  pro: Pro;
  favorited: boolean;
  onTap: () => void;
  onFavorite: () => void;
  isTop: boolean;
  slot: string;
  shadow?: string;
  border?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="cursor-pointer overflow-hidden rounded-3xl"
      style={{ backgroundColor: CARD_BG, fontFamily: SANS_STACK, boxShadow: shadow, border: border ? `1px solid ${border}` : undefined }}
    >
      <div className="relative h-[200px] overflow-hidden">
        <img src={pro.portfolio[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.45) 100%)" }}
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {isTop ? (
            <SmallTag bg={ORANGE} color="#1A0E08">★ Top rated</SmallTag>
          ) : (
            <SmallTag bg={ORANGE} color="#1A0E08">★ {pro.rating.toFixed(1)}</SmallTag>
          )}
          <SmallTag bg="rgba(10,22,40,0.7)" color="#fff">{pro.category}</SmallTag>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          aria-label={favorited ? "Unsave" : "Save"}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
          style={{
            backgroundColor: "rgba(10,22,40,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(12px)",
            color: favorited ? ORANGE : "#fff",
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill={favorited ? ORANGE : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <div
          className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full px-2 py-1"
          style={{ backgroundColor: "rgba(10,22,40,0.6)", color: "#fff", backdropFilter: "blur(10px)", fontSize: 11, fontWeight: 600 }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          {pro.portfolio.length * 8}
        </div>
      </div>

      <div className="px-3.5 pb-3.5 pt-3">
        <div className="flex items-center gap-2.5">
          <Avatar pro={pro} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1" style={{ fontSize: 14.5, fontWeight: 700, color: INK_900, letterSpacing: "-0.01em" }}>
              <span className="truncate">{pro.name}</span>
              {pro.certified && <VerifiedTick small />}
            </div>
            <div className="mt-0.5 flex items-center gap-1" style={{ fontSize: 11.5, color: INK_500 }}>
              <span style={{ color: "#F5A623", fontSize: 10 }}>★</span>
              <span style={{ color: INK_900, fontWeight: 600 }}>{pro.rating.toFixed(1)}</span>
              <span className="truncate">· {pro.reviewCount} reviews · {pro.headline}</span>
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t pt-2.5" style={{ borderColor: LINE }}>
          <span className="inline-flex items-center gap-1.5" style={{ fontSize: 11.5, fontWeight: 600, color: SUCCESS }}>
            <span aria-hidden className="ewa-pulse" style={{ width: 6, height: 6, borderRadius: 9999, backgroundColor: SUCCESS }} />
            Available {slot}
          </span>
          <span className="inline-flex items-center gap-1" style={{ fontSize: 11.5, fontWeight: 500, color: INK_700 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INK_500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
            {formatProLocation(pro, getLocationContext())}
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

/* ───────── New stylists (2-col grid) ───────── */

function NewStylistsGrid({
  pros,
  muted,
  text,
  onTap,
  onFavorite,
  cardShadow,
  cardBorder,
}: {
  pros: Pro[];
  muted: string;
  text: string;
  onTap: (p: Pro) => void;
  onFavorite: (p: Pro) => void;
  cardShadow: string;
  cardBorder?: string;
}) {
  return (
    <>
      <div className="px-5 py-3" style={{ fontFamily: SANS_STACK, fontSize: 12, color: muted }}>
        <strong style={{ color: text, fontWeight: 600 }}>{pros.length} new stylists</strong> · Show some love
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 pb-6">
        {pros.length === 0 ? (
          <div className="col-span-2">
            <EmptyState text={text} muted={muted} message="No new stylists in your area yet." />
          </div>
        ) : (
          pros.map((pro) => (
            <NewStylistTile key={pro.id} pro={pro} onTap={() => onTap(pro)} onFavorite={() => onFavorite(pro)} shadow={cardShadow} border={cardBorder} />
          ))
        )}
      </div>
    </>
  );
}

function NewStylistTile({ pro, onTap, onFavorite, shadow = "none", border }: { pro: Pro; onTap: () => void; onFavorite: () => void; shadow?: string; border?: string }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="cursor-pointer overflow-hidden rounded-2xl"
      style={{ backgroundColor: CARD_BG, fontFamily: SANS_STACK, boxShadow: shadow, border: border ? `1px solid ${border}` : undefined }}
    >
      <div className="relative aspect-square overflow-hidden">
        <img src={pro.portfolio[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <span
          className="absolute left-2 top-2 inline-flex items-center rounded-full px-2 py-0.5"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          New
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite();
          }}
          aria-label="Save"
          className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full transition-transform active:scale-95"
          style={{
            backgroundColor: "rgba(10,22,40,0.6)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(10px)",
            color: "#fff",
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="px-3 pb-3 pt-2.5">
        <div className="flex items-center gap-1" style={{ fontSize: 13, fontWeight: 600, color: INK_900, letterSpacing: "-0.005em" }}>
          <span className="truncate">{pro.name}</span>
          {pro.certified && <VerifiedTick small />}
        </div>
        <div className="mt-0.5 flex items-center gap-1" style={{ fontSize: 11, color: INK_500 }}>
          <span style={{ color: "#F5A623", fontSize: 9 }}>★</span>
          <span style={{ color: INK_900, fontWeight: 600 }}>{pro.rating.toFixed(1)}</span>
          <span>· {pro.reviewCount} reviews</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between border-t pt-2" style={{ borderColor: LINE }}>
          <span style={{ fontSize: 10.5, color: INK_500 }}>{pro.category}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: INK_900 }}>${pro.priceFrom}+</span>
        </div>
      </div>
    </div>
  );
}

/* ───────── Trending styles ───────── */

const TRENDING_THIS_WEEK: { name: string; count: number; photo: string; tall: boolean }[] = [
  { name: "Knotless braids", count: 142, photo: "1522337360788-8b13dee7a37e", tall: true },
  { name: "Silk press", count: 89, photo: "1503342217505-b0a15ec3261c", tall: false },
  { name: "Locs", count: 54, photo: "1504703395950-b89145a5425b", tall: false },
];

const ALL_STYLES: { name: string; count: number; photo: string }[] = [
  { name: "Cornrows", count: 76, photo: "1517256064527-09c73fc73e38" },
  { name: "Wash & style", count: 128, photo: "1519415943484-c6c1b4e7c1d3" },
  { name: "Color", count: 42, photo: "1531123897727-8f129e1688ce" },
  { name: "Cuts", count: 61, photo: "1544005313-94ddf0286df2" },
  { name: "Twists", count: 38, photo: "1517256064527-09c73fc73e38" },
  { name: "Wig install", count: 29, photo: "1522337360788-8b13dee7a37e" },
];

function TrendingStyles({
  muted,
  text,
  navigate,
}: {
  muted: string;
  text: string;
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <>
      <p className="px-5 pt-3 pb-1" style={{ fontFamily: SANS_STACK, fontSize: 13, lineHeight: 1.5, color: muted }}>
        Find your next look. Tap any style to see stylists who specialize in it.
      </p>

      <h2
        className="px-5 pb-3 pt-5"
        style={{ fontFamily: SANS_STACK, fontSize: 13, fontWeight: 700, color: text, letterSpacing: "-0.01em" }}
      >
        🔥 Trending this week
      </h2>
      <div className="grid grid-cols-2 gap-2.5 px-5">
        <StyleTile {...TRENDING_THIS_WEEK[0]!} trending onTap={() => navigate({ to: "/discover" })} />
        <div className="flex flex-col gap-2.5">
          {TRENDING_THIS_WEEK.slice(1).map((t) => (
            <StyleTile key={t.name} {...t} trending onTap={() => navigate({ to: "/discover" })} />
          ))}
        </div>
      </div>

      <h2
        className="px-5 pb-3 pt-6"
        style={{ fontFamily: SANS_STACK, fontSize: 13, fontWeight: 700, color: text, letterSpacing: "-0.01em" }}
      >
        All styles
      </h2>
      <div className="grid grid-cols-2 gap-2.5 px-5 pb-8">
        {ALL_STYLES.map((s) => (
          <StyleTile key={s.name} {...s} tall={false} onTap={() => navigate({ to: "/discover" })} />
        ))}
      </div>
    </>
  );
}

function StyleTile({
  name,
  count,
  photo,
  tall = false,
  trending = false,
  onTap,
}: {
  name: string;
  count: number;
  photo: string;
  tall?: boolean;
  trending?: boolean;
  onTap: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="relative cursor-pointer overflow-hidden rounded-2xl"
      style={{ aspectRatio: tall ? "3 / 4" : "1 / 1", fontFamily: SANS_STACK }}
    >
      <img
        src={`https://images.unsplash.com/photo-${photo}?auto=format&fit=crop&w=600&q=70`}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: "linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.65) 100%)" }}
      />
      {trending && (
        <span
          className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full px-2 py-1"
          style={{
            backgroundColor: ORANGE,
            color: "#1A0E08",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          ↑ Trending
        </span>
      )}
      <div className="absolute bottom-3 left-3 right-3" style={{ color: "#fff" }}>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.2 }}>{name}</div>
        <div style={{ fontSize: 11, opacity: 0.85, marginTop: 3 }}>{count} stylists</div>
      </div>
    </div>
  );
}

/* ───────── Shared atoms ───────── */

function ResultMeta({
  countLabel,
  suffix,
  muted,
  text,
}: {
  countLabel: string;
  suffix: string;
  muted: string;
  text: string;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ fontFamily: SANS_STACK, fontSize: 12, color: muted }}>
      <span>
        <strong style={{ color: text, fontWeight: 600 }}>{countLabel}</strong> {suffix}
      </span>
    </div>
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
      className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
      style={{
        background: "linear-gradient(135deg, #FFD9C7 0%, #FFBBA0 100%)",
        color: "#9A3412",
        fontSize: 11,
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
  const s = small ? 12 : 14;
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

function EmptyState({ text, muted, message }: { text: string; muted: string; message: string }) {
  return (
    <div
      className="grid place-items-center rounded-3xl border-2 border-dashed py-12 text-center"
      style={{ borderColor: muted, fontFamily: SANS_STACK }}
    >
      <p style={{ fontSize: 14, color: text, fontWeight: 500 }}>{message}</p>
    </div>
  );
}
