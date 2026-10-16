# Radio Group: decisions

**Status:** published (owner, 2026-10-15), after a round in the Lab.

- **What it is:** one choice from a few, on Radix Radio Group (`role="radiogroup"`, arrow keys move and select, hidden native radios in forms). The API is shadcn's: `RadioGroup` (`value`, `defaultValue`, `onValueChange`) and `RadioGroupItem` (`value`), plus `size` and `travel`.
- **The ask:** the selected circle jumps between the radios, with other options explored too.
- **The Lab round:**
  - **Compared:** four ways for the dot to travel (Slide, Hop, Stretch, Grow), two looks (Dot, and Filled like Checkbox's fill), and four sets (a list, a row, a grid, plan cards).
  - **Kept:**
    - `travel="slide"` (the default): straight across on `spring.snappy`
    - `travel="stretch"`: the front leaves on `spring.snappy` and the back follows `duration.instant` later, so the dot stretches into a capsule and lands round, like Switch's thumb
    - the Dot look: a ring that turns `primary`, with a dot inside
  - **Rejected:**
    - Hop: along an arc, growing mid-way
    - Grow: the old dot shrinks away as the new one grows in
    - the Filled look
- **How the travelling works:**
  - **At rest:** each radio shows its own dot, so nothing is measured and the page can reflow freely.
  - **On a change:** one shared dot is drawn at the group's level and moves from the old radio's centre to the new one's. Then it hands over to the new radio's own dot in the same frame.
  - **Placing it:** centres come from offsets (layout pixels), not on-screen boxes, so a zoomed or scaled preview doesn't double the movement (the pitfall Switch hit). The dot's size is read from the radio's own dot, so both sizes work with no numbers in the code.
  - **Mid-trip:** a new choice (an arrow key held down) leaves from where the dot's front is. A slide keeps its speed, so it curves to the new radio.
  - **Fixed in the Lab: the first slide overshot** (owner: "only first time it bounces too much"). The dot's position starts at 0 and was placed at the old radio with `set()`, and motion counted that jump as speed for the spring. It's placed with `jump()` now, which resets the speed.
- **First paint and reduced motion:** nothing animates on first paint. With reduced motion the dot moves at once.
- **Sizes:** `sm` 16px and `md` 20px, the same as Checkbox and Switch.
- **Demos:**
  - **Hero:** Slide and Stretch side by side, named underneath, with Size in the top-right corner.
  - **Card demo:** one group, for the index tile.
  - **Examples:** In a row (horizontal), Cards (the card is the label, and its border follows the choice with `has-data-[state=checked]`), Disabled (one option, skipped by the arrow keys).
- **Tests:** a click picks, arrow keys move the choice, visible labels, both ways of travelling, axe.
- **Not built yet:** a card variant inside the component (the Cards example composes it); an error message pattern for a required group.
