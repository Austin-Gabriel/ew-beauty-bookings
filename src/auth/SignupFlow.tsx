import { SignupProvider, useSignup } from "./signupState";
import {
  StepIdentifier,
  StepVerify,
  StepName,
  StepAddress,
  StepDone,
} from "./signupSteps";

/**
 * SignupFlow — provider + step router. Smooth horizontal transition between
 * steps, single mount per step so input state isn't lost.
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

  // Keyed wrapper so each step gets a fresh mount (anim + autofocus).
  return (
    <div key={step} className="ewa-rise">
      {step === "identifier" && <StepIdentifier />}
      {step === "verify" && <StepVerify />}
      {step === "name" && <StepName />}
      {step === "address" && <StepAddress />}
      {step === "done" && <StepDone />}
    </div>
  );
}
