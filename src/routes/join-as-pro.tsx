import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthTheme, SANS_STACK } from "@/auth/auth-shell";

export const Route = createFileRoute("/join-as-pro")({
  head: () => ({
    meta: [
      { title: "Join as a Pro — Ewà" },
      { name: "description", content: "Bring your skills to Ewà. Coming soon." },
    ],
  }),
  component: JoinAsProPage,
});

function JoinAsProPage() {
  const { text } = useAuthTheme();
  const muted = "var(--on-card-muted)";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center" style={{ fontFamily: SANS_STACK }}>
      <div
        className="grid h-20 w-20 place-items-center rounded-full"
        style={{ backgroundColor: "rgba(255,130,63,0.10)", color: "var(--bagel)" }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </div>
      <h1 style={{ marginTop: 18, fontSize: 22, fontWeight: 700, color: text, letterSpacing: "-0.02em" }}>
        Pro app coming soon
      </h1>
      <p style={{ marginTop: 8, fontSize: 14, color: muted, lineHeight: 1.5, maxWidth: 300 }}>
        We're building Ewà Biz — a dedicated app for beauty professionals. Interested? Reach out at{" "}
        <a href="mailto:pros@ewa.app" style={{ color: "var(--bagel)", fontWeight: 600 }}>
          pros@ewa.app
        </a>
      </p>
      <Link
        to="/welcome"
        className="mt-8 inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 transition-transform active:scale-95"
        style={{ backgroundColor: "var(--bagel)", color: "#1A0E08", fontSize: 14, fontWeight: 600, fontFamily: SANS_STACK }}
      >
        ← Back to Welcome
      </Link>
    </div>
  );
}
