# Select: decisions

- **What it is:** the owner's "Dropdown", chosen as Select (2026-10-13). It is a form field for one value. A dropdown menu of actions would be a separate component.
- **Built on Radix Select:** a select-only combobox with arrow keys, Home/End, typeahead and Escape. It is in `popper` position by default, below the trigger, and flips when there's no room. `item-aligned` stays available.
- **Opening and closing are CSS keyframes** (`animate-popover-in`/`out`), scaling from `--radix-select-content-transform-origin`. Radix wraps Content in Presence, so the exit plays. Content can't stay permanently mounted for JS animation: Radix's dismissable layer would block the page.
- **The gliding highlight:**
  - **How it moves:** a `motion.span` with `layoutId` renders inside the focused option. Radix focuses options on hover and on arrow keys, so one pill follows both.
  - **Fresh each time:** the state lives in a provider inside Content. Radix remounts it each time the list opens, so every opening starts clean, with no pill flying in from a stale spot.
  - **One pill per Select:** a `LayoutGroup id={useId()}` keeps two Selects from sharing a pill.
  - **Scrolling:** the Viewport is a `motion.div` with `layoutScroll`, so the pill stays put while the list scrolls.
  - **Clearing:** blur clears the pill only when focus leaves the options, so moving between options glides instead of flickering.
  - **Reduced motion:** the pill jumps (duration 0).
  - **Stacking (fixed 2026-10-13):** options are not stacking contexts; the content is `isolate`. Otherwise a pill gliding down was painted over the options it passed.
- **Chevron:** it rotates while open via `group-data-[state=open]:rotate-180`.
- **Not built yet:** a multi-select, a searchable combobox, and a native `<select>` fallback.
