import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useFavorites } from "@/favorites/store";
import { MOCK_PROS, type Pro } from "@/data/mock-pros";
import { formatProLocation, getLocationContext } from "@/lib/location";
import { TAB_BAR_HEIGHT_PX } from "@/home/TabBar";

const ORANGE = "#FF823F";
const SUCCESS = "#16A34A";
const STAR = "#F5A623";
const INK_900 = "#0B1220";
const INK_700 = "#2A3544";
const INK_500 = "#6B7684";
const INK_400 = "#8D97A3";
const INK_300 = "#C7CDD4";

export function ProProfile({ proId }: { proId: string }) {
  const pro = MOCK_PROS.find((p) => p.id === proId);
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const favorites = useFavorites();

  const subtleSurface = isDark ? "rgba(240,235,216,0.06)" : "#F4F6F8";
  const subtleBorder = isDark ? "rgba(240,235,216,0.10)" : "#EEF1F4";
  const muted = isDark ? "rgba(240,235,216,0.55)" : INK_500;
  const cardShadow = isDark ? "none" : "0 1px 3px rgba(11,18,32,0.06), 0 1px 2px rgba(11,18,32,0.04)";
  const surfaceBg = isDark ? "transparent" : "#FFFFFF";

  if (!pro) {
    return (
      <AppShell editorial>
        <div className="px-5 pt-12 text-center" style={{ fontFamily: SANS_STACK, color: text }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Pro not found</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/discover" })}
            className="mt-4 rounded-full px-4 py-2"
            style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 13, fontWeight: 700 }}
          >
            Back to Discover
          </button>
        </div>
      </AppShell>
    );
  }

  const isSaved = favorites.isFavorite(pro.id);
  const stats = mockStats(pro);
  const ratingBreakdown = mockBreakdown();
  const reviews = mockReviews(pro);
  const locationLabel = formatProLocation(pro, getLocationContext());
  const initials = initialsOf(pro.name);

  // Pull a hero gradient out of the first portfolio image's hue. Fallback to
  // a brand bagel-amber gradient when no portfolio.
  const heroPhoto = pro.portfolio[0];

  return (
    <AppShell editorial>
      {/* HERO ------------------------------------------------------------- */}
      <div className="relative" style={{ height: 320, overflow: "hidden" }}>
        {heroPhoto ? (
          <img src={heroPhoto} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(135deg, #4A2515 0%, #8B4A2A 60%, #C97744 100%)" }}
          />
        )}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 25%, rgba(255,200,150,0.30) 0%, transparent 55%), radial-gradient(ellipse at 70% 80%, rgba(0,0,0,0.35) 0%, transparent 50%), linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.30) 100%)",
          }}
        />

        {/* Floating top nav */}
        <div className="absolute left-3.5 right-3.5 top-3.5 z-10 flex items-center justify-between">
          <FloatIcon ariaLabel="Back" onClick={() => router.history.back()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </FloatIcon>
          <div className="flex items-center gap-2">
            <FloatIcon
              ariaLabel="Share"
              onClick={() => {
                if (typeof navigator !== "undefined" && "share" in navigator) {
                  (navigator as Navigator & { share: (d: ShareData) => Promise<void> })
                    .share({ title: pro.name, url: typeof window !== "undefined" ? window.location.href : "" })
                    .catch(() => toast("Share link copied"));
                } else {
                  toast("Share link copied");
                }
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </FloatIcon>
            <FloatIcon
              ariaLabel={isSaved ? "Unsave" : "Save"}
              onClick={() => {
                const nowSaved = favorites.toggle(pro.id, {
                  name: pro.name,
                  thumbnail: pro.portfolio[0],
                  subtitle: pro.category,
                });
                toast(nowSaved ? `Saved ${pro.name}` : `Removed ${pro.name}`);
              }}
              activeColor={isSaved ? ORANGE : undefined}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </FloatIcon>
          </div>
        </div>

        {/* Photo dots */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              style={{
                width: 22,
                height: 3,
                borderRadius: 9999,
                backgroundColor: i === 0 ? "#fff" : "rgba(255,255,255,0.40)",
              }}
            />
          ))}
        </div>
      </div>

      {/* IDENTITY (overlaps hero) ----------------------------------------- */}
      <div className="relative z-[5] px-5 pb-5" style={{ marginTop: -56 }}>
        <div
          className="rounded-3xl"
          style={{
            backgroundColor: "var(--card)",
            border: `1px solid ${subtleBorder}`,
            boxShadow: cardShadow,
            padding: "16px 18px 18px",
            color: INK_900,
            fontFamily: SANS_STACK,
          }}
        >
          <div className="flex items-start gap-3.5">
            <div
              className="relative shrink-0"
              style={{
                marginTop: -32,
                width: 64,
                height: 64,
                borderRadius: 9999,
                background: "var(--cream-elevated)",
                color: "var(--midnight)",
                fontWeight: 700,
                fontSize: 22,
                letterSpacing: "-0.02em",
                border: "3px solid #fff",
                boxShadow: `0 0 0 1px ${subtleBorder}, 0 1px 2px rgba(20,25,40,0.04)`,
                display: "grid",
                placeItems: "center",
              }}
            >
              {initials}
              {pro.certified && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 22,
                    height: 22,
                    borderRadius: 9999,
                    backgroundColor: SUCCESS,
                    color: "#fff",
                    border: "3px solid #fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 style={{ fontSize: 20, fontWeight: 700, color: INK_900, letterSpacing: "-0.025em", lineHeight: 1.1, margin: 0 }}>
                {pro.name}
              </h1>
              <p style={{ fontSize: 12, color: INK_500, marginTop: 2 }}>
                @{pro.id.replace(/-/g, "")} · {pro.headline}
              </p>
              <div className="mt-2 flex items-center gap-3" style={{ fontSize: 12 }}>
                <span className="inline-flex items-center gap-1" style={{ color: INK_700 }}>
                  <span style={{ color: STAR, fontSize: 11 }}>★</span>
                  <strong style={{ color: INK_900, fontWeight: 700 }}>{pro.rating.toFixed(1)}</strong>
                  <span>({pro.reviewCount})</span>
                </span>
                <Sep />
                <span style={{ color: INK_700 }}>
                  <strong style={{ color: INK_900, fontWeight: 700 }}>{stats.bookings}</strong>{" "}
                  bookings
                </span>
                <Sep />
                <span style={{ color: INK_700 }}>
                  <strong style={{ color: INK_900, fontWeight: 700 }}>{stats.years}</strong>
                  {stats.years === 1 ? " yr" : " yrs"}
                </span>
              </div>
            </div>
          </div>

          <p style={{ fontSize: 13, color: INK_700, lineHeight: 1.5, marginTop: 14 }}>
            {bioFor(pro)}{" "}
            {hashtagsFor(pro).map((tag, i) => (
              <span key={i} style={{ color: ORANGE }}>{tag} </span>
            ))}
          </p>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {pro.online && (
              <span
                className="inline-flex items-center gap-1.5 rounded-full"
                style={{
                  padding: "5px 10px",
                  backgroundColor: "#DCFCE7",
                  color: SUCCESS,
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                <span aria-hidden className="ewa-pulse" style={{ width: 5, height: 5, borderRadius: 9999, backgroundColor: SUCCESS }} />
                Available today 2 PM
              </span>
            )}
            <span
              className="inline-flex items-center gap-1.5 rounded-full"
              style={{ padding: "5px 10px", backgroundColor: subtleSurface, color: INK_700, fontSize: 11.5, fontWeight: 500 }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={INK_500} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {locationLabel}
            </span>
          </div>
        </div>
      </div>

      {/* SECTIONS ---------------------------------------------------------- */}
      <div
        className="px-5"
        style={{
          // Reserve room for the sticky booking bar PLUS the tab bar so the
          // last review never hides behind either of them.
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${TAB_BAR_HEIGHT_PX + 96}px)`,
        }}
      >
        {/* Services */}
        <SectionHeader title="Services" action={`See all ${pro.services.length}`} text={text} muted={muted} onAction={() => navigate({ to: "/booking/confirm/$proId", params: { proId: pro.id } })} />
        <ul className="flex flex-col gap-2">
          {pro.services.slice(0, 3).map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => navigate({ to: "/booking/confirm/$proId", params: { proId: pro.id }, search: { service: s.name } })}
                className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-3.5 text-left transition-colors"
                style={{
                  backgroundColor: "var(--card)",
                  border: `1px solid ${subtleBorder}`,
                  boxShadow: cardShadow,
                  fontFamily: SANS_STACK,
                }}
              >
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: 14.5, fontWeight: 600, color: INK_900, letterSpacing: "-0.01em" }}>
                    {s.name}
                  </p>
                  <p style={{ fontSize: 11.5, color: INK_500, marginTop: 2, lineHeight: 1.4 }}>
                    {serviceDescFor(s.name)}
                  </p>
                  <span className="mt-1.5 inline-flex items-center gap-1" style={{ fontSize: 11, color: INK_500 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {durationFor(s.name)}
                  </span>
                </div>
                <div className="shrink-0 text-right">
                  <p style={{ fontSize: 9.5, color: INK_500, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    From
                  </p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: INK_900, letterSpacing: "-0.015em" }}>${s.priceFrom}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>

        {/* Portfolio */}
        <div className="mt-7">
          <SectionHeader title="Portfolio" action={`See all ${pro.portfolio.length * 8}`} text={text} muted={muted} onAction={() => toast("Full portfolio coming soon")} />
        </div>
        <div className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1" style={{ scrollbarWidth: "none" }}>
          {[...pro.portfolio, ...pro.portfolio].slice(0, 5).map((src, i) => (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => toast("Lightbox coming soon")}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toast("Lightbox coming soon")}
              className="shrink-0 cursor-pointer overflow-hidden rounded-2xl"
              style={{ width: 130, aspectRatio: "4 / 5", boxShadow: cardShadow }}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        {/* Reviews */}
        <div className="mt-7">
          <SectionHeader title="Reviews" action={`See all ${pro.reviewCount}`} text={text} muted={muted} onAction={() => toast("Full reviews coming soon")} />
        </div>

        <div
          className="flex items-center gap-4 rounded-2xl p-4"
          style={{
            backgroundColor: "var(--card)",
            border: `1px solid ${subtleBorder}`,
            boxShadow: cardShadow,
            fontFamily: SANS_STACK,
          }}
        >
          <div className="shrink-0 text-center">
            <p style={{ fontSize: 32, fontWeight: 700, color: INK_900, letterSpacing: "-0.025em", lineHeight: 1 }}>
              {pro.rating.toFixed(1)}
            </p>
            <p style={{ color: STAR, fontSize: 11, letterSpacing: "1px", marginTop: 4 }}>★★★★★</p>
            <p style={{ fontSize: 11, color: INK_500, marginTop: 3 }}>{pro.reviewCount} reviews</p>
          </div>
          <div className="flex flex-1 flex-col gap-1">
            {ratingBreakdown.map((pct, i) => (
              <div key={i} className="flex items-center gap-2" style={{ fontSize: 11 }}>
                <span style={{ width: 8, color: INK_500, fontWeight: 600 }}>{5 - i}</span>
                <span className="flex-1 overflow-hidden rounded-full" style={{ height: 4, backgroundColor: subtleBorder }}>
                  <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: STAR }} />
                </span>
              </div>
            ))}
          </div>
        </div>

        <ul className="mt-3 flex flex-col gap-2">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl p-3.5"
              style={{
                backgroundColor: "var(--card)",
                border: `1px solid ${subtleBorder}`,
                boxShadow: cardShadow,
                fontFamily: SANS_STACK,
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
                  style={{
                    background: "var(--cream-elevated)",
                    color: "var(--midnight)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {r.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: 13, fontWeight: 600, color: INK_900 }}>{r.name}</p>
                  <p style={{ fontSize: 11, color: INK_500, marginTop: 1 }}>
                    {r.when} · {r.service}
                  </p>
                </div>
                <span style={{ color: STAR, fontSize: 11, letterSpacing: "0.5px" }}>★★★★★</span>
              </div>
              <p className="mt-2" style={{ fontSize: 13, color: INK_700, lineHeight: 1.5 }}>{r.text}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* STICKY BOOKING BAR -------------------------------------------------- */}
      <div
        className="fixed left-0 right-0 z-30"
        style={{
          // Sits flush against the top of the tab bar regardless of safe-area inset
          bottom: `calc(env(safe-area-inset-bottom, 0px) + ${TAB_BAR_HEIGHT_PX}px)`,
          backgroundColor: surfaceBg,
          borderTop: `1px solid ${subtleBorder}`,
          padding: "12px 20px",
          fontFamily: SANS_STACK,
          boxShadow: "0 -4px 12px rgba(20,25,40,0.04)",
        }}
      >
        <div className="mx-auto flex w-full max-w-[420px] items-center justify-end gap-3">
          {pro.online && (
            <p className="mr-auto inline-flex items-center gap-1.5" style={{ fontSize: 11.5, color: SUCCESS, fontWeight: 600 }}>
              <span aria-hidden className="ewa-pulse" style={{ width: 5, height: 5, borderRadius: 9999, backgroundColor: SUCCESS }} />
              Next available 2:00 PM today
            </p>
          )}
          <button
            type="button"
            onClick={() => navigate({ to: "/booking/confirm/$proId", params: { proId: pro.id } })}
            className="inline-flex items-center gap-1.5 rounded-xl transition-transform active:scale-95"
            style={{
              padding: "12px 22px",
              backgroundColor: ORANGE,
              color: "#1A0E08",
              fontSize: 14.5,
              fontWeight: 600,
              fontFamily: SANS_STACK,
            }}
          >
            Book
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </AppShell>
  );
}

/* ───────── Atoms ───────── */

function FloatIcon({
  children,
  onClick,
  ariaLabel,
  activeColor,
}: {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel: string;
  activeColor?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
      style={{
        backgroundColor: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        color: activeColor ?? "#2A3544",
        boxShadow: "0 1px 2px rgba(20,25,40,0.04)",
      }}
    >
      {children}
    </button>
  );
}

function Sep() {
  return <span aria-hidden style={{ width: 3, height: 3, borderRadius: 9999, backgroundColor: INK_300 }} />;
}

function SectionHeader({
  title,
  action,
  onAction,
  text,
  muted,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  text: string;
  muted: string;
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between">
      <h2 style={{ fontFamily: SANS_STACK, fontSize: 17, fontWeight: 700, color: text, letterSpacing: "-0.015em", margin: 0 }}>
        {title}
      </h2>
      {action && (
        <button
          type="button"
          onClick={onAction}
          style={{
            fontFamily: SANS_STACK,
            fontSize: 13,
            fontWeight: 600,
            color: ORANGE,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {action}
        </button>
      )}
      {/* suppress unused muted */}
      <span hidden>{muted}</span>
    </div>
  );
}

/* ───────── Mock helpers ───────── */

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function mockStats(pro: Pro) {
  // Derive plausible bookings + tenure from rating and review count
  const bookings = pro.reviewCount * 3 + 30;
  const years = Math.max(1, Math.round(pro.reviewCount / 30));
  return { bookings, years };
}

function mockBreakdown(): number[] {
  // 5/4/3/2/1 percentages — heavily skewed positive, like Airbnb
  return [92, 6, 1, 1, 0];
}

function bioFor(pro: Pro): string {
  switch (pro.category) {
    case "Braids":
      return "Brooklyn-based braider — clean parts, no tension, hair-first protective styling. Healthy hair journeys are my joy.";
    case "Silk press":
      return "Brooklyn-based stylist specializing in natural hair, silk presses & protective styles. Healthy hair journeys are my joy.";
    case "Barbering":
      return "Sharp lines, fresh fades, clean beard work. 10+ years in Brooklyn shops, now mobile.";
    case "Locs":
      return "Loctician focused on starter locs, retwist, sisterlocks, and overall scalp health.";
    case "Color":
      return "Color specialist — single process, balayage, gloss work. Healthy color, no compromise.";
    case "Nails":
      return "Mobile nail tech doing Gel-X, Russian manis, structured gel. Cleanliness is non-negotiable.";
    case "Makeup":
      return "Soft glam, bridal, editorial. Skin-first beauty for melanin-rich tones.";
    case "Wash & Style":
      return "Healthy wash days, defined styles, and trims that grow your hair out, not back.";
  }
}

function hashtagsFor(pro: Pro): string[] {
  const base = ["#brooklyn"];
  if (pro.category === "Silk press" || pro.category === "Wash & Style") return ["#naturalhair", ...base];
  if (pro.category === "Braids") return ["#protectivestyles", ...base];
  if (pro.category === "Locs") return ["#locticiansofnyc", ...base];
  if (pro.category === "Barbering") return ["#bkbarber", ...base];
  if (pro.category === "Nails") return ["#nailsofnyc", ...base];
  if (pro.category === "Makeup") return ["#mua", ...base];
  return ["#color", ...base];
}

function serviceDescFor(name: string): string {
  const k = name.toLowerCase();
  if (k.includes("silk press")) return "Wash, blow-dry, flat iron. Includes deep condition and trim.";
  if (k.includes("knotless")) return "Small, medium, or large. Hair extensions included.";
  if (k.includes("wash")) return "Cleanse, condition, style of choice.";
  if (k.includes("retwist")) return "Maintenance retwist + light styling.";
  if (k.includes("sisterlocks")) return "Full sisterlocks install — consultation included.";
  if (k.includes("balayage")) return "Hand-painted highlights for a sun-kissed finish.";
  if (k.includes("gel-x")) return "Full set. Choose length and shape on the day.";
  if (k.includes("manicure")) return "Cuticle, file, color of choice.";
  if (k.includes("box")) return "Classic box braids in your choice of size.";
  if (k.includes("bridal")) return "Trial included. Lock in your wedding day look.";
  if (k.includes("soft glam")) return "Skin-first base, soft eye, defined lip.";
  if (k.includes("cut") || k.includes("line")) return "Skin or scissor cut + sharp line-up.";
  if (k.includes("beard")) return "Detail, shape, and trim.";
  return "Tap to see all the options for this service.";
}

function durationFor(name: string): string {
  const k = name.toLowerCase();
  if (k.includes("knotless") || k.includes("box")) return "3–4 hr";
  if (k.includes("sisterlocks")) return "8 hr+";
  if (k.includes("silk press")) return "90 min";
  if (k.includes("wash")) return "60 min";
  if (k.includes("retwist")) return "75 min";
  if (k.includes("balayage")) return "3 hr";
  if (k.includes("gel-x")) return "90 min";
  if (k.includes("manicure")) return "45 min";
  if (k.includes("bridal")) return "2 hr";
  if (k.includes("soft glam")) return "60 min";
  if (k.includes("cut")) return "45 min";
  if (k.includes("beard")) return "30 min";
  return "60 min";
}

type ReviewItem = { id: string; initials: string; name: string; when: string; service: string; text: string };
function mockReviews(pro: Pro): ReviewItem[] {
  const first = pro.services[0]?.name ?? pro.category;
  const second = pro.services[1]?.name ?? pro.category;
  return [
    {
      id: "rev-1",
      initials: "MO",
      name: "Maya Okafor",
      when: "2 days ago",
      service: first,
      text: `${pro.name.split(" ")[0]} is honestly the best. So gentle, so professional, and my hair was bouncing for two weeks straight. Will rebook every month.`,
    },
    {
      id: "rev-2",
      initials: "TB",
      name: "Tasha B.",
      when: "1 week ago",
      service: second,
      text: "Came right to my apartment, set up was so professional. Looked amazing and didn't pull at all. 10/10.",
    },
  ];
}

// Unused-var suppression for INK_300 (only used inside Sep, but prevents tree-shaker noise)
const __INK_300 = INK_300;
void __INK_300;
const __INK_400 = INK_400;
void __INK_400;
