import { useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/home/AppShell";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";
import { MOCK_PROS } from "@/data/mock-pros";
import { TAB_BAR_HEIGHT_PX } from "@/home/TabBar";
import { PortfolioLightbox } from "./PortfolioLightbox";
import { buildFullPortfolio } from "./portfolio-data";

export function PortfolioPage({ proId }: { proId: string }) {
  const pro = MOCK_PROS.find((p) => p.id === proId);
  const { text } = useAuthTheme();
  const navigate = useNavigate();
  const router = useRouter();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const subtleSurface = "var(--surface-elevated)";
  const subtleBorder = "var(--border)";

  if (!pro) {
    return (
      <AppShell>
        <div className="px-5 pt-12 text-center" style={{ fontFamily: SANS_STACK, color: text }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Pro not found</p>
          <button
            type="button"
            onClick={() => navigate({ to: "/discover" })}
            className="mt-4 rounded-full px-4 py-2"
            style={{ backgroundColor: "var(--bagel)", color: "#1A0E08", fontSize: 13, fontWeight: 700 }}
          >
            Back to Discover
          </button>
        </div>
      </AppShell>
    );
  }

  const photos = buildFullPortfolio(pro.portfolio);

  return (
    <AppShell>
      <header className="relative flex items-center justify-center px-5 pb-3 pt-4">
        <button
          type="button"
          onClick={() => router.history.back()}
          aria-label="Back"
          className="absolute left-5 grid h-9 w-9 place-items-center rounded-full transition-transform active:scale-95"
          style={{ backgroundColor: subtleSurface, border: `1px solid ${subtleBorder}`, color: text }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 style={{ fontFamily: SANS_STACK, fontSize: 17, fontWeight: 700, color: text, margin: 0 }}>
          Portfolio
        </h1>
      </header>

      <div
        className="px-3"
        style={{
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${TAB_BAR_HEIGHT_PX + 24}px)`,
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          {photos.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="overflow-hidden rounded-xl transition-transform active:scale-[0.98]"
              style={{ aspectRatio: "1 / 1", border: `1px solid ${subtleBorder}` }}
              aria-label={`Open photo ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <PortfolioLightbox
        photos={photos}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onIndexChange={setOpenIndex}
      />
    </AppShell>
  );
}
