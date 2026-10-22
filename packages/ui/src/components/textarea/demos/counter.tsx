"use client";

import { Textarea } from "@fewtone/ui/components/textarea/textarea";
import { duration, ease, spring, swap } from "@fewtone/ui/lib/motion";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";

const LIMIT = 160;

/*
 * A character count under the field. Each digit swaps through the blur on its own (Copy Button's swap),
 * rising as the count goes up and falling as it goes down, so typing rolls only the digits that change.
 * A digit that appears or goes (9 → 10) comes and goes the same way. Screen readers get the count as text,
 * linked to the field with aria-describedby.
 */

/** The swap, turned to the count's direction: 1 rises for a higher count, -1 falls for a lower one */
const roll = {
  enter: (direction: number) => ({ ...swap.initial, y: swap.initial.y * direction }),
  shown: swap.animate,
  leave: (direction: number) => ({ ...swap.exit, y: swap.exit.y * direction }),
};
/** With reduced motion, opacity only */
const fade = { enter: { opacity: 0 }, shown: { opacity: 1 }, leave: { opacity: 0 } };

function Count({ value }: { value: number }) {
  const reduce = useReducedMotion() ?? false;
  // Which way the count last moved, updated while rendering (React's pattern for following a prop)
  const [last, setLast] = useState(value);
  const [direction, setDirection] = useState(1);
  if (value !== last) {
    setLast(value);
    setDirection(value > last ? 1 : -1);
  }
  const digits = String(value).split("");
  const variants = reduce ? fade : roll;
  const transition = reduce
    ? { duration: duration.fast }
    : { duration: duration.base, ease: ease.out, y: spring.snappy };
  const swapping = {
    custom: direction,
    variants,
    initial: "enter",
    animate: "shown",
    exit: "leave",
    transition,
  };

  return (
    <span aria-hidden className="inline-flex">
      <AnimatePresence initial={false} custom={direction}>
        {digits.map((digit, index) => {
          // Keyed by place (ones, tens, hundreds), so each digit keeps its slot as the number grows
          const place = digits.length - index;
          return (
            <motion.span key={place} {...swapping} className="inline-grid">
              <AnimatePresence initial={false} custom={direction}>
                {/* Old and new share one cell, so the swap doesn't shift the text */}
                <motion.span key={digit} {...swapping} className="col-start-1 row-start-1">
                  {digit}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          );
        })}
      </AnimatePresence>
    </span>
  );
}

export default function TextareaCounter() {
  const id = useId();
  const [bio, setBio] = useState("Designer and engineer. I build calm, accessible interfaces.");

  return (
    <div className="grid w-full max-w-sm gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Bio
      </label>
      <Textarea
        id={id}
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        maxLength={LIMIT}
        minRows={2}
        maxRows={5}
        aria-describedby={`${id}-hint ${id}-count`}
      />
      <div className="flex items-start justify-between gap-4 text-sm text-muted-foreground">
        <p id={`${id}-hint`}>Shown on your public profile.</p>
        <p id={`${id}-count`} className="shrink-0 tabular-nums">
          <Count value={bio.length} />
          <span aria-hidden>/{LIMIT}</span>
          <span className="sr-only">
            {bio.length} of {LIMIT} characters
          </span>
        </p>
      </div>
    </div>
  );
}
