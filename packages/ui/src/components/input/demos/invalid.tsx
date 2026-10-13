import { Input } from "@fewtone/ui/components/input/input";
import { useId } from "react";

export default function InputInvalid() {
  const id = useId();
  return (
    <div className="grid w-full max-w-xs gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Username
      </label>
      <Input id={id} defaultValue="f" aria-invalid="true" aria-describedby={`${id}-error`} />
      <p id={`${id}-error`} className="text-sm text-destructive">
        Use at least 3 characters.
      </p>
    </div>
  );
}
