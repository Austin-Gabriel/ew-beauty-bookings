# Project Structure — Ewà (Customer)

Companion to **Ewà Biz** (pro-facing). Premium, editorial, mobile-first
beauty marketplace. TanStack Start + React + Tailwind.

## Top-level layout

```
src/
  routes/                 # TanStack file-based routes (flat, thin wrappers)
  components/             # UI shared across 3+ domains
  hooks/                  # Hooks shared across 3+ domains
  lib/                    # Utilities, formatters
  styles.css              # Brand tokens + global styles (single source of truth)
  assets/                 # Images, icons, static files
  data/                   # Mock data layer (driven by dev-state in dev mode)
  integrations/           # Third-party wrappers (Supabase, etc.)

  # Domain folders — all components/hooks/logic for the feature live inside
  auth/
  onboarding/             # Welcome, intro screens
  onboarding-states/      # Includes /kyc subfolder
  home/
  bookings/
  calendar/
  clients/
  earnings/
  services/
  profile/
  messaging/
  notifications/
  settings/
  support/
  disputes/
  insights/
  system/                 # Splash, error/empty states, system surfaces
  dev-state/              # Floating dev toggle (hidden in production)
```

## Placement rules

1. New code goes in the matching domain folder.
2. Promote to `components/`, `hooks/`, or `lib/` only when used by **3+** domains.
3. Routes in `src/routes/` stay thin — import from the domain folder.
4. Don't add new top-level folders or move files between domains without confirmation.

## Brand tokens (single source of truth: `src/styles.css`)

- **Midnight** `#061C27` — dark backgrounds, primary text on light
- **Cream** `#F0EBD8` — light backgrounds, primary text on dark
- **Cream-elevated** — elevated surfaces on light mode
- **Bagel** `#FF823F` — accent / CTA, full saturation, never tinted
- Cards: white on dark, cream-elevated on light
- Always use theme tokens — never hardcode colors in components

## Type

- **Uncut Sans** — primary
- **Fraunces** — editorial display (use `.font-display`, sparingly)
- **Tabular figures** for prices/ratings/times/distances → use `.tabular`

## Voice

Warm, peer-to-peer. Never gig-app. The word **"Order" is banned** — it's a **booking**.
