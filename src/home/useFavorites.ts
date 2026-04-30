import { useCallback, useEffect, useState } from "react";

/**
 * Favorites — persisted to localStorage so the heart state survives reloads.
 * Single key, no per-user partitioning until auth lands.
 */
const KEY = "ewa.favorites.v1";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent("ewa:favorites-changed"));
  } catch {}
}

export function useFavorites() {
  const [ids, setIds] = useState<Set<string>>(() => new Set(read()));

  useEffect(() => {
    const sync = () => setIds(new Set(read()));
    window.addEventListener("ewa:favorites-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("ewa:favorites-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const isFavorite = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback(
    (id: string): boolean => {
      const next = new Set(ids);
      const willFavorite = !next.has(id);
      if (willFavorite) next.add(id);
      else next.delete(id);
      write(Array.from(next));
      setIds(next);
      return willFavorite;
    },
    [ids],
  );

  return { ids, isFavorite, toggle, count: ids.size };
}
