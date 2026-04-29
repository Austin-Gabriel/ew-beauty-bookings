/**
 * EwaRibbons — the brand's signature soft, drifting organic ribbons.
 * Same visual language as Ewà Biz; gives both Splash and Welcome a calm,
 * editorial sense of motion without ever stealing focus from content.
 *
 * - Inherits surface color, so it works on cream OR midnight via tokens
 * - Bagel-tinted ribbons at very low opacity (warmth, not weight)
 * - Slow, asymmetric drift via CSS keyframes — generous durations so it
 *   feels like breath, not animation
 */
export function EwaRibbons({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {/* Three layered ribbons drift independently — top, middle, bottom */}
      <svg
        className="absolute left-1/2 top-[14%] h-[28vh] w-[260%] -translate-x-1/2 animate-[ribbonDriftA_22s_ease-in-out_infinite]"
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,150 C200,40 380,250 600,140 C820,30 1000,230 1200,130 L1200,240 L0,240 Z"
          fill="#FF823F"
          fillOpacity="0.18"
        />
      </svg>

      <svg
        className="absolute left-1/2 top-[44%] h-[24vh] w-[260%] -translate-x-1/2 animate-[ribbonDriftB_28s_ease-in-out_infinite]"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,120 C220,200 420,40 640,120 C860,200 1040,60 1200,130 L1200,200 L0,200 Z"
          fill="#FF823F"
          fillOpacity="0.12"
        />
      </svg>

      <svg
        className="absolute left-1/2 bottom-[8%] h-[28vh] w-[260%] -translate-x-1/2 animate-[ribbonDriftC_34s_ease-in-out_infinite]"
        viewBox="0 0 1200 240"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,90 C200,200 420,30 620,120 C820,210 1020,60 1200,140 L1200,240 L0,240 Z"
          fill="#FF823F"
          fillOpacity="0.15"
        />
      </svg>

      {/* Soft warm glow anchors so the cream/midnight surface still breathes */}
      <div
        className="absolute -top-32 -left-24 h-72 w-72 rounded-full opacity-50 animate-[glowPulse_14s_ease-in-out_infinite]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,130,63,0.35), transparent 70%)",
        }}
      />
      <div
        className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full opacity-40 animate-[glowPulse_18s_ease-in-out_infinite_reverse]"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,130,63,0.4), transparent 70%)",
        }}
      />

      <style>{`
        @keyframes ribbonDriftA {
          0%, 100% { transform: translate(-50%, 0) rotate(-2deg); }
          50%      { transform: translate(-46%, -8px) rotate(0deg); }
        }
        @keyframes ribbonDriftB {
          0%, 100% { transform: translate(-50%, 0) rotate(1deg); }
          50%      { transform: translate(-54%, 6px) rotate(-1deg); }
        }
        @keyframes ribbonDriftC {
          0%, 100% { transform: translate(-50%, 0) rotate(-1deg); }
          50%      { transform: translate(-48%, -10px) rotate(1.5deg); }
        }
        @keyframes glowPulse {
          0%, 100% { transform: scale(1); opacity: 0.45; }
          50%      { transform: scale(1.15); opacity: 0.6; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[ribbonDriftA_22s_ease-in-out_infinite\\],
          .animate-\\[ribbonDriftB_28s_ease-in-out_infinite\\],
          .animate-\\[ribbonDriftC_34s_ease-in-out_infinite\\],
          .animate-\\[glowPulse_14s_ease-in-out_infinite\\],
          .animate-\\[glowPulse_18s_ease-in-out_infinite_reverse\\] {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
