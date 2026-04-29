import { SignupProvider, useSignup } from "./signupState";
import {
  StepAccount,
  StepVerify,
  StepAddress,
  StepReview,
  StepDone,
} from "./signupSteps";

/**
 * SignupFlow — provider + step router. Single mount per step so input state
 * is preserved as the user moves forward and back.
 */
export function SignupFlow() {
  return (
    <SignupProvider>
      <Switcher />
    </SignupProvider>
  );
}

function Switcher() {
  const { step } = useSignup();
  return (
    <div key={step} className="ewa-rise">
      {step === "account" && <StepAccount />}
      {step === "verify" && <StepVerify />}
      {step === "address" && <StepAddress />}
      {step === "review" && <StepReview />}
      {step === "done" && <StepDone />}
    </div>
  );
}
