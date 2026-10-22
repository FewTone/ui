"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { NumberTicker } from "@fewtone/ui/components/number-ticker/number-ticker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { MinusIcon, PlusIcon, ShuffleIcon } from "lucide-react";
import { useId, useState } from "react";

/** Values of different lengths, so Shuffle shows places coming and going and the width gliding */
const VALUES = [1248, 98.5, 24501.75, 7, 312480, 3.2];
const formats = {
  currency: { style: "currency", currency: "USD" },
  plain: { maximumFractionDigits: 2 },
} as const satisfies Record<string, Intl.NumberFormatOptions>;
type Format = keyof typeof formats;

/*
 * One big number that changes, the way a price or a balance does: step it down or up, or shuffle to a value of
 * another length. Each change flows from what's on screen: the digits roll, the characters that stay glide to
 * their new places, new ones come in through the blur and the ones that go leave through it. Format in the
 * top-right corner. An empty row at the bottom, as tall as the setting's row, keeps the number centred.
 */
export default function NumberTickerFlow() {
  const id = useId();
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState(VALUES[0] ?? 0);
  const [format, setFormat] = useState<Format>("currency");

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-format`} className="text-sm text-muted-foreground">
          Format
        </label>
        <Select value={format} onValueChange={(next) => setFormat(next as Format)}>
          <SelectTrigger id={`${id}-format`} size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="currency">Currency</SelectItem>
            <SelectItem value="plain">Plain</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <NumberTicker
          value={value}
          from={VALUES[0]}
          format={formats[format]}
          locale="en-US"
          className="text-5xl font-semibold tracking-tight sm:text-6xl"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Decrease by 100"
            onClick={() => setValue((current) => Math.max(0, Math.round((current - 100) * 100) / 100))}
          >
            <MinusIcon aria-hidden />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const next = (index + 1) % VALUES.length;
              setIndex(next);
              setValue(VALUES[next] ?? 0);
            }}
          >
            <ShuffleIcon aria-hidden />
            Shuffle
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Increase by 100"
            onClick={() => setValue((current) => Math.round((current + 100) * 100) / 100)}
          >
            <PlusIcon aria-hidden />
          </Button>
        </div>
      </div>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
