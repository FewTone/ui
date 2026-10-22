"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { Spinner } from "@fewtone/ui/components/spinner/spinner";
import { useState } from "react";

/* The finish: done fills the whole infinity. The row is the status, so it's read as its text. */
export default function SpinnerFinish() {
  const [done, setDone] = useState(false);
  return (
    <div className="flex flex-col items-center gap-4">
      <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner aria-hidden done={done} />
        {done ? "Saved" : "Saving…"}
      </div>
      <Button variant="outline" size="sm" onClick={() => setDone((current) => !current)}>
        {done ? "Restart" : "Finish"}
      </Button>
    </div>
  );
}
