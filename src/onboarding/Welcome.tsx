import { Link } from "@tanstack/react-router";
import { EwaMark } from "@/components/EwaLogo";

/**
 * Welcome — pre-auth. Editorial typography composition (no stock photos).
 * One screen, two actions: Sign up (bagel CTA) + Sign in (text link).
 */
export function Welcome() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {/* Warm bagel wash anchored top-right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 h-[420px] w-[420px] rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,130,63,0.55), transparent 70%)",
        }}
      />
      {/* Subtle squiggle for cultural warmth */}
      <svg
        aria-hidden
        className="pointer-events-none absolute bottom-32 -left-6 opacity-25"
        width="220"
        height="80"
        viewBox="0 0 220 80"
        fill="none"
      >
        <path
          d="M4 50 C 30 20, 60 70, 90 40 S 150 20, 180 50 S 220 60, 216 30"
          stroke="#FF823F"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-6 pt-10 pb-8">
        {/* Top corner: mark only, never the wordmark */}
        <header>
          <EwaMark size={32} className="text-foreground" />
        </header>

        {/* Editorial typographic hero */}
        <section className="mt-20 flex-1">
          <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
            Welcome to ewà
          </p>
          <h1 className="mt-4 font-display text-[52px] leading-[0.98] tracking-tight text-foreground">
            Bring beauty
            <br />
            <span className="italic">to</span>{" "}
            <span className="text-bagel">you</span>.
          </h1>
          <p className="mt-6 max-w-[32ch] text-[15px] leading-relaxed text-muted-foreground">
            Trusted barbers, stylists, braiders, nail techs and makeup artists —
            booked on your terms, at your door.
          </p>
        </section>

        {/* Actions */}
        <footer className="space-y-3">
          <Link
            to="/signup"
            className="flex h-12 w-full items-center justify-center rounded-full bg-bagel text-[15px] font-semibold text-bagel-foreground shadow-[0_8px_24px_-12px_rgba(255,130,63,0.7)] transition-transform active:scale-[0.99]"
          >
            Sign up
          </Link>
          <Link
            to="/signin"
            className="flex h-12 w-full items-center justify-center rounded-full text-[14px] font-medium text-foreground"
          >
            I already have an account
          </Link>
          <p className="pt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </footer>
      </div>
    </main>
  );
}
