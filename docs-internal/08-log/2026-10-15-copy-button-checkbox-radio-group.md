# 2026-10-15: Copy Button across the site, Checkbox, the blur, and Radio Group

**The site uses the library's Copy Button everywhere (owner):**
- **Where:** code blocks (with and without a filename bar), the Command bar on install steps, the header install chip, and Copy prompt.
- **Deleted:** `apps/www/components/docs/copy-button.tsx` (a scale swap) and `copy-prompt-button.tsx` (a text-only label swap). The site now has one copy interaction: the blur + rise with a drawn check.
- **Sizes:** the icon buttons are `icon-sm` shrunk to 28px, so bars and the install chip keep their heights and insets. Copy prompt is `default` / `sm` with the chip's `rounded-lg` and `text-label`, and it gains the copy icon and check.
- **Records:** the motion table's icon-state row now points at Copy Button; `04-components/copy-button/decisions.md` lists the site uses.
- **Copy prompt is text only again (owner):** Copy Button gained `icon={false}`; the label still swaps through the blur. 1 new test.

**Checkbox, published directly (owner):**
- **What:** Radix Checkbox with sizes `sm`/`md` (16/20px, matching Switch). The fill fades in as the check draws itself in; unchecking plays it backwards; indeterminate draws a dash.
- **State:** held in the component and passed to Radix, so the marks can animate and a form reset still restores it.
- **Corners:** `rounded-xs`/`rounded-sm`, added to the portable vocabulary for the smallest controls (design-system §13, components.md).
- **Demos and tests:** the hero is one zoomed checkbox; examples are Label and hint, Select all, Sizes, Disabled. 6 tests.
- **The roadmap** shows Checkbox as Available on its own (it was Next up).
- **Fill grows (owner: "the BG can also animate a little"):** it grows from 60% as it fades in, and shrinks back as it fades out.

**The blur everywhere (owner, ADR 0011):**
- **Rule:** content that appears, leaves or swaps now sharpens in from a 6px blur instead of only fading, like Loading Button and Copy Button.
- **Code:** `blur` and `swap` presets in `lib/motion.ts`. Copy Button and Loading Button now use the shared `swap`. The keyframes blur too: `fade-in`/`fade-out` were renamed `blur-in`/`blur-out`, and `rise-in`, `scale-in` and the shipped `popover-in`/`popover-out` changed. `check:tokens` keeps the CSS blur equal to `blur.hidden`.
- **Applied to:** Select's popover, Input's Invalid demo, preview tab panels, Expandable (items and both buttons), the search window and its Enter arrow, the header tooltip.
- **Left as fades:** full-screen overlays, fills and highlights, hover, scroll-edge fades.

**Radio Group, in the Lab (owner: the selected circle jumps between radios, other options explored too):**
- **Where:** `packages/ui/src/components/radio-group/` (component and 4 tests, no meta). The workbench is on `/lab` (`app/lab/radio-group-lab.tsx`).
- **Compared:** Motion (Slide, Hop, Stretch, Grow), Look (Dot, Filled) and Size, across a List, a Row, a Grid and Plan cards.
- **How:** at rest each radio has its own dot. A change sends one shared dot from the old centre to the new one (measured with offsets, so zoom doesn't double it), which hands back to the new radio's dot.
- **Shortlist (owner):** Stretch and Slide. Slide's first trip overshot because placing the dot with `set()` counted the jump from 0 as speed; it now uses `jump()`. Still in the Lab.
- **Radio Group published (owner: Dot only, Slide by default, Stretch as the option):** Hop, Grow and the Filled look were removed. A Slide and Stretch hero with a Size setting, a card demo, and In a row, Cards and Disabled examples. The Lab workbench was deleted, and `/lab` is an index again. The motion rules gained the travelling-mark pattern and the `set()`/`jump()` pitfall. The roadmap flips to Available on its own.
