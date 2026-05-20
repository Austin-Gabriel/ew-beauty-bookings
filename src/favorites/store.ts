/**
 * Favorites store — collections + items (pros only), persisted to localStorage.
 *
 * Data model
 * ----------
 * Collection: { id, name, createdAt }
 *   - "saved" is the default collection (id: "saved", name: "Saved")
 *   - cannot be deleted; new items default here
 * Item: { id, collectionId, type: 'pro', refId, thumbnailUrl, addedAt, meta? }
 *
 * Hooks
 * -----
 * useCollections()  → list collections + create / rename / delete
 * useFavorites()    → isFavorite(proId), toggle(proId, pro?), count
 * useCollectionItems(collectionId) → items inside a collection
 */
import { useCallback, useEffect, useMemo, useState } from "react";

const COLL_KEY = "ewa.favorites.collections.v1";
const ITEMS_KEY = "ewa.favorites.items.v1";

export const DEFAULT_COLLECTION_ID = "saved";

export type FavCollection = {
  id: string;
  name: string;
  createdAt: number;
  /** True for the system "Saved" collection — cannot be renamed/deleted. */
  system?: boolean;
};

/** Pro is the only saved-item type. Stand-alone "looks" were removed pre-MVP. */
export type FavItemType = "pro";

export type FavItem = {
  id: string;
  collectionId: string;
  type: FavItemType;
  refId: string;
  thumbnailUrl: string;
  addedAt: number;
  meta?: {
    name?: string;
    subtitle?: string;
  };
};

const CHANGE_EVENT = "ewa:favorites-store-changed";

function safeRead<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {}
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function ensureDefaultCollection(list: FavCollection[]): FavCollection[] {
  if (list.some((c) => c.id === DEFAULT_COLLECTION_ID)) return list;
  return [
    {
      id: DEFAULT_COLLECTION_ID,
      name: "Saved",
      createdAt: Date.now(),
      system: true,
    },
    ...list,
  ];
}

// ----- low-level reads -----
function readCollections(): FavCollection[] {
  return ensureDefaultCollection(safeRead<FavCollection[]>(COLL_KEY, []));
}
function readItems(): FavItem[] {
  // Strip any legacy look items left over from old localStorage.
  return safeRead<FavItem[]>(ITEMS_KEY, []).filter((it) => it.type === "pro");
}

// ----- subscription hook (collections + items together) -----
function useFavStore() {
  const [collections, setCollections] = useState<FavCollection[]>(() => readCollections());
  const [items, setItems] = useState<FavItem[]>(() => readItems());

  useEffect(() => {
    const sync = () => {
      setCollections(readCollections());
      setItems(readItems());
    };
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { collections, items };
}

// =====================================================================
// Public API
// =====================================================================

export function useCollections() {
  const { collections, items } = useFavStore();

  const create = useCallback((name: string) => {
    const all = readCollections();
    const trimmed = name.trim() || "Untitled";
    const next: FavCollection = {
      id: makeId("col"),
      name: trimmed,
      createdAt: Date.now(),
    };
    safeWrite(COLL_KEY, [...all, next]);
    return next;
  }, []);

  const rename = useCallback((id: string, name: string) => {
    const all = readCollections();
    const next = all.map((c) => (c.id === id && !c.system ? { ...c, name: name.trim() || c.name } : c));
    safeWrite(COLL_KEY, next);
  }, []);

  const remove = useCallback((id: string) => {
    if (id === DEFAULT_COLLECTION_ID) return;
    const all = readCollections().filter((c) => c.id !== id);
    safeWrite(COLL_KEY, all);
    // Move orphaned items back to default
    const allItems = readItems().map((it) =>
      it.collectionId === id ? { ...it, collectionId: DEFAULT_COLLECTION_ID } : it,
    );
    safeWrite(ITEMS_KEY, allItems);
  }, []);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const it of items) m.set(it.collectionId, (m.get(it.collectionId) ?? 0) + 1);
    return m;
  }, [items]);

  const previews = useMemo(() => {
    const m = new Map<string, string[]>();
    for (const c of collections) m.set(c.id, []);
    // newest first
    const sorted = [...items].sort((a, b) => b.addedAt - a.addedAt);
    for (const it of sorted) {
      const arr = m.get(it.collectionId);
      if (arr && arr.length < 3) arr.push(it.thumbnailUrl);
    }
    return m;
  }, [collections, items]);

  return { collections, create, rename, remove, count: (id: string) => counts.get(id) ?? 0, preview: (id: string) => previews.get(id) ?? [] };
}

