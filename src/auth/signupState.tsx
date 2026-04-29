import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDevState } from "@/dev-state/devState";

/**
 * 5-screen customer signup, matching the Biz editorial pattern:
 *   1. account  — full name + email + mobile (single screen)
 *   2. verify   — OTP
 *   3. address  — optional default booking address
 *   4. review   — summary with per-field Edit links
 *   5. done     — celebratory "You're in"
 */
export type SignupStepId =
  | "account"
  | "verify"
  | "address"
  | "review"
  | "done";

export const SIGNUP_STEPS: SignupStepId[] = [
  "account",
  "verify",
  "address",
  "review",
  "done",
];

export interface SignupData {
  fullName: string;
  email: string;
  countryCode: string; // e.g. "+1"
  phone: string;
  address: string;
}

const DEFAULTS: SignupData = {
  fullName: "",
  email: "",
  countryCode: "+1",
  phone: "",
  address: "",
};

interface SignupCtx {
  step: SignupStepId;
  index: number;
  total: number;
  data: SignupData;
  set: <K extends keyof SignupData>(key: K, value: SignupData[K]) => void;
  goTo: (step: SignupStepId) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
  /** "+1 555 010 1234" — what we display when echoing the phone back. */
  phoneDisplay: string;
}

const Ctx = createContext<SignupCtx | null>(null);

/** Map dev-state onboardingProgress → resume step. */
function startStepFromDev(progress: string): SignupStepId {
  switch (progress) {
    case "after-identifier":
      return "verify";
    case "after-verification":
    case "after-name":
      return "address";
    case "after-address":
      return "review";
    case "complete":
      return "done";
    default:
      return "account";
  }
}

export function SignupProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { state: devState } = useDevState();

  const initialStep =
    devState.authState === "mid-signup"
      ? startStepFromDev(devState.onboardingProgress)
      : "account";

  // Pre-seed data so deep-linking mid-flow shows believable values.
  const initialData: SignupData = useMemo(() => {
    const d = { ...DEFAULTS };
    const p = devState.onboardingProgress;
    if (p !== "none") {
      d.fullName = "Amara Okafor";
      d.email = "amara@example.com";
      d.phone = "555 010 1234";
    }
    if (p === "after-address" || p === "complete") {
      d.address = "215 Atlantic Ave, Brooklyn, NY";
    }
    return d;
    // Only re-seed on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [step, setStep] = useState<SignupStepId>(initialStep);
  const [data, setData] = useState<SignupData>(initialData);

  const index = SIGNUP_STEPS.indexOf(step);
  const total = SIGNUP_STEPS.length;

  const set: SignupCtx["set"] = useCallback((key, value) => {
    setData((d) => ({ ...d, [key]: value }));
  }, []);

  const goTo = useCallback((s: SignupStepId) => setStep(s), []);

  const next = useCallback(() => {
    setStep((curr) => {
      const i = SIGNUP_STEPS.indexOf(curr);
      return SIGNUP_STEPS[Math.min(i + 1, SIGNUP_STEPS.length - 1)];
    });
  }, []);

  const back = useCallback(() => {
    setStep((curr) => {
      const i = SIGNUP_STEPS.indexOf(curr);
      if (i <= 0) {
        navigate({ to: "/welcome" });
        return curr;
      }
      return SIGNUP_STEPS[i - 1];
    });
  }, [navigate]);

  const reset = useCallback(() => {
    setData(DEFAULTS);
    setStep("account");
  }, []);

  const phoneDisplay = `${data.countryCode} ${data.phone || "your number"}`;

  const value: SignupCtx = {
    step,
    index,
    total,
    data,
    set,
    goTo,
    next,
    back,
    reset,
    phoneDisplay,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSignup() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSignup must be used inside <SignupProvider>");
  return ctx;
}
