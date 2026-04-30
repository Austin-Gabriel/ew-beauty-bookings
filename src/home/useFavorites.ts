/**
 * Back-compat shim — favorites moved to /src/favorites/store.
 * Existing call sites get the same shape: { isFavorite, toggle, count, ids }.
 *
 * Note: toggle() can now optionally accept pro metadata so the heart can
 * record a thumbnail for the Favorites tab. Old call sites that pass only
 * an id keep working (they'll fall back to a placeholder thumbnail).
 */
export { useFavorites } from "@/favorites/store";
