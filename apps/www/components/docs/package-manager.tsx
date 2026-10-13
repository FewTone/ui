"use client";

import { cn } from "@fewtone/ui/lib/utils";
import { useSyncExternalStore } from "react";
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

  return (
    <div className="overflow-hidden rounded-xl border bg-muted">
      <div className="flex items-center justify-between gap-2 border-b px-(--space-bar-x) py-(--space-bar-y)">
        <fieldset className="flex gap-(--space-tabs)">
          <legend className="sr-only">Package manager</legend>
          {packageManagers.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={manager === option}
              onClick={() => choose(option)}
              className={cn(
                "focus-ring rounded-md border border-transparent px-(--space-nav-item-x) py-(--space-nav-item-y) font-mono text-caption text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground",
                manager === option && "border-border bg-background text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </fieldset>
        <CopyButton value={command} label="Copy command" />
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
