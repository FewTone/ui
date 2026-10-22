"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { DotGrid } from "@fewtone/ui/components/dot-grid/dot-grid";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { useId, useState } from "react";

/*
 * A short hero over the grid, filling the preview. Move the mouse over it: the dots near the pointer brighten.
 * The spacing between dots is in the top-right corner.
 */
export default function DotGridHero() {
  const id = useId();
  const [size, setSize] = useState("16");

  return (
    <section className="relative isolate flex w-full flex-col items-center justify-center gap-4 self-stretch px-6 py-16 text-center">
      <DotGrid size={Number(size)} highlight />

      <div className="absolute end-4 top-4 flex items-center gap-2">
        <label htmlFor={`${id}-size`} className="text-sm text-muted-foreground">
          Spacing
        </label>
        <Select value={size} onValueChange={setSize}>
          <SelectTrigger id={`${id}-size`} size="sm" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="12">12px</SelectItem>
            <SelectItem value="16">16px</SelectItem>
            <SelectItem value="24">24px</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <h3 className="text-base font-semibold text-balance">Ship your next idea</h3>
      <p className="max-w-xs text-sm text-balance text-muted-foreground">
        Accessible React components for Next.js, ready to copy into your project.
      </p>
      <Button>Get started</Button>
    </section>
  );
}
