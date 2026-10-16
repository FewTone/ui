import type { Transition } from "motion/react";

/*
 * Motion tokens for JavaScript animations (motion/react).
 * Durations and easings mirror the CSS tokens in src/styles/tokens.css;
 * `pnpm check:tokens` fails if the two drift apart.
 */

/** Durations in seconds. Mirrors --duration-* in tokens.css. */
export const duration = {
  instant: 0.08,
  fast: 0.15,
  base: 0.22,
  slow: 0.35,
  slower: 0.5,
} as const;

/** Cubic-bezier easings. Mirrors --ease-* in tokens.css. */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  in: [0.55, 0, 1, 0.45],
  inOut: [0.65, 0, 0.35, 1],
} as const;

/**
 * Named springs: the library's motion voice.
 * - snappy: quick, almost no overshoot. Toggles, tabs, small controls.
 * - smooth: slow and settled. Panels, sidebars, page sections.
 * - bouncy: playful overshoot. Rare, for moments of delight.
 */
export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 38, mass: 1 },
  smooth: { type: "spring", stiffness: 120, damping: 20, mass: 1 },
  bouncy: { type: "spring", stiffness: 300, damping: 15, mass: 1 },
} as const satisfies Record<string, Transition>;

export type SpringName = keyof typeof spring;

/**
 * The blur (owner, 2026-10-15): content that appears, leaves or swaps sharpens in from a 6px blur as it
 * fades, instead of only fading. Pair it with the movement the pattern already has. Not for fills,
 * highlights, hover or anything full-screen (those still fade), and with reduced motion it's opacity only.
 * The CSS keyframes in tokens.css use the same 6px (checked by `pnpm check:tokens`).
 */
export const blur = { hidden: "blur(6px)", shown: "blur(0px)" } as const;

/** Swapping content in place (Loading Button, Copy Button): the new rises 6px from blurred; the old lifts away blurring */
export const swap = {
  initial: { opacity: 0, filter: blur.hidden, y: 6 },
  animate: { opacity: 1, filter: blur.shown, y: 0 },
  exit: { opacity: 0, filter: blur.hidden, y: -6 },
} as const;
