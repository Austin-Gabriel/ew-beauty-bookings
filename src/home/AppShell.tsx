import type { ReactNode } from "react";
import { AuthShell } from "@/auth/auth-shell";
import { TabBar, TAB_BAR_SPACER_PX } from "./TabBar";

/**
 * AppShell — the canonical shell for the four-tab logged-in experience.
 * Inherits AuthShell's surface (cream/midnight, optional waveform on dark)
 * and pins the bottom TabBar.
 */
export function AppShell({
  children,
  topLabel,
  editorial = false,
}: {
  children: ReactNode;
  topLabel?: string;
  /**
   * Editorial surfaces (Discover) keep the warm waveform/glow background.
   * Industrial surfaces (Bookings list, settings) suppress it.
   */
  editorial?: boolean;
}) {
  return (
    <AuthShell topLabel={topLabel} noSquiggles={!editorial} quietSquiggles={editorial} hideThemeToggle>
      <main
        className="relative z-[1] mx-auto flex w-full max-w-[420px] flex-1 flex-col"
        style={{ paddingBottom: TAB_BAR_SPACER_PX }}
      >
        {children}
      </main>
      <TabBar />
    </AuthShell>
  );
}
