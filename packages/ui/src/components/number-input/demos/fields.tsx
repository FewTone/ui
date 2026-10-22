"use client";

import { NumberInput } from "@fewtone/ui/components/number-input/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { useId, useState } from "react";

type Size = "sm" | "md" | "lg";

/*
 * A quantity and a price side by side, named underneath, with the size in the top-right corner. An empty
 * row at the bottom, as tall as the setting's row, keeps them centred.
 */
export default function NumberInputFields() {
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
        <li className="flex flex-col items-center gap-2">
          <NumberInput aria-label="Quantity" defaultValue={1} min={1} max={99} size={size} className="w-32" />
          <span className="text-xs text-muted-foreground">Quantity</span>
        </li>
        <li className="flex flex-col items-center gap-2">
          <NumberInput
            aria-label="Price"
            defaultValue={24}
            min={0}
            step={0.5}
            largeStep={10}
            locale="en-US"
            format={{ style: "currency", currency: "USD" }}
            size={size}
            className="w-40"
          />
          <span className="text-xs text-muted-foreground">Price</span>
        </li>
      </ul>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
