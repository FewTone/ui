"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { Progress, ProgressRing, ProgressValue } from "@fewtone/ui/components/progress/progress";
import { PlayIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Pretend upload: where it's got to at each step */
const steps = [0, 12, 27, 41, 58, 72, 86, 100];

/*
 * A bar and a ring at the same value, and both while indeterminate, named underneath (each row lines its
 * names up at the bottom). Run steps the value from 0 to 100 every 0.7s, and the fill, the arc and the number
 * rise continuously through the steps rather than in parts.
 */
export default function ProgressOverview() {
  const [value, setValue] = useState(64);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  // Leaving the page mid-run stops the steps
  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  const run = () => {
    stop();
    let step = 0;
    setValue(steps[0] ?? 0);
    timer.current = setInterval(() => {
      step += 1;
      const next = steps[step];
      if (next === undefined) stop();
      else setValue(next);
    }, 700);
  };

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end">
        <Button variant="outline" size="sm" onClick={run}>
          <PlayIcon aria-hidden />
          Run
        </Button>
      </div>

      <ul className="mx-auto grid w-full max-w-md flex-1 grid-cols-2 content-center items-end justify-items-center gap-x-10 gap-y-8">
        <li className="flex w-full flex-col items-center gap-2">
          <div className="flex w-full items-center gap-3">
            <Progress value={value} aria-label="Upload" />
            <ProgressValue value={value} className="w-10 justify-end text-xs text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Bar</span>
        </li>
        <li className="flex flex-col items-center gap-2">
          <ProgressRing value={value} size="lg" showValue aria-label="Upload" />
          <span className="text-xs text-muted-foreground">Ring</span>
        </li>
        <li className="flex w-full flex-col items-center gap-2">
          <div className="flex h-4 w-full items-center">
            <Progress aria-label="Loading" />
          </div>
          <span className="text-xs text-muted-foreground">Indeterminate</span>
        </li>
        <li className="flex flex-col items-center gap-2">
          <ProgressRing size="lg" aria-label="Loading" />
          <span className="text-xs text-muted-foreground">Indeterminate</span>
        </li>
      </ul>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
