import { Checkbox } from "@fewtone/ui/components/checkbox/checkbox";
import { useId } from "react";

export default function CheckboxHint() {
  const id = useId();
  return (
    <div className="flex w-full max-w-sm items-start gap-3">
      <Checkbox id={id} aria-describedby={`${id}-hint`} />
      <div className="grid gap-0.5">
        <label htmlFor={id} className="text-sm font-medium">
          Accept terms and conditions
        </label>
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          You agree to the Terms of Service and the Privacy Policy.
        </p>
      </div>
    </div>
  );
}
