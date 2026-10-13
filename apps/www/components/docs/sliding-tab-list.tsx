"use client";

import { Tabs } from "radix-ui";
import type { ReactNode } from "react";
import { Pill, PillGroup } from "@/components/motion/pill";
import { switchList, switchPill, switchTab } from "./tabs-style";

export type SlidingTab = { value: string; label: string };

/**
 * The tab row for a Radix tab set, in the docs' switcher style (tabs-style.ts): an ink pill glides to the
 * active tab. The Tabs root must be controlled. `actions` sit at the right end of the row (for example Replay).
 */
export function SlidingTabList({
  label,
  tabs,
  value,
  actions,
}: {
  label: string;
  tabs: SlidingTab[];
  value: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-(--space-heading)">
      <PillGroup>
        <Tabs.List aria-label={label} className={switchList}>
          {tabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} className={switchTab}>
              {tab.value === value ? <Pill className={switchPill} /> : null}
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </PillGroup>
      {actions ? <div className="flex items-center">{actions}</div> : null}
    </div>
  );
}
