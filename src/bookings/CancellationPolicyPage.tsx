/**
 * CancellationPolicyPage — /policies/cancellation
 * Static policy content, reachable from cancel sheet and booking detail.
 */
import { useRouter } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { SANS_STACK } from "@/auth/auth-shell";

const ORANGE = "var(--bagel)";

export function CancellationPolicyPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background" style={{ fontFamily: SANS_STACK }}>
      {/* Header */}
      <div className="relative flex h-12 shrink-0 items-center px-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <button
          type="button"
          onClick={() => router.history.back()}
          className="grid h-9 w-9 place-items-center rounded-full text-foreground"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-semibold text-foreground">
          Cancellation policy
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-6 pb-12">
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--foreground)", letterSpacing: "-0.02em", marginBottom: 16 }}>
          When you cancel a booking
        </h2>

        <Section title="Free cancellation">
          Cancel more than <strong>4 hours</strong> before your booking start time and you won't be charged anything.
          Your card is authorized but not charged until the pro begins the service.
        </Section>

        <Section title="Late cancellation (under 4 hours)">
          If you cancel within <strong>4 hours</strong> of your booking, a cancellation fee of up to{" "}
          <strong>50% of the service price</strong> may apply. This compensates the pro for their time
          and the slot they held for you.
        </Section>

        <Section title="No-shows">
          If you don't show up or aren't available when your pro arrives, you may be charged{" "}
          <strong>100% of the service price</strong>. Please cancel or reschedule if your plans change.
        </Section>

        <Section title="Pro cancellations">
          If your pro cancels, you'll receive a full refund automatically. We'll also help you find
          another available pro if you'd like.
        </Section>

        <Section title="Refund timing">
          Refunds are processed immediately but may take <strong>5–10 business days</strong> to appear
          on your statement, depending on your bank.
        </Section>

        <div className="mt-8 rounded-xl px-4 py-3" style={{ backgroundColor: "var(--surface-elevated)", border: "1px solid var(--hairline)" }}>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", lineHeight: 1.6, textAlign: "center" }}>
            Have questions? Reach out to{" "}
            <span style={{ color: ORANGE, fontWeight: 600 }}>support@ewa.app</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)", marginBottom: 6 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "var(--muted-foreground)", lineHeight: 1.6 }}>{children}</p>
    </div>
  );
}
