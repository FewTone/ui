"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { LayoutGroup, motion } from "motion/react";
import { type ReactNode, useId } from "react";

/*
 * Sliding indicators for horizontal sets (tabs, package managers, filters). Render one inside the
 * active item only; motion glides it from the previous item (layoutId).
 *
 * Stacking: the items must NOT be stacking contexts (no `isolate`, no z-index). The set's container
 * is the one `isolate` layer, so the indicator passes behind every item's text in both directions.
 * (With isolated items, an indicator moving forward was painted over the items it passed.)
 */

/** Scopes the indicator to one set, so two sets on a page never trade it. Put `isolate` on the set. */
export function PillGroup({ children }: { children: ReactNode }) {
  return <LayoutGroup id={useId()}>{children}</LayoutGroup>;
}

/**
 * A filled pill behind the active item (sidebar filter). The item needs `relative`.
 * `radius` is a number (px) so motion keeps the corners true while the pill changes width.
 * `instant` skips the glide, for state changes the user didn't make (a stored choice loading).
 */
export function Pill({
  className,
  radius = 9999,
  instant = false,
}: {
  className?: string;
  radius?: number;
  instant?: boolean;
}) {
  return (
    <motion.span
      layoutId="pill"
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 bg-background", className)}
      style={{ borderRadius: radius }}
      transition={instant ? { duration: 0 } : spring.snappy}
    />
  );
}
