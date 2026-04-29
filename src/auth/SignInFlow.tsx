import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AuthFrame, PrimaryCta, TertiaryLink } from "./AuthFrame";
import { EditorialField } from "./EditorialField";
import { OtpInput } from "./OtpInput";
import { useDevState } from "@/dev-state/devState";

/**
 * SignInFlow — two screens (identifier → OTP) plus the biometric prompt
 * that fires on launch when a session + enrollment exist.
 */
export function SignInFlow() {
  const [screen, setScreen] = useState<"identifier" | "verify">("identifier");
  const [identifier, setIdentifier] = useState("");

  if (screen === "identifier") {
    return (
      <SignInIdentifier
        value={identifier}
        onChange={setIdentifier}
        onContinue={() => setScreen("verify")}
      />
    );
  }
  return (
    <SignInVerify
      identifier={identifier}
      onBack={() => setScreen("identifier")}
    />
  );
}

function SignInIdentifier({
  value,
  onChange,
  onContinue,
}: {
  value: string;
  onChange: (v: string) => void;
  onContinue: () => void;
}) {
  const navigate = useNavigate();
  const looksEmail = value.includes("@");
  const valid = looksEmail
    ? /.+@.+\..+/.test(value)
    : value.replace(/\D/g, "").length >= 7;

  return (
    <AuthFrame onBack={() => navigate({ to: "/welcome" })} quietRibbons>
      <section className="mt-14 flex-1">
        <h1 className="font-display text-[48px] leading-[1.02] tracking-tight text-foreground">
          Welcome <span className="italic">back</span>.
        </h1>
        <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-muted-foreground">
          Phone number or email — we'll send a one-time code.
        </p>

        <div className="mt-12">
          <EditorialField
            label="Phone or email"
            value={value}
            onChange={onChange}
            type={looksEmail ? "email" : "tel"}
            inputMode={looksEmail ? "email" : "tel"}
            autoComplete="username"
            autoFocus
            placeholder="555 010 1234  ·  you@domain.com"
          />
        </div>
      </section>

      <footer className="space-y-4">
        <PrimaryCta disabled={!valid} onClick={onContinue}>
          Continue
        </PrimaryCta>
        <div className="flex justify-center">
          <TertiaryLink>Forgot your account?</TertiaryLink>
        </div>
        <p className="pt-2 text-center text-[12.5px] text-muted-foreground">
          New to Ewà?{" "}
          <Link to="/signup" className="font-semibold text-foreground underline-offset-4 hover:underline">
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
    // First successful sign-in → mark signed-in. If they haven't enrolled
    // biometrics yet, send them through the enroll prompt before Discover.
    if (state.authState !== "biometric-enrolled") {
      set("authState", "signed-in");
      navigate({ to: "/biometric-enroll" });
    } else {
      set("authState", "biometric-enrolled");
      navigate({ to: "/discover" });
    }
  };

  return (
    <AuthFrame onBack={onBack} quietRibbons>
      <section className="mt-14 flex-1">
        <h1 className="font-display text-[40px] leading-[1.02] tracking-tight text-foreground">
          Enter your <span className="italic">code</span>
        </h1>
        <p className="mt-4 text-[14px] text-muted-foreground">
          Sent to <span className="tabular font-medium text-foreground">{identifier}</span>
        </p>

        <div className="mt-12">
          <OtpInput value={code} onChange={setCode} onComplete={submit} />
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
        <PrimaryCta disabled={code.length !== 6} onClick={submit}>
          Verify
        </PrimaryCta>
      </footer>
    </AuthFrame>
  );
}

/**
 * BiometricPrompt — used on app launch when there's a saved session.
 * Pure UI; tap to "authenticate" and continue. "Use code instead" falls
 * back to the sign-in OTP flow.
 */
export function BiometricPrompt({
  onSuccess,
  onFallback,
}: {
  onSuccess: () => void;
  onFallback: () => void;
}) {
  return (
    <AuthFrame>
      <section className="mt-24 flex flex-1 flex-col items-start">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          Welcome back
        </p>
        <h1 className="mt-4 font-display text-[44px] leading-[1.02] tracking-tight text-foreground">
          Unlock with <span className="italic">Face ID</span>
        </h1>
        <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-muted-foreground">
          We'll never see your biometrics — they stay on your device.
        </p>

        <button
          type="button"
          onClick={onSuccess}
          aria-label="Authenticate with Face ID"
          className="mt-16 grid h-28 w-28 place-items-center rounded-3xl border border-hairline bg-foreground/[0.04] text-foreground transition-transform hover:scale-[1.03] active:scale-[0.97]"
        >
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
            <path d="M9 10v1M15 10v1M12 9v4l-1 1h2" />
            <path d="M9 16c1 1 2 1.5 3 1.5S14 17 15 16" />
          </svg>
        </button>
      </section>

      <footer>
        <button
          type="button"
          onClick={onFallback}
          className="flex h-12 w-full items-center justify-center rounded-full border border-hairline text-[14px] font-medium text-foreground"
        >
          Use code instead
        </button>
      </footer>
    </AuthFrame>
  );
}

/**
 * BiometricEnroll — shown right after a first successful sign-in. Lets the
 * user opt into biometrics so subsequent launches skip OTP.
 */
export function BiometricEnroll() {
  const navigate = useNavigate();
  const { set } = useDevState();
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
      <section className="mt-24 flex-1">
        <p className="text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          One-time setup
        </p>
        <h1 className="mt-4 font-display text-[44px] leading-[1.02] tracking-tight text-foreground">
          Skip the code <span className="italic">next time</span>
        </h1>
        <p className="mt-4 max-w-[34ch] text-[14px] leading-relaxed text-muted-foreground">
          Use Face ID or Touch ID to sign in faster on this device. You can
          turn it off anytime in settings.
        </p>
      </section>

      <footer className="space-y-3">
        <PrimaryCta onClick={enroll}>Turn on Face ID</PrimaryCta>
        <button
          type="button"
          onClick={skip}
          className="flex h-12 w-full items-center justify-center text-[14px] font-medium text-foreground/70"
        >
          Not now
        </button>
      </footer>
    </AuthFrame>
  );
}
