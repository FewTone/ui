"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";

/*
 * A small loading indicator (owner's roadmap, 2026-10-16), the same one Loading Button turns: a faint ring with
 * an arc going round it, in the text's colour.
 * - Motion: one turn a second at a constant speed. The whole drawing turns as a transform, which motion hands to
 *   the Web Animations API, so it keeps turning while the page is busy (exactly when a spinner shows). With
 *   reduced motion it doesn't turn: it pulses its opacity instead.
 * - The drawing turns inside a still wrapper, so nothing passed to the spinner (margins, classes) turns with it.
 * - role="status", named "Loading" unless you give it another aria-label. Inside a button that already says
 *   what's happening ("Saving…"), hide it with aria-hidden, or the button's name would include it.
 * - Sizes are the icon sizes (14, 16 and 20px), so it can stand in for an icon anywhere.
 */

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

export type SpinnerProps = ComponentProps<"span"> & VariantProps<typeof spinnerVariants>;

function Spinner({ className, size, "aria-label": label = "Loading", ...props }: SpinnerProps) {
  const reduce = useReducedMotion() ?? false;
  return (
    <span
      role="status"
      aria-label={label}
      data-slot="spinner"
      data-size={size ?? "md"}
      className={cn(spinnerVariants({ size }), className)}
      {...props}
    >
      <motion.span
        // Switching between turning and pulsing starts the new loop afresh
        key={reduce ? "pulse" : "turn"}
        className="inline-flex size-full"
        animate={reduce ? { opacity: [1, 0.4, 1] } : { transform: ["rotate(0turn)", "rotate(1turn)"] }}
        transition={
          reduce
            ? { duration: duration.slower * 3, ease: ease.inOut, repeat: Number.POSITIVE_INFINITY }
            : { duration: duration.slower * 2, ease: "linear", repeat: Number.POSITIVE_INFINITY }
        }
      >
        <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </motion.span>
    </span>
  );
}

export { Spinner, spinnerVariants };
