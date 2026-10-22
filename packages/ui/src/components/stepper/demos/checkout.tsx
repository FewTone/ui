"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@fewtone/ui/components/stepper/stepper";
import { useRef, useState } from "react";

const steps = ["Cart", "Shipping", "Payment", "Review"];

/*
 * A four-step checkout. Next and Back move one step: the line fills or empties, and the step you leave gets its
 * check (or loses it). Steps you've reached can be pressed to jump back; the ones ahead aren't reachable yet.
 * Past Review every step is done. When Back or Next can't go further, focus moves to the other one.
 */
export default function StepperCheckout() {
  const [step, setStep] = useState(2);
  const back = useRef<HTMLButtonElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  const last = steps.length + 1;

  const go = (to: number) => {
    setStep(to);
    if (to === 1) next.current?.focus();
    if (to === last) back.current?.focus();
  };

  return (
    <div className="flex w-full max-w-xl flex-col gap-10">
      <Stepper value={step} onValueChange={setStep} aria-label="Checkout">
        {steps.map((title, index) => (
          <StepperItem key={title} step={index + 1} disabled={index + 1 > step}>
            <StepperTrigger>
              <StepperIndicator />
              <StepperTitle>{title}</StepperTitle>
            </StepperTrigger>
            <StepperSeparator />
          </StepperItem>
        ))}
      </Stepper>
      <div className="flex justify-end gap-2">
        <Button ref={back} variant="outline" size="sm" disabled={step === 1} onClick={() => go(step - 1)}>
          Back
        </Button>
        <Button ref={next} size="sm" disabled={step === last} onClick={() => go(step + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
