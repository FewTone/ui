"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import {
  animate,
  motion,
  type Transition,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { Progress as ProgressPrimitive } from "radix-ui";
import { type ComponentProps, useEffect, useRef } from "react";

/*
 * Progress: how far along a task is, as a bar (Progress) or a ring (ProgressRing), both on Radix Progress
 * (role="progressbar" with the value, and no value while it's indeterminate). Owner's roadmap, 2026-10-16.
 * Give each a name with aria-label or aria-labelledby.
 * Motion (.agents/rules/motion.md):
 * - A new value: the bar's fill slides to it (translateX) and the ring's arc draws to it (pathLength). It rises
 *   continuously, not in parts (owner, 2026-10-21): each change takes as long as the gap since the one before,
 *   at an even pace, so updates that keep coming join into one smooth rise and the fill never stops to wait.
 *   A change after a pause eases in on its own (duration.slow, ease.out). Never a spring: its overshoot would
 *   show more than was done, and past 100 at the end. The first paint shows the value as it is.
 * - Indeterminate (`value` null or left out): a segment sweeps across the bar; an arc turns round the ring.
 *   Both are transform loops, which motion hands to the Web Animations API (as Spinner does), so they keep
 *   moving while the page is busy. With reduced motion they stop moving and pulse instead, like Spinner.
 * - ProgressValue, the percentage, counts through every whole number in step with the fill (12, 13, 14…), on
 *   the same timing, so the two never disagree. A deliberate exception to "never a tween through every
 *   number": here the number is the bar read aloud.
 */

/** Radix's rules: a max above 0 (else 100), a value from 0 to max (clamped here rather than refused) */
function percentOf(value: number | null | undefined, max: number | undefined) {
  if (value == null || Number.isNaN(value)) return null;
  const top = max !== undefined && max > 0 ? max : 100;
  return (Math.min(Math.max(value, 0), top) / top) * 100;
}

/** Updates closer together than this join into one continuous rise; further apart, each eases in on its own */
const STEADY = duration.slower * 2;

/**
 * How a change to `target` moves: as long as the gap since the last change, at an even pace, while the changes
 * keep coming; else a quick ease. Progress, its ring and ProgressValue see the same changes at the same moments,
 * so they keep in step.
 */
function useFollow(target: number | null, reduce: boolean): Transition {
  const last = useRef<{ target: number | null; at: number; transition: Transition }>({
    target,
    at: Number.NEGATIVE_INFINITY,
    transition: { duration: 0 },
  });
  if (target !== last.current.target) {
    const now = typeof performance === "undefined" ? 0 : performance.now();
    const gap = (now - last.current.at) / 1000;
    const transition: Transition = reduce
      ? { duration: 0 }
      : gap <= STEADY
        ? { duration: gap, ease: "linear" }
        : { duration: duration.slow, ease: ease.out };
    last.current = { target, at: now, transition };
  }
  return last.current.transition;
}

/** The indeterminate loops: a calm sweep, and Spinner's pulse with reduced motion */
const sweep = { duration: duration.slower * 3, ease: ease.inOut, repeat: Number.POSITIVE_INFINITY };
const turn = { duration: duration.slower * 3, ease: "linear", repeat: Number.POSITIVE_INFINITY } as const;
const pulse = { duration: duration.slower * 3, ease: ease.inOut, repeat: Number.POSITIVE_INFINITY };

export type ProgressProps = ComponentProps<typeof ProgressPrimitive.Root>;

/**
 * A bar, built on Radix Progress. `value` from 0 to `max` (100); leave it out, or pass null, while there's
 * no telling how long the task will take.
 */
function Progress({ className, value, max, ...props }: ProgressProps) {
  const percent = percentOf(value, max);
  const top = max !== undefined && max > 0 ? max : 100;
  const reduce = useReducedMotion() ?? false;
  const follow = useFollow(percent, reduce);

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      value={percent === null ? null : (percent / 100) * top}
      max={top}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)}
      {...props}
    >
      {percent === null ? (
        <ProgressPrimitive.Indicator asChild>
          {/* A segment 40% of the track wide, from just off the start to just off the end (250% of itself) */}
          <motion.div
            key={reduce ? "pulse" : "sweep"}
            data-slot="progress-indicator"
            className={cn(
              "absolute inset-y-0 w-2/5 rounded-full bg-primary",
              reduce ? "left-1/2 -translate-x-1/2" : "left-0",
            )}
            animate={
              reduce ? { opacity: [1, 0.4, 1] } : { transform: ["translateX(-100%)", "translateX(250%)"] }
            }
            transition={reduce ? pulse : sweep}
          />
        </ProgressPrimitive.Indicator>
      ) : (
        <ProgressPrimitive.Indicator asChild>
          <motion.div
            data-slot="progress-indicator"
            className="size-full rounded-full bg-primary"
            initial={false}
            animate={{ x: `-${100 - percent}%` }}
            transition={follow}
          />
        </ProgressPrimitive.Indicator>
      )}
    </ProgressPrimitive.Root>
  );
}

