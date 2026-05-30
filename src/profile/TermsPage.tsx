import { LegalDocumentPage } from "./LegalDocumentPage";

export function TermsPage() {
  return (
    <LegalDocumentPage
      title="Terms of Service"
      effectiveDate="May 1, 2026"
      intro="These Terms of Service govern your use of Ewà, the mobile platform that connects customers with verified beauty professionals for on-demand and scheduled appointments. By creating an account or booking a stylist, you agree to these terms."
      sections={[
        {
          heading: "Eligibility & account",
          body: [
            "You must be at least 18 years old to use Ewà. You're responsible for keeping your account credentials secure and for every action taken under your account.",
            "We may suspend or terminate accounts for repeated cancellations, no-shows, abusive behavior toward stylists, or any violation of these terms.",
          ],
        },
        {
          heading: "Bookings & cancellations",
          body: [
            "When you book a stylist, you agree to be available at the address and time you confirmed. Your card is authorized when the pro accepts and charged when the service completes.",
            "Each pro sets their own cancellation window. Cancellations made outside the free window may incur a fee (typically 50% of service cost). Cancellations made by the pro are always fully refunded.",
            "You may not contact, hire, or pay any Ewà stylist directly outside the platform for a period of 12 months after your last booking. Off-platform arrangements void our service guarantees and may result in account termination.",
          ],
        },
        {
          heading: "Payment terms",
          body: [
            "All payments are processed through our payment partner. Ewà charges a flat $3 booking fee in addition to the service price set by the pro.",
            "Tips are optional and 100% of any tip you choose to add goes directly to the stylist. Tipping happens after the service completes — not at checkout.",
            "Refunds for pro-cancelled or no-show bookings are processed automatically within 1–2 business days.",
          ],
        },
        {
          heading: "Safety & verification",
          body: [
            "Every Ewà stylist completes ID verification and a background check before they can take bookings. We may share appointment details (name, ETA, license info) with your emergency contacts if you trigger SOS.",
            "Customers may report safety concerns anonymously through the Safety screen. Ewà reserves the right to remove pros from the platform pending investigation.",
          ],
        },
        {
          heading: "User content",
          body: [
            "Reviews, ratings, and notes you submit may be displayed publicly on pro profiles. You grant Ewà a non-exclusive, royalty-free license to display this content. We may moderate or remove content that violates our community guidelines.",
          ],
        },
        {
          heading: "Liability",
          body: [
            "Ewà is a platform that connects customers with independent service providers. We do not employ or directly supervise stylists. To the maximum extent permitted by law, Ewà is not liable for indirect, incidental, or consequential damages arising from your use of the service or interactions with stylists.",
            "Our total liability for any claim shall not exceed the amount you paid to Ewà in the 12 months preceding the event giving rise to the claim.",
          ],
        },
        {
          heading: "Changes to these terms",
          body: [
            "We may update these terms from time to time. We'll notify you of material changes through the app or via email at least 30 days before they take effect. Continued use of Ewà after the effective date constitutes acceptance.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about these terms? Email legal@ewatheapp.com or reach out through the Help Center inside the app.",
          ],
        },
      ]}
    />
  );
}
