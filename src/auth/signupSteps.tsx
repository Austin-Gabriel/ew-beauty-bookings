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
import { useSignup, type SignupStepId } from "./signupState";

const FRAUNCES = '"Fraunces", "Times New Roman", serif';

/* ───────────────────────── Screen 1 — Create account ───────────────────────── */

export function StepAccount() {
  const { data, set, next, back, index, total } = useSignup();
  const phoneDigits = data.phone.replace(/\D/g, "");
  const emailValid = /.+@.+\..+/.test(data.email);
  const valid = data.fullName.trim().length >= 2 && emailValid && phoneDigits.length >= 7;

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total} topRightLabel="Create account">
      <section className="mt-10 flex-1">
        <AuthHeadline>
          Create your <span style={{ fontStyle: "italic" }}>account</span>.
        </AuthHeadline>
        <AuthSubhead>A few details so we can text you bookings.</AuthSubhead>

        <div className="mt-10 space-y-7">
          <EditorialField
            label="Full name"
            value={data.fullName}
            onChange={(v) => set("fullName", v)}
            autoComplete="name"
            autoFocus
            placeholder="Amara Okafor"
          />
          <EditorialField
            label="Email"
            type="email"
            inputMode="email"
            value={data.email}
            onChange={(v) => set("email", v)}
            autoComplete="email"
            placeholder="you@domain.com"
          />
          <EditorialField
            label="Mobile number"
            type="tel"
            inputMode="tel"
            prefix={data.countryCode}
            value={data.phone}
            onChange={(v) => set("phone", v.replace(/[^\d\s-]/g, ""))}
            autoComplete="tel"
            placeholder="555 010 1234"
          />
        </div>
      </section>

      <FooterStack>
        <PrimaryCta disabled={!valid} onClick={next}>
          Continue
        </PrimaryCta>
        <AuthFootnote>
          Already have an account?{" "}
          <Link to="/signin" style={{ color: "#FF823F", fontWeight: 500 }}>
            Sign in
          </Link>
        </AuthFootnote>
        <FinePrint>
          By continuing you agree to our Terms and Privacy Policy.
        </FinePrint>
      </FooterStack>
    </AuthFrame>
  );
}

/* ───────────────────────── Screen 2 — Verify your number ───────────────────────── */

export function StepVerify() {
  const { back, index, total } = useSignup();
  return (
    <AuthFrame onBack={back} progress={(index + 1) / total} topRightLabel="Verify">
      <StepVerifyBody />
    </AuthFrame>
  );
}

