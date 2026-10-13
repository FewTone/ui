"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { CheckIcon, SparklesIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

/**
 * Copies the item's AI prompt (lib/prompt.ts): a brief the user pastes into their coding assistant
 * to add the component safely. A neutral filled button, per the brand rules (primary actions are neutral).
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

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "focus-ring inline-flex h-(--size-control-sm) shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-label text-primary-foreground transition duration-(--duration-fast) ease-out hover:opacity-90 active:scale-(--scale-press)",
        className,
      )}
    >
      <span className="grid size-(--size-icon-sm) place-items-center">
        <AnimatePresence initial={false}>
          <motion.span
            key={copied ? "copied" : "copy"}
            className="col-start-1 row-start-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={spring.snappy}
          >
            {copied ? (
              <CheckIcon className="size-(--size-icon-sm)" aria-hidden />
            ) : (
              <SparklesIcon className="size-(--size-icon-sm)" aria-hidden />
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      {copied ? "Prompt copied" : "Copy prompt"}
      <span className="sr-only" aria-live="polite">
        {copied ? "The prompt is on your clipboard" : ""}
      </span>
    </button>
  );
}
