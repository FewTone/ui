"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { Toaster, type ToastPosition, toast } from "@fewtone/ui/components/toast/toast";
import { useId, useState } from "react";

const positions: { value: ToastPosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top centre" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom centre" },
  { value: "bottom-right", label: "Bottom right" },
];

/*
 * One button per kind of toast, with the corner they appear in at the top right. Show a few in a row to see
 * them stack, then hover them to fan them out.
 */
export default function ToastTypes() {
  const id = useId();
  const [position, setPosition] = useState<ToastPosition>("bottom-right");

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-position`} className="text-sm text-muted-foreground">
          Position
        </label>
        <Select value={position} onValueChange={(value) => setPosition(value as ToastPosition)}>
          <SelectTrigger id={`${id}-position`} size="sm" className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {positions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 flex-wrap items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => toast("Event created", { description: "Friday, 10:00 to 11:00" })}
        >
          Default
        </Button>
        <Button variant="outline" onClick={() => toast.success("Changes saved")}>
          Success
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.error("Couldn't save changes", { description: "Check your connection and try again." })
          }
        >
          Error
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast("Message archived", {
              action: { label: "Undo", onClick: () => toast("Message restored") },
            })
          }
        >
          With action
        </Button>
      </div>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
      <Toaster position={position} />
    </div>
  );
}
