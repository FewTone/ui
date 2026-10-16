"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { type ComponentProps, useState } from "react";

/*
 * A checkbox on Radix Checkbox (owner, 2026-10-15).
 * - Motion (.agents/rules/motion.md): the fill grows from the centre as it fades in (CSS, the same `before:`
 *   layer as Button's tint) and the check draws itself in (pathLength, the tiny-stroke exception).
 *   Unchecking is checking played backwards: the check erases, then the fill shrinks and fades. Indeterminate is a dash that draws in the same way;
 *   between checked and indeterminate the fill stays and one mark erases as the other draws.
 * - Nothing animates on first paint. With reduced motion the marks appear and go at once.
 * - The state is held here and always passed to Radix, controlled or not, so the marks know what to draw.
 *   When its form resets, Radix restores the first state through onCheckedChange, so that still works.
 * - Sizes match Switch's track heights (16 and 20px), so the two line up in a form. Flat, no shadow.
 */

const checkboxVariants = cva(
  [
    "peer relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center border border-input bg-transparent text-primary-foreground",
    "transition-colors duration-(--duration-fast) ease-out enabled:hover:border-ring",
    // The fill covers the border, so checked is one solid shape. It grows from 60% as it fades in (owner,
    // 2026-10-15: "the BG can also animate a little"). Unchecking, it waits for the check to start erasing, then
    // shrinks and fades a little quicker.
    "before:pointer-events-none before:absolute before:-inset-px before:-z-10 before:bg-primary before:opacity-0 before:scale-60",
    "before:transition before:duration-(--duration-fast) before:ease-in data-[state=unchecked]:before:delay-(--duration-instant)",
    "not-data-[state=unchecked]:before:scale-100 not-data-[state=unchecked]:before:opacity-100 not-data-[state=unchecked]:before:duration-(--duration-base) not-data-[state=unchecked]:before:ease-out",
    "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    "aria-invalid:border-destructive aria-invalid:outline-destructive",
    "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
  ],
  {
    variants: {
      size: {
        sm: "size-4 rounded-xs before:rounded-xs",
        md: "size-5 rounded-sm before:rounded-sm",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/** The same check as Copy Button and Loading Button, and a dash for indeterminate */
const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const DASH = "M7 12h10";

/**
 * A mark that draws itself in, after the fill has started, and erases the way it came. Its opacity goes
 * with it, so a round cap never leaves a dot behind.
 */
function Mark({ d, shown, reduce }: { d: string; shown: boolean; reduce: boolean }) {
  return (
    <motion.path
      d={d}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={false}
      animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : shown
            ? {
                pathLength: { duration: duration.base, ease: ease.out, delay: duration.instant },
                opacity: { duration: 0, delay: duration.instant },
              }
            : { duration: duration.fast, ease: ease.in }
      }
    />
  );
}

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkboxVariants>;

/**
 * A checkbox for choices submitted with a form, built on Radix Checkbox (role="checkbox", Space toggles).
 * Set `checked` to "indeterminate" for a select-all box when only some are picked. Give it a visible label
 * (`<label htmlFor>`).
 */
function Checkbox({ className, size, checked, defaultChecked, onCheckedChange, ...props }: CheckboxProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultChecked ?? false);
  const state = checked ?? uncontrolled;
  const reduce = useReducedMotion() ?? false;

  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-size={size ?? "md"}
      checked={state}
      onCheckedChange={(value) => {
        if (checked === undefined) setUncontrolled(value);
        onCheckedChange?.(value);
      }}
      className={cn(checkboxVariants({ size }), className)}
      {...props}
    >
      <svg data-slot="checkbox-indicator" viewBox="0 0 24 24" fill="none" aria-hidden className="size-full">
        <Mark d={CHECK} shown={state === true} reduce={reduce} />
        <Mark d={DASH} shown={state === "indeterminate"} reduce={reduce} />
      </svg>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox, checkboxVariants };
