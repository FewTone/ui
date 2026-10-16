import { RadioGroup, RadioGroupItem } from "@fewtone/ui/components/radio-group/radio-group";
import { useId } from "react";

const plans = [
  { value: "starter", title: "Starter", price: "Free", note: "For trying things out." },
  { value: "pro", title: "Pro", price: "$12 a month", note: "For one person shipping." },
  { value: "team", title: "Team", price: "$40 a month", note: "For a small team." },
];

/** Each card is the radio's label, so a click anywhere on it picks the plan; the border follows the choice */
export default function RadioGroupCards() {
  const id = useId();
  return (
    <RadioGroup defaultValue="pro" aria-label="Plan" className="w-full max-w-2xl gap-3 sm:grid-cols-3">
      {plans.map((plan) => (
        <label
          key={plan.value}
          htmlFor={`${id}-${plan.value}`}
          className="grid cursor-pointer gap-1 rounded-lg border border-input bg-background p-4 transition-colors duration-(--duration-fast) ease-out has-data-[state=checked]:border-primary"
        >
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">{plan.title}</span>
            <RadioGroupItem id={`${id}-${plan.value}`} value={plan.value} />
          </span>
          <span className="text-sm">{plan.price}</span>
          <span className="text-xs text-muted-foreground">{plan.note}</span>
        </label>
      ))}
    </RadioGroup>
  );
}
