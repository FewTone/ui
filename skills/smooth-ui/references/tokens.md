# Motion tokens

One small set of values, defined once and used everywhere. Paste the CSS into the project's global stylesheet and the JavaScript into one shared module (for example `lib/motion.ts`). Keep the two in step: the durations and easings must match.

If the project already has motion tokens, map these patterns onto its values instead of adding a second set.

## Durations

| Token | Value | Use it for |
|---|---|---|
| instant | 80ms | a popover closing, a stagger step, a beat between two parts of one change |
| fast | 150ms | hover and colour changes, exits, a popover opening |
| base | 220ms | most entrances and swaps, dialogs leaving |
| slow | 350ms | height glides, list items rising, things travelling a distance |
| slower | 500ms | long journeys, a head-shake, the base unit for loops (1s spinner turn = 2 × slower) |

Full-screen effects (a theme reveal crossing the screen) can run 450–1000ms; nothing else should exceed 500ms.

## Easings

| Token | Curve | Use it for |
|---|---|---|
| ease-out | `cubic-bezier(0.22, 1, 0.36, 1)` | anything arriving, opening or settling (the default) |
| ease-in | `cubic-bezier(0.55, 0, 1, 0.45)` | anything leaving or closing |
| ease-in-out | `cubic-bezier(0.65, 0, 0.35, 1)` | loops, sweeps, a panel narrowing and widening, things that start and stop on screen |
| linear | `linear` | constant motion only: a spinner's turn, a marquee, progress that keeps arriving |

## Springs

| Name | Stiffness / damping / mass | Feel | Use it for |
|---|---|---|---|
| snappy | 520 / 38 / 1 | quick, about 1% overshoot | small controls: indicators, thumbs, highlights, toggles, chevrons, a dialog's scale |
| smooth | 120 / 20 / 1 | slow and settled, damping ratio ~0.91 (~0.1% overshoot) | panels and sections, including height (it lands without a visible bounce) |
| bouncy | 300 / 15 / 1 | playful overshoot | rare delight only (a moon swelling in a theme icon); never for UI chrome |

Springs only for position, scale and rotation. Never for opacity or blur (they can overshoot below 0), never for a size, a progress value or anything at a screen edge without room for the overshoot.

## The blur

`6px`. Content that appears sharpens from `blur(6px)` to `blur(0px)` as it fades in; content that leaves blurs back to 6px as it fades out. Pair it with the movement the pattern has: a 6px rise for swaps, a 12px rise for list items, a 96% scale for popovers and dialogs, a 12px slide for directional panels.

Opacity and blur run on a tween (duration + ease), even when the movement beside them runs on a spring.

## CSS (Tailwind v4 shown; plain CSS works the same)

```css
:root {
  --duration-instant: 80ms;
  --duration-fast: 150ms;
  --duration-base: 220ms;
  --duration-slow: 350ms;
  --duration-slower: 500ms;
}

/* Reduced motion: every CSS animation and transition built on the tokens becomes instant */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 1ms;
    --duration-fast: 1ms;
    --duration-base: 1ms;
    --duration-slow: 1ms;
    --duration-slower: 1ms;
  }
}

@theme {
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-in: cubic-bezier(0.55, 0, 1, 0.45);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

  /* Content that comes and goes */
  --animate-blur-in: blur-in var(--duration-base) var(--ease-out) both;
  --animate-blur-out: blur-out var(--duration-fast) var(--ease-in) both;
  --animate-rise-in: rise-in var(--duration-slow) var(--ease-out) both;
  /* Floating surfaces (popover, menu, select, tooltip): scale from their trigger's side */
  --animate-popover-in: popover-in var(--duration-fast) var(--ease-out) both;
  --animate-popover-out: popover-out var(--duration-instant) var(--ease-in) both;
  /* Sections that open and close; set --collapsible-height to the content's measured height */
  --animate-collapsible-open: collapsible-open var(--duration-slow) var(--ease-out);
  --animate-collapsible-close: collapsible-close var(--duration-base) var(--ease-in) both;

  @keyframes blur-in {
    from { opacity: 0; filter: blur(6px); }
    to { opacity: 1; filter: blur(0); }
  }
  @keyframes blur-out {
    from { opacity: 1; filter: blur(0); }
    to { opacity: 0; filter: blur(6px); }
  }
  @keyframes rise-in {
    from { opacity: 0; filter: blur(6px); transform: translateY(0.75rem); }
    to { opacity: 1; filter: blur(0); transform: translateY(0); }
  }
  @keyframes popover-in {
    from { opacity: 0; filter: blur(6px); transform: scale(0.96); }
    to { opacity: 1; filter: blur(0); transform: scale(1); }
  }
  @keyframes popover-out {
    from { opacity: 1; filter: blur(0); transform: scale(1); }
    to { opacity: 0; filter: blur(6px); transform: scale(0.96); }
  }
  @keyframes collapsible-open {
    from { height: 0; opacity: 0; filter: blur(6px); }
    to { height: var(--collapsible-height); opacity: 1; filter: blur(0); }
  }
  @keyframes collapsible-close {
    from { height: var(--collapsible-height); opacity: 1; filter: blur(0); }
    to { height: 0; opacity: 0; filter: blur(6px); }
  }
}
```

