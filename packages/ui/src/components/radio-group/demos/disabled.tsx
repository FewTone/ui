import { RadioGroup, RadioGroupItem } from "@fewtone/ui/components/radio-group/radio-group";
import { useId } from "react";

const options = [
  { value: "email", label: "Email" },
  { value: "sms", label: "Text message", disabled: true, hint: "(not available in your region)" },
  { value: "app", label: "Authenticator app" },
];

export default function RadioGroupDisabled() {
  const id = useId();
  return (
    <RadioGroup defaultValue="email" aria-label="Two-step sign-in">
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-3">
          <RadioGroupItem id={`${id}-${option.value}`} value={option.value} disabled={option.disabled} />
          <label
            htmlFor={`${id}-${option.value}`}
            className={option.disabled ? "text-sm text-muted-foreground" : "text-sm"}
          >
            {option.label} {option.hint}
          </label>
        </div>
      ))}
    </RadioGroup>
  );
}
