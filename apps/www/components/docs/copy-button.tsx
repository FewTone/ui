"use client";

import { cn } from "@fewtone/ui/lib/utils";
import { CheckIcon, CopyIcon } from "lucide-react";
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
      {copied ? (
        <CheckIcon className="size-(--size-icon-sm)" aria-hidden />
      ) : (
        <CopyIcon className="size-(--size-icon-sm)" aria-hidden />
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied" : ""}
      </span>
    </button>
  );
}
