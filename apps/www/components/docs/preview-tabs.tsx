"use client";

import { cn } from "@fewtone/ui/lib/utils";
import type { PreviewTemplate } from "@fewtone/ui/registry/kinds";
import { RotateCcwIcon } from "lucide-react";
import { Tabs } from "radix-ui";
import { type ReactNode, useState } from "react";
import { SlidingTabList } from "./sliding-tab-list";
import { tabPanel } from "./tabs-style";

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
  const [tab, setTab] = useState("preview");
  const tabs = [
    { value: "preview", label: "Preview" },
    ...(usage ? [{ value: "usage", label: "Usage" }] : []),
    { value: "code", label: "Code" },
  ];

  return (
    <Tabs.Root value={tab} onValueChange={setTab} className="grid grid-cols-1 gap-(--space-heading)">
      <SlidingTabList
        label="Example view"
        tabs={tabs}
        value={tab}
        actions={
          replay ? (
            <button
              type="button"
              onClick={() => setRun((value) => value + 1)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-label text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground"
            >
              <RotateCcwIcon className="size-(--size-icon-sm)" aria-hidden />
              Replay
            </button>
          ) : null
        }
      />
      <Tabs.Content value="preview" forceMount className={tabPanel}>
        {/* An open canvas: no border or fill, the demo sits on the page */}
        <div
          className={cn(
            "grid place-items-center overflow-hidden rounded-xl",
            heights[height],
            template === "centered" && "p-(--space-canvas)",
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
