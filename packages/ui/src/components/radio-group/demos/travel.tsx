"use client";

import {
  RadioGroup,
  RadioGroupItem,
  type RadioGroupTravel,
} from "@fewtone/ui/components/radio-group/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { useId, useState } from "react";

type Size = "sm" | "md";

const travels: { travel: RadioGroupTravel; label: string }[] = [
  { travel: "slide", label: "Slide" },
  { travel: "stretch", label: "Stretch" },
];
const options = ["Default", "Comfortable", "Compact"];

/*
 * Both ways of travelling side by side, named underneath, with the size in the top-right corner. An empty
 * row at the bottom, as tall as the setting's row, keeps them centred.
 */
export default function RadioGroupTravelDemo() {
  const id = useId();
  const [size, setSize] = useState<Size>("md");

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-size`} className="text-sm text-muted-foreground">
          Size
        </label>
        <Select value={size} onValueChange={(value) => setSize(value as Size)}>
          <SelectTrigger id={`${id}-size`} size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-16 gap-y-8">
        {travels.map(({ travel, label }) => (
          <li key={travel} className="flex flex-col items-center gap-4">
            <RadioGroup
              defaultValue="comfortable"
              travel={travel}
              size={size}
              aria-label={`Density, ${label.toLowerCase()}`}
            >
              {options.map((option) => (
                <div key={option} className="flex items-center gap-3">
                  <RadioGroupItem id={`${id}-${travel}-${option}`} value={option.toLowerCase()} />
                  <label htmlFor={`${id}-${travel}-${option}`} className="text-sm">
                    {option}
                  </label>
                </div>
              ))}
            </RadioGroup>
            <span className="text-xs text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
