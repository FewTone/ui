import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from "@fewtone/ui/components/stepper/stepper";

const steps = ["Cart", "Shipping", "Payment", "Review"];

/** The index card's preview: four steps without titles, the second current. The page itself has a checkout. */
export default function StepperCard() {
  return (
    <Stepper defaultValue={2} aria-label="Checkout" className="w-56">
      {steps.map((title, index) => (
        <StepperItem key={title} step={index + 1}>
          <StepperTrigger aria-label={title}>
            <StepperIndicator />
          </StepperTrigger>
          <StepperSeparator />
        </StepperItem>
      ))}
    </Stepper>
  );
}
