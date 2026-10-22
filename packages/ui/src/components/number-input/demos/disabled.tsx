import { NumberInput } from "@fewtone/ui/components/number-input/number-input";
import { useId } from "react";

export default function NumberInputDisabled() {
  const id = useId();
  return (
    <div className="grid w-full max-w-xs gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Seats
      </label>
      <NumberInput id={id} defaultValue={5} min={1} disabled />
    </div>
  );
}
