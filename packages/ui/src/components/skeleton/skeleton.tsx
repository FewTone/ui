import { SkeletonSheen } from "@fewtone/ui/components/skeleton/skeleton-sheen";
import { cn } from "@fewtone/ui/lib/utils";
import type { ComponentProps } from "react";

/*
 * A placeholder block while content loads (owner's roadmap, 2026-10-16), with shadcn's API: one `div` you shape
 * with classes (`h-4 w-40`, `size-10 rounded-full`).
 * - A muted block with a calm sheen sweeping across it: one neutral hue, a step lighter, never a colour. The sheen
 *   lives in SkeletonSheen, a small client part, so Skeleton stays a server component, which is where loading
 *   states usually render (loading.tsx, Suspense fallbacks).
 * - Every skeleton on the page sweeps in step, however late it mounted (see skeleton-sheen.tsx).
 * - With reduced motion it's a still, muted block.
 * - Hidden from screen readers (aria-hidden): a grey block says nothing. Mark the region that's loading with
 *   aria-busy="true" and a visually hidden "Loading…" instead (the demos do).
 */

function Skeleton({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden
      className={cn("relative overflow-hidden rounded-md bg-muted", className)}
      {...props}
    >
      {children}
      <SkeletonSheen />
    </div>
  );
}

export { Skeleton };