const progressRingVariants = cva("relative inline-flex shrink-0 items-center justify-center text-primary", {
  variants: {
    size: {
      sm: "size-(--size-icon-lg)",
      md: "size-(--size-control-lg)",
      lg: "size-16 text-sm",
    },
  },
  defaultVariants: { size: "md" },
});

/** Stroke widths on the 24-unit drawing, so the line is about 2.5, 3.3 and 4px at 20, 40 and 64px */
const strokes = { sm: 3, md: 2, lg: 1.5 } as const;

export type ProgressRingProps = Omit<ComponentProps<typeof ProgressPrimitive.Root>, "children"> &
  VariantProps<typeof progressRingVariants> & {
    /** Shows the percentage in the middle, rolling as it changes (md and lg) */
    showValue?: boolean;
  };

/**
 * A ring, built on Radix Progress: the same `value` and `max` as Progress, drawn as an arc that goes round
 * from the top. It takes the text colour (text-primary unless you set another).
 */
function ProgressRing({ className, value, max, size, showValue = false, ...props }: ProgressRingProps) {
  const percent = percentOf(value, max);
  const top = max !== undefined && max > 0 ? max : 100;
  const reduce = useReducedMotion() ?? false;
  const ring = size ?? "md";
  const stroke = strokes[ring];
  const radius = 12 - stroke / 2;
  const indeterminate = percent === null;
  const loop = !indeterminate ? "still" : reduce ? "pulse" : "turn";
  const follow = useFollow(percent, reduce);

  return (
    <ProgressPrimitive.Root
      data-slot="progress-ring"
      data-size={ring}
      value={percent === null ? null : (percent / 100) * top}
      max={top}
      className={cn(progressRingVariants({ size }), className)}
      {...props}
    >
      <ProgressPrimitive.Indicator asChild>
        {/* The drawing turns inside the still root, so nothing passed to the ring turns with it */}
        <motion.span
          key={loop}
          data-slot="progress-indicator"
          className="absolute inset-0 inline-flex"
          animate={
            loop === "turn"
              ? { transform: ["rotate(0turn)", "rotate(1turn)"] }
              : loop === "pulse"
                ? { opacity: [1, 0.4, 1] }
                : undefined
          }
          transition={loop === "turn" ? turn : loop === "pulse" ? pulse : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
            <circle cx="12" cy="12" r={radius} stroke="currentColor" strokeWidth={stroke} opacity="0.2" />
            {/* Starts at the top: the rotation is on a group, since a CSS transform would replace it */}
            <g transform="rotate(-90 12 12)">
              <motion.circle
                cx="12"
                cy="12"
                r={radius}
                stroke="currentColor"
                strokeWidth={stroke}
                strokeLinecap="round"
                initial={false}
                // At 0 the round cap would still show a dot, so the arc fades out with its length
                animate={{
                  pathLength: indeterminate ? 0.25 : percent / 100,
                  opacity: indeterminate || percent > 0 ? 1 : 0,
                }}
                transition={follow}
              />
            </g>
          </svg>
        </motion.span>
      </ProgressPrimitive.Indicator>
      {showValue && percent !== null && ring !== "sm" ? (
        // Positioned, so it paints above the drawing rather than under it
        <ProgressValue value={percent} className={cn("relative", ring === "md" && "text-xs")} />
      ) : null}
    </ProgressPrimitive.Root>
  );
}

export type ProgressValueProps = Omit<ComponentProps<"span">, "children"> & {
  /** The same value and max as the Progress it labels */
  value?: number | null;
  max?: number;
};

/**
 * The percentage as text, for beside a bar or inside a ring. It counts to a new value in step with the fill.
 * Hidden from screen readers: the progressbar already says its value.
 */
function ProgressValue({ value, max, className, ...props }: ProgressValueProps) {
  const percent = percentOf(value, max);
  const reduce = useReducedMotion() ?? false;
  const follow = useFollow(percent, reduce);
  const count = useMotionValue(percent ?? 0);
  const shown = useTransform(count, (current) => Math.round(current));

  useEffect(() => {
    if (percent === null) return;
    const counting = animate(count, percent, follow);
    return () => counting.stop();
  }, [percent, follow, count]);

  if (percent === null) return null;
  return (
    <span
      aria-hidden
      data-slot="progress-value"
      className={cn("inline-flex font-medium tabular-nums", className)}
      {...props}
    >
      <motion.span>{shown}</motion.span>
      <span>%</span>
    </span>
  );
}

export { Progress, ProgressRing, ProgressValue, progressRingVariants };
