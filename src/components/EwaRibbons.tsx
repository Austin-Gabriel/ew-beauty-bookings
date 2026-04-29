/**
 * EwaRibbons — soft, drifting bagel-toned ribbons that mirror the
 * brand visual language used in Ewà Biz. Calm, editorial sense of
 * motion that never steals focus from foreground content.
 *
 * Implementation notes:
 * - Ribbons are stroked curves (not closed shapes), so they read as
 *   flowing bands instead of solid rectangles
 * - Bagel at low opacity for warmth on cream; brighter on midnight
 * - Slow, asymmetric drift via CSS keyframes — durations long enough
 *   that motion feels like breath, never busy
 * - Respects prefers-reduced-motion
 */
export function EwaRibbons({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {/* Soft warm anchor glows */}
      <div
        className="absolute -top-32 -left-24 h-72 w-72 rounded-full opacity-60 animate-[ewaGlow_14s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,130,63,0.45), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full opacity-55 animate-[ewaGlow_18s_ease-in-out_infinite_reverse]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,130,63,0.5), transparent 70%)",
        }}
      />

      {/* Ribbon A — sweeping band across the top third */}
      <svg
        className="absolute left-1/2 top-[18%] h-[22vh] w-[260%] -translate-x-1/2 animate-[ewaRibbonA_24s_ease-in-out_infinite]"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-50,110 C220,20 420,200 640,110 C860,20 1040,200 1260,110"
          stroke="#FF823F"
          strokeOpacity="0.22"
          strokeWidth="64"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Ribbon B — gentler band across the middle */}
      <svg
        className="absolute left-1/2 top-[46%] h-[20vh] w-[260%] -translate-x-1/2 animate-[ewaRibbonB_30s_ease-in-out_infinite]"
        viewBox="0 0 1200 180"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-50,90 C220,170 420,10 640,90 C860,170 1040,10 1260,90"
          stroke="#FF823F"
          strokeOpacity="0.16"
          strokeWidth="52"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Ribbon C — wider, lower band */}
      <svg
        className="absolute left-1/2 bottom-[10%] h-[24vh] w-[260%] -translate-x-1/2 animate-[ewaRibbonC_36s_ease-in-out_infinite]"
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M-50,140 C220,30 420,220 640,120 C860,30 1040,210 1260,130"
          stroke="#FF823F"
          strokeOpacity="0.20"
          strokeWidth="78"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <style>{`
        @keyframes ewaRibbonA {
          0%, 100% { transform: translate(-50%, 0) rotate(-1.5deg); }
          50%      { transform: translate(-46%, -10px) rotate(0.5deg); }
        }
        @keyframes ewaRibbonB {
          0%, 100% { transform: translate(-50%, 0) rotate(1deg); }
          50%      { transform: translate(-54%, 8px) rotate(-1deg); }
        }
        @keyframes ewaRibbonC {
          0%, 100% { transform: translate(-50%, 0) rotate(-0.5deg); }
          50%      { transform: translate(-48%, -12px) rotate(1.5deg); }
        }
        @keyframes ewaGlow {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.18); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-[ewaRibbon"],
          [class*="animate-[ewaGlow"] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
