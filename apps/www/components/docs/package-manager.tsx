"use client";

import { CopyButton } from "@fewtone/ui/components/copy-button/copy-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { cn } from "@fewtone/ui/lib/utils";
import { useState, useSyncExternalStore } from "react";
import { Pill, PillGroup } from "@/components/motion/pill";
import { type PackageManager, packageManagers } from "@/lib/install";
import { switchButton, switchList, switchPill } from "./tabs-style";

/* The chosen package manager is shared by every command on the site and remembered per browser. */
const KEY = "fewtone-package-manager";
const listeners = new Set<() => void>();

function read(): PackageManager {
  try {
    const value = localStorage.getItem(KEY);
    if (value && (packageManagers as readonly string[]).includes(value)) return value as PackageManager;
  } catch {
    // Storage can be blocked
  }
  return "pnpm";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function usePackageManager() {
  return useSyncExternalStore(subscribe, read, () => "pnpm" as PackageManager);
}

function choose(manager: PackageManager) {
  try {
    localStorage.setItem(KEY, manager);
  } catch {
    // Storage can be blocked; the choice still applies until reload
  }
  for (const listener of listeners) listener();
}

/** The library's Copy Button, quiet until hovered; 28px, so it sits 2px inside the 32px chip */
const copy = "size-7 text-muted-foreground hover:text-foreground";

/** A shell command with a package-manager switch (the docs' ink pill, tabs-style.ts) and a copy button */
export function Command({ commands }: { commands: Record<PackageManager, string> }) {
  const manager = usePackageManager();
  const command = commands[manager];
  // The stored choice arrives after hydration; the pill only glides once the user has picked
  const [picked, setPicked] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border bg-muted">
      <div className="flex items-center justify-between gap-2 border-b px-(--space-code-x) py-(--space-bar-y)">
        <PillGroup>
          <fieldset className={switchList}>
            <legend className="sr-only">Package manager</legend>
            {packageManagers.map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={manager === option}
                onClick={() => {
                  setPicked(true);
                  choose(option);
                }}
                className={cn(switchButton, "font-mono text-caption")}
              >
                {manager === option ? <Pill className={switchPill} instant={!picked} /> : null}
                {option}
              </button>
            ))}
          </fieldset>
        </PillGroup>
        <CopyButton value={command} size="icon-sm" aria-label="Copy command" className={copy} />
      </div>
      <pre className="overflow-x-auto px-(--space-code-x) py-(--space-code-y) font-mono text-code">
        <code>
          <span className="text-muted-foreground select-none">$ </span>
          {command}
        </code>
      </pre>
    </div>
  );
}

/**
 * A compact install command for the page header (owner, 2026-10-13), on one line: the
 * package manager (our own Select, with only its border and shadow taken off so it sits inside), the
 * command, and a copy button. The long registry URL is shortened on screen (…/r/select.json); hovering
 * shows the full command, and copying always copies it whole.
 *
 * It wears the secondary colours, like Button's secondary variant, so the filled Copy prompt beside it
 * leads. Spacing: 12px in from the left (as on the buttons beside it), 8px between the parts, and the copy
 * button 2px from the top, bottom and right.
 *
 * Fixed width (owner, 2026-10-13): switching package manager never resizes it. The command is monospaced,
 * so its slot is a width in `ch` matching the longest of the four commands (plus 1ch of room), and the manager's name gets a 4ch
 * slot. On narrow screens the command can still shrink, truncating with an ellipsis.
 */
export function CommandChip({ commands }: { commands: Record<PackageManager, string> }) {
  const manager = usePackageManager();
  const command = commands[manager];
  const shorten = (value: string) => value.replace(/https?:\/\/\S+?(\/r\/\S+)/, "…$1");
  const longest = Math.max(...Object.values(commands).map((value) => shorten(value).length));

  return (
    <div className="inline-flex h-(--size-control-sm) min-w-0 max-w-full items-center gap-2 rounded-lg bg-secondary ps-3 pe-0.5 text-secondary-foreground">
      <Select value={manager} onValueChange={(value) => choose(value as PackageManager)}>
        <SelectTrigger
          size="sm"
          aria-label="Package manager"
          className="h-auto w-auto shrink-0 gap-1 border-0 bg-transparent p-0 font-mono text-caption shadow-none"
        >
          <span className="inline-block text-start" style={{ width: "4ch" }}>
            <SelectValue />
          </span>
        </SelectTrigger>
        <SelectContent>
          {packageManagers.map((option) => (
            <SelectItem key={option} value={option} className="font-mono">
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <code
        title={command}
        className="min-w-0 shrink truncate font-mono text-caption text-muted-foreground"
        style={{ width: `${longest + 1}ch` }}
      >
        {shorten(command)}
      </code>
      <CopyButton value={command} size="icon-sm" aria-label="Copy command" className={copy} />
    </div>
  );
}
