import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { useCollections, DEFAULT_COLLECTION_ID } from "./store";
import { NewCollectionSheet } from "./NewCollectionSheet";

const ORANGE = "#FF823F";
const FRAUNCES = '"Fraunces", "Times New Roman", serif';

export function FavoritesIndex() {
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const { collections, create, count, preview } = useCollections();
  const [newOpen, setNewOpen] = useState(false);

  const muted = isDark ? "rgba(240,235,216,0.55)" : "rgba(6,28,39,0.62)";
  const subtleSurface = isDark ? "rgba(240,235,216,0.06)" : "#FFFFFF";
  const subtleBorder = isDark ? "rgba(240,235,216,0.10)" : "rgba(6,28,39,0.10)";

  const totalCount = collections.reduce((acc, c) => acc + count(c.id), 0);

  return (
    <AppShell editorial>
      <header className="px-5 pt-5">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <h1 style={{ fontFamily: FRAUNCES, fontWeight: 400, fontSize: 38, lineHeight: 1.05, letterSpacing: "-0.02em", color: text, margin: 0 }}>
              Collections
            </h1>
            <p className="mt-1.5" style={{ fontFamily: SANS_STACK, fontSize: 13.5, color: muted }}>
              {totalCount === 0
                ? "Save the pros and looks you love."
                : `${totalCount} saved across ${collections.length} ${collections.length === 1 ? "collection" : "collections"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNewOpen(true)}
            className="shrink-0 rounded-full px-3.5 py-2 transition-transform active:scale-95"
            style={{
              backgroundColor: subtleSurface,
              border: `1px solid ${subtleBorder}`,
              color: text,
              fontFamily: SANS_STACK,
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            + New
          </button>
        </div>
      </header>

      <div className="px-5 pt-5" style={{ fontFamily: SANS_STACK }}>
        {collections.length === 1 && count(DEFAULT_COLLECTION_ID) === 0 ? (
          <EmptyState
            onBrowse={() => navigate({ to: "/discover" })}
            text={text}
            muted={muted}
            subtleSurface={subtleSurface}
            subtleBorder={subtleBorder}
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {collections.map((c) => {
              const n = count(c.id);
              const previews = preview(c.id);
              return (
                <li key={c.id}>
                  <Link
                    to="/favorites/$collectionId"
                    params={{ collectionId: c.id }}
                    className="group block overflow-hidden rounded-2xl bg-card text-card-foreground transition-transform active:scale-[0.98]"
                    style={{ border: `1px solid ${subtleBorder}` }}
                  >
                    <CollectionPreview previews={previews} muted={muted} />
                    <div className="px-3 py-2.5">
                      <p className="truncate" style={{ fontSize: 14, fontWeight: 700, color: "var(--card-foreground)" }}>
                        {c.name}
                      </p>
                      <p style={{ fontSize: 11.5, color: muted, marginTop: 2 }}>
                        {n} {n === 1 ? "item" : "items"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

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

function CollectionPreview({ previews, muted }: { previews: string[]; muted: string }) {
  if (previews.length === 0) {
    return (
      <div
        className="grid h-32 w-full place-items-center"
        style={{ backgroundColor: "rgba(6,28,39,0.04)", color: muted }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
    );
  }
  if (previews.length === 1) {
    return <img src={previews[0]} alt="" className="h-32 w-full object-cover" />;
  }
  if (previews.length === 2) {
    return (
      <div className="grid h-32 w-full grid-cols-2 gap-px">
        {previews.map((p, i) => (
          <img key={i} src={p} alt="" className="h-full w-full object-cover" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid h-32 w-full grid-cols-2 gap-px">
      <img src={previews[0]} alt="" className="h-full w-full object-cover" />
      <div className="grid grid-rows-2 gap-px">
        <img src={previews[1]} alt="" className="h-full w-full object-cover" />
        <img src={previews[2]} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

function EmptyState({
  onBrowse,
  text,
  muted,
  subtleSurface,
  subtleBorder,
}: {
  onBrowse: () => void;
  text: string;
  muted: string;
  subtleSurface: string;
  subtleBorder: string;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-3xl px-6 py-10 text-center"
      style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}` }}
    >
      <div className="grid h-14 w-14 place-items-center rounded-full" style={{ backgroundColor: "rgba(255,130,63,0.12)", color: ORANGE }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <p className="mt-4" style={{ fontFamily: FRAUNCES, fontSize: 24, fontWeight: 400, letterSpacing: "-0.01em", color: text }}>
        Nothing favorited yet
      </p>
      <p className="mt-1.5" style={{ fontSize: 13.5, color: muted, maxWidth: 280 }}>
        Tap the heart on any pro and they'll land in your <strong>Saved</strong> collection — or make a new one for a vibe.
      </p>
      <button
        type="button"
        onClick={onBrowse}
        className="mt-5 rounded-full px-5 py-2.5 transition-transform active:scale-95"
        style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 13.5, fontWeight: 700 }}
      >
        Browse pros
      </button>
    </div>
  );
}
