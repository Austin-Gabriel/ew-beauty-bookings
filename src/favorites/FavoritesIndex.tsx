import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useCollections, useAllItems, DEFAULT_COLLECTION_ID, type FavItem } from "./store";
import { NewCollectionSheet } from "./NewCollectionSheet";
import { MOCK_PROS, type Pro } from "@/data/mock-pros";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";
const INK_900 = "#0B1220";
const INK_500 = "#6B7684";
const INK_400 = "#8D97A3";
const STAR = "#F5A623";

type Tab = "collections" | "stylists" | "inspiration";

export function FavoritesIndex() {
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const { collections, create, count, preview } = useCollections();
  const allItems = useAllItems();
  const [tab, setTab] = useState<Tab>("collections");
  const [newOpen, setNewOpen] = useState(false);

  // Theme tokens — light mode is white-on-white per design system
  const muted = isDark ? "rgba(240,235,216,0.55)" : INK_500;
  const subtleSurface = isDark ? "rgba(240,235,216,0.06)" : "#F4F6F8";
  const subtleBorder = isDark ? "rgba(240,235,216,0.10)" : "#EEF1F4";
  const cardShadow = isDark ? "none" : "0 1px 3px rgba(11,18,32,0.06), 0 1px 2px rgba(11,18,32,0.04)";
  const surfaceBg = isDark ? "transparent" : "#FFFFFF";

  const savedPros = useMemo(() => {
    const seen = new Set<string>();
    const out: { item: FavItem; pro: Pro }[] = [];
    for (const it of allItems) {
      if (it.type !== "pro" || seen.has(it.refId)) continue;
      const pro = MOCK_PROS.find((p) => p.id === it.refId);
      if (pro) {
        seen.add(it.refId);
        out.push({ item: it, pro });
      }
    }
    return out;
  }, [allItems]);

  const looks = useMemo(() => allItems.filter((it) => it.type === "look"), [allItems]);

  const totals = {
    collections: collections.length,
    stylists: savedPros.length,
    inspiration: looks.length,
  };

  const isEmpty =
    collections.length === 1 &&
    count(DEFAULT_COLLECTION_ID) === 0 &&
    savedPros.length === 0 &&
    looks.length === 0;

  return (
    <AppShell editorial>
      {/* STICKY HEADER ----------------------------------------------------- */}
      <header
        className="sticky top-0 z-30 px-5 pt-5"
        style={{
          backgroundColor: surfaceBg,
          borderBottom: `1px solid ${subtleBorder}`,
          fontFamily: SANS_STACK,
        }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.025em", color: text, margin: 0 }}>
            Saved
          </h1>
          <div className="flex items-center gap-2">
            <IconBtn ariaLabel="Search saved" onClick={() => toast("Search coming soon")} bg={subtleSurface} color={text}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </IconBtn>
            <IconBtn ariaLabel="New collection" onClick={() => setNewOpen(true)} bg={ORANGE} color="#1A0E08">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </IconBtn>
          </div>
        </div>

        <Tabs value={tab} onChange={setTab} totals={totals} text={text} muted={muted} />
      </header>

      {/* BODY -------------------------------------------------------------- */}
      {isEmpty ? (
        <FullEmptyState onBrowse={() => navigate({ to: "/discover" })} text={text} muted={muted} />
      ) : tab === "collections" ? (
        <CollectionsTab
          collections={collections}
          count={count}
          preview={preview}
          subtleBorder={subtleBorder}
          subtleSurface={subtleSurface}
          cardShadow={cardShadow}
          muted={muted}
          text={text}
          onNew={() => setNewOpen(true)}
        />
      ) : tab === "stylists" ? (
        <StylistsTab
          pros={savedPros}
          subtleBorder={subtleBorder}
          subtleSurface={subtleSurface}
          cardShadow={cardShadow}
          muted={muted}
          text={text}
          onTap={(pro) => navigate({ to: "/pro/$proId", params: { proId: pro.id } })}
        />
      ) : (
        <InspirationTab
          looks={looks}
          subtleSurface={subtleSurface}
          subtleBorder={subtleBorder}
          cardShadow={cardShadow}
          muted={muted}
          text={text}
          onTap={(item) => {
            const proId = item.meta?.proId;
            if (proId) navigate({ to: "/pro/$proId", params: { proId } });
            else toast("Lightbox coming soon");
          }}
        />
      )}

      <NewCollectionSheet
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={(name) => {
          const c = create(name);
          setNewOpen(false);
          toast(`Created "${c.name}"`);
          navigate({ to: "/favorites/$collectionId", params: { collectionId: c.id } });
        }}
      />
    </AppShell>
  );
}

/* ───────── Header atoms ───────── */

function IconBtn({
  children,
  onClick,
  ariaLabel,
  bg,
  color,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  bg: string;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
      style={{ backgroundColor: bg, color }}
    >
      {children}
    </button>
  );
}

function Tabs({
  value,
  onChange,
  totals,
  text,
  muted,
}: {
  value: Tab;
  onChange: (t: Tab) => void;
  totals: { collections: number; stylists: number; inspiration: number };
  text: string;
  muted: string;
}) {
  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "collections", label: "Collections", count: totals.collections },
    { id: "stylists", label: "Stylists", count: totals.stylists },
    { id: "inspiration", label: "Inspiration", count: totals.inspiration },
  ];
  return (
    <div className="flex" style={{ gap: 2 }}>
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className="relative flex flex-1 items-center justify-center gap-1.5 py-3"
            style={{
              fontFamily: SANS_STACK,
              fontSize: 14,
              fontWeight: active ? 600 : 500,
              color: active ? text : muted,
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span>{t.label}</span>
            <span style={{ color: INK_400, fontWeight: 500, fontSize: 12.5 }}>{t.count}</span>
            {active && (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "25%",
                  right: "25%",
                  bottom: -1,
                  height: 2,
                  borderRadius: 2,
                  backgroundColor: ORANGE,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ───────── Collections tab ───────── */

function CollectionsTab({
  collections,
  count,
  preview,
  subtleBorder,
  subtleSurface,
  cardShadow,
  muted,
  text,
  onNew,
}: {
  collections: ReturnType<typeof useCollections>["collections"];
  count: (id: string) => number;
  preview: (id: string) => string[];
  subtleBorder: string;
  subtleSurface: string;
  cardShadow: string;
  muted: string;
  text: string;
  onNew: () => void;
}) {
  const total = collections.length;
  return (
    <div className="px-5 pb-6 pt-4" style={{ fontFamily: SANS_STACK }}>
      <p style={{ fontSize: 12, color: muted, marginBottom: 14 }}>
        {total} {total === 1 ? "collection" : "collections"} · plan your looks
      </p>
      <div className="grid grid-cols-2 gap-3">
        {collections.map((c) => {
          const n = count(c.id);
          const previews = preview(c.id);
          return (
            <Link
              key={c.id}
              to="/favorites/$collectionId"
              params={{ collectionId: c.id }}
              className="block overflow-hidden rounded-2xl transition-all hover:-translate-y-0.5 active:scale-[0.98]"
              style={{
                backgroundColor: "var(--card)",
                border: `1px solid ${subtleBorder}`,
                boxShadow: cardShadow,
                color: "var(--card-foreground)",
              }}
            >
              <CollectionCover previews={previews} />
              <div className="px-3.5 py-3">
                <p className="truncate" style={{ fontSize: 14.5, fontWeight: 700, color: INK_900, letterSpacing: "-0.015em", lineHeight: 1.2 }}>
                  {c.name}
                </p>
                <p style={{ fontSize: 11.5, color: INK_500, marginTop: 4 }}>
                  {n} {n === 1 ? "save" : "saves"}
                  {c.id === DEFAULT_COLLECTION_ID && " · default"}
                </p>
              </div>
            </Link>
          );
        })}

        <button
          type="button"
          onClick={onNew}
          className="flex flex-col items-center justify-center gap-2.5 rounded-2xl text-center transition-colors"
          style={{
            backgroundColor: subtleSurface,
            border: `2px dashed ${INK_400}`,
            aspectRatio: "0.83",
            padding: 20,
            cursor: "pointer",
            color: text,
            fontFamily: SANS_STACK,
          }}
        >
          <span
            className="grid h-11 w-11 place-items-center rounded-full"
            style={{ backgroundColor: "var(--card)", border: `1.5px solid ${INK_400}`, color: INK_500 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: text }}>New collection</div>
            <div style={{ fontSize: 11, color: muted, lineHeight: 1.4, marginTop: 2 }}>Plan a look or event</div>
          </div>
        </button>
      </div>
    </div>
  );
}

function CollectionCover({ previews }: { previews: string[] }) {
  if (previews.length === 0) {
    return (
      <div
        className="grid place-items-center"
        style={{ aspectRatio: "1", backgroundColor: "rgba(11,18,32,0.04)", color: INK_400 }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
    );
  }
  // Pad to 4 tiles by repeating; build a 2×2 grid
  const tiles = [previews[0]!, previews[1] ?? previews[0]!, previews[2] ?? previews[0]!, previews[0]!];
  return (
    <div className="grid grid-cols-2 grid-rows-2 gap-px" style={{ aspectRatio: "1", backgroundColor: "#EEF1F4" }}>
      {tiles.map((src, i) => (
        <div key={i} className="overflow-hidden">
          <img src={src} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

/* ───────── Stylists tab ───────── */

type StylistChip = "All" | "Available now" | "Booked before" | "Want to try";

function StylistsTab({
  pros,
  subtleBorder,
  subtleSurface,
  cardShadow,
  muted,
  text,
  onTap,
}: {
  pros: { item: FavItem; pro: Pro }[];
  subtleBorder: string;
  subtleSurface: string;
  cardShadow: string;
  muted: string;
  text: string;
  onTap: (pro: Pro) => void;
}) {
  const [chip, setChip] = useState<StylistChip>("All");

  const list = useMemo(() => {
    if (chip === "Available now") return pros.filter(({ pro }) => pro.online);
    return pros;
  }, [pros, chip]);

  const chips: StylistChip[] = ["All", "Booked before", "Want to try", "Available now"];

  return (
    <div style={{ fontFamily: SANS_STACK }}>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 pt-4" style={{ scrollbarWidth: "none" }}>
        {chips.map((c) => (
          <Chip key={c} active={chip === c} onClick={() => setChip(c)} subtleSurface={subtleSurface} text={text}>
            {c}
          </Chip>
        ))}
      </div>

      <p className="px-5 pb-3" style={{ fontSize: 12, color: muted }}>
        {list.length} stylist{list.length === 1 ? "" : "s"} saved · sorted by recent activity
      </p>

      {list.length === 0 ? (
        <div className="px-5 pb-6">
          <EmptyCard text={text} muted={muted} subtleBorder={subtleBorder} message="No stylists match this filter." />
        </div>
      ) : (
        <div className="flex flex-col gap-2.5 px-5 pb-6">
          {list.map(({ item, pro }) => (
            <SavedStylistCard
              key={item.id}
              item={item}
              pro={pro}
              onTap={() => onTap(pro)}
              subtleBorder={subtleBorder}
              cardShadow={cardShadow}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Chip({
  children,
  active,
  onClick,
  subtleSurface,
  text,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  subtleSurface: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full border px-3.5 py-1.5"
      style={{
        backgroundColor: active ? "rgba(255,130,63,0.10)" : subtleSurface,
        borderColor: active ? "rgba(255,130,63,0.35)" : "transparent",
        color: active ? ORANGE : text,
        fontFamily: SANS_STACK,
        fontSize: 12.5,
        fontWeight: active ? 600 : 500,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

function SavedStylistCard({
  item,
  pro,
  onTap,
  subtleBorder,
  cardShadow,
}: {
  item: FavItem;
  pro: Pro;
  onTap: () => void;
  subtleBorder: string;
  cardShadow: string;
}) {
  const distance = (pro.travelRadiusMi * 0.4).toFixed(1);
  const availabilityNow = pro.online;
  const availabilityText = availabilityNow ? "Available now" : "Next opening Sat";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="relative flex cursor-pointer overflow-hidden rounded-2xl"
      style={{
        backgroundColor: "var(--card)",
        border: `1px solid ${subtleBorder}`,
        boxShadow: cardShadow,
        fontFamily: SANS_STACK,
      }}
    >
      <div className="relative w-[100px] shrink-0 overflow-hidden">
        <img src={item.thumbnailUrl || pro.portfolio[0]} alt="" className="absolute inset-0 h-full w-full object-cover" />
      </div>

      <button
        type="button"
        aria-label="Saved"
        onClick={(e) => e.stopPropagation()}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full"
        style={{
          backgroundColor: "var(--card)",
          color: ORANGE,
          boxShadow: "0 1px 3px rgba(11,18,32,0.10)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      <div className="flex min-w-0 flex-1 flex-col justify-between px-3.5 py-3 pr-12">
        <div>
          <div className="flex items-center gap-1" style={{ fontSize: 15, fontWeight: 700, color: INK_900, letterSpacing: "-0.015em" }}>
            <span className="truncate">{pro.name}</span>
            {pro.certified && (
              <span
                aria-hidden
                className="inline-grid shrink-0 place-items-center rounded-full"
                style={{ width: 13, height: 13, backgroundColor: SUCCESS, color: "#fff" }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1" style={{ fontSize: 12, color: INK_500 }}>
            <span style={{ color: STAR, fontSize: 11 }}>★</span>
            <span style={{ color: INK_900, fontWeight: 600 }}>{pro.rating.toFixed(1)}</span>
            <span className="truncate">· {pro.category} · {distance} mi</span>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between border-t pt-2.5" style={{ borderColor: subtleBorder }}>
          <span
            className="inline-flex items-center gap-1.5"
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: availabilityNow ? SUCCESS : INK_500,
            }}
          >
            <span
              aria-hidden
              className={availabilityNow ? "ewa-pulse" : ""}
              style={{
                width: 5,
                height: 5,
                borderRadius: 9999,
                backgroundColor: availabilityNow ? SUCCESS : INK_400,
              }}
            />
            {availabilityText}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTap();
            }}
            className="rounded-full px-3 py-1.5"
            style={{
              backgroundColor: ORANGE,
              color: "#1A0E08",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: SANS_STACK,
            }}
          >
            Book
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────── Inspiration tab ───────── */

function InspirationTab({
  looks,
  subtleSurface,
  subtleBorder,
  cardShadow,
  muted,
  text,
  onTap,
}: {
  looks: FavItem[];
  subtleSurface: string;
  subtleBorder: string;
  cardShadow: string;
  muted: string;
  text: string;
  onTap: (item: FavItem) => void;
}) {
  const [chip, setChip] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const it of looks) {
      const c = it.meta?.subtitle;
      if (c) set.add(c);
    }
    return ["All", ...Array.from(set)];
  }, [looks]);

  const list = useMemo(() => {
    if (chip === "All") return looks;
    return looks.filter((it) => it.meta?.subtitle === chip);
  }, [looks, chip]);

  // Mixed aspect ratios for masonry feel — alternate tall/short across the list
  const aspectFor = (i: number): string => {
    const cycle = ["3 / 4", "1 / 1", "2 / 3", "1 / 1"];
    return cycle[i % cycle.length]!;
  };

  return (
    <div style={{ fontFamily: SANS_STACK }}>
      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3 pt-4" style={{ scrollbarWidth: "none" }}>
        {categories.map((c) => (
          <Chip key={c} active={chip === c} onClick={() => setChip(c)} subtleSurface={subtleSurface} text={text}>
            {c}
          </Chip>
        ))}
      </div>

      <p className="px-5 pb-3" style={{ fontSize: 12, color: muted }}>
        {list.length} {list.length === 1 ? "style saved" : "styles saved"} · share with your stylist when booking
      </p>

      {list.length === 0 ? (
        <div className="px-5 pb-6">
          <EmptyCard text={text} muted={muted} subtleBorder={subtleBorder} message="No looks saved yet." />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 px-5 pb-6">
          {list.map((it, i) => (
            <InspirationTile key={it.id} item={it} aspect={aspectFor(i)} cardShadow={cardShadow} onTap={() => onTap(it)} />
          ))}
        </div>
      )}
    </div>
  );
}

function InspirationTile({
  item,
  aspect,
  cardShadow,
  onTap,
}: {
  item: FavItem;
  aspect: string;
  cardShadow: string;
  onTap: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onTap}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onTap()}
      className="relative cursor-pointer overflow-hidden rounded-2xl"
      style={{ aspectRatio: aspect, boxShadow: cardShadow, fontFamily: SANS_STACK }}
    >
      <img src={item.thumbnailUrl} alt={item.meta?.name ?? ""} className="absolute inset-0 h-full w-full object-cover" />
      <button
        type="button"
        aria-label="Saved"
        onClick={(e) => e.stopPropagation()}
        className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full"
        style={{
          backgroundColor: "rgba(255,255,255,0.95)",
          color: ORANGE,
          boxShadow: "0 1px 3px rgba(11,18,32,0.10)",
          backdropFilter: "blur(6px)",
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
    </div>
  );
}

/* ───────── Empty states ───────── */

function FullEmptyState({ onBrowse, text, muted }: { onBrowse: () => void; text: string; muted: string }) {
  return (
    <div className="flex flex-col items-center px-6 pt-14 text-center" style={{ fontFamily: SANS_STACK }}>
      <div
        className="grid h-24 w-24 place-items-center rounded-full"
        style={{ backgroundColor: "rgba(255,130,63,0.10)", color: ORANGE }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <h2 style={{ marginTop: 20, fontSize: 18, fontWeight: 700, color: text, letterSpacing: "-0.015em" }}>
        Start your collection
      </h2>
      <p style={{ marginTop: 8, fontSize: 13.5, color: muted, lineHeight: 1.5, maxWidth: 280 }}>
        Browse stylists and styles, then tap the heart to add them here. Mix hair, makeup, nails — whatever your look needs.
      </p>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-transform active:scale-95"
        style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 14, fontWeight: 600, fontFamily: SANS_STACK }}
      >
        Browse stylists
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

function EmptyCard({ text, muted, subtleBorder, message }: { text: string; muted: string; subtleBorder: string; message: string }) {
  return (
    <div
      className="grid place-items-center rounded-2xl py-10 text-center"
      style={{ border: `2px dashed ${subtleBorder}`, fontFamily: SANS_STACK }}
    >
      <p style={{ fontSize: 14, fontWeight: 600, color: text }}>{message}</p>
      <p style={{ fontSize: 12, color: muted, marginTop: 4 }}>Heart a pro or look from Discover to add them.</p>
    </div>
  );
}
