import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import {
  useCollections,
  useCollectionItems,
  removeItem,
  moveItem,
  DEFAULT_COLLECTION_ID,
  type FavItem,
} from "./store";
import { ItemActionSheet } from "./ItemActionSheet";
import { MoveToCollectionSheet } from "./MoveToCollectionSheet";
import { FavoriteEmptyState } from "./FavoriteEmptyState";
import { Sheet, SheetContent } from "@/components/ui/sheet";

const ORANGE = "#FF823F";


export function CollectionDetail({ collectionId }: { collectionId: string }) {
  const { isDark, text } = useAuthTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const { collections, remove } = useCollections();
  const items = useCollectionItems(collectionId);

  const collection = collections.find((c) => c.id === collectionId);

  const muted = isDark ? "rgba(240,235,216,0.55)" : "rgba(6,28,39,0.62)";
  const subtleSurface = isDark ? "rgba(240,235,216,0.06)" : "#FFFFFF";
  const subtleBorder = isDark ? "rgba(240,235,216,0.10)" : "rgba(6,28,39,0.10)";

  const [actionItem, setActionItem] = useState<FavItem | null>(null);
  const [moveItemState, setMoveItemState] = useState<FavItem | null>(null);
  const [lightboxItem, setLightboxItem] = useState<FavItem | null>(null);

  if (!collection) {
    return (
      <AppShell>
        <div className="px-5 pt-12 text-center" style={{ fontFamily: SANS_STACK, color: text }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Collection not found</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/favorites" })}
            className="mt-4 rounded-full px-4 py-2"
            style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 13, fontWeight: 700 }}
          >
            Back to Collections
          </button>
        </div>
      </AppShell>
    );
  }

  const onShare = async () => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/favorites/shared/${collection.shareId}`;
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({
          title: `${collection.name} on Ewà`,
          text: "Check out my Ewà collection",
          url,
        });
        return;
      }
    } catch {/* fall through to clipboard */}
    try {
      await navigator.clipboard.writeText(url);
      toast("Share link copied to clipboard");
    } catch {
      toast(url);
    }
  };

  const onDeleteCollection = () => {
    if (collection.system) return;
    if (typeof window !== "undefined" && !window.confirm(`Delete "${collection.name}"? Items will move to Saved.`)) return;
    remove(collection.id);
    toast(`Deleted "${collection.name}"`);
    navigate({ to: "/favorites" });
  };

  return (
    <AppShell>
      <header className="relative flex items-center justify-between gap-2 px-5 pb-3 pt-4">
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="grid h-9 w-9 place-items-center rounded-full transition-transform active:scale-95"
          style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}`, color: text }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate" style={{ fontFamily: SANS_STACK, fontSize: 13, color: muted, margin: 0 }}>Collection</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onShare}
            aria-label="Share collection"
            className="grid h-9 w-9 place-items-center rounded-full transition-transform active:scale-95"
            style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}`, color: text }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          {!collection.system && (
            <button
              type="button"
              onClick={onDeleteCollection}
              aria-label="Delete collection"
              className="grid h-9 w-9 place-items-center rounded-full transition-transform active:scale-95"
              style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}`, color: text }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <div className="px-5" style={{ fontFamily: SANS_STACK, color: text }}>
        <h1 style={{ fontFamily: SANS_STACK, fontWeight: 700, fontSize: 30, lineHeight: 1.1, letterSpacing: "-0.01em", margin: 0, color: text }}>
          {collection.name}
        </h1>
        <p className="mt-1" style={{ fontSize: 13, color: muted }}>
          {items.length} {items.length === 1 ? "item" : "items"}
          {collection.id === DEFAULT_COLLECTION_ID && " · default"}
        </p>

        {items.length === 0 ? (
          <FavoriteEmptyState variant="collection-detail" onCta={() => navigate({ to: "/discover" })} />
        ) : (
          <ul className="mt-5 grid grid-cols-2 gap-3 pb-6 sm:grid-cols-3 md:grid-cols-4">
            {items.map((it) => (
              <li key={it.id}>
                <FavoriteCard
                  item={it}
                  muted={muted}
                  subtleBorder={subtleBorder}
                  onTap={() => {
                    if (it.type === "pro") {
                      navigate({ to: "/pro/$proId", params: { proId: it.refId } });
                    } else {
                      // Look: open lightbox; "View pro" lives inside it
                      setLightboxItem(it);
                    }
                  }}
                  onMore={() => setActionItem(it)}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <LookLightbox
        item={lightboxItem}
        onClose={() => setLightboxItem(null)}
        onViewPro={(proId) => {
          setLightboxItem(null);
          navigate({ to: "/pro/$proId", params: { proId } });
        }}
      />

      <ItemActionSheet
        item={actionItem}
        onClose={() => setActionItem(null)}
        onMove={() => {
          if (actionItem) {
            setMoveItemState(actionItem);
            setActionItem(null);
          }
        }}
        onRemove={() => {
          if (actionItem) {
            removeItem(actionItem.id);
            toast("Removed from collection");
            setActionItem(null);
          }
        }}
      />
      <MoveToCollectionSheet
        item={moveItemState}
        collections={collections}
        onClose={() => setMoveItemState(null)}
        onPick={(toId) => {
          if (moveItemState) {
            moveItem(moveItemState.id, toId);
            const dest = collections.find((c) => c.id === toId)?.name ?? "collection";
            toast(`Moved to "${dest}"`);
            setMoveItemState(null);
          }
        }}
      />
    </AppShell>
  );
}

function FavoriteCard({
  item,
  muted,
  subtleBorder,
  onTap,
  onMore,
}: {
  item: FavItem;
  muted: string;
  subtleBorder: string;
  onTap: () => void;
  onMore: () => void;
}) {
  // Long-press detection
  const timer = useRef<number | null>(null);
  const triggered = useRef(false);
  const start = () => {
    triggered.current = false;
    timer.current = window.setTimeout(() => {
      triggered.current = true;
      onMore();
    }, 500);
  };
  const cancel = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };
  useEffect(() => () => cancel(), []);

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-card text-card-foreground transition-all hover:-translate-y-0.5 hover:shadow-md"
      style={{ border: `1px solid ${subtleBorder}` }}
    >
      <button
        type="button"
        onClick={() => { if (!triggered.current) onTap(); }}
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(e) => { e.preventDefault(); onMore(); }}
        className="block w-full text-left transition-transform active:scale-[0.98]"
      >
        <div className="relative aspect-square w-full">
          {item.thumbnailUrl ? (
            <img src={item.thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 grid place-items-center" style={{ backgroundColor: "rgba(6,28,39,0.06)", color: muted }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
            </div>
          )}
          {item.type === "look" && (
            <span
              className="absolute left-2 top-2 rounded-full px-2 py-0.5"
              style={{ fontSize: 10, fontWeight: 700, backgroundColor: "rgba(0,0,0,0.55)", color: "#FFF", letterSpacing: "0.04em" }}
            >
              LOOK
            </span>
          )}
        </div>
        <div className="px-2.5 py-2">
          <p className="truncate" style={{ fontSize: 13, fontWeight: 700, color: "var(--card-foreground)" }}>
            {item.meta?.name ?? (item.type === "pro" ? "Saved pro" : "Saved look")}
          </p>
          {item.meta?.subtitle && (
            <p className="truncate" style={{ fontSize: 11.5, color: muted, marginTop: 1 }}>
              {item.meta.subtitle}
            </p>
          )}
        </div>
      </button>
      <button
        type="button"
        onClick={onMore}
        aria-label="Item options"
        className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full transition-transform active:scale-95"
        style={{ backgroundColor: "rgba(0,0,0,0.45)", color: "#FFF" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
      </button>
    </div>
  );
}

function LookLightbox({
  item,
  onClose,
  onViewPro,
}: {
  item: FavItem | null;
  onClose: () => void;
  onViewPro: (proId: string) => void;
}) {
  const proId = item?.meta?.proId;
  return (
    <Sheet open={!!item} onOpenChange={(v) => { if (!v) onClose(); }}>
      <SheetContent side="bottom" className="rounded-t-3xl p-0">
        <div className="px-5 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-5" style={{ fontFamily: SANS_STACK }}>
          {item?.thumbnailUrl ? (
            <img
              src={item.thumbnailUrl}
              alt={item.meta?.name ?? "Look"}
              className="mx-auto max-h-[60vh] w-full rounded-2xl object-contain"
            />
          ) : null}
          <div className="mt-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate" style={{ fontSize: 16, fontWeight: 700, color: "var(--card-foreground)" }}>
                {item?.meta?.name ?? "Saved look"}
              </p>
              {item?.meta?.subtitle && (
                <p className="truncate" style={{ fontSize: 13, color: "var(--on-card-muted)", marginTop: 2 }}>
                  {item.meta.subtitle}
                </p>
              )}
            </div>
            {proId && (
              <button
                type="button"
                onClick={() => onViewPro(proId)}
                className="shrink-0 rounded-full px-4 py-2.5 transition-transform active:scale-95"
                style={{ backgroundColor: ORANGE, color: "#1A0E08", fontSize: 13, fontWeight: 700 }}
              >
                View pro
              </button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
