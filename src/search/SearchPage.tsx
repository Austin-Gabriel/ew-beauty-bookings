import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { ChevronLeft, Search as SearchIcon, X, Clock, TrendingUp, MapPin, Star } from "lucide-react";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { MOCK_PROS } from "@/data/mock-pros";

const ORANGE = "#FF823F";
const RECENT_KEY = "ewa.search.recent.v1";

const TRENDING = [
  "Knotless braids",
  "Silk press",
  "Tapered fade",
  "Loc retwist",
  "Acrylic set",
  "Bridal makeup",
];

const SUGGEST_AREAS = ["Brooklyn", "Bed-Stuy", "Newark", "Atlanta", "Crown Heights"];

function loadRecents(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveRecents(items: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 6)));
  } catch {}
}

export function SearchPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recents, setRecents] = useState<string[]>([]);

  useEffect(() => {
    setRecents(loadRecents());
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, []);

  const muted = "var(--muted-foreground)";
  const subtleSurface = isDark ? "rgba(255,255,255,0.05)" : "var(--surface-elevated)";
  const subtleBorder = "var(--border)";

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return MOCK_PROS.filter((p) => {
      return (
        p.name.toLowerCase().includes(q) ||
        p.headline.toLowerCase().includes(q) ||
        p.neighborhood.toLowerCase().includes(q) ||
        p.specializations.some((s) => s.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q) ||
        p.professionalType.toLowerCase().includes(q)
      );
    }).slice(0, 8);
  }, [query]);

  const commit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    const next = [t, ...recents.filter((r) => r.toLowerCase() !== t.toLowerCase())].slice(0, 6);
    setRecents(next);
    saveRecents(next);
    setQuery(t);
  };

  const clearRecents = () => {
    setRecents([]);
    saveRecents([]);
  };

  return (
    <AppShell>
      <header
        className="sticky top-0 z-30 flex items-center gap-2 border-b px-4 py-3"
        style={{
          backgroundColor: isDark ? "transparent" : "var(--card)",
          borderColor: subtleBorder,
          fontFamily: SANS_STACK,
        }}
      >
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full"
          style={{ color: text }}
        >
          <ChevronLeft size={16} />
        </button>
        <div
          className="flex flex-1 items-center gap-2 rounded-full border px-3.5 py-2"
          style={{ borderColor: subtleBorder, backgroundColor: subtleSurface }}
        >
          <SearchIcon size={15} style={{ color: muted }} />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit(query);
            }}
            placeholder="Search stylists, styles, or areas"
            className="flex-1 bg-transparent outline-none"
            style={{ color: text, fontSize: 14, fontFamily: SANS_STACK }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear"
              style={{ color: muted }}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </header>

      <div className="px-5 pt-4 pb-14" style={{ fontFamily: SANS_STACK }}>
        {query.trim() ? (
          <>
            <SectionLabel>
              {results.length} result{results.length === 1 ? "" : "s"} for "{query.trim()}"
            </SectionLabel>
            {results.length === 0 ? (
              <div
                className="rounded-2xl border bg-card p-5 text-center"
                style={{ borderColor: subtleBorder }}
              >
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>
                  Nothing yet for that.
                </p>
                <p className="mt-1.5" style={{ fontSize: 12.5, color: "var(--on-card-muted)", lineHeight: 1.5 }}>
                  Try a different style, neighborhood, or stylist name.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      commit(query);
                      navigate({ to: "/pro/$proId", params: { proId: p.id } });
                    }}
                    className="flex items-center gap-3 rounded-2xl border bg-card px-3 py-3 text-left transition-colors active:bg-muted/30"
                    style={{ borderColor: subtleBorder }}
                  >
                    <img
                      src={p.avatar}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate" style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>
                        {p.name}
                      </p>
                      <p className="truncate" style={{ fontSize: 12, color: "var(--on-card-muted)", marginTop: 1 }}>
                        {p.headline}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2.5" style={{ fontSize: 11.5, color: "var(--on-card-muted)" }}>
                        <span className="inline-flex items-center gap-1">
                          <Star size={10} style={{ color: ORANGE, fill: ORANGE }} />
                          {p.rating}
                        </span>
                        <span>·</span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={10} />
                          {p.neighborhood}
                        </span>
                        <span>·</span>
                        <span>${p.priceFrom}+</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {recents.length > 0 && (
              <>
                <div className="flex items-center justify-between pt-2 pb-2.5">
                  <SectionLabel inline>Recent</SectionLabel>
                  <button
                    type="button"
                    onClick={clearRecents}
                    style={{
                      background: "none",
                      border: "none",
                      color: muted,
                      fontSize: 11.5,
                      fontWeight: 600,
                      fontFamily: SANS_STACK,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Clear
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {recents.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setQuery(r)}
                      className="flex w-full items-center gap-3 rounded-xl py-2 text-left"
                    >
                      <Clock size={14} style={{ color: muted }} />
                      <span style={{ fontSize: 14, color: text }}>{r}</span>
                    </button>
                  ))}
                </div>
              </>
            )}

            <SectionLabel>Trending searches</SectionLabel>
            <div className="-mx-1 flex flex-wrap gap-2">
              {TRENDING.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => commit(t)}
                  className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5"
                  style={{
                    borderColor: subtleBorder,
                    backgroundColor: subtleSurface,
                    color: text,
                    fontSize: 12.5,
                    fontWeight: 500,
                    fontFamily: SANS_STACK,
                  }}
                >
                  <TrendingUp size={11} style={{ color: ORANGE }} />
                  {t}
                </button>
              ))}
            </div>

            <SectionLabel>Popular areas</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {SUGGEST_AREAS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => commit(a)}
                  className="flex w-full items-center justify-between rounded-2xl border bg-card px-4 py-3 text-left"
                  style={{ borderColor: subtleBorder }}
                >
                  <span className="inline-flex items-center gap-2.5">
                    <span
                      className="grid h-8 w-8 place-items-center rounded-full"
                      style={{ backgroundColor: "rgba(255,130,63,0.10)", color: ORANGE }}
                    >
                      <MapPin size={13} />
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--card-foreground)" }}>
                      {a}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, color: "var(--on-card-muted)" }}>
                    Explore →
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function SectionLabel({ children, inline = false }: { children: React.ReactNode; inline?: boolean }) {
  return (
    <p
      className={inline ? "" : "pt-6 pb-2.5"}
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--muted-foreground)",
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        fontFamily: SANS_STACK,
      }}
    >
      {children}
    </p>
  );
}
