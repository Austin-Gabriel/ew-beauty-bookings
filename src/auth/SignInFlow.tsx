import { useState } from "react";
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
import { useDevState } from "@/dev-state/devState";

const FRAUNCES = '"Fraunces", "Times New Roman", serif';

/**
 * SignInFlow — two screens (identifier → OTP). No squiggles, no logo.
 */
export function SignInFlow() {
  const [screen, setScreen] = useState<"identifier" | "verify">("identifier");
  const [kind, setKind] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const countryCode = "+1";

  const identifierDisplay =
    kind === "phone" ? `${countryCode} ${phone}` : email;

  if (screen === "identifier") {
    return (
      <SignInIdentifier
        kind={kind}
        setKind={setKind}
        phone={phone}
        setPhone={setPhone}
        email={email}
        setEmail={setEmail}
        countryCode={countryCode}
        onContinue={() => setScreen("verify")}
      />
    );
  }
  return (
    <SignInVerify
      identifier={identifierDisplay}
      onBack={() => setScreen("identifier")}
    />
  );
}

function SignInIdentifier({
  kind,
  setKind,
  phone,
  setPhone,
  email,
  setEmail,
  countryCode,
  onContinue,
}: {
  kind: "phone" | "email";
  setKind: (k: "phone" | "email") => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  countryCode: string;
  onContinue: () => void;
}) {
  const navigate = useNavigate();
  const { text } = useAuthTheme();
  const isPhone = kind === "phone";
  const valid = isPhone
    ? phone.replace(/\D/g, "").length >= 7
    : /.+@.+\..+/.test(email);

  return (
    <AuthFrame onBack={() => navigate({ to: "/welcome" })}>
      <section className="mt-12 flex-1">
        <AuthHeadline>Welcome back.</AuthHeadline>
        <AuthSubhead>We'll send a one-time code to sign you in.</AuthSubhead>

        <div className="mt-12">
          {isPhone ? (
            <EditorialField
              label="Phone number"
              prefix={countryCode}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              autoFocus
              value={phone}
              onChange={(v) => setPhone(v.replace(/[^\d\s-]/g, ""))}
              placeholder="555 010 1234"
            />
          ) : (
            <EditorialField
              label="Email address"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={setEmail}
              placeholder="you@domain.com"
            />
          )}
        </div>
      </section>

      <footer className="mt-6 flex flex-col gap-3" style={{ paddingBottom: 8 }}>
        <PrimaryCta disabled={!valid} onClick={onContinue}>
          Continue
        </PrimaryCta>
        <div className="flex justify-center pt-1">
          <TertiaryLink onClick={() => setKind(isPhone ? "email" : "phone")}>
            Use {isPhone ? "email" : "phone"} instead
          </TertiaryLink>
        </div>
        <p
          className="pt-2 text-center"
          style={{
            fontFamily: SANS_STACK,
            fontSize: 12.5,
            color: text,
            opacity: 0.55,
          }}
        >
          New to Ewà?{" "}
          <Link to="/signup" style={{ color: "#FF823F", fontWeight: 500 }}>
            Sign up
          </Link>
        </p>
      </footer>
    </AuthFrame>
  );
}

