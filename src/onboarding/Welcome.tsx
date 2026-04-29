import { Link } from "@tanstack/react-router";
import { EwaLockup } from "@/components/EwaLogo";
import { EwaRibbons } from "@/components/EwaRibbons";

/**
 * Welcome — pre-auth. Editorial typographic composition over the brand's
 * drifting bagel ribbons (same visual language as Ewà Biz).
 * One screen, two actions: Sign up (bagel CTA) + Sign in (text link).
 */
export function Welcome() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <EwaRibbons />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[420px] flex-col px-6 pt-10 pb-8">
        {/* Top: official lockup, small */}
        <header className="flex items-center justify-between">
          <EwaLockup height={28} />
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
            For customers
          </span>
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