export function useCollectionItems(collectionId: string) {
  const { items } = useFavStore();
  return useMemo(
    () => items.filter((it) => it.collectionId === collectionId).sort((a, b) => b.addedAt - a.addedAt),
    [items, collectionId],
  );
}

/** All saved items across every collection (newest first). */
export function useAllItems() {
  const { items } = useFavStore();
  return useMemo(() => [...items].sort((a, b) => b.addedAt - a.addedAt), [items]);
}

/**
 * Pro-level favoriting. A pro is "favorited" if there's at least one pro
 * item with refId == proId in any collection.
 */
export function useFavorites() {
  const { items } = useFavStore();

  const proIds = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) s.add(it.refId);
    return s;
  }, [items]);

  const isFavorite = useCallback((proId: string) => proIds.has(proId), [proIds]);

  const toggle = useCallback(
    (
      proId: string,
      pro?: { name?: string; thumbnail?: string; subtitle?: string },
      collectionId: string = DEFAULT_COLLECTION_ID,
    ): boolean => {
      const all = readItems();
      const existing = all.filter((it) => it.refId === proId);
      if (existing.length > 0) {
        // Unfavorite — remove from ALL collections
        const next = all.filter((it) => !(it.refId === proId));
        safeWrite(ITEMS_KEY, next);
        return false;
      }
      const item: FavItem = {
        id: makeId("it"),
        collectionId,
        type: "pro",
        refId: proId,
        thumbnailUrl: pro?.thumbnail ?? "",
        addedAt: Date.now(),
        meta: { name: pro?.name, subtitle: pro?.subtitle },
      };
      safeWrite(ITEMS_KEY, [...all, item]);
      return true;
    },
    [],
  );

  return { isFavorite, toggle, count: proIds.size, ids: proIds };
}

export function moveItem(itemId: string, toCollectionId: string) {
  const all = readItems().map((it) => (it.id === itemId ? { ...it, collectionId: toCollectionId } : it));
  safeWrite(ITEMS_KEY, all);
}

export function removeItem(itemId: string) {
  const all = readItems().filter((it) => it.id !== itemId);
  safeWrite(ITEMS_KEY, all);
}

// ----- Dev-state seeding -----
export type FavoritesSeed = "empty" | "few" | "many";

export function seedFavorites(seed: FavoritesSeed, pros: { id: string; name: string; portfolio: string[]; category: string }[]) {
  if (seed === "empty") {
    safeWrite(COLL_KEY, ensureDefaultCollection([]));
    safeWrite(ITEMS_KEY, []);
    return;
  }
  const cols: FavCollection[] =
    seed === "few"
      ? ensureDefaultCollection([
          { id: "col_birthday", name: "Birthday glam", createdAt: Date.now() },
        ])
      : ensureDefaultCollection([
          { id: "col_birthday", name: "Birthday glam", createdAt: Date.now() },
          { id: "col_regulars", name: "My regulars", createdAt: Date.now() - 1000 },
          { id: "col_wedding", name: "Wedding inspo", createdAt: Date.now() - 2000 },
        ]);

  const take = seed === "few" ? 3 : 8;
  const picks = pros.slice(0, take);
  const items: FavItem[] = [];
  picks.forEach((p, i) => {
    const target = cols[i % cols.length]!;
    items.push({
      id: makeId("it"),
      collectionId: target.id,
      type: "pro",
      refId: p.id,
      thumbnailUrl: p.portfolio[0] ?? "",
      addedAt: Date.now() - i * 1000,
      meta: { name: p.name, subtitle: p.category },
    });
  });
  safeWrite(COLL_KEY, cols);
  safeWrite(ITEMS_KEY, items);
}
