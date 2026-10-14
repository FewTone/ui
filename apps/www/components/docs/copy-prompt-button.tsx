"use client";

import { cn } from "@fewtone/ui/lib/utils";
import { useState } from "react";

/**
 * Copies the item's AI prompt (lib/prompt.ts): a brief the user pastes into their coding assistant
 * to add the component safely. A neutral filled button, per the brand rules (primary actions are neutral).
 * Text only (owner, 2026-10-13). Both labels share one cell, so the button keeps its width when it says
 * "Copied"; the hidden one is skipped by screen readers.
 */
export function CopyPromptButton({ prompt, className }: { prompt: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be blocked; nothing else to do
    }
  }

  const label = "col-start-1 row-start-1 transition-opacity duration-(--duration-fast) ease-out";

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "focus-ring inline-grid h-(--size-control-sm) shrink-0 place-items-center rounded-lg bg-primary px-3 text-label text-primary-foreground transition duration-(--duration-fast) ease-out hover:opacity-90 active:opacity-80",
        className,
      )}
    >
      <span aria-hidden={copied} className={cn(label, copied && "opacity-0")}>
        Copy prompt
      </span>
      <span aria-hidden={!copied} className={cn(label, !copied && "opacity-0")}>
        Copied
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "The prompt is on your clipboard" : ""}
      </span>
    </button>
  );
}
