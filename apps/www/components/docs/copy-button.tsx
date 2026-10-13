"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function CopyButton({
  value,
  label = "Copy code",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the code is still selectable
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className={cn(
        "focus-ring inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {/* The copy icon turns into a check: both stack in one cell and swap with a quick spring */}
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
              <CopyIcon className="size-(--size-icon-sm)" aria-hidden />
            )}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
