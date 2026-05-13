/**
 * CustomerAvatar — the SINGLE renderer for the signed-in customer's avatar.
 *
 * Reads identity (name + avatarPhotoUrl) from the shared customer profile
 * store. Renders the uploaded photo when present, otherwise a two-letter
 * monogram on the locked cream-elevated/midnight pattern.
 *
 * Use this anywhere the current customer's avatar appears (Profile header,
 * Discover top-right, etc.). Never duplicate the read or hardcode initials.
 */
import { useCustomerProfile } from "@/data/customer-store";
import { SANS_STACK } from "@/auth/auth-shell";

export function getCustomerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "??";
  const first = parts[0]?.[0] ?? "";
  if (parts.length === 1) {
    // No last name — pad to two letters with the second char of the first name
    const second = parts[0]?.[1] ?? first;
    return (first + second).toUpperCase();
  }
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

type Props = {
  size: number;
  fontSize?: number;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
};

export function CustomerAvatar({ size, fontSize, className, ariaLabel, onClick }: Props) {
  const { profile } = useCustomerProfile();
  const photo = profile.identity.avatarPhotoUrl;
  const initials = getCustomerInitials(profile.identity.name);
  const computedFontSize = fontSize ?? Math.max(10, Math.round(size * 0.36));

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: 9999,
    backgroundColor: "var(--cream-elevated)",
    color: "var(--midnight)",
    fontFamily: SANS_STACK,
    fontSize: computedFontSize,
    fontWeight: 700,
    border: "0.5px solid rgba(6,28,39,0.08)",
    overflow: "hidden",
  };

  const inner = photo ? (
    <img
      src={photo}
      alt={ariaLabel ?? "Profile photo"}
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  ) : (
    <span>{initials}</span>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel ?? "Profile"}
        className={`grid place-items-center transition-transform hover:scale-105 active:scale-95 ${className ?? ""}`}
        style={baseStyle}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className={`grid place-items-center ${className ?? ""}`}
      aria-label={ariaLabel}
      style={baseStyle}
    >
      {inner}
    </div>
  );
}
