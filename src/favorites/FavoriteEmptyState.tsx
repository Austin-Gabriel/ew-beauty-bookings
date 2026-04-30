import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "#FF823F";

export type FavoriteEmptyVariant =
  | "collections"
  | "collection-detail"
  | "stylists"
  | "inspiration";

const COPY: Record<
  FavoriteEmptyVariant,
  { heading: string; body: string; cta: string }
> = {
  collections: {
    heading: "Start your collection",
    body: "Save your favorite stylists and styles into themed collections — birthdays, weddings, your weekly rotation.",
    cta: "Browse stylists",
  },
  "collection-detail": {
    heading: "Start your collection",
    body: "Browse stylists and styles, then tap the heart to add them here. Mix hair, makeup, nails — whatever your look needs.",
    cta: "Browse stylists",
  },
  stylists: {
    heading: "No stylists saved yet",
    body: "Tap the heart on any pro to add them here. Build your shortlist so they're one tap away next time.",
    cta: "Browse stylists",
  },
  inspiration: {
    heading: "No inspiration saved yet",
    body: "Heart any look from a stylist's portfolio to save it here. Share your favorites with your stylist when booking.",
    cta: "Browse styles",
  },
};

export function FavoriteEmptyState({
  variant,
  onCta,
}: {
  variant: FavoriteEmptyVariant;
  onCta: () => void;
}) {
  const { isDark, text } = useAuthTheme();
  const muted = isDark ? "rgba(240,235,216,0.55)" : "#6B7684";
  const copy = COPY[variant];

  return (
    <div
      className="flex flex-col items-center px-6 pt-12 pb-10 text-center"
      style={{ fontFamily: SANS_STACK }}
    >
      <div
        className="grid h-24 w-24 place-items-center rounded-full"
        style={{ backgroundColor: "rgba(255,130,63,0.10)", color: ORANGE }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </div>
      <h2
        style={{
          marginTop: 20,
          fontSize: 18,
          fontWeight: 700,
          color: text,
          letterSpacing: "-0.015em",
        }}
      >
        {copy.heading}
      </h2>
      <p
        style={{
          marginTop: 8,
          fontSize: 13.5,
          color: muted,
          lineHeight: 1.5,
          maxWidth: 280,
        }}
      >
        {copy.body}
      </p>
      <button
        type="button"
        onClick={onCta}
        className="mt-6 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-transform active:scale-95"
        style={{
          backgroundColor: ORANGE,
          color: "#1A0E08",
          fontSize: 14,
          fontWeight: 600,
          fontFamily: SANS_STACK,
        }}
      >
        {copy.cta}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
