import { cn } from "@fewtone/ui/lib/utils";

export type Status = "Beta" | "Draft";

/**
 * Status signals (there are no "New" tags, owner 2026-10-14). "Beta" is one of the few places the brand
 * colour appears (AGENTS.md rule 2):
 * a solid Navy edge with two light shines travelling round it (the `edge-shine` utility, owner 2026-10-13).
 * The badge is transparent inside, so it sits on any surface. "Draft" is neutral, since it only shows in
 * development.
 */
export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-caption leading-none",
        status === "Draft"
          ? "border border-transparent bg-muted text-muted-foreground"
          : "edge-shine text-foreground",
        className,
      )}
    >
      {status}
    </span>
  );
}
