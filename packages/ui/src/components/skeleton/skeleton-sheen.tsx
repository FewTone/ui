"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/*
 * The light sweeping across a Skeleton. The only client part of Skeleton, so Skeleton stays server-safe.
 * - How: a band (a gradient one step lighter than the block, fading out at both sides) sits just outside the
 *   block and slides across it. Only `translate` moves, so the browser composites it on its own.
 * - In step: every sheen counts from the page's start (startTime 0 on the document timeline), so skeletons that
 *   mount at different moments still sweep together, as one loading surface.
 * - The pace: a 1.5s sweep, then a 0.5s rest, on ease.inOut. Calm, not a flicker.
 * - With reduced motion nothing moves: a still, muted block. Before hydration it's still too; the sweep starts
 *   once React runs.
 * - The Web Animations API directly, rather than motion: motion doesn't expose an animation's start time, and
 *   that's what keeps every sheen in step.
 */

const period = duration.slower * 4 * 1000;
/** The share of each period spent sweeping; the rest is a pause */
const sweep = 0.75;

function SkeletonSheen() {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduce || typeof node.animate !== "function") return;
    // From the start of the line in either writing direction
    const [from, to] = getComputedStyle(node).direction === "rtl" ? ["100%", "-100%"] : ["-100%", "100%"];
    const animation = node.animate(
      [
        { translate: from, easing: `cubic-bezier(${ease.inOut.join(", ")})` },
        { translate: to, offset: sweep },
        { translate: to },
      ],
      { duration: period, iterations: Number.POSITIVE_INFINITY },
    );
    animation.startTime = 0;
    return () => animation.cancel();
  }, [reduce]);

  return (
    <span
      ref={ref}
      aria-hidden
      data-slot="skeleton-sheen"
      className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-background/60 to-transparent rtl:translate-x-full dark:via-foreground/5"
    />
  );
}

export { SkeletonSheen };
