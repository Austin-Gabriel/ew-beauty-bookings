/**
 * Single source of truth for the Ewà customer support email.
 *
 * IMPORTANT: There is NO `openSupportMail()` helper and NO `mailto:` href
 * exported from this module. The mailto: URL is constructed inline inside
 * `ContactSupportSheet` only at the moment the user explicitly taps
 * "Open in mail app". This is deliberate — we previously had spurious
 * mail-app launches and the safest fix is to keep the mailto: surface area
 * out of the main UI entirely.
 */
export const SUPPORT_EMAIL = "support@ewatheapp.com";
export const SUPPORT_MAILTO_SUBJECT = "Ewà support — [your account]";
