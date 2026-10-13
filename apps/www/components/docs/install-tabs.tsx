"use client";

import { Tabs } from "radix-ui";
import { type ReactNode, useState } from "react";
import type { PackageManager } from "@/lib/install";
import { CopyPromptButton } from "./copy-prompt-button";
import { Command } from "./package-manager";
import { SlidingTabList } from "./sliding-tab-list";
import { tabPanel } from "./tabs-style";

const tabs = [
  { value: "cli", label: "CLI" },
  { value: "manual", label: "Manual" },
  { value: "prompt", label: "AI prompt" },
];

/** CLI, Manual, or a prompt for the user's AI assistant. All panels are server-rendered. */
export function InstallTabs({
  commands,
  manual,
  prompt,
  title,
}: {
  commands: Record<PackageManager, string>;
  manual: ReactNode;
  prompt: string;
  title: string;
}) {
  const [tab, setTab] = useState("cli");
  return (
    <Tabs.Root value={tab} onValueChange={setTab} className="grid grid-cols-1 gap-(--space-heading)">
      <SlidingTabList label="Installation method" tabs={tabs} value={tab} />
      <Tabs.Content value="cli" forceMount className={tabPanel}>
        <Command commands={commands} />
      </Tabs.Content>
      <Tabs.Content value="manual" forceMount className={tabPanel}>
        {manual}
      </Tabs.Content>
      <Tabs.Content value="prompt" forceMount className={tabPanel}>
        <div className="grid max-w-prose justify-items-start gap-(--space-heading)">
          <p className="text-body-sm text-muted-foreground">
            Paste this into your AI coding assistant (Claude Code, Cursor, Copilot, ChatGPT). It checks your
            project first, installs {title} with the shadcn CLI or by hand, and leaves everything else as it
            is: no overwritten files, no changes to your theme.
          </p>
          <CopyPromptButton prompt={prompt} />
        </div>
      </Tabs.Content>
    </Tabs.Root>
  );
}
