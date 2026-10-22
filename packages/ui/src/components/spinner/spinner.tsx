"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { type ComponentProps, useEffect } from "react";

/*
 * A small loading indicator (owner's roadmap, 2026-10-16), redesigned as the infinity the owner chose in the Lab
 * (2026-10-22), ported from it exactly: the same path, line, timings and finish. In the text's colour.
 * - One line travels round and round an infinity at an even pace over a faint track.
 * - `done` shows the task finished: the line stops where it is and grows forward until it fills the whole
 *   infinity, the track fading out under it. Back to loading, it shrinks to a line and travels on.
 * - Motion: the line is a dash along the path (its offset and length), so only the stroke moves. With reduced
 *   motion it doesn't travel: it pulses its opacity instead, and a finish fills at once.
 * - role="status", named "Loading" unless you give it another aria-label, and "Done" once finished (doneLabel).
 *   Inside a button that already says what's happening ("Saving…"), hide it with aria-hidden, or the button's
 *   name would include it.
 * - Sizes are the icon sizes (14, 16 and 20px), so it can stand in for an icon anywhere.
 */

/**
 * The infinity as one continuous stroke (a dash restarts at every subpath, so it couldn't run from one loop into
 * the other): from the centre up into the right loop, round it, back through the centre into the left loop,
 * round it and home
 */
const INFINITY =
  "M12 12C14 9 16 8 18 8A4 4 0 1 1 18 16C16 16 14 15 12 12C10 9 8 8 6 8A4 4 0 1 0 6 16C8 16 10 15 12 12Z";
/** The line's length, in hundredths of the infinity */
const LINE = 24;
/** One second: the old spinner's turn; the line goes round in 1.6 of them */
const TURN = duration.slower * 2;
const forever = { repeat: Number.POSITIVE_INFINITY } as const;

const spinnerVariants = cva("inline-flex shrink-0", {
  variants: {
    size: {
      sm: "size-(--size-icon-sm)",
      md: "size-(--size-icon-md)",
      lg: "size-(--size-icon-lg)",
    },
  },
  defaultVariants: { size: "md" },
});

export type SpinnerProps = ComponentProps<"span"> &
  VariantProps<typeof spinnerVariants> & {
    /** The task is finished: the line fills the whole infinity */
    done?: boolean;
    /** Its name once done, for screen readers */
    doneLabel?: string;
  };

function Spinner({
  className,
  size,
  done = false,
  doneLabel = "Done",
  "aria-label": label = "Loading",
  ...props
}: SpinnerProps) {
  const reduce = useReducedMotion() ?? false;
  // Where the line starts along the infinity, and how long it is, in hundredths
  const offset = useMotionValue(0);
  const length = useMotionValue(done ? 100 : LINE);
  const dasharray = useTransform(length, (line) => `${line} ${Math.max(0, 100 - line)}`);

  useEffect(() => {
    if (done) {
      // It stops where it is and fills forward from there
      const fill = animate(
        length,
        100,
        reduce ? { duration: 0 } : { duration: duration.slower * 1.6, ease: ease.out },
      );
      return () => fill.stop();
    }
    const shrink = animate(
      length,
      LINE,
      reduce ? { duration: 0 } : { duration: duration.slow, ease: ease.out },
    );
    if (reduce) return () => shrink.stop();
    // Round and round at an even pace, on from wherever it is
    const from = offset.get();
    const travel = animate(offset, [from, from - 100], { duration: TURN * 1.6, ease: "linear", ...forever });
    return () => {
      shrink.stop();
      travel.stop();
    };
  }, [done, reduce, offset, length]);

  return (
    <span
      role="status"
      aria-label={done ? doneLabel : label}
      data-slot="spinner"
      data-size={size ?? "md"}
      data-done={done || undefined}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      {/* With reduced motion the drawing pulses while loading; finished, it holds still */}
      <motion.span
        key={reduce && !done ? "pulse" : "still"}
        className="inline-flex size-full"
        animate={reduce && !done ? { opacity: [1, 0.4, 1] } : { opacity: 1 }}
        transition={
          reduce && !done ? { duration: TURN * 1.5, ease: ease.inOut, ...forever } : { duration: 0 }
        }
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
          <motion.path
            d={INFINITY}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinejoin="round"
            initial={false}
            animate={{ opacity: done ? 0 : 0.15 }}
            transition={reduce ? { duration: 0 } : { duration: duration.slower, ease: ease.out }}
          />
          <motion.path
            data-slot="spinner-line"
            d={INFINITY}
            pathLength={100}
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: dasharray, strokeDashoffset: offset }}
          />
        </svg>
      </motion.span>
    </span>
  );
}

export { Spinner, spinnerVariants };
