"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { Toaster, toast } from "@fewtone/ui/components/toast/toast";
import { useId } from "react";

/** Pretend work that settles after a moment, one way or the other */
const work = (succeed: boolean) =>
  new Promise<void>((resolve, reject) =>
    setTimeout(() => (succeed ? resolve() : reject(new Error("Failed"))), 1500),
  );

/*
 * toast.promise shows a spinner until the work settles, then swaps the same toast to the result through the
 * blur, and it closes on its own from then.
 */
export default function ToastPromise() {
  const id = useId();

  return (
    <div className="flex flex-wrap items-start justify-center gap-x-6 gap-y-4">
      <div className="flex flex-col items-center gap-1.5">
        <Button
          onClick={() =>
            toast.promise(work(true), {
              loading: "Saving changes…",
              success: "Changes saved",
              error: "Couldn't save changes",
            })
          }
          aria-describedby={`${id}-saves`}
        >
          Save changes
        </Button>
        <span id={`${id}-saves`} className="text-xs text-muted-foreground">
          Succeeds
        </span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <Button
          variant="outline"
          onClick={() =>
            toast.promise(work(false), {
              loading: "Publishing…",
              success: "Published",
              error: "Couldn't publish",
            })
          }
          aria-describedby={`${id}-fails`}
        >
          Publish
        </Button>
        <span id={`${id}-fails`} className="text-xs text-muted-foreground">
          Fails
        </span>
      </div>
      <Toaster />
    </div>
  );
}
