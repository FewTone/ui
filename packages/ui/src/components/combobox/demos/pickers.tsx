"use client";

import { Combobox, type ComboboxOption } from "@fewtone/ui/components/combobox/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { useId, useState } from "react";

type Size = "sm" | "md";

const frameworks: ComboboxOption[] = [
  { value: "next", label: "Next.js", keywords: ["react", "vercel"] },
  { value: "react-router", label: "React Router", keywords: ["remix", "react"] },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
  { value: "sveltekit", label: "SvelteKit", keywords: ["svelte"] },
  { value: "solid-start", label: "SolidStart", keywords: ["solid"] },
  { value: "tanstack-start", label: "TanStack Start", keywords: ["react", "tanstack"] },
];

const labels: ComboboxOption[] = [
  { value: "bug", label: "Bug" },
  { value: "feature", label: "Feature" },
  { value: "docs", label: "Docs", keywords: ["documentation"] },
  { value: "design", label: "Design" },
  { value: "performance", label: "Performance", keywords: ["speed", "perf"] },
  { value: "accessibility", label: "Accessibility", keywords: ["a11y"] },
  { value: "good-first-issue", label: "Good first issue" },
  { value: "help-wanted", label: "Help wanted" },
];

/*
 * One value and several side by side, each named underneath, with the size in the top-right corner. An empty
 * row at the bottom, as tall as the setting's row, keeps them centred.
 */
export default function ComboboxPickers() {
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

      <div className="grid flex-1 content-center justify-center gap-x-10 gap-y-6 sm:grid-cols-2">
        <div className="grid w-64 max-w-full content-start gap-2">
          <label htmlFor={`${id}-framework`} className="text-sm font-medium">
            Framework
          </label>
          <Combobox
            id={`${id}-framework`}
            size={size}
            options={frameworks}
            defaultValue="next"
            placeholder="Pick a framework"
            emptyText="No framework found."
          />
          <span className="text-xs text-muted-foreground">One value</span>
        </div>
        <div className="grid w-64 max-w-full content-start gap-2">
          <label htmlFor={`${id}-labels`} className="text-sm font-medium">
            Labels
          </label>
          <Combobox
            id={`${id}-labels`}
            multiple
            size={size}
            options={labels}
            defaultValue={["bug", "design"]}
            placeholder="Add labels"
            emptyText="No label found."
          />
          <span className="text-xs text-muted-foreground">Several, as chips</span>
        </div>
      </div>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
