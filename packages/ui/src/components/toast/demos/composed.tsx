"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@fewtone/ui/components/toast/toast";
import { useState } from "react";

/*
 * The parts, for a toast you render yourself: its open state is yours, and it plays its exit when it closes.
 * This one appears at the top centre.
 */
export default function ToastComposed() {
  const [open, setOpen] = useState(false);
  const [scheduled, setScheduled] = useState(true);

  return (
    <ToastProvider>
      <div className="flex flex-col items-center gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setScheduled(true);
            setOpen(true);
          }}
        >
          Schedule meeting
        </Button>
        <span aria-live="polite" className="text-xs text-muted-foreground">
          {scheduled ? "Friday, 10:00" : "Not scheduled"}
        </span>
      </div>
      <Toast open={open} onOpenChange={setOpen}>
        <div className="grid flex-1 gap-0.5">
          <ToastTitle>Meeting scheduled</ToastTitle>
          <ToastDescription>Friday, 10:00 to 11:00</ToastDescription>
        </div>
        <ToastAction altText="Remove the meeting from Friday" onClick={() => setScheduled(false)}>
          Undo
        </ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport position="top-center" />
    </ToastProvider>
  );
}
