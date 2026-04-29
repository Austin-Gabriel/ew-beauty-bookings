import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AuthFrame, PrimaryCta, TertiaryLink } from "./AuthFrame";
import { EditorialField } from "./EditorialField";
import { useSignup } from "./signupState";

/**
 * Screen 1 — Phone (or email) identifier.
 * Display headline (Fraunces). Single field. One primary action.
 */
export function StepIdentifier() {
  const { data, set, next, back, index, total } = useSignup();
  const isPhone = data.identifierKind === "phone";

  const phoneDigits = data.phone.replace(/\D/g, "");
  const valid = isPhone ? phoneDigits.length >= 7 : /.+@.+\..+/.test(data.email);

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total} quietRibbons>
      <section className="mt-14 flex-1">
        <h1 className="font-display text-[44px] leading-[1.02] tracking-tight text-foreground">
          Let's get you <span className="italic">started</span>.
        </h1>
        <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-muted-foreground">
          We'll send you a code to verify it's really you.
        </p>

        <div className="mt-12">
          {isPhone ? (
            <EditorialField
              label="Phone number"
              prefix={data.countryCode}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              autoFocus
              value={data.phone}
              onChange={(v) => set("phone", v.replace(/[^\d\s-]/g, ""))}
              placeholder="555 010 1234"
            />
          ) : (
            <EditorialField
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={data.email}
              onChange={(v) => set("email", v)}
              placeholder="you@domain.com"
            />
          )}
        </div>
      </section>

      <footer className="space-y-4">
        <PrimaryCta disabled={!valid} onClick={next}>
          Continue
        </PrimaryCta>
        <div className="flex justify-center">
          <TertiaryLink
            onClick={() => set("identifierKind", isPhone ? "email" : "phone")}
          >
            Use {isPhone ? "email" : "phone"} instead
          </TertiaryLink>
        </div>
        <p className="pt-2 text-center text-[12.5px] text-muted-foreground">
          Already have an account?{" "}
          <Link to="/signin" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </footer>
    </AuthFrame>
  );
}

/** Screen 2 — OTP verification. */
export function StepVerify() {
  const { identifierDisplay, back, next, index, total, goTo } = useSignup();
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const startCooldown = () => {
    setCooldown(30);
    const id = setInterval(() => {
      setCooldown((s) => {
        if (s <= 1) {
          clearInterval(id);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total} quietRibbons>
      <section className="mt-14 flex-1">
        <h1 className="font-display text-[40px] leading-[1.02] tracking-tight text-foreground">
          Enter your <span className="italic">code</span>
        </h1>
        <p className="mt-4 flex flex-wrap items-center gap-1.5 text-[14px] text-muted-foreground">
          Sent to{" "}
          <span className="tabular font-medium text-foreground">{identifierDisplay}</span>
          <button
            type="button"
            onClick={() => goTo("identifier")}
            aria-label="Edit"
            className="inline-flex h-6 w-6 items-center justify-center rounded-full text-foreground/60 hover:bg-foreground/[0.05] hover:text-foreground"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </p>

        <div className="mt-12">
          <OtpInputBlock value={code} onChange={setCode} onComplete={() => next()} />
        </div>

        <div className="mt-8">
          {cooldown > 0 ? (
            <p className="text-[13px] text-muted-foreground">
              Resend code in <span className="tabular text-foreground">{cooldown}s</span>
            </p>
          ) : (
            <TertiaryLink onClick={startCooldown}>Resend code</TertiaryLink>
          )}
        </div>
      </section>

      <footer>
        <PrimaryCta disabled={code.length !== 6} onClick={next}>
          Verify
        </PrimaryCta>
      </footer>
    </AuthFrame>
  );
}

// Local import to avoid a top-level circular concern
import { OtpInput } from "./OtpInput";
function OtpInputBlock(props: React.ComponentProps<typeof OtpInput>) {
  return <OtpInput {...props} />;
}

/** Screen 3 — name. */
export function StepName() {
  const { data, set, next, back, index, total } = useSignup();
  const valid = data.firstName.trim().length >= 1;

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total} quietRibbons>
      <section className="mt-14 flex-1">
        <h1 className="font-display text-[44px] leading-[1.02] tracking-tight text-foreground">
          What should we <span className="italic">call</span> you?
        </h1>
        <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-muted-foreground">
          This is what pros will see when you book.
        </p>

        <div className="mt-12 space-y-8">
          <EditorialField
            label="First name"
            value={data.firstName}
            onChange={(v) => set("firstName", v)}
            autoComplete="given-name"
            autoFocus
            placeholder="Amara"
          />
          <EditorialField
            label="Last name (optional)"
            value={data.lastName}
            onChange={(v) => set("lastName", v)}
            autoComplete="family-name"
            placeholder="Okafor"
          />
        </div>
      </section>

      <footer>
        <PrimaryCta disabled={!valid} onClick={next}>
          Continue
        </PrimaryCta>
      </footer>
    </AuthFrame>
  );
}

/** Screen 4 — default address (optional). */
export function StepAddress() {
  const { data, set, next, back, index, total } = useSignup();

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total} quietRibbons>
      <section className="mt-14 flex-1">
        <h1 className="font-display text-[42px] leading-[1.02] tracking-tight text-foreground">
          Where should pros <span className="italic">come</span>?
        </h1>
        <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-muted-foreground">
          You can skip this and add it later.
        </p>

        <div className="mt-12">
          <EditorialField
            label="Default address"
            value={data.address}
            onChange={(v) => set("address", v)}
            autoComplete="street-address"
            autoFocus
            placeholder="Street, city"
          />
          <button
            type="button"
            onClick={() => set("address", "Current location · Brooklyn, NY")}
            className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-bagel hover:underline underline-offset-4"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            Use my current location
          </button>
        </div>
      </section>

      <footer className="space-y-3">
        <PrimaryCta disabled={data.address.trim().length < 3} onClick={next}>
          Continue
        </PrimaryCta>
        <div className="flex justify-center pt-1">
          <TertiaryLink onClick={next}>Skip for now</TertiaryLink>
        </div>
      </footer>
    </AuthFrame>
  );
}

