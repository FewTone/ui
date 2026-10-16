import { RadioGroup, RadioGroupItem } from "@fewtone/ui/components/radio-group/radio-group";
import { useId } from "react";

export default function RadioGroupHorizontal() {
  const id = useId();
  return (
    <RadioGroup defaultValue="m" orientation="horizontal" aria-label="Size" className="flex flex-wrap gap-6">
      {["S", "M", "L", "XL"].map((option) => (
        <div key={option} className="flex items-center gap-2">
          <RadioGroupItem id={`${id}-${option}`} value={option.toLowerCase()} />
          <label htmlFor={`${id}-${option}`} className="text-sm">
            {option}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}
