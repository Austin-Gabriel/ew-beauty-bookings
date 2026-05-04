/**
 * Single source of truth for the Ewà customer support email.
 * Used by both the Contact support mailto row and the Help center stub.
 */
export const SUPPORT_EMAIL = "support@ewatheapp.com";
export const SUPPORT_MAILTO_SUBJECT = "Ewà support — [your account]";

export function supportMailtoHref(): string {
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_MAILTO_SUBJECT)}`;
}
