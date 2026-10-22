"use client";

import { duration } from "@fewtone/ui/lib/motion";
import { useReducedMotion } from "motion/react";
import { type CSSProperties, useEffect, useRef } from "react";

/*
 * The slow pan: the only client part of Line Grid, so the grid itself stays server-safe.
 * - How: the lines' layer slides one cell down and to the right, then starts again. The pattern repeats every
 *   cell, so the restart lands on identical pixels and the loop has no seam. Only the transform moves, so the
 *   browser composites it without repainting.
 * - The pace: a cell every 12s (24 × duration.slower) at speed 1, on a linear curve. It's ambient: steady, never
 *   easing in and out each cell, and slow enough to read as still at a glance.
 * - It only runs while it can be seen: paused off-screen (IntersectionObserver) and while the tab is hidden.
 * - With reduced motion, or speed 0, nothing moves: the plain grid. Before hydration it's still too; the pan
 *   starts from the resting position once React runs, so there's no jump.
 * - The Web Animations API directly: an endless linear loop needs nothing more, and it can pause and play.
 */

/** One cell's trip at speed 1, in ms */
const CELL = duration.slower * 24 * 1000;

function LineGridPan({ size, speed, style }: { size: number; speed: number; style: CSSProperties }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduce || !(speed > 0) || typeof node.animate !== "function") return;
    const animation = node.animate(
      [{ transform: "translate(0px, 0px)" }, { transform: `translate(${size}px, ${size}px)` }],
      { duration: CELL / speed, iterations: Number.POSITIVE_INFINITY, easing: "linear" },
    );

    let onScreen = true;
    const update = () => {
      if (onScreen && !document.hidden) animation.play();
      else animation.pause();
    };
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver((entries) => {
            onScreen = entries.at(-1)?.isIntersecting ?? true;
            update();
          })
        : undefined;
    observer?.observe(node);
    document.addEventListener("visibilitychange", update);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
      animation.cancel();
    };
  }, [reduce, size, speed]);

  return <div ref={ref} data-slot="line-grid-lines" className="absolute" style={style} />;
}

export { LineGridPan };
