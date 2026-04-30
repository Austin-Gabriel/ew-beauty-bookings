import { useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { AppShell } from "./AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { PrimaryCta, GhostCta } from "@/auth/AuthFrame";
import { useDevState } from "@/dev-state/devState";
import { MOCK_PROS, SERVICE_CATEGORIES, NEIGHBORHOODS, type Pro } from "@/data/mock-pros";
import {
  NEW_CUSTOMER,
  RETURNING_CUSTOMER,
  POWER_CUSTOMER,
  type CustomerProfile,
} from "@/data/mock-customer-profile";

const FRAUNCES = '"Fraunces", "Times New Roman", serif';

type QuickFilter =
  | "available-now"
  | "today"
  | "this-week"
  | "top-rated"
  | "under-100"
  | "100-200"
  | "200-plus";

const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "this-week", label: "This week" },
  { id: "top-rated", label: "Top rated" },
  { id: "under-100", label: "Under $100" },
  { id: "100-200", label: "$100–200" },
  { id: "200-plus", label: "$200+" },
];

export function DiscoverPage() {
  const { state } = useDevState();
  const { text, borderCol, isDark, bg } = useAuthTheme();
  const navigate = useNavigate();

  // Dev-state controlled customer profile
  const customer: CustomerProfile =
    state.customerState === "power"
      ? POWER_CUSTOMER
      : state.customerState === "returning"
        ? RETURNING_CUSTOMER
        : NEW_CUSTOMER;

  const [neighborhood, setNeighborhood] = useState(state.location);
  const [neighborhoodOpen, setNeighborhoodOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Set<QuickFilter>>(new Set());
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [prefSheetOpen, setPrefSheetOpen] = useState<null | "now" | "later">(null);

  // Density + availability mix shape the visible pool
  const pool = useMemo(() => shapePool(state.discoverDensity, state.availabilityMix), [
    state.discoverDensity,
    state.availabilityMix,
  ]);

  // Apply filters
  const filteredPros = useMemo(() => {
    let pros = pool;
    if (state.location !== "out-of-coverage" && neighborhood !== "out-of-coverage") {
      pros = pros.filter((p) => p.neighborhood === neighborhood);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      pros = pros.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.headline.toLowerCase().includes(q) ||
          p.specializations.some((s) => s.toLowerCase().includes(q)) ||
          p.neighborhood.toLowerCase().includes(q),
      );
    }
    if (activeCategories.size > 0) {
      pros = pros.filter((p) => activeCategories.has(p.category));
    }
    if (activeFilters.has("top-rated")) pros = pros.filter((p) => p.rating >= 4.85);
    if (activeFilters.has("under-100")) pros = pros.filter((p) => p.priceFrom < 100);
    if (activeFilters.has("100-200")) pros = pros.filter((p) => p.priceFrom >= 100 && p.priceFrom < 200);
    if (activeFilters.has("200-plus")) pros = pros.filter((p) => p.priceFrom >= 200);
    return pros;
  }, [pool, neighborhood, search, activeFilters, activeCategories, state.location]);

  const isOutOfCoverage =
    state.location === "out-of-coverage" || state.discoverDensity === "empty";

  const spotlight = filteredPros[0];
  const restPros = filteredPros.slice(1);
  const topRated = [...filteredPros].sort((a, b) => b.rating - a.rating).slice(0, 6);
  const newPros = filteredPros.filter((p) => p.newOnEwa);
  const rebookPros = customer.pastBookingProIds
    .map((id) => MOCK_PROS.find((p) => p.id === id))
    .filter(Boolean) as Pro[];

  const toggleFilter = (id: QuickFilter) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleCategory = (id: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const clearFilters = () => {
    setActiveFilters(new Set());
    setActiveCategories(new Set());
    setSearch("");
  };

  // Fully opaque so the editorial waveform doesn't bleed through and crush
  // contrast in light mode (cream-on-cream "Hello, Friend" was unreadable).
  const stickyBg = isDark ? "#061C27" : "#F0EBD8";
  const subtle = isDark ? "rgba(240,235,216,0.06)" : "rgba(6,28,39,0.05)";

  return (
    <AppShell editorial>
      {/* HEADER */}
      <header className="flex items-center justify-between px-5 pt-4">
        <button
          type="button"
          onClick={() => setNeighborhoodOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors"
          style={{
            borderColor: borderCol,
            color: text,
            fontFamily: SANS_STACK,
            fontSize: 13,
            fontWeight: 500,
            backgroundColor: subtle,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {neighborhood === "out-of-coverage" ? "Choose area" : neighborhood}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Favourites"
          onClick={() => {
            // returning users → saved pros (placeholder route); for now, a noop
          }}
          className="grid h-9 w-9 place-items-center rounded-full border transition-colors"
          style={{ borderColor: borderCol, color: text, backgroundColor: subtle }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </header>

      {/* PAGE TITLE */}
      <div className="px-5 pt-5 pb-3">
        <h1
          style={{
            fontFamily: FRAUNCES,
            fontWeight: 400,
            fontSize: 34,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: text,
            margin: 0,
          }}
        >
          Hello, <span style={{ fontStyle: "italic" }}>{customer.name}</span>.
        </h1>
        <p
          style={{
            fontFamily: SANS_STACK,
            fontSize: 13,
            color: text,
            opacity: 0.6,
            marginTop: 6,
          }}
        >
          Beauty, where you are.
        </p>
      </div>

      {/* STICKY: search + filter row */}
      <div
        className="sticky top-0 z-30 px-5 pb-3 pt-2"
        style={{
          backgroundColor: stickyBg,
          borderBottom: `1px solid ${borderCol}`,
        }}
      >
        <SearchBar value={search} onChange={setSearch} />
        <FilterChipRow
          filters={QUICK_FILTERS}
          active={activeFilters}
          onToggle={toggleFilter}
          onOpenSheet={() => setFilterSheetOpen(true)}
        />
      </div>

      {/* ACTION CTAs */}
      <div className="grid grid-cols-2 gap-3 px-5 pt-4">
        <PrimaryCta onClick={() => setPrefSheetOpen("now")}>Book now</PrimaryCta>
        <GhostCta onClick={() => setPrefSheetOpen("later")}>Schedule later</GhostCta>
      </div>

      {/* MAIN CONTENT */}
      {isOutOfCoverage ? (
        <EmptyArea
          headline="We're not in your area yet, but we're growing fast."
          neighborhood={neighborhood === "out-of-coverage" ? "your area" : neighborhood}
        />
      ) : filteredPros.length === 0 ? (
        <NoResults onClear={clearFilters} />
      ) : (
        <>
          {/* Editorial spotlight */}
          {spotlight && (
            <section className="px-5 pt-8">
              <SectionEyebrow>Spotlight</SectionEyebrow>
              <SpotlightCard pro={spotlight} onTap={() => navigate({ to: "/pro/$proId", params: { proId: spotlight.id } })} />
            </section>
          )}

          {/* Quick rebook (returning users only) */}
          {rebookPros.length > 0 && (
            <section className="pt-8">
              <div className="px-5">
                <SectionEyebrow>Book again</SectionEyebrow>
                <SectionTitle>Pros you've worked with</SectionTitle>
              </div>
              <HScroll>
                {rebookPros.map((p) => (
                  <RebookCard
                    key={p.id}
                    pro={p}
                    onTap={() => navigate({ to: "/pro/$proId", params: { proId: p.id } })}
                  />
                ))}
              </HScroll>
            </section>
          )}

          {/* Service categories chip row */}
          <section className="pt-8">
            <div className="px-5">
              <SectionEyebrow>Browse</SectionEyebrow>
              <SectionTitle>By service</SectionTitle>
            </div>
            <HScroll>
              {SERVICE_CATEGORIES.map((cat) => {
                const active = activeCategories.has(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="shrink-0 rounded-full border px-4 py-2 transition-colors"
                    style={{
                      borderColor: active ? "#FF823F" : borderCol,
                      backgroundColor: active ? "rgba(255,130,63,0.12)" : subtle,
                      color: active ? "#FF823F" : text,
                      fontFamily: SANS_STACK,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </HScroll>
          </section>

          {/* Available now */}
          {onlinePros.length > 0 && state.availabilityMix !== "none" && (
            <CuratedRow
              eyebrow="Right now"
              title="Available now"
              pros={onlinePros}
              onTap={(id) => navigate({ to: "/pro/$proId", params: { proId: id } })}
            />
          )}

          {/* Top rated */}
          {topRated.length > 0 && (
            <CuratedRow
              eyebrow="Trusted"
              title="Top rated near you"
              pros={topRated}
              onTap={(id) => navigate({ to: "/pro/$proId", params: { proId: id } })}
            />
          )}

          {/* New on Ewà */}
          {newPros.length > 0 && (
            <CuratedRow
              eyebrow="Fresh"
              title="New on Ewà"
              pros={newPros}
              onTap={(id) => navigate({ to: "/pro/$proId", params: { proId: id } })}
            />
          )}

          {/* All Pros feed */}
          <section className="px-5 pt-10">
            <SectionEyebrow>All pros</SectionEyebrow>
            <SectionTitle>Near {neighborhood}</SectionTitle>
            <div className="mt-5 flex flex-col gap-5">
              {restPros.map((p) => (
                <ProCard
                  key={p.id}
                  pro={p}
                  onTap={() => navigate({ to: "/pro/$proId", params: { proId: p.id } })}
                />
              ))}
            </div>
          </section>
        </>
      )}

      {/* SHEETS */}
      {neighborhoodOpen && (
        <Sheet onClose={() => setNeighborhoodOpen(false)} title="Choose your area">
          <div className="space-y-2">
            {NEIGHBORHOODS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setNeighborhood(n);
                  setNeighborhoodOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors"
                style={{
                  borderColor: neighborhood === n ? "#FF823F" : borderCol,
                  color: text,
                  fontFamily: SANS_STACK,
                  fontSize: 14,
                  fontWeight: 500,
                  backgroundColor: neighborhood === n ? "rgba(255,130,63,0.08)" : "transparent",
                }}
              >
                {n}
                {neighborhood === n && <span style={{ color: "#FF823F" }}>✓</span>}
              </button>
            ))}
          </div>
        </Sheet>
      )}
      {filterSheetOpen && (
        <Sheet onClose={() => setFilterSheetOpen(false)} title="Filters">
          <SheetSubhead text={text}>
            Refine by service, price, distance, and availability.
          </SheetSubhead>
          <SheetComingSoon text={text} label="Advanced filters" hint="Use the chips above the feed for quick filtering in the meantime." />
        </Sheet>
      )}
      {prefSheetOpen && (
        <Sheet
          onClose={() => setPrefSheetOpen(null)}
          title={prefSheetOpen === "now" ? "Book now" : "Schedule later"}
        >
          <SheetSubhead text={text}>
            {prefSheetOpen === "now"
              ? "Tell us what you need today and we'll match you with a pro who's online right now."
              : "Pick a date, a service, and a place — we'll find the right pro and confirm in minutes."}
          </SheetSubhead>
          <SheetComingSoon
            text={text}
            label={prefSheetOpen === "now" ? "Instant matching" : "Scheduling flow"}
            hint="The full preference flow (when, what, where) lands next."
          />
        </Sheet>
      )}
      <span hidden>{bg}</span>
    </AppShell>
  );
}

/* ───────────────────────── Sub-components ───────────────────────── */

function SearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { text, borderCol, isDark } = useAuthTheme();
  const fieldBg = isDark ? "rgba(240,235,216,0.06)" : "rgba(6,28,39,0.04)";
  return (
    <div
      className="flex h-11 items-center gap-2.5 rounded-full border px-4"
      style={{ borderColor: borderCol, backgroundColor: fieldBg }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={text} strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-4.3-4.3" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search pros, services, or neighborhoods"
        className="flex-1 bg-transparent outline-none"
        style={{
          fontFamily: SANS_STACK,
          fontSize: 14,
          color: text,
        }}
      />
    </div>
  );
}

function FilterChipRow({
  filters,
  active,
  onToggle,
  onOpenSheet,
}: {
  filters: { id: QuickFilter; label: string }[];
  active: Set<QuickFilter>;
  onToggle: (id: QuickFilter) => void;
  onOpenSheet: () => void;
}) {
  const { text, borderCol, isDark } = useAuthTheme();
  const subtle = isDark ? "rgba(240,235,216,0.05)" : "rgba(6,28,39,0.04)";
  return (
    <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [&::-webkit-scrollbar]:hidden">
      {filters.map((f) => {
        const on = active.has(f.id);
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onToggle(f.id)}
            className="shrink-0 rounded-full border px-3.5 py-1.5 transition-colors"
            style={{
              borderColor: on ? "#FF823F" : borderCol,
              backgroundColor: on ? "rgba(255,130,63,0.12)" : subtle,
              color: on ? "#FF823F" : text,
              fontFamily: SANS_STACK,
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            {f.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={onOpenSheet}
        aria-label="Open all filters"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border"
        style={{ borderColor: borderCol, backgroundColor: subtle, color: text }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M6 12h12M10 18h4" />
        </svg>
      </button>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  const { text } = useAuthTheme();
  return (
    <div
      style={{
        fontFamily: SANS_STACK,
        fontSize: 10,
        letterSpacing: "1.6px",
        textTransform: "uppercase",
        color: text,
        opacity: 0.5,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}
function SectionTitle({ children }: { children: React.ReactNode }) {
  const { text } = useAuthTheme();
  return (
    <h2
      style={{
        fontFamily: FRAUNCES,
        fontWeight: 400,
        fontSize: 24,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: text,
        margin: 0,
        marginTop: 6,
      }}
    >
      {children}
    </h2>
  );
}

function HScroll({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex gap-3 overflow-x-auto px-5 pb-2 [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

function CuratedRow({
  eyebrow,
  title,
  pros,
  onTap,
}: {
  eyebrow: string;
  title: string;
  pros: Pro[];
  onTap: (id: string) => void;
}) {
  return (
    <section className="pt-8">
      <div className="px-5">
        <SectionEyebrow>{eyebrow}</SectionEyebrow>
        <SectionTitle>{title}</SectionTitle>
      </div>
      <HScroll>
        {pros.map((p) => (
          <CompactProCard key={p.id} pro={p} onTap={() => onTap(p.id)} />
        ))}
      </HScroll>
    </section>
  );
}

/* ───────────────────────── Pro cards ───────────────────────── */

function SpotlightCard({ pro, onTap }: { pro: Pro; onTap: () => void }) {
  const { text, borderCol, isDark } = useAuthTheme();
  const cardBg = isDark ? "rgba(240,235,216,0.04)" : "#ffffff";
  return (
    <button
      type="button"
      onClick={onTap}
      className="mt-4 block w-full overflow-hidden rounded-3xl border text-left transition-transform active:scale-[0.99]"
      style={{ borderColor: borderCol, backgroundColor: cardBg }}
    >
      <div
        className="relative aspect-[5/4] w-full bg-center bg-cover"
        style={{ backgroundImage: `url(${pro.portfolio[0]})` }}
      >
        {pro.online && (
          <span
            className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
            style={{
              backgroundColor: "rgba(6,28,39,0.7)",
              color: "#F0EBD8",
              fontFamily: SANS_STACK,
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#3DDC97" }} />
            Available now
          </span>
        )}
        <button
          type="button"
          aria-label="Save"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full"
          style={{ backgroundColor: "rgba(6,28,39,0.6)", color: "#F0EBD8" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
      <div className="px-5 pb-5 pt-4">
        <h3
          style={{
            fontFamily: FRAUNCES,
            fontWeight: 400,
            fontSize: 26,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: text,
            margin: 0,
          }}
        >
          {pro.name}
        </h3>
        <p
          style={{
            fontFamily: SANS_STACK,
            fontSize: 13.5,
            color: text,
            opacity: 0.7,
            marginTop: 4,
          }}
        >
          {pro.headline}
        </p>
        <div
          className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1"
          style={{ fontFamily: SANS_STACK, fontSize: 12.5, color: text, opacity: 0.75 }}
        >
          <span className="tabular">★ {pro.rating.toFixed(2)}</span>
          <span>·</span>
          <span>{pro.neighborhood}</span>
          <span>·</span>
          <span className="tabular">From ${pro.priceFrom}</span>
        </div>
      </div>
    </button>
  );
}

function ProCard({ pro, onTap }: { pro: Pro; onTap: () => void }) {
  const { text, borderCol, isDark } = useAuthTheme();
  const cardBg = isDark ? "rgba(240,235,216,0.04)" : "#ffffff";
  return (
    <button
      type="button"
      onClick={onTap}
      className="block w-full overflow-hidden rounded-2xl border text-left transition-transform active:scale-[0.99]"
      style={{ borderColor: borderCol, backgroundColor: cardBg }}
    >
      <div className="relative aspect-[16/10] w-full bg-center bg-cover" style={{ backgroundImage: `url(${pro.portfolio[0]})` }}>
        <button
          type="button"
          aria-label="Save"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full"
          style={{ backgroundColor: "rgba(6,28,39,0.55)", color: "#F0EBD8" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        {pro.online && (
          <span
            className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5"
            style={{
              backgroundColor: "rgba(6,28,39,0.7)",
              color: "#F0EBD8",
              fontFamily: SANS_STACK,
              fontSize: 10.5,
              fontWeight: 500,
            }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#3DDC97" }} />
            Online
          </span>
        )}
      </div>
      <div className="flex items-start gap-3 px-4 pb-4 pt-3">
        <div
          className="-mt-7 h-12 w-12 shrink-0 rounded-full bg-center bg-cover"
          style={{ backgroundImage: `url(${pro.avatar})`, border: `2px solid ${cardBg}` }}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3
              className="truncate"
              style={{
                fontFamily: SANS_STACK,
                fontSize: 15,
                fontWeight: 600,
                color: text,
              }}
            >
              {pro.name}
            </h3>
            <span
              className="tabular shrink-0"
              style={{ fontFamily: SANS_STACK, fontSize: 12.5, color: text, opacity: 0.75 }}
            >
              From ${pro.priceFrom}
            </span>
          </div>
          <p
            className="truncate"
            style={{
              fontFamily: SANS_STACK,
              fontSize: 12.5,
              color: text,
              opacity: 0.65,
              marginTop: 2,
            }}
          >
            {pro.headline}
          </p>
          <div
            className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5"
            style={{ fontFamily: SANS_STACK, fontSize: 11.5, color: text, opacity: 0.6 }}
          >
            <span className="tabular">★ {pro.rating.toFixed(1)} · {pro.reviewCount}</span>
            <span>·</span>
            <span>{pro.neighborhood} · {pro.travelRadiusMi}mi</span>
            {pro.certified && (
              <>
                <span>·</span>
                <span style={{ color: "#FF823F", fontWeight: 500 }}>Licensed</span>
              </>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

function CompactProCard({ pro, onTap }: { pro: Pro; onTap: () => void }) {
  const { text, borderCol, isDark } = useAuthTheme();
  const cardBg = isDark ? "rgba(240,235,216,0.04)" : "#ffffff";
  return (
    <button
      type="button"
      onClick={onTap}
      className="w-[220px] shrink-0 overflow-hidden rounded-2xl border text-left transition-transform active:scale-[0.98]"
      style={{ borderColor: borderCol, backgroundColor: cardBg }}
    >
      <div
        className="relative aspect-[4/3] w-full bg-center bg-cover"
        style={{ backgroundImage: `url(${pro.portfolio[0]})` }}
      >
        {pro.online && (
          <span
            className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5"
            style={{
              backgroundColor: "rgba(6,28,39,0.7)",
              color: "#F0EBD8",
              fontFamily: SANS_STACK,
              fontSize: 9.5,
              fontWeight: 500,
            }}
          >
            <span className="h-1 w-1 rounded-full" style={{ backgroundColor: "#3DDC97" }} />
            Online
          </span>
        )}
      </div>
      <div className="px-3 py-3">
        <div
          className="truncate"
          style={{
            fontFamily: SANS_STACK,
            fontSize: 13.5,
            fontWeight: 600,
            color: text,
          }}
        >
          {pro.name}
        </div>
        <div
          className="mt-0.5 truncate"
          style={{ fontFamily: SANS_STACK, fontSize: 11.5, color: text, opacity: 0.6 }}
        >
          {pro.headline}
        </div>
        <div
          className="mt-1.5 flex items-center justify-between"
          style={{ fontFamily: SANS_STACK, fontSize: 11, color: text, opacity: 0.7 }}
        >
          <span className="tabular">★ {pro.rating.toFixed(1)}</span>
          <span className="tabular">From ${pro.priceFrom}</span>
        </div>
      </div>
    </button>
  );
}

function RebookCard({ pro, onTap }: { pro: Pro; onTap: () => void }) {
  const { text, borderCol, isDark } = useAuthTheme();
  const cardBg = isDark ? "rgba(240,235,216,0.04)" : "#ffffff";
  return (
    <div
      className="flex w-[260px] shrink-0 items-center gap-3 rounded-2xl border p-3"
      style={{ borderColor: borderCol, backgroundColor: cardBg }}
    >
      <div
        className="h-12 w-12 shrink-0 rounded-full bg-center bg-cover"
        style={{ backgroundImage: `url(${pro.avatar})` }}
      />
      <div className="min-w-0 flex-1">
        <div
          className="truncate"
          style={{ fontFamily: SANS_STACK, fontSize: 13.5, fontWeight: 600, color: text }}
        >
          {pro.name}
        </div>
        <div
          className="truncate"
          style={{ fontFamily: SANS_STACK, fontSize: 11.5, color: text, opacity: 0.6 }}
        >
          {pro.services[0]?.name}
        </div>
      </div>
      <button
        type="button"
        onClick={onTap}
        className="shrink-0 rounded-full px-3 py-1.5"
        style={{
          backgroundColor: "rgba(255,130,63,0.12)",
          color: "#FF823F",
          fontFamily: SANS_STACK,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Book again
      </button>
    </div>
  );
}

/* ───────────────────────── Empty + sheets ───────────────────────── */

function EmptyArea({ headline, neighborhood }: { headline: string; neighborhood: string }) {
  const { text } = useAuthTheme();
  const [email, setEmail] = useState("");
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-8 pt-12 text-center">
      <div
        style={{
          fontFamily: SANS_STACK,
          fontSize: 10,
          letterSpacing: "1.6px",
          textTransform: "uppercase",
          color: text,
          opacity: 0.5,
          fontWeight: 600,
        }}
      >
        Coming to your area
      </div>
      <h2
        style={{
          fontFamily: FRAUNCES,
          fontWeight: 400,
          fontSize: 30,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: text,
          margin: 0,
          marginTop: 12,
          maxWidth: 320,
        }}
      >
        {headline}
      </h2>
      <p
        style={{
          fontFamily: SANS_STACK,
          fontSize: 13.5,
          color: text,
          opacity: 0.62,
          marginTop: 12,
          maxWidth: 300,
        }}
      >
        Drop your email and we'll let you know when Ewà comes to {neighborhood}.
      </p>
      <div className="mt-6 flex w-full max-w-[320px] flex-col gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@domain.com"
          className="h-11 w-full rounded-full border bg-transparent px-4 outline-none"
          style={{
            borderColor: "rgba(127,127,127,0.3)",
            color: text,
            fontFamily: SANS_STACK,
            fontSize: 14,
          }}
        />
        <PrimaryCta onClick={() => setEmail("")}>Notify me</PrimaryCta>
      </div>
    </section>
  );
}

function NoResults({ onClear }: { onClear: () => void }) {
  const { text } = useAuthTheme();
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-8 py-16 text-center">
      <h2
        style={{
          fontFamily: FRAUNCES,
          fontWeight: 400,
          fontSize: 24,
          lineHeight: 1.1,
          color: text,
          margin: 0,
          maxWidth: 280,
        }}
      >
        No pros match those filters.
      </h2>
      <button
        type="button"
        onClick={onClear}
        className="mt-4"
        style={{
          fontFamily: SANS_STACK,
          fontSize: 13,
          fontWeight: 600,
          color: "#FF823F",
        }}
      >
        Clear filters
      </button>
    </section>
  );
}

function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const { text, borderCol, isDark } = useAuthTheme();
  const sheetBg = isDark ? "#0E2933" : "#FAF6E7";
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(6,28,39,0.55)" }}
      />
      <div
        role="dialog"
        aria-label={title}
        className="relative max-h-[85vh] w-full max-w-[420px] overflow-y-auto rounded-t-3xl border p-5"
        style={{
          backgroundColor: sheetBg,
          borderColor: borderCol,
          minHeight: 320,
          paddingBottom: "calc(env(safe-area-inset-bottom) + 28px)",
        }}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: borderCol }} />
        <div className="mb-5 flex items-center justify-between">
          <h3
            style={{
              fontFamily: FRAUNCES,
              fontWeight: 400,
              fontSize: 26,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              color: text,
              margin: 0,
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full text-lg"
            style={{ color: text, opacity: 0.6 }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function SheetSubhead({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <p
      style={{
        fontFamily: SANS_STACK,
        fontSize: 14,
        lineHeight: 1.5,
        color: text,
        opacity: 0.7,
        marginTop: 0,
        marginBottom: 20,
      }}
    >
      {children}
    </p>
  );
}

function SheetComingSoon({ text, label, hint }: { text: string; label: string; hint: string }) {
  return (
    <div
      className="rounded-2xl border px-4 py-5"
      style={{
        borderColor: "rgba(255,130,63,0.35)",
        backgroundColor: "rgba(255,130,63,0.08)",
      }}
    >
      <div
        style={{
          fontFamily: SANS_STACK,
          fontSize: 10,
          letterSpacing: "1.6px",
          textTransform: "uppercase",
          color: "#FF823F",
          fontWeight: 600,
        }}
      >
        Coming soon
      </div>
      <div
        style={{
          fontFamily: FRAUNCES,
          fontWeight: 400,
          fontSize: 20,
          lineHeight: 1.15,
          color: text,
          marginTop: 6,
        }}
      >
        {label}
      </div>
      <p
        style={{
          fontFamily: SANS_STACK,
          fontSize: 13,
          lineHeight: 1.5,
          color: text,
          opacity: 0.65,
          marginTop: 8,
        }}
      >
        {hint}
      </p>
    </div>
  );
}

/* ───────────────────────── Density / availability shaping ───────────────────────── */

function shapePool(
  density: "empty" | "sparse" | "rich",
  mix: "many" | "few" | "none",
): Pro[] {
  if (density === "empty") return [];
  let pool = [...MOCK_PROS];
  if (density === "sparse") pool = pool.slice(0, 3);

  if (mix === "none") pool = pool.map((p) => ({ ...p, online: false }));
  if (mix === "few") {
    let count = 1;
    pool = pool.map((p) => {
      if (count > 0 && p.online) {
        count -= 1;
        return p;
      }
      return { ...p, online: false };
    });
  }
  return pool;
}
