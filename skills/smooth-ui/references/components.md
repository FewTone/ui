# Component recipes

What each common control should do to feel finished. Patterns referenced by name are in `patterns.md`; timings in `tokens.md`. Every recipe assumes the rules in `SKILL.md`: nothing on first paint, reduced motion respected, focus visible.

Prefer an accessible primitive library (Radix, React Aria, Headless UI, Ark) for behaviour, and add the motion on top.

## Actions

**Button**
- Hover/press: the tint layer (10% rising 4px on hover, 15% on press). No scale, no shadow.
- `type="button"` by default; `cursor: pointer`.
- Heights shared with inputs (32/36/40px); icons size themselves (16px) unless sized.
- Icon-only buttons have an `aria-label`.

**Loading button**
- idle → loading → success/error → idle after 2s; or driven by a returned promise.
- All states in one grid cell (fixed width); swaps through the blur with a 6px rise.
- Spinner while loading; drawn check or cross; danger colour on error, neutral success.
- `aria-busy` while busy, clicks ignored, never `disabled`; a polite live region announces the result.

**Copy button**
- Copy icon lifts away blurring as a check rises in and draws itself; back after 2s (restarted by copying again).
- The name stays "Copy" (an icon-only button's name shouldn't flicker); a live region says "Copied".
- `navigator.clipboard.writeText` with a hidden-textarea fallback.

## Selection controls

**Switch**
- Thumb placed by `x` and width on spring snappy; hover stretches 2px, press further; stretched during the trip.
- The "on" colour is a fill driven by the thumb's live position (opacity `1.6√p`), so off is on played backwards. No rings, no shadows.
- `role="switch"`, Space toggles, a visible `<label>`.

**Checkbox**
- Fill grows from 60% and fades (220ms ease-out); check draws in 80ms later. Uncheck plays backwards (150ms ease-in).
- Indeterminate draws a dash; opacity tied to the mark's length (no dots).
- Hover darkens the border; checked fill covers the border.

**Radio group**
- One shared dot travels from the old radio to the new (spring snappy, offsets, speed reset), then hands back. Optional stretch variant.
- Arrow keys move and select.

**Segmented control (one choice from a few)**
- A pill slides to the active option (spring snappy); there's always a choice (clicking the active one keeps it).
- The pill takes the page's own surface colour on a muted track; on an outlined track it gets a hairline so it shows on any surface.
- Hover brightens only inactive options.

**Toggle group (several on/off)**
- Each pressed option fades its own pill in (opacity + scale from 0.92 on spring snappy) and out quickly (150ms ease-in). Nothing slides; that's the segmented control's job.

**Tabs**
- Underline (or pill) slides to the active tab; labels change colour over 220ms.
- The new panel slides 12px in from the tab's side through the blur (220ms ease-out); the old goes at once.
- The panel's height glides (350ms ease-out), clipped only while moving; switching mid-glide starts from the current height.
- Keep the tab row still: if the tabs sit in a vertically centred area, a gliding panel moves them. Anchor to the top.
- Mount the new panel in the same commit as the tab change, so its entrance starts before the first paint (no flash).

**Slider**
- The value thumb (dot → pill with the value, speed stretch, thickening track). See `patterns.md`.
- Keyboard: arrows, Shift for 10 steps, Page Up/Down, Home/End. A track press moves the nearest thumb there and focuses it.
- `aria-valuetext` from the same formatter as the visible value. A range's thumbs are named "Price, minimum" / "Price, maximum".

## Text input

**Input**
- No motion beyond colour. Focus: a ring plus a border colour. Invalid from `aria-invalid` (danger border and ring).
- Validation message: follows the value, glides open and shut in a polite live region.

**Textarea**
- Grows with its text: the height glides to fit (220ms ease-out tween), bounded by min and max rows, then scrolls.
- While growing, hold the scroll at the top so the text doesn't jump up and slide back.
- CSS `field-sizing: content` sizes it before JavaScript runs, so server-rendered values don't jump.
- Optional drag-to-resize on the bottom-right corner (resize cursor there, height only); the dragged height becomes its floor.
- Character counter: each digit swaps on its own, rising as it counts up and falling as it counts down.

**Number input**
- `type="text"` with `role="spinbutton"` and `inputMode="decimal"` (`type="number"` can't format, can't be styled, and the wheel changes it by accident).
- Step buttons out of the tab order (keys do the same) and don't steal focus; press-and-hold repeats after 500ms, 12 per second.
- A step rolls the changed digits a whole line up or down, staggered 50ms from the right; typing doesn't roll.

**One-time code**
- Separate boxes; a focus box glides between them as you type (spring snappy).
- Characters rise in through the blur; a pasted code staggers left to right.
- A soft caret that breathes (opacity, 1s ease-in-out), not a hard blink.
- Wrong: one head-shake + danger borders. Right: a wave, each box swelling 6%.
- Once full, the focus box fades so the code reads as one; it returns on any movement.

**Combobox / command palette**
- The field keeps focus; one highlight glides through results (jumps while typing changes the list).
- Rank results: exact, starts with, word starts with, contains, keywords, letters in order with the first at a word start.
- The list's height glides as results change; the empty state comes through the blur.
- Multi-select chips come and go through the blur (scale from 96%); the others glide into place (position only).
- A palette sits near the top of the screen so its field stays put.

