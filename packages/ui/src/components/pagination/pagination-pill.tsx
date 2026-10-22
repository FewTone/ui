"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useId, useLayoutEffect, useRef, useState } from "react";

/*
 * The client parts of Pagination, so the rest stays a server component (links rendered on the server work).
 * - One pill marks the current page and slides to the new one when the page changes (layoutId on
 *   spring.snappy, .agents/rules/motion.md), scoped to each Pagination, so two never trade a pill.
 * - It lies behind the link, inside the list item, rather than inside the link: the link keeps Button's own
 *   hover tint, which is clipped to it, and the pill isn't clipped while it slides.
 * - It starts where it is on first paint. With reduced motion it jumps.
 */

/** One pill per Pagination */
function PaginationGroup({ children }: { children: ReactNode }) {
  const id = useId();
  return <LayoutGroup id={id}>{children}</LayoutGroup>;
}

/** The pill behind the current page's link */
function PaginationPill({ className }: { className?: string }) {
  const reduce = useReducedMotion() ?? false;
  const node = useRef<HTMLSpanElement>(null);
  const [radius, setRadius] = useState<number>();

  // Its corners follow the link's own (read from it), as a number, so motion keeps them true if the pill changes
  // width between pages. The class below draws them until then, including on the server.
  useLayoutEffect(() => {
    const link = node.current?.parentElement?.querySelector("[data-slot=pagination-link]");
    if (link) setRadius(Number.parseFloat(getComputedStyle(link).borderTopLeftRadius) || 0);
  }, []);

  return (
    <motion.span
      ref={node}
      layoutId="pagination-pill"
      aria-hidden
      data-slot="pagination-pill"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 rounded-lg border border-input bg-background",
        className,
      )}
      style={radius === undefined ? undefined : { borderRadius: radius }}
      transition={reduce ? { duration: 0 } : spring.snappy}
    />
  );
}

export { PaginationGroup, PaginationPill };
