/**
 * EwaRibbons — soft, drifting bagel-toned ribbons that mirror the
 * brand visual language used in Ewà Biz. Calm, editorial sense of
 * motion that never steals focus from foreground content.
 *
 * Stroked curves keep round ends and curvy tops/bottoms — they read as
 * flowing bands instead of stretched rectangles. Slow drift via CSS
 * keyframes; respects prefers-reduced-motion.
 */
export function EwaRibbons({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {/* Soft warm anchor glows */}
      <div
        className="absolute -top-40 -left-32 h-[28rem] w-[28rem] rounded-full opacity-60 animate-[ewaGlow_14s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,130,63,0.42), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-40 -right-28 h-[30rem] w-[30rem] rounded-full opacity-55 animate-[ewaGlow_18s_ease-in-out_infinite_reverse]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,130,63,0.5), transparent 70%)",
        }}
      />

      {/* Ribbon A — top sweep */}
      <svg
        className="absolute -left-[80%] top-[10%] h-[26vh] w-[260%] animate-[ewaRibbonA_24s_ease-in-out_infinite]"
        viewBox="0 0 1200 260"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <path
          d="M0,140 C200,40 400,240 600,140 C800,40 1000,240 1200,140"
          stroke="#FF823F" strokeOpacity="0.22" strokeWidth="70"
          strokeLinecap="round" fill="none"
        />
      </svg>

      {/* Ribbon B — middle sweep, opposite phase */}
      <svg
        className="absolute -left-[80%] top-[40%] h-[24vh] w-[260%] animate-[ewaRibbonB_30s_ease-in-out_infinite]"
        viewBox="0 0 1200 260"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <path
          d="M0,130 C200,220 400,40 600,130 C800,220 1000,40 1200,130"
          stroke="#FF823F" strokeOpacity="0.16" strokeWidth="56"
          strokeLinecap="round" fill="none"
        />
      </svg>

      {/* Ribbon C — lower sweep, broader */}
      <svg
        className="absolute -left-[80%] bottom-[4%] h-[28vh] w-[260%] animate-[ewaRibbonC_36s_ease-in-out_infinite]"
        viewBox="0 0 1200 280"
        preserveAspectRatio="xMidYMid meet"
        fill="none"
      >
        <path
          d="M0,160 C200,40 400,260 600,150 C800,40 1000,250 1200,140"
          stroke="#FF823F" strokeOpacity="0.20" strokeWidth="84"
          strokeLinecap="round" fill="none"
        />
      </svg>

      <style>{`
        @keyframes ewaRibbonA {
          0%, 100% { transform: translate(0, 0) rotate(-1.5deg); }
          50%      { transform: translate(2%, -10px) rotate(0.5deg); }
        }
        @keyframes ewaRibbonB {
          0%, 100% { transform: translate(0, 0) rotate(1deg); }
          50%      { transform: translate(-2%, 8px) rotate(-1deg); }
        }
        @keyframes ewaRibbonC {
          0%, 100% { transform: translate(0, 0) rotate(-0.5deg); }
          50%      { transform: translate(1.5%, -12px) rotate(1.2deg); }
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
