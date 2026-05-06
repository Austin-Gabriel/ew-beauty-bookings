import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { AuthShell } from "@/auth/auth-shell";
import {
  getCollectionByShareId,
  getItemsForCollection,
  type FavCollection,
  type FavItem,
} from "./store";

const ORANGE = "#FF823F";

/**
 * Public read-only view of a collection. No bottom tab bar, no auth required.
 * Note: persistence is currently localStorage so the preview only works on
 * the same device. When backend lands, swap getCollectionByShareId() for
 * a server fetch.
 */
export function SharedCollection({ shareId }: { shareId: string }) {
  const { isDark, text } = useAuthTheme();
  const [data, setData] = useState<{ collection: FavCollection | null; items: FavItem[] }>({
    collection: null,
    items: [],
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const c = getCollectionByShareId(shareId);
    setData({
      collection: c,
      items: c ? getItemsForCollection(c.id) : [],
    });
    setHydrated(true);
  }, [shareId]);

  const muted = "var(--muted-foreground)";
  const subtleSurface = "var(--surface-elevated)";
  const subtleBorder = "var(--border)";

  return (
    <AuthShell hideThemeToggle noSquiggles>
      <main className="relative z-[1] mx-auto w-full max-w-[420px] px-5 pb-12 pt-6" style={{ fontFamily: SANS_STACK, color: text }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: muted }}>
          Shared via Ewà
        </div>
        {!hydrated ? (
          <p className="mt-6" style={{ fontSize: 14, color: muted }}>Loading…</p>
        ) : !data.collection ? (
          <div className="mt-8 rounded-2xl px-5 py-8 text-center" style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}` }}>
            <p style={{ fontFamily: SANS_STACK, fontSize: 20, fontWeight: 700 }}>Collection not found</p>
            <p className="mt-1" style={{ fontSize: 13, color: muted }}>This share link is no longer available.</p>
            <Link
              to="/discover"
              className="mt-4 inline-block rounded-full px-4 py-2"
              style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 13, fontWeight: 700 }}
            >
              Open Ewà
            </Link>
          </div>
        ) : (
          <>
            <h1 style={{ fontFamily: SANS_STACK, fontWeight: 700, fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.01em", margin: 0, marginTop: 8, color: text }}>
              {data.collection.name}
            </h1>
            <p className="mt-1.5" style={{ fontSize: 13, color: muted }}>
              {data.items.length} {data.items.length === 1 ? "item" : "items"} · read-only
            </p>

            {data.items.length === 0 ? (
              <p className="mt-8" style={{ fontSize: 14, color: muted }}>Nothing here yet.</p>
            ) : (
              <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {data.items.map((it) => (
                  <li key={it.id} className="overflow-hidden rounded-2xl bg-card text-card-foreground transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ border: `1px solid ${subtleBorder}` }}>
                    <div className="aspect-square w-full">
                      {it.thumbnailUrl ? (
                        <img src={it.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center" style={{ backgroundColor: "rgba(6,28,39,0.06)", color: muted }}>♥</div>
                      )}
                    </div>
                    <div className="px-2.5 py-2">
                      <p className="truncate" style={{ fontSize: 13, fontWeight: 700, color: "var(--card-foreground)" }}>
                        {it.meta?.name ?? (it.type === "pro" ? "Saved pro" : "Saved look")}
                      </p>
                      {it.meta?.subtitle && (
                        <p className="truncate" style={{ fontSize: 11.5, color: muted, marginTop: 1 }}>{it.meta.subtitle}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <Link
              to="/discover"
              className="mt-8 inline-flex items-center gap-2 rounded-full px-4 py-2.5 transition-transform active:scale-95"
              style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 13.5, fontWeight: 700 }}
            >
              Open Ewà to save your own
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </>
        )}
      </main>
    </AuthShell>
  );
}
