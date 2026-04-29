import { Link } from "@tanstack/react-router";
import { EwaLogo } from "../components/EwaLogo";

/**
 * Welcome — editorial onboarding intro. Generous space, Fraunces headline,
 * Uncut Sans body. Light/dark via tokens.
 */
export function Welcome() {
  return (
    <main className="relative min-h-screen bg-background text-foreground">
      {/* Soft brand wash in the corner — uses Bagel at full saturation */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,130,63,0.55), transparent 70%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-[420px] flex-col px-6 pt-10 pb-8">
        <header className="flex items-center gap-2">
          <EwaLogo size={28} className="text-foreground" />
          <span className="font-display text-2xl leading-none">ewà</span>
        </header>

        <section className="mt-16 flex-1">
          <p className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
            Welcome
          </p>
          <h1 className="mt-3 font-display text-[44px] leading-[1.05] tracking-tight">
            Beauty that comes to <em className="not-italic text-bagel">you</em>.
          </h1>
          <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-muted-foreground">
            Trusted barbers, stylists, braiders, nail techs, makeup artists and
            locticians — booked on your terms, at your door.
          </p>

          <ul className="mt-10 space-y-5">
            <Bullet
              kicker="01"
              title="Browse like a friend's recommendation"
              body="Hand-picked pros, with the work and reviews to back it up."
            />
            <Bullet
              kicker="02"
              title="Book in a few taps"
              body="Pick a time, share an address, and we'll handle the rest."
            />
            <Bullet
              kicker="03"
              title="Show up ready, anywhere"
              body="At home, at the office, before the wedding — wherever life is."
            />
          </ul>
        </section>

        <footer className="mt-10 space-y-3">
          <Link
            to="/"
            className="flex h-12 w-full items-center justify-center rounded-full bg-bagel font-semibold text-bagel-foreground transition-transform active:scale-[0.99]"
          >
            Get started
          </Link>
          <button
            type="button"
            className="flex h-12 w-full items-center justify-center rounded-full border border-hairline font-medium text-foreground"
          >
            I already have an account
          </button>
          <p className="pt-2 text-center text-[11px] leading-relaxed text-muted-foreground">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </footer>
      </div>
    </main>
  );
}

function Bullet({
  kicker,
  title,
  body,
}: {
  kicker: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-4">
      <span className="tabular pt-1 text-xs font-semibold tracking-widest text-bagel">
        {kicker}
      </span>
      <div>
        <h3 className="text-[15px] font-semibold leading-snug text-foreground">
          {title}
        </h3>
        <p className="mt-1 text-[13.5px] leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  );
}