Notes:
- `collapsible-open` has no fill mode on purpose: once open, the height goes back to `auto`.
- For a popover, set `transform-origin` to the side of the trigger it opened from. Radix exposes it as `--radix-popover-content-transform-origin` (and `-select-`, `-dropdown-menu-`, `-tooltip-`…).
- In Tailwind: `duration-(--duration-fast) ease-out`, `animate-popover-in`, `data-[state=closed]:animate-popover-out`.

## JavaScript (motion/react)

```ts
import type { Transition } from "motion/react";

/** Seconds. Mirrors the CSS durations. */
export const duration = { instant: 0.08, fast: 0.15, base: 0.22, slow: 0.35, slower: 0.5 } as const;

/** Mirrors the CSS easings */
export const ease = {
  out: [0.22, 1, 0.36, 1],
  in: [0.55, 0, 1, 0.45],
  inOut: [0.65, 0, 0.35, 1],
} as const;

export const spring = {
  snappy: { type: "spring", stiffness: 520, damping: 38, mass: 1 },
  smooth: { type: "spring", stiffness: 120, damping: 20, mass: 1 },
  bouncy: { type: "spring", stiffness: 300, damping: 15, mass: 1 },
} as const satisfies Record<string, Transition>;

/** Content that comes and goes sharpens from this blur */
export const blur = { hidden: "blur(6px)", shown: "blur(0px)" } as const;

/** Content swapping in place: the new rises 6px from blurred, the old lifts 6px away blurring */
export const swap = {
  initial: { opacity: 0, filter: blur.hidden, y: 6 },
  animate: { opacity: 1, filter: blur.shown, y: 0 },
  exit: { opacity: 0, filter: blur.hidden, y: -6 },
} as const;
```

With reduced motion in JavaScript, either set `{ duration: 0 }` or use only opacity: `useReducedMotion()` from motion, or `matchMedia("(prefers-reduced-motion: reduce)")`. Where a component doesn't branch, use `blur.shown` as its hidden filter so nothing blurs.

## Other shared values

- **Distances:** 6px for a swap's rise, 8px for a trail level growing out, 12px for list items rising and directional panel slides, 4px for a hover tint rising, 2px for a thumb's hover stretch.
- **Stagger:** 50ms between items. Cap it: past ~8 items, start the rest together.
- **Scale:** 96% for popovers and dialogs entering. Never scale a button on press.
- **Tooltip delay:** 300ms to the first, 300ms hand-over window to the next.
- **Reset after feedback:** 2000ms (a copied check, a saved state) before returning to idle.
- **Control heights:** 32 / 36 / 40px (sm / md / lg) shared by buttons, inputs, selects and toggles so they line up in a row; icons 14 / 16 / 20px.
