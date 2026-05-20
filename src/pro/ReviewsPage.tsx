import { useNavigate, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { MOCK_PROS } from "@/data/mock-pros";
import { TAB_BAR_HEIGHT_PX } from "@/home/TabBar";
import { buildFullReviews, ratingBreakdownFor } from "./reviews-data";

const STAR = "#F5A623";
const INK_900 = "#0B1220";
const INK_500 = "#6B7684";
const INK_700 = "#2A3544";

export function ReviewsPage({ proId }: { proId: string }) {
  const pro = MOCK_PROS.find((p) => p.id === proId);
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const router = useRouter();

  const subtleSurface = "var(--surface-elevated)";
  const subtleBorder = "var(--border)";
  const cardShadow = isDark
    ? "none"
    : "0 1px 3px rgba(11,18,32,0.06), 0 1px 2px rgba(11,18,32,0.04)";

  if (!pro) {
    return (
      <AppShell>
        <div className="px-5 pt-12 text-center" style={{ fontFamily: SANS_STACK, color: text }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Pro not found</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/discover" })}
            className="mt-4 rounded-full px-4 py-2"
            style={{ backgroundColor: "var(--bagel)", color: "#1A0E08", fontSize: 13, fontWeight: 700 }}
          >
            Back to Discover
          </button>
        </div>
      </AppShell>
    );
  }

  const reviews = buildFullReviews(pro);
  const breakdown = ratingBreakdownFor(reviews);
  const avg = pro.rating.toFixed(1);

  return (
    <AppShell>
      <header className="relative flex items-center justify-center px-5 pb-3 pt-4">
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
        <h1 style={{ fontFamily: SANS_STACK, fontSize: 17, fontWeight: 700, color: text, margin: 0 }}>
          Reviews
        </h1>
      </header>

      <div
        className="px-5"
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${TAB_BAR_HEIGHT_PX + 24}px)`,
          fontFamily: SANS_STACK,
        }}
      >
        {/* Rating summary */}
        <div
          className="flex items-center gap-6 rounded-2xl p-5"
          style={{
            backgroundColor: "var(--card)",
            border: `1px solid ${subtleBorder}`,
            boxShadow: cardShadow,
            color: "var(--card-foreground)",
          }}
        >
          <div className="shrink-0 text-center">
            <p
              className="tabular"
              style={{ fontSize: 44, fontWeight: 700, color: INK_900, letterSpacing: "-0.03em", lineHeight: 1 }}
            >
              {avg}
            </p>
            <p style={{ color: STAR, fontSize: 14, letterSpacing: "1px", marginTop: 6 }}>★★★★★</p>
            <p className="tabular" style={{ fontSize: 12, color: INK_500, marginTop: 4 }}>
              {pro.reviewCount} reviews
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            {breakdown.map((pct, i) => (
              <div key={i} className="flex items-center gap-2" style={{ fontSize: 12 }}>
                <span style={{ width: 10, color: INK_500, fontWeight: 600 }}>{5 - i}</span>
                <span className="flex-1 overflow-hidden rounded-full" style={{ height: 6, backgroundColor: subtleBorder }}>
                  <span className="block h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: STAR }} />
                </span>
                <span className="tabular" style={{ width: 32, textAlign: "right", color: INK_500 }}>
                  {pct}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Reviews list */}
        <ul className="mt-4 flex flex-col gap-2.5">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl p-4"
              style={{
                backgroundColor: "var(--card)",
                border: `1px solid ${subtleBorder}`,
                boxShadow: cardShadow,
                color: "var(--card-foreground)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                  style={{
                    backgroundColor: "var(--cream-elevated)",
                    color: "var(--midnight)",
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {r.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: INK_900 }}>{r.name}</p>
                  <p style={{ fontSize: 11.5, color: INK_500, marginTop: 1 }}>
                    {r.when} · {r.service}
                  </p>
                </div>
                <span style={{ color: STAR, fontSize: 12, letterSpacing: "0.5px" }}>
                  {"★".repeat(r.rating)}
                  <span style={{ color: subtleBorder }}>{"★".repeat(5 - r.rating)}</span>
                </span>
              </div>
              <p className="mt-2.5" style={{ fontSize: 13, color: INK_700, lineHeight: 1.5 }}>
                {r.text}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
