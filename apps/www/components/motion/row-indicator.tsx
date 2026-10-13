"use client";

import { duration, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { motion } from "motion/react";
import { type RefObject, useLayoutEffect, useState } from "react";

/*
 * One highlight that glides between the rows of a vertical list, such as the sidebar or search results.
 * It measures the target row against its list and moves on `y` only (transform), so it stays correct
 * inside scrolling containers, where shared-layout animations jump.
 */

export type RowBox = { y: number; height: number };

/** Where `target` sits inside `list`, kept current when the list changes size */
export function useRowBox(list: RefObject<HTMLElement | null>, target: HTMLElement | null): RowBox | null {
  const [box, setBox] = useState<RowBox | null>(null);

  useLayoutEffect(() => {
    const parent = list.current;
    if (!parent || !target) {
      setBox(null);
      return;
    }
    // Layout offsets, not screen rects: they ignore transforms (a dialog scaling in) and scrolling
    const measure = () => {
      let y = 0;
      let node: HTMLElement | null = target;
      while (node && node !== parent) {
        y += node.offsetTop;
        node = node.offsetParent as HTMLElement | null;
      }
      if (node !== parent) {
        // The list isn't the row's positioned ancestor: fall back to screen positions
        y = target.getBoundingClientRect().top - parent.getBoundingClientRect().top;
      }
      setBox({ y, height: target.offsetHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(parent);
    return () => observer.disconnect();
  }, [list, target]);

  return box;
}

/**
 * The highlight itself. Place it inside the list, which needs `relative isolate`.
 * It fades in where it first appears, glides between rows, and fades out when `box` is null.
 * `instant` jumps without gliding (for example while search results change under it).
 */
export function RowIndicator({
  box,
  className,
  instant = false,
}: {
  box: RowBox | null;
  className?: string;
  instant?: boolean;
}) {
  // Remember whether it was showing on the previous render: only then does it glide
  const [wasShown, setWasShown] = useState(false);
  const shown = box !== null;
  if (shown !== wasShown) setWasShown(shown);
  const glide = wasShown && shown && !instant;

  return (
    <motion.span
      aria-hidden
      className={cn("pointer-events-none absolute inset-x-0 top-0 -z-10", className)}
      style={box ? { height: box.height } : undefined}
      initial={false}
      animate={box ? { y: box.y, opacity: 1 } : { opacity: 0 }}
      transition={glide ? spring.snappy : { y: { duration: 0 }, opacity: { duration: duration.fast } }}
    />
  );
}
