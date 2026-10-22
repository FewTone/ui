"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@fewtone/ui/components/tooltip/tooltip";
import {
  DownloadIcon,
  type LucideIcon,
  MessageSquarePlusIcon,
  Redo2Icon,
  Share2Icon,
  Undo2Icon,
} from "lucide-react";
import { Fragment, useId, useState } from "react";

type Side = "top" | "right" | "bottom" | "left";

const groups: { label: string; icon: LucideIcon }[][] = [
  [
    { label: "Undo", icon: Undo2Icon },
    { label: "Redo", icon: Redo2Icon },
  ],
  [
    { label: "Add a comment", icon: MessageSquarePlusIcon },
    { label: "Share", icon: Share2Icon },
    { label: "Download", icon: DownloadIcon },
  ],
];

/*
 * A toolbar of icon buttons, each with a tooltip, and the side in the top-right corner. Hover one, then move
 * along the row: the next tooltips appear at once. An empty row at the bottom, as tall as the setting's
 * row, keeps the toolbar centred.
 */
export default function TooltipToolbar() {
  const id = useId();
  const [side, setSide] = useState<Side>("top");

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-side`} className="text-sm text-muted-foreground">
          Side
        </label>
        <Select value={side} onValueChange={(value) => setSide(value as Side)}>
          <SelectTrigger id={`${id}-side`} size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
            <SelectItem value="left">Left</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 items-center justify-center">
        {/* One provider for the row, so its tooltips share the delay and hand over to each other */}
        <TooltipProvider>
          <div className="flex items-center gap-1">
            {groups.map((group, index) => (
              <Fragment key={group[0]?.label}>
                {index > 0 ? <div aria-hidden className="mx-1 h-5 w-px bg-border" /> : null}
                {group.map(({ label, icon: Icon }) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label={label}>
                        <Icon aria-hidden />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side={side}>{label}</TooltipContent>
                  </Tooltip>
                ))}
              </Fragment>
            ))}
          </div>
        </TooltipProvider>
      </div>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
