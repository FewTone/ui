# Number Input: decisions

**Status:** published directly, without a Lab step (2026-10-16, roadmap build). Waiting for the owner's review on the dev server.

- **What it is:** a number field with step buttons, following the WAI-ARIA spinbutton pattern. shadcn has no number input, so the API is ours, shaped like the rest of the library: `value` / `defaultValue` / `onValueChange` (a `number | null`, null being empty), `min`, `max`, `step`, `largeStep`, `format`, `locale`, `size`, `incrementLabel`, `decrementLabel`.
- **Built on a native input,** not `type="number"`:
  - `type="text"` with `role="spinbutton"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext` when it's formatted. `inputMode="decimal"` brings up a number keypad; pass `inputMode` to change it.
  - `type="number"` was rejected: it can't show formatted text ($1,250.00), its spinners can't be styled, and the wheel changes it by accident.
  - **Keys:** ArrowUp/ArrowDown step, PageUp/PageDown take `largeStep` (ten steps by default), Home/End go to `min`/`max` (only when they're set; otherwise they move the caret), Enter reads what was typed.
  - **Typing:** a number in range updates the value as you type; anything else waits until you leave the field or press Enter, then it's clamped and formatted. Text with no digits goes back to the last number. Empty is `null`.
  - **Reading text:** group separators, currency signs and spaces are ignored, in the field's locale; a minus anywhere or accounting brackets make it negative; a percent field reads 25 as 0.25.
  - **Decimals:** steps round to the step's and the value's decimal places, so 0.1 + 0.2 shows 0.3.
  - **Forms:** with `name`, a hidden input submits the plain number, not the formatted text.
- **The step buttons:** our `Button`, ghost, `icon-sm` resized to sit 3px inside the field at every size (24, 28, 32px), muted until hovered, at the field's ends (minus first).
  - **Not in the tab order** (`tabIndex={-1}`), as in the APG example: the keys do the same. They don't take focus when pressed, so typing carries on.
  - **Press and hold:** one step on press, then after `duration.slower` one every `duration.instant` (12 a second) until release or a bound. A click from the keyboard or a screen reader (no pointer down) steps once.
  - **At a bound** the button is disabled.
- **Look:** Input's field: control heights, `rounded-lg` (`rounded-md` small), `border-input`, Input's `shadow-xs`. The focus ring goes round the whole field (`has-focus-visible`). Invalid turns the border and ring destructive. The number is centred, with tabular figures.
- **Motion: the number rolls when it steps** (the roadmap's crafted detail):
  - **An odometer, a whole line per digit** (revised 2026-10-21, owner: smoother blur, more noticeable up and down): each character that changes travels out of the field (`y` to ∓100% of its line) as the new one travels in from the other edge (±100% → 0), up for up and down for down. The travel is on `spring.snappy`; the opacity and the blur (6px → 0) on `duration.slow` + `ease.out`, so it sharpens smoothly instead of flickering (it used to be `swap`'s 6px rise over `duration.base`, which was easy to miss). Places set off 0.05s apart from the right (the list stagger), the old digit leaving on the same stagger the new one arrives on, so 19 → 20 turns the ones, then the tens. The roller's top and bottom fade through a static mask (transparent → black at 30% and 70% → transparent), so digits roll in and out of sight softly. Places count from the right, so 19 → 20 rolls both digits and 20 → 21 only the last; a leading digit that goes (10 → 9) pops out of the row and leaves the same way.
  - **How:** while it rolls, the input's own text is transparent and a copy is drawn over it, one inline-grid cell per place, the old and new character stacked in the cell. Once the steps stop (twice `duration.slow`: the blur, plus room for the spring to land and the stagger), the input's text shows again. Tabular figures keep the widths still.
  - **Typing doesn't roll:** the copy is hidden and updates without animating.
  - **Holding a button** rolls continuously, each step's digits stacking as they pass.
  - **Reduced motion:** no roll; the number just changes.
- **Formatting:** `format` takes `Intl.NumberFormatOptions` and `locale` a locale; without `format` the field shows plain numbers. Without `locale` it uses the runtime's, which can differ between the server and the browser, so the demos and docs set it.
- **Demos:**
  - **Hero:** Quantity (1–99) and Price (USD, steps of $0.50) side by side, named underneath, with Size in the top-right corner.
  - **Card demo:** one quantity field.
  - **Examples:** Percent (0–1 in 5% steps, Page Up/Down by 25%), Disabled.
- **Tests:** spinbutton with value and bounds; arrow keys, Page Up/Down, Home/End and stopping at a bound; buttons step without taking focus and disable at a bound; press and hold repeats and stops on release; typed text is clamped on blur; non-numbers revert; currency formatting, reading it back, aria-valuetext and the hidden input; the roll shows for steps and not for typing; decimals without float errors; axe with a value, empty and invalid.
- **Not built yet:** wheel and scrub-to-change; snapping a typed value to the step grid; separate parts (Group, Increment, Decrement) for custom layouts; buttons stacked at the end.
