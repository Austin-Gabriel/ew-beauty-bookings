import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useDevState } from "@/dev-state/devState";

export type SignupStepId =
  | "identifier"
  | "verify"
  | "name"
  | "address"
  | "done";

export const SIGNUP_STEPS: SignupStepId[] = [
  "identifier",
  "verify",
  "name",
  "address",
  "done",
];

export type IdentifierKind = "phone" | "email";

export interface SignupData {
  identifierKind: IdentifierKind;
  phone: string;
  countryCode: string; // e.g. "+1"
  email: string;
  firstName: string;
  lastName: string;
  address: string;
}

const DEFAULTS: SignupData = {
  identifierKind: "phone",
  phone: "",
  countryCode: "+1",
  email: "",
  firstName: "",
  lastName: "",
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
  /** Identifier as displayed to the user — phone w/ country code or email. */
  identifierDisplay: string;
}

const Ctx = createContext<SignupCtx | null>(null);

/**
 * Map dev-state onboardingProgress → the screen we should jump to when the
 * user lands on /signup with a "mid-signup" auth state.
 */
function startStepFromDev(progress: string): SignupStepId {
  switch (progress) {
    case "phone-no-name":
      return "name";
    case "phone-name-no-address":
      return "address";
    case "phone-name-address-no-payment":
      return "address";
    case "complete":
      return "done";
    default:
      return "identifier";
  }
}

export function SignupProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { state: devState } = useDevState();

  const initialStep =
    devState.authState === "mid-signup"
      ? startStepFromDev(devState.onboardingProgress)
      : "identifier";

  // Pre-seed data based on how far through signup the dev toggle says the
  // user has gotten — so deep-linking into Address shows their name etc.
  const initialData: SignupData = useMemo(() => {
    const d = { ...DEFAULTS };
    const p = devState.onboardingProgress;
    if (p !== "none") {
      d.phone = "555 010 1234";
    }
    if (p === "phone-name-no-address" || p === "phone-name-address-no-payment" || p === "complete") {
      d.firstName = "Amara";
    }
    if (p === "phone-name-address-no-payment" || p === "complete") {
      d.address = "215 Atlantic Ave, Brooklyn, NY";
    }
    return d;
    // We deliberately only re-seed on first mount — once the user is
    // navigating the flow, dev-state changes shouldn't yank them around.
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
        // From the very first step, exit the flow back to Welcome.
        navigate({ to: "/welcome" });
        return curr;
      }
      return SIGNUP_STEPS[i - 1];
    });
  }, [navigate]);

  const reset = useCallback(() => {
    setData(DEFAULTS);
    setStep("identifier");
  }, []);

  const identifierDisplay =
    data.identifierKind === "phone"
      ? `${data.countryCode} ${data.phone || "your number"}`
      : data.email || "your email";

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
    identifierDisplay,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSignup() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSignup must be used inside <SignupProvider>");
  return ctx;
}
