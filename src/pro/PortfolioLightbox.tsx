/**
 * PortfolioLightbox — full-screen overlay for browsing portfolio photos.
 * Used by ProProfile and PortfolioPage.
 *
 * Props:
 *  - photos: full array of photo URLs
 *  - index:  current index, or null when closed
 *  - onClose / onIndexChange: parent state setters
 *
 * Interactions: × to close, swipe down to close, arrows or swipe left/right
 * to navigate. Photo counter at the bottom.
 */
import { useEffect, useRef } from "react";
import { SANS_STACK } from "@/auth/auth-shell";

type Props = {
  photos: string[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export function PortfolioLightbox({ photos, index, onClose, onIndexChange }: Props) {
  const open = index !== null;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index !== null && index < photos.length - 1) onIndexChange(index + 1);
      if (e.key === "ArrowLeft" && index !== null && index > 0) onIndexChange(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, index, photos.length, onClose, onIndexChange]);

  if (!open || index === null) return null;

  const canPrev = index > 0;
  const canNext = index < photos.length - 1;

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const s = touchStart.current;
    touchStart.current = null;
    if (!s) return;
    const t = e.changedTouches[0];
    if (!t) return;
    const dx = t.clientX - s.x;
    const dy = t.clientY - s.y;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    if (ay > 60 && dy > 0 && ay > ax) {
      onClose();
      return;
    }
    if (ax > 50 && ax > ay) {
      if (dx < 0 && canNext) onIndexChange(index + 1);
      else if (dx > 0 && canPrev) onIndexChange(index - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio photo"
      style={{ backgroundColor: "rgba(0,0,0,0.95)", fontFamily: SANS_STACK }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="flex items-center justify-end"
        style={{ padding: "calc(env(safe-area-inset-top, 0px) + 12px) 16px 12px" }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="grid h-10 w-10 place-items-center rounded-full transition-transform active:scale-95"
          style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "#fff" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-2">
        {canPrev && (
          <button
            type="button"
            onClick={() => onIndexChange(index - 1)}
            aria-label="Previous photo"
            className="absolute left-2 z-10 grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-95"
            style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "#fff" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        <img
          src={photos[index]}
          alt={`Photo ${index + 1} of ${photos.length}`}
          className="max-h-full max-w-full object-contain"
          style={{ userSelect: "none" }}
          draggable={false}
        />

        {canNext && (
          <button
            type="button"
            onClick={() => onIndexChange(index + 1)}
            aria-label="Next photo"
            className="absolute right-2 z-10 grid h-11 w-11 place-items-center rounded-full transition-transform active:scale-95"
            style={{ backgroundColor: "rgba(255,255,255,0.14)", color: "#fff" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      <div
        className="text-center"
        style={{
          color: "rgba(255,255,255,0.85)",
          fontSize: 13,
          fontWeight: 500,
          padding: "12px 16px calc(env(safe-area-inset-bottom, 0px) + 20px)",
        }}
      >
        {index + 1} of {photos.length}
      </div>
    </div>
  );
}
