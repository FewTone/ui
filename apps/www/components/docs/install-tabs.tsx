"use client";

import { Tabs } from "radix-ui";
import type { ReactNode } from "react";
import type { PackageManager } from "@/lib/install";
import { Command } from "./package-manager";
import { tabList, tabPanel, tabTrigger } from "./tabs-style";

/** CLI or Manual installation. Both panels are server-rendered; Manual arrives as children. */
export function InstallTabs({
  commands,
  manual,
}: {
  commands: Record<PackageManager, string>;
  manual: ReactNode;
}) {
  return (
    <Tabs.Root defaultValue="cli" className="grid grid-cols-1 gap-4">
      <Tabs.List aria-label="Installation method" className={tabList}>
        <Tabs.Trigger value="cli" className={tabTrigger}>
          CLI
        </Tabs.Trigger>
        <Tabs.Trigger value="manual" className={tabTrigger}>
          Manual
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="cli" forceMount className={tabPanel}>
        <Command commands={commands} />
      </Tabs.Content>
      <Tabs.Content value="manual" forceMount className={tabPanel}>
        {manual}
      </Tabs.Content>
    </Tabs.Root>
  );
}
