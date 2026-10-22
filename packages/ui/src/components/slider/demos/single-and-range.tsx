"use client";

import { Slider } from "@fewtone/ui/components/slider/slider";

const percent = { style: "unit", unit: "percent" } as const;
const dollars = { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const;

/**
 * One value and a range side by side, named underneath. Reach for a thumb (hover, Tab, drag) and it grows into
 * a pill with its value inside, flowing as it changes.
 */
export default function SliderSingleAndRange() {
  return (
    <ul className="flex w-full flex-wrap items-center justify-center gap-x-12 gap-y-10 pt-6">
      <li className="flex w-full max-w-48 flex-col items-center gap-4">
        <Slider aria-label="Volume" defaultValue={[60]} format={percent} />
        <span className="text-xs text-muted-foreground">Single</span>
      </li>
      <li className="flex w-full max-w-48 flex-col items-center gap-4">
        <Slider
          aria-label="Price"
          defaultValue={[200, 750]}
          max={1000}
          step={10}
          minStepsBetweenThumbs={5}
          format={dollars}
        />
        <span className="text-xs text-muted-foreground">Range</span>
      </li>
    </ul>
  );
}