/** Screen 5 — payment (optional). */
export function StepPayment() {
  const { data, set, next, back, index, total } = useSignup();

  const Method = ({
    id,
    label,
    icon,
  }: {
    id: NonNullable<typeof data.paymentMethod>;
    label: string;
    icon: ReactIcon;
  }) => {
    const active = data.paymentMethod === id;
    return (
      <button
        type="button"
        onClick={() => set("paymentMethod", id)}
        className={`flex h-14 w-full items-center gap-3 rounded-2xl border px-4 text-left transition-all ${
          active
            ? "border-bagel bg-bagel/10"
            : "border-hairline hover:border-foreground/30"
        }`}
      >
        <span className="text-foreground">{icon}</span>
        <span className="flex-1 text-[14px] font-semibold text-foreground">{label}</span>
        {active && (
          <span className="grid h-5 w-5 place-items-center rounded-full bg-bagel text-bagel-foreground">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
        )}
      </button>
    );
  };

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total} quietRibbons>
      <section className="mt-14 flex-1">
        <h1 className="font-display text-[42px] leading-[1.02] tracking-tight text-foreground">
          Add a <span className="italic">payment</span> method
        </h1>
        <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-muted-foreground">
          Required when you book — you can skip this for now.
        </p>

        <div className="mt-12 space-y-3">
          <Method
            id="applepay"
            label="Apple Pay"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.4 1.6c0 1-.4 2-1.1 2.7-.7.8-1.9 1.4-2.9 1.3-.1-1 .4-2 1.1-2.7.7-.8 2-1.3 2.9-1.3zM20 17.4c-.3.7-.5 1-.9 1.6-.6.9-1.4 2-2.4 2-.9 0-1.2-.6-2.4-.6-1.3 0-1.6.6-2.5.6-1 0-1.7-1-2.4-1.9-1.6-2.4-2.9-6.7-1.2-9.7.8-1.4 2.3-2.3 3.9-2.3 1 0 2 .7 2.4.7s1.6-.8 2.7-.7c.5 0 1.9.2 2.8 1.5-2.4 1.3-2 4.6.4 5.6-.3.8-.5 1.4-1.4 2.2z" />
              </svg>
            }
          />
          <Method
            id="googlepay"
            label="Google Pay"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </svg>
            }
          />
          <Method
            id="card"
            label="Add card"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="3" />
                <path d="M2 10h20M6 15h4" />
              </svg>
            }
          />
        </div>
      </section>

      <footer className="space-y-3">
        <PrimaryCta disabled={!data.paymentMethod} onClick={next}>
          Add
        </PrimaryCta>
        <div className="flex justify-center pt-1">
          <TertiaryLink onClick={next}>Skip for now</TertiaryLink>
        </div>
      </footer>
    </AuthFrame>
  );
}

type ReactIcon = React.ReactNode;

/** Screen 6 — done. */
export function StepDone() {
  return (
    <AuthFrame progress={1}>
      <section className="mt-20 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Welcome to ewà
        </p>
        <h1 className="mt-4 font-display text-[64px] leading-[0.96] tracking-tight text-foreground">
          You're <span className="italic text-bagel">in</span>.
        </h1>
        <p className="mt-6 max-w-[32ch] text-[15px] leading-relaxed text-muted-foreground">
          We'll keep things simple — discover trusted pros, book what fits your
          day, and we'll take care of the rest.
        </p>
      </section>

      <footer>
        <Link
          to="/discover"
          className="flex h-12 w-full items-center justify-center rounded-full bg-bagel text-[15px] font-semibold text-bagel-foreground shadow-[0_8px_24px_-12px_rgba(255,130,63,0.7)] transition-transform active:scale-[0.99]"
        >
          Start exploring
        </Link>
      </footer>
    </AuthFrame>
  );
}