## Overlays

**Popover** — opens out of its trigger (scale 96% + blur, 150ms), closes back into it (80ms); its height glides when content changes; non-modal; focus moves in and returns.

**Dropdown / context menu**
- Same surface and entrance as a popover; a context menu grows from the pointer.
- One highlight per menu level; fades where it left; fresh per opening.
- Checkbox items draw their check; radio items grow their dot from half size.
- Sub-menu chevron nudges 2px towards the open sub-menu; sub-menus in a portal with a deeper shadow.
- Keep a menu open on settings toggles so the user sees the change.

**Select** — gliding highlight; no scroll arrows; selected option opens centred; scroll-edge fades; search for long lists (focus stays in the search field).

**Tooltip** — 300ms delay, then out of its trigger through the blur; neighbours along a row appear instantly (300ms hand-over); inverted colours, no arrow needed; describes, doesn't name.

**Hover card** — 300ms open delay; the same hand-over; optionally one card that glides between links (position and size on a 220ms tween).

**Dialog** — grows out of its trigger (origin = trigger centre); spring snappy in, 220ms ease-in out; backdrop fades; clicks pass through during the exit; focus returns only if it was inside.

**Alert dialog** — the dialog's motion; focus starts on Cancel; backdrop doesn't dismiss; no shake.

**Sheet / drawer** — slides from its edge (spring snappy), 8px extended past the edge so overshoot never shows a gap; no blur on the panel.

**Toast** — slides from the edge through the blur; stacked deck that fans out on hover/focus; swipe to dismiss; timer pauses on hover, focus and hidden tab; updates swap in place.

## Navigation

**Sidebar**
- One highlight glides to the current page; a fainter one follows the mouse and fades where it left.
- Place highlights by offsets from the scroll container (works while scrolling, sliding and zoomed). Re-place every frame while the layout is changing (width gliding, a section opening); glide only when the row changes.
- Narrowing to icons: width on 350ms ease-in-out; labels leave through the blur fast and return slower; group labels shrink to a short rule; a badge becomes a dot on the icon's corner; the trigger icon's divider slides to show the state.
- A current page inside a folded section shows its highlight on the section's row.
- Down to icons, rows keep their accessible names and get tooltips.

**Navigation menu (mega menu)**
- A highlight glides along the top-level items (mouse) and rests on the open one.
- The shared panel morphs its width and height to the next section (220ms ease-out); the new content slides 12px in from the side moved towards, the old out the other way.
- Opening, the links rise 6px through the blur, 50ms apart.
- ArrowDown on a closed trigger opens it and moves into the panel.

**Breadcrumb** — levels grow out of the one before; the left level slides back; the current level dims to a link through a colour on the level.

**Pagination** — a pill slides to the current page; a fixed-length page list (same count of slots) so the pill moves one slot at a time; disabled Previous/Next keep focus (`aria-disabled`).

**Stepper** — progress travels: check draws, line fills, next ring grows; backwards plays it in reverse.

**Accordion**
- Height on spring smooth (damping ratio ~0.9) or a 350ms ease-out tween; content staged (follows 80ms later on opening, leaves first on closing).
- Closed content stays in the page as `hidden="until-found"` (find-in-page opens it).
- The chevron turns on spring snappy (wrap the icon so its own transform isn't replaced).
- Clip only while moving, so focus rings at the edge aren't cut.

## Data display

**Table** — FLIP on sort (spring snappy, offsets); one turning sort arrow; borders on cells; hover is a colour change only.

**Card** — soft shadow plus a hairline, or a lightness step in dark mode; as a link, the surface lifts one lightness step on hover (150ms colour transition). No scale, tilt or shadow change.

**Badge** — flat, small; an optional "shine" is a 1px light travelling round the edge (a conic gradient on a turning square under a static mask: the transform runs on the compositor). Never a glow.

**Avatar** — the picture blurs in over the initials once loaded, only if the initials were shown first; initials carry the person's name for screen readers.

**Calendar / date picker**
- Six weeks always (fixed height) so the page never jumps between months.
- Paging: the new month slides 12px in from its side through the blur; its name swaps in place.
- The picked circle travels to the new day (shared mark); a range band grows from start to end along each week (scaleX on a 350ms ease-out tween, never a spring); a hover preview of the range at half tint.
- Today: a soft filled circle, not a dot.
- A date picker closes 220ms after a pick, once the circle has landed; a range picker stays open.

**Progress** — continuous rise (each change as long as the gap since the last, linear); count the label in step; indeterminate sweep; never a spring.

**Spinner / skeleton / text shimmer** — calm loops in step, transform-only, paused off-screen, still or pulsing with reduced motion.

**Marquee** — Web Animations transform loop; copies fill the row (measured), extra copies `aria-hidden` and `inert`; eases to a stop on hover, focus and pause; masked ends; a scrollable row with reduced motion.

**Number ticker** — digit columns that roll; the `flow` spring curve (900ms); tabular figures; `role="img"` with the formatted value.

**Theme toggle** — a View Transition reveal from the click point; one morphing sun/moon drawing; the label says what it'll switch to.
