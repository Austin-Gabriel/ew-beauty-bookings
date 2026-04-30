import { Link, useRouterState } from "@tanstack/react-router";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";

type Tab = {
  to: "/discover" | "/bookings" | "/messages" | "/profile";
  label: string;
  icon: (active: boolean) => React.ReactNode;
};

const Stroke = ({ children }: { children: React.ReactNode }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
);

const TABS: Tab[] = [
  {
    to: "/discover",
    label: "Discover",
    icon: () => (
      <Stroke>
        <circle cx="12" cy="12" r="9" />
        <polygon points="14.5 9.5 11 11 9.5 14.5 13 13" fill="currentColor" stroke="none" />
      </Stroke>
    ),
  },
  {
    to: "/bookings",
    label: "Bookings",
    icon: () => (
      <Stroke>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </Stroke>
    ),
  },
  {
    to: "/messages",
    label: "Messages",
    icon: () => (
      <Stroke>
        <path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" />
      </Stroke>
    ),
  },
  {
    to: "/profile",
    label: "Profile",
    icon: () => (
      <Stroke>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
      </Stroke>
    ),
  },
];

export function TabBar() {
  const { text, borderCol, bg, isDark } = useAuthTheme();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const barBg = isDark ? "rgba(6,28,39,0.85)" : "rgba(240,235,216,0.92)";

  return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 z-40"
      style={{
        backgroundColor: barBg,
        borderTop: `1px solid ${borderCol}`,
        backdropFilter: "saturate(140%) blur(16px)",
        WebkitBackdropFilter: "saturate(140%) blur(16px)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 6px)",
        paddingTop: 8,
        // Hint that the bg color matches AuthShell
        boxShadow: isDark ? "0 -8px 28px rgba(0,0,0,0.25)" : "0 -8px 28px rgba(6,28,39,0.06)",
        // Ensure no transparency leak
        backgroundClip: "padding-box",
      }}
    >
      <ul
        className="mx-auto flex w-full max-w-[420px] items-stretch justify-between px-3"
        style={{ fontFamily: SANS_STACK }}
      >
        {TABS.map((t) => {
          const active = path === t.to || path.startsWith(t.to + "/");
          const color = active ? "#FF823F" : text;
          const opacity = active ? 1 : 0.55;
          return (
            <li key={t.to} className="flex-1">
              <Link
                to={t.to}
                aria-current={active ? "page" : undefined}
                className="flex h-12 flex-col items-center justify-center gap-0.5 transition-all"
                style={{ color, opacity }}
              >
                {t.icon(active)}
                <span
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.06em",
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  {t.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      {/* Suppress unused bg var warning */}
      <span hidden>{bg}</span>
    </nav>
  );
}

/** Bottom padding so content doesn't hide behind the tab bar. */
export const TAB_BAR_SPACER_PX = 76;
/** Approximate tab bar height (icons+label+padding) used by sheets to
 *  reserve room so their content never sits behind the bar. */
export const TAB_BAR_HEIGHT_PX = 68;