function SignInVerify({ identifier, onBack }: { identifier: string; onBack: () => void }) {
  const navigate = useNavigate();
  const { state, set } = useDevState();
  const { text } = useAuthTheme();
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

  const submit = () => {
    if (state.authState !== "biometric-enrolled") {
      set("authState", "signed-in");
      navigate({ to: "/biometric-enroll" });
    } else {
      set("authState", "biometric-enrolled");
      navigate({ to: "/discover" });
    }
  };

  return (
    <AuthFrame onBack={onBack}>
      <section className="mt-12 flex-1">
        <AuthHeadline>
          Enter your <span style={{ fontStyle: "italic" }}>code</span>.
        </AuthHeadline>
        <p
          className="ewa-rise inline-flex flex-wrap items-center gap-1.5"
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
          <span>Sent to</span>
          <span className="tabular" style={{ fontWeight: 500, opacity: 0.9 }}>
            {identifier}
          </span>
          <button
            type="button"
            onClick={onBack}
            aria-label="Edit number"
            className="inline-flex items-center justify-center rounded-full p-1 transition-opacity hover:opacity-100"
            style={{ color: "#FF823F", opacity: 0.95 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
          </button>
        </p>

        <div className="mt-12">
          <OtpInput value={code} onChange={setCode} onComplete={submit} />
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

      <footer className="mt-6" style={{ paddingBottom: 8 }}>
        <PrimaryCta disabled={code.length !== 6} onClick={submit}>
          Verify
        </PrimaryCta>
      </footer>
    </AuthFrame>
  );
}

/**
 * BiometricPrompt — used on app launch when there's a saved session.
 * No squiggles, no logo — clean working surface.
 */
export function BiometricPrompt({
  onSuccess,
  onFallback,
}: {
  onSuccess: () => void;
  onFallback: () => void;
}) {
  const { text, borderCol } = useAuthTheme();
  return (
    <AuthFrame>
      <section className="mt-20 flex flex-1 flex-col items-start">
        <AuthEyebrow>Welcome back</AuthEyebrow>
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
            animationDelay: "120ms",
          }}
        >
          Unlock with{" "}
          <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 400 }}>
            Face ID
          </span>
          .
        </h1>
        <AuthSubhead>We'll never see your biometrics — they stay on your device.</AuthSubhead>

        <button
          type="button"
          onClick={onSuccess}
          aria-label="Authenticate with Face ID"
          className="mt-12 grid h-28 w-28 place-items-center rounded-3xl transition-transform hover:scale-[1.03] active:scale-[0.97]"
          style={{
            border: `1px solid ${borderCol}`,
            color: text,
            backgroundColor: "transparent",
          }}
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
            <path d="M9 10v1M15 10v1M12 9v4l-1 1h2" />
            <path d="M9 16c1 1 2 1.5 3 1.5S14 17 15 16" />
          </svg>
        </button>
      </section>

      <footer className="mt-6 flex flex-col gap-3" style={{ paddingBottom: 8 }}>
        <button
          type="button"
          onClick={onFallback}
          className="flex h-12 w-full items-center justify-center rounded-full transition-colors"
          style={{
            border: `1px solid ${borderCol}`,
            color: text,
            fontFamily: SANS_STACK,
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Use code instead
        </button>
      </footer>
    </AuthFrame>
  );
}

/**
 * BiometricEnroll — shown right after a first successful sign-in.
 */
export function BiometricEnroll() {
  const navigate = useNavigate();
  const { set } = useDevState();
  const { text } = useAuthTheme();
  const enroll = () => {
    set("authState", "biometric-enrolled");
    navigate({ to: "/discover" });
  };
  const skip = () => {
    set("authState", "signed-in");
    navigate({ to: "/discover" });
  };

  return (
    <AuthFrame>
      <section className="mt-20 flex-1">
        <AuthEyebrow>One-time setup</AuthEyebrow>
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
            animationDelay: "120ms",
          }}
        >
          Skip the code{" "}
          <span style={{ fontFamily: FRAUNCES, fontStyle: "italic", fontWeight: 400 }}>
            next time
          </span>
          .
        </h1>
        <AuthSubhead>
          Use Face ID or Touch ID to sign in faster on this device. You can turn it off anytime in settings.
        </AuthSubhead>
      </section>

      <footer className="mt-6 flex flex-col gap-3" style={{ paddingBottom: 8 }}>
        <PrimaryCta onClick={enroll}>Turn on Face ID</PrimaryCta>
        <button
          type="button"
          onClick={skip}
          className="flex h-12 w-full items-center justify-center"
          style={{
            color: text,
            opacity: 0.65,
            fontFamily: SANS_STACK,
            fontWeight: 500,
            fontSize: 14,
          }}
        >
          Not now
        </button>
      </footer>
    </AuthFrame>
  );
}
