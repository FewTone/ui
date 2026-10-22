"use client";

import { blur, duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import type { PreviewTemplate } from "@fewtone/ui/registry/kinds";
import { RotateCcwIcon } from "lucide-react";
import { animate, useReducedMotion } from "motion/react";
import { Tabs } from "radix-ui";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { AutoHeight } from "@/components/motion/auto-height";
import { type SlidingTab, SlidingTabList } from "./sliding-tab-list";
import { tabPanel } from "./tabs-style";

const heights = { sm: "min-h-48", md: "min-h-72", lg: "min-h-96" } as const;

/**
 * Preview / Usage / Code for one demo, framed like the item cards (owner, 2026-10-13): one outer card with a
 * 12px frame holds the switcher row and the panels, and the preview sits on the preview-coloured tile.
 * Switching tabs, the card glides to the new panel's height (AutoHeight), and the new panel fades in while
 * sliding 12px from the side you're moving towards (from the right going Preview → Code). The panels stay
 * mounted, so a demo keeps its state. With reduced motion, the panel only fades.
 * All panels are server-rendered and stay in the HTML. Replay (animated items only) remounts the demo so
 * its entrance plays again.
 */
export function PreviewTabs({
  preview,
  usage,
  code,
  replay,
  height,
  align = "center",
  template,
  zoom,
}: {
  preview: ReactNode;
  usage?: ReactNode;
  code: ReactNode;
  replay: boolean;
  height: keyof typeof heights;
  /** Top keeps a demo whose height changes (Tabs) from re-centring, so its controls stay where they were */
  align?: "center" | "top";
  template: PreviewTemplate;
  /** Shows a small control bigger (CSS zoom); the demo's code stays as written */
  zoom?: number;
}) {
  const [run, setRun] = useState(0);
  const [tab, setTab] = useState("preview");
  const tabs: SlidingTab[] = [
    { value: "preview", label: "Preview" },
    ...(usage ? [{ value: "usage", label: "Usage" }] : []),
    { value: "code", label: "Code" },
  ];

  // The panel that just appeared slides and sharpens in through the blur, before the first paint (so it never
  // flashes in place). The filter is cleared afterwards, so it doesn't leave a stacking context round the demo.
  const reduce = useReducedMotion();
  const panels = useRef(new Map<string, HTMLDivElement>());
  const direction = useRef(0);
  const changed = useRef(false);
  const show = (next: string) => {
    const order = tabs.map((option) => option.value);
    direction.current = order.indexOf(next) > order.indexOf(tab) ? 1 : -1;
    changed.current = true;
    setTab(next);
  };
  useLayoutEffect(() => {
    const node = panels.current.get(tab);
    if (!changed.current || !node) return;
    changed.current = false;
    animate(
      node,
      reduce
        ? { opacity: [0, 1] }
        : { opacity: [0, 1], x: [direction.current * 12, 0], filter: [blur.hidden, blur.shown] },
      { duration: duration.base, ease: ease.out },
    ).then(() => node.style.removeProperty("filter"));
  }, [tab, reduce]);
  const register = (value: string) => (node: HTMLDivElement | null) => {
    if (node) panels.current.set(value, node);
    else panels.current.delete(value);
  };

  return (
    <Tabs.Root
      value={tab}
      onValueChange={show}
      className="grid grid-cols-1 gap-(--space-card-frame) rounded-(--radius-card) bg-card p-(--space-card-frame) shadow-card"
    >
      <SlidingTabList
        label="Example view"
        tabs={tabs}
        value={tab}
        actions={
          replay ? (
            <button
              type="button"
              onClick={() => setRun((value) => value + 1)}
              className="focus-ring inline-flex items-center gap-1.5 rounded-full px-(--space-tab-x) py-(--space-tab-y) text-label text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-preview hover:text-foreground"
            >
              <RotateCcwIcon className="size-(--size-icon-sm)" aria-hidden />
              Replay
            </button>
          ) : null
        }
      />
      <AutoHeight>
        <Tabs.Content ref={register("preview")} value="preview" forceMount className={tabPanel}>
          <div
            className={cn(
              "grid overflow-hidden rounded-xl bg-preview",
              align === "top" ? "content-start justify-items-center" : "place-items-center",
              heights[height],
              template === "centered" && "p-(--space-canvas)",
            )}
          >
            {zoom ? (
              <div key={run} style={{ zoom }}>
                {preview}
              </div>
            ) : (
              <div key={run} className="contents">
                {preview}
              </div>
            )}
          </div>
        </Tabs.Content>
        {usage ? (
          <Tabs.Content ref={register("usage")} value="usage" forceMount className={tabPanel}>
            {usage}
          </Tabs.Content>
        ) : null}
        <Tabs.Content ref={register("code")} value="code" forceMount className={tabPanel}>
          {code}
        </Tabs.Content>
      </AutoHeight>
    </Tabs.Root>
  );
}
