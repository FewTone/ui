"use client";

import { cn } from "@fewtone/ui/lib/utils";
import type { PreviewTemplate } from "@fewtone/ui/registry/kinds";
import { RotateCcwIcon } from "lucide-react";
import { Tabs } from "radix-ui";
import { type ReactNode, useState } from "react";
import { tabList, tabPanel, tabTrigger } from "./tabs-style";

const heights = { sm: "min-h-48", md: "min-h-72", lg: "min-h-96" } as const;

/**
 * Preview / Usage / Code for one demo. All panels are server-rendered and stay in the HTML.
 * Replay (animated items only) remounts the demo so its entrance plays again.
 */
export function PreviewTabs({
  preview,
  usage,
  code,
  replay,
  height,
  template,
}: {
  preview: ReactNode;
  usage?: ReactNode;
  code: ReactNode;
  replay: boolean;
  height: keyof typeof heights;
  template: PreviewTemplate;
}) {
  const [run, setRun] = useState(0);

  return (
    <Tabs.Root defaultValue="preview" className="grid grid-cols-1 gap-3">
      <div className="flex items-center justify-between gap-3">
        <Tabs.List aria-label="Example view" className={tabList}>
          <Tabs.Trigger value="preview" className={tabTrigger}>
            Preview
          </Tabs.Trigger>
          {usage ? (
            <Tabs.Trigger value="usage" className={tabTrigger}>
              Usage
            </Tabs.Trigger>
          ) : null}
          <Tabs.Trigger value="code" className={tabTrigger}>
            Code
          </Tabs.Trigger>
        </Tabs.List>
        {replay ? (
          <button
            type="button"
            onClick={() => setRun((value) => value + 1)}
            className="focus-ring inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground"
          >
            <RotateCcwIcon className="size-(--size-icon-sm)" aria-hidden />
            Replay
          </button>
        ) : null}
      </div>
      <Tabs.Content value="preview" forceMount className={tabPanel}>
        <div
          className={cn(
            "grid place-items-center overflow-hidden rounded-xl border bg-card",
            heights[height],
            template === "centered" && "p-10",
          )}
        >
          <div key={run} className="contents">
            {preview}
          </div>
        </div>
      </Tabs.Content>
      {usage ? (
        <Tabs.Content value="usage" forceMount className={tabPanel}>
          {usage}
        </Tabs.Content>
      ) : null}
      <Tabs.Content value="code" forceMount className={tabPanel}>
        {code}
      </Tabs.Content>
    </Tabs.Root>
  );
}
