## Discover — wire every clickable element

Replace placeholder toasts and silent buttons with real interactions. Single file changes: `src/home/Discover.tsx`.

### 1. Saved sheet (bookmark icon)
Bottom `Sheet`. Header: "Saved pros" + count.
- **Empty:** large faint heart, "Nothing saved yet", sub "Tap the heart on any pro to keep them close.", CTA "Browse pros" closes sheet.
- **Populated:** vertical list — 48px portfolio thumb, name + verified tick, category · neighborhood, rating · "from $X", filled heart to unsave. Whole row navigates to `/pro/$proId`.

### 2. Notifications sheet (bell icon)
Bottom `Sheet`. Header: "Notifications" + "Mark all read".
Three mock rows (vary by dev-state customer profile):
- Green dot — "Amara confirmed your booking" / "Tomorrow at 2:00 PM · Knotless braids" / 2h → `/bookings`
- Orange dot — "New braider near you" / "Imani just joined Ewà in Bed-Stuy" / yesterday → pro page
- Blue dot — "Message from Zara" / "Sounds good, see you Saturday!" / 2d → `/messages`
Unread rows get cream-elevated background. New customer state shows "You're all caught up."

### 3. Filters sheet (orange button)
Bottom `Sheet` with three chip groups:
- **Price:** $ (under $80), $$ ($80–150), $$$ ($150+)
- **Rating:** Any, 4.0+, 4.5+, 4.8+
- **Availability:** Anytime, Today, This week, This weekend
Sticky footer (respects safe area + tab bar): orange "Apply filters" / "Apply N filters". "Reset" in header. Toast: "Showing N pros". Filter button gets a small badge when active.

### 4. Radius sheet (5 mi pill)
Bottom `Sheet`. Header: "Search radius" / "How far should we look from your spot in Bed-Stuy?"
Large radio rows: 1 mi "Just my block", 3 mi "My neighborhood", 5 mi "Nearby" (default), 10 mi "Across Brooklyn", 25 mi "All boroughs". Tap updates pill label, closes sheet, toast "Showing pros within X mi".

### 5. OnlineCard heart parity
Pass `favorited` prop, render filled orange when saved, toast on toggle.

### 6. CompactCard — add heart
Same heart pattern as OnlineCard (top-right, dark-blur pill bg) wired to `useFavorites`.

### 7. TrendingTile — tap to filter
Each tile becomes a button:
- Knotless braids → chip "Braider" + search "knotless" + scroll top + toast
- Silk press → chip "Stylist" + search "silk press" + toast
- Locs → chip "Loctician" + clear search + toast

### Technical notes

- New state in `DiscoverPage`: `savedSheetOpen`, `notifSheetOpen`, `filtersSheetOpen`, `radiusSheetOpen`, `radiusMi`, `priceFilter`, `ratingFilter`, `availabilityFilter`, `unreadNotifs`.
- Extend `filtered` memo with price/rating/availability logic.
- All sheets use `@/components/ui/sheet` `side="bottom"` with `pb-[calc(env(safe-area-inset-bottom)+88px)]` on scrollable content so footer CTAs sit above the tab bar.
- Theme tokens only — `text`, `muted`, `subtleSurface`, `subtleBorder`, plus existing `ORANGE` / `SUCCESS` constants.
- All toasts via `sonner`.

### Files

- `src/home/Discover.tsx` — only file changed. New sub-components (`SavedSheet`, `NotificationsSheet`, `FiltersSheet`, `RadiusSheet`) defined in-file, consistent with existing card components.

### Out of scope

- Persisting filter/radius across reloads.
- Real notifications backend.
- Real geocoding.
