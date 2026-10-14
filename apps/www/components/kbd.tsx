import { cn } from "@fewtone/ui/lib/utils";
import type { ReactNode } from "react";

/**
 * A key cap for shortcut hints (⌘ K, ↑ ↓, esc): one key per cap, on the page colour with a hairline, centred
 * on a fixed 20px height so it lines up with the text beside it.
 */
export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md border bg-background px-1 font-sans text-caption leading-none text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
