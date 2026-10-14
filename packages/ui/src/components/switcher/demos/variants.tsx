"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { Switcher, SwitcherItem } from "@fewtone/ui/components/switcher/switcher";
import { useId, useState } from "react";

type Size = "sm" | "md" | "lg";

const variants = [
  { variant: "default", label: "Default" },
  { variant: "outline", label: "Outline" },
] as const;

/*
 * Both variants side by side, named underneath, with the size in the top-right corner. An empty row at the
 * bottom, as tall as the setting's row, keeps them centred.
 */
export default function SwitcherVariants() {
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
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul className="flex flex-1 flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {variants.map(({ variant, label }) => (
          <li key={variant} className="flex flex-col items-center gap-2">
            <Switcher
              defaultValue="week"
              variant={variant}
              size={size}
              aria-label={`Range, ${label.toLowerCase()} style`}
            >
              <SwitcherItem value="day">Day</SwitcherItem>
              <SwitcherItem value="week">Week</SwitcherItem>
              <SwitcherItem value="month">Month</SwitcherItem>
              <SwitcherItem value="year">Year</SwitcherItem>
            </Switcher>
            <span className="text-xs text-muted-foreground">{label}</span>
          </li>
        ))}
      </ul>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
