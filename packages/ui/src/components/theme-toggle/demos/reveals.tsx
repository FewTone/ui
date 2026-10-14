"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import {
  type RevealOption,
  type ThemeRevealSpeed,
  ThemeToggle,
} from "@fewtone/ui/components/theme-toggle/theme-toggle";
import { useId, useState } from "react";

const reveals: { reveal: RevealOption; label: string }[] = [
  { reveal: "circle", label: "Circle" },
  { reveal: "shrink", label: "Shrink" },
  { reveal: "ink", label: "Ink" },
  { reveal: "tide", label: "Tide" },
  { reveal: "page-turn", label: "Page turn" },
  { reveal: "fade", label: "Fade" },
  { reveal: "wipe-right", label: "Wipe right" },
  { reveal: "wipe-down", label: "Wipe down" },
  { reveal: "feather", label: "Feather" },
  { reveal: "curtain", label: "Curtain" },
  { reveal: "diagonal", label: "Diagonal" },
  { reveal: "random", label: "Random" },
];

const speeds: { speed: ThemeRevealSpeed; label: string }[] = [
  { speed: "quick", label: "Quick · 450ms" },
  { speed: "medium", label: "Medium · 700ms" },
  { speed: "slow", label: "Slow · 1000ms" },
];

/*
 * Fills the preview: the speed setting in the top-right corner, the toggles in a compact grid in the middle.
 * An empty row at the bottom, as tall as the setting's row, keeps the grid truly centred.
 */
export default function ThemeToggleReveals() {
  const id = useId();
  const [speed, setSpeed] = useState<ThemeRevealSpeed>("medium");

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-speed`} className="text-sm text-muted-foreground">
          Speed
        </label>
        <Select value={speed} onValueChange={(value) => setSpeed(value as ThemeRevealSpeed)}>
          <SelectTrigger id={`${id}-speed`} size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {speeds.map((option) => (
              <SelectItem key={option.speed} value={option.speed}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <ul className="grid w-fit grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-4 lg:grid-cols-6">
          {reveals.map(({ reveal, label }) => (
            <li key={label} className="flex flex-col items-center gap-1.5">
              <ThemeToggle reveal={reveal} speed={speed} aria-describedby={`${id}-${label}`} />
              <span id={`${id}-${label}`} className="text-xs whitespace-nowrap text-muted-foreground">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
