# Switch: decisions

- **What it is:** the on/off setting control on Radix Switch (`role="switch"`, `aria-checked`, Space toggles). It is named Switch like shadcn and beUI, with "toggle" as a search keyword (owner, 2026-10-13: build both Switch and Toggle).
- **The thumb glides with motion's `layout`.** The track flips between `justify-start` and `justify-end`, and the thumb (a Radix `Thumb asChild` → `motion.span`) animates between the two positions on `spring.snappy`. Technique adapted from beUI.
  - **No stray animations:** `layoutDependency` is the on and pressed state, so unrelated re-renders never animate it.
  - **Knowing the state:** the component mirrors the checked state (controlled or not) so it knows when the state changed.
- **Press stretch:** while the pointer is down the thumb widens a little (by state, animated by the same layout spring). A numeric `borderRadius` keeps it round while it stretches.
- **Reduced motion:** `useReducedMotion()` sets the transition to 0.
- **Sizes:** `sm | md` (track 28×16 and 36×20).
- **Not built yet:** a label slot inside the component. Demos pair it with `<label htmlFor>` and `aria-describedby` hints.
