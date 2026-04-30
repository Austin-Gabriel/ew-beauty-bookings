/**
 * Location & distance display logic for the customer app.
 *
 * The display rule depends on three things:
 *   1. The pro's home area (city + state)
 *   2. The user's currently-selected SEARCH area
 *   3. The user's actual HOME area
 *
 * Three cases:
 *
 *   a) Pro is in the search area, and you're searching your home area
 *      → "1.2 mi"   (just the raw distance)
 *
 *   b) Pro is in the search area, but you're searching ELSEWHERE
 *      (e.g., physically in NJ but searching Atlanta)
 *      → "0.8 mi from search area"   (distance is from the search center,
 *      not from you, so we name it explicitly)
 *
 *   c) Pro is NOT in the search area
 *      • If the search area IS your home area AND the pro is in a
 *        plausibly-driveable neighboring metro (e.g., Brooklyn pro
 *        from Newark), show the cross-metro distance: "12 mi"
 *      • Otherwise (e.g., a saved Brooklyn stylist while you're searching
 *        Atlanta), show the city: "Brooklyn, NY"
 *
 * The pro feed itself only includes pros in the active search area, so
 * case (c) only fires for a few specific surfaces (saved/favorites,
 * past bookings, etc.).
 */

export type Area = { city: string; state: string };

/** Distance, in miles, between two metros — for the cross-metro display
 *  case (Newark ↔ Brooklyn shows "12 mi", but Brooklyn ↔ Atlanta is too
 *  far so we fall back to the city label). Symmetric. */
const NEIGHBOR_METRO_MI: Record<string, number> = {
  "Brooklyn,NY|Newark,NJ": 12,
  "Brooklyn,NY|Manhattan,NY": 5,
  "Brooklyn,NY|Queens,NY": 8,
  "Brooklyn,NY|Jersey City,NJ": 10,
  "Newark,NJ|Manhattan,NY": 14,
};

const MAX_NEIGHBOR_MI = 30;

function key(a: Area, b: Area): string {
  return `${a.city},${a.state}|${b.city},${b.state}`;
}

export function sameArea(a: Area, b: Area): boolean {
  return a.city === b.city && a.state === b.state;
}

function neighborMetroDistance(a: Area, b: Area): number | null {
  if (sameArea(a, b)) return 0;
  return NEIGHBOR_METRO_MI[key(a, b)] ?? NEIGHBOR_METRO_MI[key(b, a)] ?? null;
}

export type LocationContext = {
  /** The area the user is actively searching. */
  searchArea: Area;
  /** The user's actual physical / home area. */
  userHome: Area;
};

/** Returns true when the pro should appear in the feed for the current
 *  search context. Out-of-area pros are filtered out *unless* the surface
 *  has a different rule (Saved, past Bookings — those override). */
export function inSearchArea(pro: { area: Area }, ctx: LocationContext): boolean {
  return sameArea(pro.area, ctx.searchArea);
}

/** Pro location string, ready to drop into the UI. */
export function formatProLocation(
  pro: { area: Area; distanceMi: number },
  ctx: LocationContext,
): string {
  // Case (a) + (b): pro is in the search area
  if (sameArea(pro.area, ctx.searchArea)) {
    const d = pro.distanceMi.toFixed(1);
    return sameArea(ctx.searchArea, ctx.userHome) ? `${d} mi` : `${d} mi from search area`;
  }

  // Case (c): pro is NOT in the search area
  // (c.i) — user is searching home AND pro is in a plausible neighboring metro
  if (sameArea(ctx.searchArea, ctx.userHome)) {
    const cross = neighborMetroDistance(ctx.userHome, pro.area);
    if (cross !== null && cross <= MAX_NEIGHBOR_MI) return `${cross} mi`;
  }

  // (c.ii) — out of any reasonable distance context, show the city
  return `${pro.area.city}, ${pro.area.state}`;
}

/* ───────── Defaults / current-context provider ───────── */

const DEFAULT_AREA: Area = { city: "Brooklyn", state: "NY" };

/**
 * Single source of truth for the customer's location context. Defaults
 * to Brooklyn, NY for both home and search; once we ship a real location
 * picker / GPS hookup this is the only place that has to change.
 */
export function getLocationContext(): LocationContext {
  return { searchArea: DEFAULT_AREA, userHome: DEFAULT_AREA };
}
