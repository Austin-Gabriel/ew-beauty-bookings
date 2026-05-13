import { useEffect, useState } from "react";
import { Copy, Check, Mail, X } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_MAILTO_SUBJECT } from "./support-constants";

/**
 * In-app sheet for contacting support.
 *
 * IMPORTANT: This sheet exists specifically so the `mailto:` URL is NOT
 * rendered into the main app UI. The mailto: handler only fires when the
 * user taps the explicit "Open in mail app" button below. This prevents
 * the OS Mail app from being triggered spuriously by stray events,
 * link prefetching, or peek gestures during normal navigation.
 *
 * Do NOT add an <a href="mailto:..."> anywhere in this component.
 */
export function ContactSupportSheet({ onDismiss }: { onDismiss: () => void }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  async function handleCopy() {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(SUPPORT_EMAIL);
        setCopied(true);
      }
    } catch {
      /* clipboard unavailable — silently no-op */
    }
  }

  function handleOpenMail() {
    if (typeof window === "undefined") return;
    // Build the URL only at the moment of an explicit user tap. Never
    // store it in any href, data-* attribute, or component prop.
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_MAILTO_SUBJECT)}`;
    window.location.href = href;
  }

  return (
    <div className="fixed inset-0 z-[9998] flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onDismiss}
        className="absolute inset-0 bg-midnight/40 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-[420px] rounded-t-3xl bg-card p-5 pb-8 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <p className="text-[18px] font-semibold text-card-foreground">
            Contact support
          </p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-full transition-colors active:bg-muted/30"
          >
            <X size={18} className="text-card-foreground" />
          </button>
        </div>

        <p className="text-[14px] leading-relaxed text-on-card-muted">
          Email us at <span className="font-medium text-card-foreground">{SUPPORT_EMAIL}</span> and we'll get back to you as soon as we can.
        </p>

        {/* Copyable email field */}
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-hairline bg-cream-elevated/40 px-3 py-2.5">
          <span className="flex-1 truncate text-[14px] font-medium text-card-foreground">
            {SUPPORT_EMAIL}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex shrink-0 items-center gap-1 rounded-full bg-card px-3 py-1.5 text-[12px] font-semibold text-card-foreground shadow-sm transition-opacity active:opacity-70"
            aria-label="Copy email address"
          >
            {copied ? (
              <>
                <Check size={13} /> Copied
              </>
            ) : (
              <>
                <Copy size={13} /> Copy
              </>
            )}
          </button>
        </div>

        {/* Explicit, deliberate mailto trigger */}
        <button
          type="button"
          onClick={handleOpenMail}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-bagel py-3.5 text-[15px] font-semibold text-bagel-foreground transition-opacity active:opacity-80"
        >
          <Mail size={16} /> Open in mail app
        </button>

        <button
          type="button"
          onClick={onDismiss}
          className="mt-2 w-full rounded-2xl border border-hairline bg-card py-3.5 text-[15px] font-semibold text-card-foreground transition-opacity active:opacity-80"
        >
          Done
        </button>
      </div>
    </div>
  );
}
