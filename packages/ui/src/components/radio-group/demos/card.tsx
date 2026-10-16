import { RadioGroup, RadioGroupItem } from "@fewtone/ui/components/radio-group/radio-group";
import { useId } from "react";

/** The index card's preview: one group. The page itself opens on both ways of travelling. */
export default function RadioGroupCard() {
  const id = useId();
  return (
    <RadioGroup defaultValue="comfortable" aria-label="Density">
      {["Default", "Comfortable", "Compact"].map((option) => (
        <div key={option} className="flex items-center gap-3">
          <RadioGroupItem id={`${id}-${option}`} value={option.toLowerCase()} />
          <label htmlFor={`${id}-${option}`} className="text-sm">
            {option}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}
