"use client";

import { LoadingButton } from "@fewtone/ui/components/loading-button/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { useId, useState } from "react";

const delays = [
  { ms: "800", label: "Quick · 0.8s" },
  { ms: "1500", label: "Medium · 1.5s" },
  { ms: "3000", label: "Slow · 3s" },
];

/** Pretend work that settles after `ms`, one way or the other */
const work = (ms: number, succeed: boolean) =>
  new Promise<void>((resolve, reject) =>
    setTimeout(() => (succeed ? resolve() : reject(new Error("Failed"))), ms),
  );

export default function LoadingButtonAsync() {
  const id = useId();
  const [delay, setDelay] = useState("1500");

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-delay`} className="text-sm text-muted-foreground">
          Work takes
        </label>
        <Select value={delay} onValueChange={setDelay}>
          <SelectTrigger id={`${id}-delay`} size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {delays.map((option) => (
              <SelectItem key={option.ms} value={option.ms}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 flex-wrap items-start justify-center gap-x-6 gap-y-4">
        <div className="flex flex-col items-center gap-1.5">
          <LoadingButton
            onClick={() => work(Number(delay), true)}
            loadingText="Saving…"
            successText="Saved"
            aria-describedby={`${id}-saves`}
          >
            Save changes
          </LoadingButton>
          <span id={`${id}-saves`} className="text-xs text-muted-foreground">
            Succeeds
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <LoadingButton
            variant="outline"
            onClick={() => work(Number(delay), false)}
            loadingText="Publishing…"
            errorText="Try again"
            aria-describedby={`${id}-fails`}
          >
            Publish
          </LoadingButton>
          <span id={`${id}-fails`} className="text-xs text-muted-foreground">
            Fails
          </span>
        </div>
      </div>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
