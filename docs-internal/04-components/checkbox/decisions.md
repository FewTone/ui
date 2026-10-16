# Checkbox: decisions

**Status:** published directly, without a Lab step (owner, 2026-10-15).

- **What it is:** a checkbox on Radix Checkbox (`role="checkbox"`, `aria-checked` true/false/mixed, Space toggles, and a hidden native checkbox inside forms). The API is shadcn's: `checked`, `defaultChecked`, `onCheckedChange`, plus `size`.
- **Motion** (the roadmap's "a check that draws itself in"):
  - **Checking:** the fill grows from 60% as it fades in (`duration-base`, `ease-out`, a CSS `before:` layer like Button's tint), and the check draws itself in (`pathLength`, `duration.base`, `ease.out`, after `duration.instant`). The check is the same path as Copy Button's and Loading Button's.
  - **Unchecking is checking played backwards:** the check erases (`duration.fast`, `ease.in`), and the fill waits `duration-instant`, then shrinks back to 60% and fades (`duration-fast`, `ease-in`).
  - **Indeterminate:** a dash that draws in the same way. Between checked and indeterminate the fill stays, and one mark erases while the other draws.
  - **No dots:** each mark's opacity goes with its length, so a round cap never leaves a dot.
  - **First paint and reduced motion:** nothing animates on first paint (`initial={false}`). With reduced motion the marks appear and go at once, and the CSS fade collapses on its own.
  - **The fill grows a little** (owner, 2026-10-15: "the BG can also animate a little"). It started as a fade only. It grows from 60%, not 0, and on an ease-out, not the CSS spring, so it never overshoots past the box.
- **State:** held in the component and always passed to Radix as `checked`, controlled or not, so the marks know what to draw. Radix still restores the first state on a form reset through `onCheckedChange` (tested).
- **Look:**
  - **Sizes:** `sm` 16px and `md` 20px (the default), the heights of Switch's tracks, so the two line up in a form.
  - **Corners:** `rounded-xs` and `rounded-sm` (4 and 6px here). These are the first library uses of `xs`/`sm`; design-system §13 records the caveat that `xs` is Tailwind's 2px in a stock shadcn theme.
  - **Hover:** the border darkens to `ring`, only while enabled.
  - **Checked:** the fill covers the border, so it's one solid shape.
  - **Flat:** no shadow. Invalid gets a destructive border and focus ring, like Input.
- **Demos:**
  - **Hero:** a single checkbox, checked, at `zoom: 2` (like Switch).
  - **Examples:** Label and hint, Select all (indeterminate parent), Sizes (`zoom: 1.5`), Disabled.
- **Tests:** click, Space, the visible label, indeterminate is `mixed` and becomes checked, form reset, disabled, axe.
- **Not built yet:** a label slot inside the component (demos use `<label htmlFor>`, as Switch does); a card-style checkbox for plans.
