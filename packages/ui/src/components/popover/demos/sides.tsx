"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@fewtone/ui/components/popover/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { useId, useState } from "react";

type Align = "start" | "center" | "end";

const sides = [
  { side: "top", label: "Top", opens: "Opens above" },
  { side: "right", label: "Right", opens: "Opens to the right" },
  { side: "bottom", label: "Bottom", opens: "Opens below" },
  { side: "left", label: "Left", opens: "Opens to the left" },
] as const;

const lineUp: Record<Align, string> = {
  start: "lined up with the start of its button",
  center: "centred on its button",
  end: "lined up with the end of its button",
};

/*
 * One popover per side, with the alignment in the top-right corner. Each one opens out of its button's
 * edge. An empty row at the bottom, as tall as the setting's row, keeps the buttons centred.
 */
export default function PopoverSides() {
  const id = useId();
  const [align, setAlign] = useState<Align>("center");

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-align`} className="text-sm text-muted-foreground">
          Align
        </label>
        <Select value={align} onValueChange={(value) => setAlign(value as Align)}>
          <SelectTrigger id={`${id}-align`} size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-center gap-3">
        {sides.map(({ side, label, opens }) => (
          <Popover key={side}>
            <PopoverTrigger asChild>
              <Button variant="outline">{label}</Button>
            </PopoverTrigger>
            <PopoverContent side={side} align={align} className="w-56">
              <PopoverHeader>
                <PopoverTitle>{label}</PopoverTitle>
                <PopoverDescription>
                  {opens}, {lineUp[align]}.
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        ))}
      </div>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
