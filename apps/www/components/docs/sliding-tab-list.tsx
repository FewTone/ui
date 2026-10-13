"use client";

import { Tabs } from "radix-ui";
import type { ReactNode } from "react";
import { PillGroup, Underline } from "@/components/motion/pill";
import { tabList, tabRow, tabTrigger } from "./tabs-style";

/**
 * Underline tabs for a Radix tab set: the bar glides to the active tab. The Tabs root must be controlled.
 * `actions` sit at the right end of the same row (for example Replay).
 */
export function SlidingTabList({
  label,
  tabs,
  value,
  actions,
}: {
  label: string;
  tabs: { value: string; label: string }[];
  value: string;
  actions?: ReactNode;
}) {
  return (
    <div className={tabRow}>
      <PillGroup>
        <Tabs.List aria-label={label} className={tabList}>
          {tabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value} className={tabTrigger}>
              {tab.label}
              {tab.value === value ? <Underline /> : null}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
      </PillGroup>
      {actions ? <div className="flex items-center pb-1.5">{actions}</div> : null}
    </div>
  );
}
