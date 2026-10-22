import { NumberInput } from "@fewtone/ui/components/number-input/number-input";
import { useId } from "react";

/** A percent between 0 and 1 in steps of 5%. Home and End go to 0% and 100%. */
export default function NumberInputPercent() {
  const id = useId();
  return (
    <div className="grid w-full max-w-xs gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Discount
      </label>
      <NumberInput
        id={id}
        defaultValue={0.15}
        min={0}
        max={1}
        step={0.05}
        largeStep={0.25}
        locale="en-US"
        format={{ style: "percent" }}
        aria-describedby={`${id}-hint`}
      />
      <p id={`${id}-hint`} className="text-sm text-muted-foreground">
        Up to 100%, in steps of 5%.
      </p>
    </div>
  );
}
