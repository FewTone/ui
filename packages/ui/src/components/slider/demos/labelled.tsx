"use client";

import { Slider } from "@fewtone/ui/components/slider/slider";
import { useId, useState } from "react";

/*
 * A visible label with the value beside it, controlled. aria-labelledby names the thumb from the label, and
 * the Intl format ("24 hours") shows in the thumb's pill and reaches screen readers as aria-valuetext.
 */
export default function SliderLabelled() {
  const id = useId();
  const [value, setValue] = useState([24]);
  const hours = { style: "unit", unit: "hour", unitDisplay: "long" } as const;
  const format = (value: number) => new Intl.NumberFormat("en-US", hours).format(value);

  return (
    <div className="grid w-full max-w-xs gap-3">
      <div className="flex items-center justify-between gap-4">
        <span id={id} className="text-sm font-medium">
          Keep backups for
        </span>
        <span className="text-sm text-muted-foreground tabular-nums">{format(value[0] ?? 0)}</span>
      </div>
      <Slider aria-labelledby={id} value={value} onValueChange={setValue} min={1} max={72} format={hours} />
    </div>
  );
}
