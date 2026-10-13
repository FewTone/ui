"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { motion, type Transition, useReducedMotion } from "motion/react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

/**
 * Smoothly resizes to fit its content whenever the content changes height: a tab set showing another
 * panel, a section opening (owner, 2026-10-13). The one place the site animates height rather than only
 * transform and opacity (AGENTS.md rule 4): only this wrapper moves, on an eased tween (a spring's
 * overshoot would bounce the page below), and it's instant with reduced motion.
 *
 * The content is clipped only while it moves, so focus rings and shadows aren't cut off at rest.
 */
export function AutoHeight({
  children,
  className,
  transition = { duration: duration.slow, ease: ease.out },
}: {
  children: ReactNode;
  className?: string;
  transition?: Transition;
}) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const [moving, setMoving] = useState(false);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      className={cn(moving && "overflow-hidden", className)}
      initial={false}
      animate={{ height }}
      transition={reduce ? { duration: 0 } : transition}
      onAnimationStart={() => setMoving(true)}
      onAnimationComplete={() => setMoving(false)}
    >
      <div ref={inner}>{children}</div>
    </motion.div>
  );
}
