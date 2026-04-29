import ewaMarkPng from "@/assets/ewa-mark.png";
import ewaLogoFullPng from "@/assets/ewa-logo-full.png";
import ewaWordmarkLightPng from "@/assets/ewa-wordmark-light.png";

const FRAUNCES = '"Fraunces", "Times New Roman", serif';

export function EwaMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <img
      src={ewaMarkPng}
      width={size}
      height={size}
      alt="Ewà"
      className={className}
      draggable={false}
      style={{ display: "block", width: size, height: size, objectFit: "contain" }}
    />
  );
}

export function EwaWordmark({ size = 28, isDark = true, className }: { size?: number; isDark?: boolean; className?: string }) {
  const color = isDark ? "#F0EBD8" : "#061C27";
  return (
    <span
      className={className}
      style={{
        fontFamily: FRAUNCES,
        fontWeight: 400,
        fontStyle: "italic",
        fontSize: size,
        lineHeight: 1,
        color,
        letterSpacing: "-0.02em",
        display: "inline-block",
      }}
    >
      ewà
    </span>
  );
}

export function EwaLockup({ isDark = true, markSize = 44, className }: { isDark?: boolean; markSize?: number; className?: string }) {
  if (isDark) {
    return (
      <img
        src={ewaLogoFullPng}
        alt="Ewà"
        className={className}
        draggable={false}
        style={{ display: "block", height: markSize, width: "auto", objectFit: "contain" }}
      />
    );
  }
  return (
    <div className={className} style={{ display: "inline-flex", alignItems: "center", gap: markSize * 0.32 }}>
      <img
        src={ewaMarkPng}
        alt=""
        aria-hidden
        draggable={false}
        style={{ display: "block", height: markSize, width: markSize, objectFit: "contain" }}
      />
      <img
        src={ewaWordmarkLightPng}
        alt="Ewà"
        draggable={false}
        style={{ display: "block", height: markSize * 0.78, width: "auto", objectFit: "contain" }}
      />
    </div>
  );
}
