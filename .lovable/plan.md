
## Overview

Replace the placeholder Profile tab with a full industrial settings hub. Rename the Favorites tab to "Saved" with a bookmark icon. Add a new dev-state toggle for profile completeness.

---

## 1. Tab bar — rename + re-icon

**File: `src/home/TabBar.tsx`**

- Change label from `"Favorites"` to `"Saved"`
- Replace the heart SVG path with a bookmark path (`M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z`), keeping the fill-on-active pattern
- Route stays `/favorites` — no route change

## 2. Dev-state: add `ProfileState`

**File: `src/dev-state/devState.tsx`**

- New type: `export type ProfileState = "new" | "partial" | "complete";`
- Add `profileState: ProfileState` to `DevState`, default `"complete"`

**File: `src/dev-state/DevStateToggle.tsx`**

- Import `ProfileState`
- Add a "Profile" section divider + a `Stacked` control with three options:
  - New (no phone, 0 addresses, no pill)
  - Partial (phone shown, 1 address)
  - Complete (phone, 2 addresses, Expiring pill)

## 3. Build the Profile screen

**New file: `src/profile/ProfilePage.tsx`**

Industrial surface using `AppShell` (not editorial). All colors via theme tokens — `var(--foreground)`, `var(--muted-foreground)`, `var(--cream-elevated)`, `var(--hairline)`, `var(--bagel)`, `var(--midnight)`, `var(--cream)`, `var(--destructive)`. Uncut Sans only (via `font-sans` / `SANS_STACK`). No Fraunces.

Structure:
- **Identity header** — centered avatar (104px, `bg-cream-elevated`, two-letter "IO" monogram in `text-midnight`), camera badge (midnight circle, cream camera icon via lucide-react `Camera`), name + pencil icon (`Pencil` from lucide), email + masked phone with `.tabular`
- **PERSONAL card** — eyebrow label floating above a `bg-cream-elevated` rounded card. Rows: Saved addresses (lucide `MapPin`), Payment methods (lucide `CreditCard`). Expiring pill uses `bg-bagel text-bagel-foreground`
- **PREFERENCES card** — Notifications (`Bell`), Tipping (`Percent`), Theme (`Sun`/`Monitor`)
- **SUPPORT card** — Help center (`HelpCircle`), Contact support (`MessageCircle`), Terms (`FileText`), Privacy (`Shield`)
- **Sign out** — centered `text-destructive`, toast confirmation on tap

Each row: 32px rounded-square icon tile (`bg-muted`, `text-foreground` icon), label, optional right value/pill, chevron (`ChevronRight`). Hairline dividers indented past icon tile using `var(--hairline)`.

Reads `profileState` from `useDevState()` to drive:
- New: email only, "0 addresses", no pill
- Partial: email + phone, "1 address", no pill
- Complete: email + phone, "2 addresses", Expiring pill

## 4. Route restructure

**File: `src/routes/profile.tsx`** — convert to layout route with `<Outlet />`

**New file: `src/routes/profile.index.tsx`** — renders `ProfilePage`

**6 new stub routes** (each renders a simple back-arrow + title placeholder using `AppShell`):
- `src/routes/profile.edit.tsx`
- `src/routes/profile.addresses.tsx`
- `src/routes/profile.payment-methods.tsx`
- `src/routes/profile.notifications.tsx`
- `src/routes/profile.tipping.tsx`
- `src/routes/profile.theme.tsx`

## Files touched (complete list)

1. `src/home/TabBar.tsx`
2. `src/dev-state/devState.tsx`
3. `src/dev-state/DevStateToggle.tsx`
4. `src/profile/ProfilePage.tsx` (new)
5. `src/routes/profile.tsx` (rewrite to layout)
6. `src/routes/profile.index.tsx` (new)
7. `src/routes/profile.edit.tsx` (new)
8. `src/routes/profile.addresses.tsx` (new)
9. `src/routes/profile.payment-methods.tsx` (new)
10. `src/routes/profile.notifications.tsx` (new)
11. `src/routes/profile.tipping.tsx` (new)
12. `src/routes/profile.theme.tsx` (new)

## Post-build audit commitments

1. Zero hardcoded hex colors in any touched file
2. Cream / midnight / bagel resolve via CSS custom properties in both modes
3. Card text readable in both light and dark
4. Pencil, chevron, divider, icon tile colors all adapt via `var(--muted-foreground)`, `var(--hairline)`, `var(--foreground)`
5. Tab bar shows "Saved" with bookmark icon on every screen
