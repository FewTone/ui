"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { GradientDrift } from "@fewtone/ui/components/gradient-drift/gradient-drift";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { useId, useState } from "react";

/*
 * A short hero over the drifting field, filling the preview. At 1× the drift is slow enough to read as still at a
 * glance; the speed in the top-right corner shows it moving.
 */
export default function GradientDriftHero() {
  const id = useId();
  const [speed, setSpeed] = useState("1");

  return (
    <section className="relative isolate flex w-full flex-col items-center justify-center gap-4 self-stretch px-6 py-16 text-center">
      <GradientDrift speed={Number(speed)} />

      <div className="absolute end-4 top-4 flex items-center gap-2">
        <label htmlFor={`${id}-speed`} className="text-sm text-muted-foreground">
          Speed
        </label>
        <Select value={speed} onValueChange={setSpeed}>
          <SelectTrigger id={`${id}-speed`} size="sm" className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1×</SelectItem>
            <SelectItem value="2">2×</SelectItem>
            <SelectItem value="4">4×</SelectItem>
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
