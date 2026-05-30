import { LegalDocumentPage } from "./LegalDocumentPage";

export function PrivacyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      effectiveDate="May 1, 2026"
      intro="This Privacy Policy explains what information Ewà collects, how we use it, and the choices you have. We collect only what we need to connect you with stylists and keep your appointments safe."
      sections={[
        {
          heading: "What we collect",
          body: [
            "Account details — name, email, phone number, and a payment method when you book.",
            "Appointment data — addresses you save, services you book, ratings and reviews you leave, and the arrival PINs we generate for each booking.",
            "Device & usage — basic device info, app version, and how you interact with screens (used to fix bugs and improve the product).",
            "Location — your approximate location is used to show stylists near you. Precise location is only used during active appointments if you enable Live Location Sharing in Safety.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To match you with stylists, process payments, send booking notifications, and provide customer support.",
            "To verify stylists and run safety features like SOS, share appointment, and emergency contact alerts.",
            "To detect fraud, abuse, and policy violations.",
            "To improve Ewà — analytics are aggregated and never tied to your identity in reports we share externally.",
          ],
        },
        {
          heading: "Who we share with",
          body: [
            "Stylists you book — they see your first name, the booking address, and any notes you leave them.",
            "Payment processors — we send card details directly to our PCI-compliant payment partner; Ewà never stores your full card number.",
            "Emergency contacts — only when you trigger SOS or share an appointment, and only the details you've authorized.",
            "Service providers — third-party vendors that help us operate (hosting, email, SMS). Each is bound by contracts that prohibit using your data for any other purpose.",
            "Law enforcement — only when legally required, and only the minimum information necessary.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            "View, update, or download your data by emailing privacy@ewatheapp.com — we'll respond within 30 days.",
            "Delete your account anytime through Help Center → Contact support. We remove your data within 30 days of confirmation, except for records we're legally required to retain (e.g., tax records).",
            "Adjust notification, location, and marketing preferences in Profile → Notifications and your device settings.",
          ],
        },
        {
          heading: "How long we keep data",
          body: [
            "Account info: until you delete your account.",
            "Booking history: 7 years for tax and dispute resolution.",
            "Anonymous analytics: indefinitely.",
          ],
        },
        {
          heading: "Security",
          body: [
            "Data is encrypted in transit (TLS 1.3) and at rest. Two-factor authentication is available in Profile → Security. We follow the principle of least privilege internally — only employees who need access to data to do their job have it.",
            "No system is perfectly secure. If we discover a breach affecting your data, we'll notify you within 72 hours.",
          ],
        },
        {
          heading: "Children",
          body: [
            "Ewà is not intended for users under 18. We do not knowingly collect data from minors. If you believe we have, contact privacy@ewatheapp.com and we'll delete it.",
          ],
        },
        {
          heading: "Changes",
          body: [
            "We'll notify you of material changes through the app or via email at least 30 days before they take effect. Continued use after the effective date constitutes acceptance.",
          ],
        },
        {
          heading: "Contact",
          body: [
            "Questions about your privacy? Email privacy@ewatheapp.com or reach out through the Help Center inside the app.",
          ],
        },
      ]}
    />
  );
}