function StepVerifyBody() {
  const { phoneDisplay, next, goTo } = useSignup();
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
    <>
      <section className="mt-10 flex-1">
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
            {phoneDisplay}
          </span>
          <button
            type="button"
            onClick={() => goTo("account")}
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

/* ───────────────────────── Screen 3 — Default address ───────────────────────── */

export function StepAddress() {
  const { data, set, next, back, index, total } = useSignup();

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total} topRightLabel="Address">
      <section className="mt-10 flex-1">
        <AuthHeadline>
          Where should pros <span style={{ fontStyle: "italic" }}>come</span>?
        </AuthHeadline>
        <AuthSubhead>
          We'll use this as your default booking address. You can skip and add it later.
        </AuthSubhead>

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

/* ───────────────────────── Screen 4 — Review and continue ───────────────────────── */

export function StepReview() {
  const { data, goTo, next, back, index, total } = useSignup();

  return (
    <AuthFrame onBack={back} progress={(index + 1) / total} topRightLabel="Review">
      <section className="mt-10 flex-1">
        <AuthHeadline>
          Review and <span style={{ fontStyle: "italic" }}>continue</span>.
        </AuthHeadline>
        <AuthSubhead>Looks good? You're almost in.</AuthSubhead>

        <div className="mt-10">
          <ReviewRow label="Name" value={data.fullName || "—"} onEdit={() => goTo("account")} />
          <ReviewRow label="Email" value={data.email || "—"} onEdit={() => goTo("account")} />
          <ReviewRow
            label="Mobile number"
            value={`${data.countryCode} ${data.phone}`.trim()}
            onEdit={() => goTo("account")}
          />
          <ReviewRow
            label="Default address"
            value={data.address || "Not set"}
            actionLabel={data.address ? "Edit" : "Add"}
            onEdit={() => goTo("address")}
            muted={!data.address}
          />
        </div>
      </section>

      <FooterStack>
        <PrimaryCta onClick={next}>Continue</PrimaryCta>
      </FooterStack>
    </AuthFrame>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
  actionLabel = "Edit",
  muted = false,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  actionLabel?: string;
  muted?: boolean;
}) {
  const { text, borderCol } = useAuthTheme();
  return (
    <div
      className="flex items-start justify-between gap-4 py-4"
      style={{ borderBottom: `1px solid ${borderCol}` }}
    >
      <div className="min-w-0 flex-1">
        <div
          style={{
            fontFamily: SANS_STACK,
            fontSize: 10,
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            color: text,
            opacity: 0.5,
            fontWeight: 600,
          }}
        >
          {label}
        </div>
        <div
          className="mt-1.5 truncate"
          style={{
            fontFamily: SANS_STACK,
            fontSize: 16,
            fontWeight: 500,
            color: text,
            opacity: muted ? 0.5 : 1,
          }}
        >
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        style={{
          fontFamily: SANS_STACK,
          fontSize: 13,
          fontWeight: 500,
          color: "#FF823F",
          marginTop: 6,
        }}
      >
        {actionLabel}
      </button>
    </div>
  );
}

/* ───────────────────────── Screen 5 — You're in ───────────────────────── */

export function StepDone() {
  const navigate = useNavigate();
  const { isDark, text } = useAuthTheme();
  return (
    <AuthShell glowBoost={1.1} topLabel="Welcome">
      <div className="relative z-[1] flex flex-1 flex-col items-center justify-center px-8 text-center">
        <CheckMark isDark={isDark} />

        <h1
          className="ewa-rise"
          style={{
            fontFamily: FRAUNCES,
            fontWeight: 400,
            fontSize: 38,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            color: text,
            margin: 0,
            marginTop: 28,
            animationDelay: "200ms",
          }}
        >
          You're <span style={{ fontStyle: "italic", color: "#FF823F" }}>in</span>.
        </h1>
        <p
          className="ewa-rise"
          style={{
            fontFamily: SANS_STACK,
            fontWeight: 400,
            fontSize: 14,
            lineHeight: 1.5,
            color: text,
            opacity: 0.62,
            marginTop: 14,
            maxWidth: 300,
            animationDelay: "320ms",
          }}
        >
          Start exploring pros near you.
        </p>
      </div>

      <div
        className="relative z-[1] mx-auto w-full max-w-[420px] px-6 ewa-rise"
        style={{ animationDelay: "440ms", paddingBottom: 24 }}
      >
        <PrimaryCta onClick={() => navigate({ to: "/discover" })}>
          Start exploring
        </PrimaryCta>
      </div>
    </AuthShell>
  );
}

function CheckMark({ isDark }: { isDark: boolean }) {
  const ringBg = isDark ? "rgba(255,130,63,0.10)" : "rgba(255,130,63,0.12)";
  return (
    <div
      className="ewa-mark-in flex items-center justify-center rounded-full"
      style={{
        width: 96,
        height: 96,
        backgroundColor: ringBg,
        border: "1.5px solid #FF823F",
        boxShadow: "0 0 60px 0 rgba(255,130,63,0.35)",
      }}
    >
      <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#FF823F" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L20 7" />
      </svg>
    </div>
  );
}

/* ───────────────────────── Footer helpers ───────────────────────── */

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
        opacity: 0.6,
      }}
    >
      {children}
    </p>
  );
}

function FinePrint({ children }: { children: ReactNode }) {
  const { text } = useAuthTheme();
  return (
    <p
      className="text-center"
      style={{
        fontFamily: SANS_STACK,
        fontSize: 11,
        lineHeight: 1.5,
        color: text,
        opacity: 0.45,
        maxWidth: 320,
        marginInline: "auto",
      }}
    >
      {children}
    </p>
  );
}

// Suppress unused-import warnings for type re-export consumers.
export type { SignupStepId };
