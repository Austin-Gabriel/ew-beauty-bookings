import { type ReactNode, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  AuthFrame,
  AuthHeadline,
  AuthSubhead,
  AuthEyebrow,
  PrimaryCta,
  TertiaryLink,
} from "./AuthFrame";
import { AuthShell, useAuthTheme, SANS_STACK } from "./auth-shell";
import { EditorialField } from "./EditorialField";
import { OtpInput } from "./OtpInput";
import { useSignup } from "./signupState";
import { EwaLockup } from "@/components/ewa-logo";

const FRAUNCES = '"Fraunces", "Times New Roman", serif';

/** Screen 1 — Phone (or email) identifier. */
export function StepIdentifier() {
  const { data, set, next, back, index, total } = useSignup();
  const isPhone = data.identifierKind === "phone";
  const phoneDigits = data.phone.replace(/\D/g, "");
  const valid = isPhone ? phoneDigits.length >= 7 : /.+@.+\..+/.test(data.email);

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total}>
      <section className="mt-12 flex-1">
        <AuthHeadline>Let's get you started.</AuthHeadline>
        <AuthSubhead>We'll send you a code to verify it's really you.</AuthSubhead>

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

      <FooterStack>
        <PrimaryCta disabled={!valid} onClick={next}>
          Continue
        </PrimaryCta>
        <div className="flex justify-center pt-1">
          <TertiaryLink onClick={() => set("identifierKind", isPhone ? "email" : "phone")}>
            Use {isPhone ? "email" : "phone"} instead
          </TertiaryLink>
        </div>
        <AuthFootnote>
          Already have an account?{" "}
          <Link to="/signin" style={{ color: "#FF823F", fontWeight: 500 }}>
            Sign in
          </Link>
        </AuthFootnote>
      </FooterStack>
    </AuthFrame>
  );
}

/** Screen 2 — OTP verification. */
export function StepVerify() {
  const { identifierDisplay, back, next, index, total, goTo } = useSignup();
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const { text } = useAuthTheme();

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
    <AuthFrame onBack={back} progress={(index + 1) / total}>
      <section className="mt-12 flex-1">
        <AuthHeadline>Enter your code.</AuthHeadline>
        <p
          className="ewa-rise"
          style={{
            fontFamily: SANS_STACK,
            fontWeight: 400,
            fontSize: 13,
            lineHeight: 1.5,
            color: text,
            opacity: 0.62,
            marginTop: 12,
            animationDelay: "120ms",
          }}
        >
          Sent to{" "}
          <span className="tabular" style={{ fontWeight: 500, opacity: 0.9 }}>
            {identifierDisplay}
          </span>
          {"  "}
          <button
            type="button"
            onClick={() => goTo("identifier")}
            aria-label="Edit"
            style={{ color: "#FF823F", fontWeight: 500 }}
          >
            Edit
          </button>
        </p>

        <div className="mt-12">
          <OtpInput value={code} onChange={setCode} onComplete={() => next()} />
        </div>

        <div className="mt-8">
          {cooldown > 0 ? (
            <p
              style={{
                fontFamily: SANS_STACK,
                fontSize: 13,
                color: text,
                opacity: 0.55,
              }}
            >
              Resend code in <span className="tabular">{cooldown}s</span>
            </p>
          ) : (
            <TertiaryLink onClick={startCooldown}>Resend code</TertiaryLink>
          )}
        </div>
      </section>

      <FooterStack>
        <PrimaryCta disabled={code.length !== 6} onClick={next}>
          Verify
        </PrimaryCta>
      </FooterStack>
    </AuthFrame>
  );
}

/** Screen 3 — name. */
export function StepName() {
  const { data, set, next, back, index, total } = useSignup();
  const valid = data.firstName.trim().length >= 1;

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total}>
      <section className="mt-12 flex-1">
        <AuthHeadline>What should we call you?</AuthHeadline>
        <AuthSubhead>This is what pros will see when you book.</AuthSubhead>

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

      <FooterStack>
        <PrimaryCta disabled={!valid} onClick={next}>
          Continue
        </PrimaryCta>
      </FooterStack>
    </AuthFrame>
  );
}

/** Screen 4 — default address (optional). */
export function StepAddress() {
  const { data, set, next, back, index, total } = useSignup();

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total}>
      <section className="mt-12 flex-1">
        <AuthHeadline>Where should pros come?</AuthHeadline>
        <AuthSubhead>You can skip this and add it later.</AuthSubhead>

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
            className="mt-5 inline-flex items-center gap-2"
            style={{
              fontFamily: SANS_STACK,
              fontSize: 13,
              fontWeight: 500,
              color: "#FF823F",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
            Use my current location
          </button>
        </div>
      </section>

      <FooterStack>
        <PrimaryCta disabled={data.address.trim().length < 3} onClick={next}>
          Continue
        </PrimaryCta>
        <div className="flex justify-center pt-1">
          <TertiaryLink onClick={next}>Skip for now</TertiaryLink>
        </div>
      </FooterStack>
    </AuthFrame>
  );
}


/**
 * Screen 6 — celebratory done screen. This IS an editorial moment, so it
 * gets the squiggles + full Ewà lockup. Mirrors Welcome's visual language.
 */
export function StepDone() {
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  return (
    <AuthShell glowBoost={1.1}>
      <div
        className="relative z-[1] flex flex-col items-center"
        style={{ paddingTop: "10vh" }}
      >
        <div className="ewa-mark-in">
          <div className="ewa-breathe">
            <EwaLockup isDark={isDark} markSize={48} />
          </div>
        </div>
      </div>

      <div className="flex-1" />

      <div className="relative z-[1] flex flex-col items-center px-8 text-center">
        <AuthEyebrow>Welcome to ewà</AuthEyebrow>
        <h1
          className="ewa-rise"
          style={{
            fontFamily: SANS_STACK,
            fontWeight: 500,
            fontSize: 26,
            lineHeight: 1.18,
            letterSpacing: "-0.02em",
            color: text,
            margin: 0,
            marginTop: 14,
            animationDelay: "200ms",
          }}
        >
          You're{" "}
          <span
            style={{
              fontFamily: FRAUNCES,
              fontStyle: "italic",
              fontWeight: 400,
              color: "#FF823F",
            }}
          >
            in
          </span>
          .
        </h1>
        <p
          className="ewa-rise"
          style={{
            fontFamily: SANS_STACK,
            fontWeight: 400,
            fontSize: 13,
            lineHeight: 1.5,
            color: text,
            opacity: 0.62,
            marginTop: 12,
            maxWidth: 280,
            animationDelay: "320ms",
          }}
        >
          Discover trusted pros, book what fits your day — we'll take care of the rest.
        </p>
      </div>

      <div
        className="relative z-[1] mt-10 flex flex-col items-stretch px-5 ewa-rise"
        style={{ animationDelay: "440ms", paddingBottom: 24 }}
      >
        <PrimaryCta onClick={() => navigate({ to: "/discover" })}>
          Start exploring
        </PrimaryCta>
      </div>
    </AuthShell>
  );
}

/* ---------- Footer helpers ---------- */

function FooterStack({ children }: { children: ReactNode }) {
  return (
    <footer className="mt-6 flex flex-col gap-3" style={{ paddingBottom: 8 }}>
      {children}
    </footer>
  );
}

function AuthFootnote({ children }: { children: ReactNode }) {
  const { text } = useAuthTheme();
  return (
    <p
      className="pt-2 text-center"
      style={{
        fontFamily: SANS_STACK,
        fontSize: 12.5,
        color: text,
        opacity: 0.55,
      }}
    >
      {children}
    </p>
  );
}
