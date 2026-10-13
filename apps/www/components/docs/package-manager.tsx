"use client";

import { cn } from "@fewtone/ui/lib/utils";
import { useState, useSyncExternalStore } from "react";
import { PillGroup, Underline } from "@/components/motion/pill";
import { type PackageManager, packageManagers } from "@/lib/install";
import { CopyButton } from "./copy-button";

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

/** A shell command with a package-manager switch and a copy button */
export function Command({ commands }: { commands: Record<PackageManager, string> }) {
  const manager = usePackageManager();
  const command = commands[manager];
  // The stored choice arrives after hydration; the pill only glides once the user has picked
  const [picked, setPicked] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border bg-muted">
      {/* The same underline tabs as Preview / Code, sitting on the block's header rule */}
      <div className="flex items-end justify-between gap-2 border-b px-(--space-code-x)">
        <PillGroup>
          <fieldset className="relative isolate flex items-end gap-(--space-tab-gap)">
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
                className={cn(
                  "focus-ring relative py-(--space-tab-pad) font-mono text-caption text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground",
                  manager === option && "text-foreground",
                )}
              >
                {option}
                {manager === option ? <Underline instant={!picked} /> : null}
              </button>
            ))}
          </fieldset>
        </PillGroup>
        <CopyButton value={command} label="Copy command" className="mb-1.5 self-center" />
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
