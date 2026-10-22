# Pattern catalogue

Each pattern: when to use it, how it moves, the values, and the details that separate a smooth version from a rough one. Timings refer to `tokens.md`. Code for the starred patterns (★) is in `code.md`.

## Contents
1. Indicators: sliding pill ★, gliding row highlight ★, shared travelling mark
2. Size: height glide ★, width and size morph, keeping widths fixed
3. Content coming and going: the blur, swaps ★, list stagger, directional panels, trails
4. Floating surfaces: popovers and menus, tooltips and hover cards, dialogs ★, drawers
5. Controls: button tint ★, toggle thumb, checkbox and drawn marks, slider value thumb
6. Values: numbers that roll, continuous progress ★, steppers
7. Lists and data: reorder (FLIP) ★, long lists in popups, scroll-edge fades
8. Feedback: async buttons, validation messages, toasts, wrong and right codes
9. Loops: spinners, sheens, marquees ★
10. Images and pages: picture blur-in, theme reveal, layout that never shifts

---

## 1. Indicators

### Sliding pill or underline ★
**Use:** the active item in a horizontal set: tabs, segmented controls, filter chips, pagination.

- One element moves; it's rendered inside the active item, or placed by numbers over the set.
- Spring snappy. The label's colour changes over 220ms so it arrives with the pill.
- **Stacking:** the set is `isolation: isolate`; the items are *not* stacking contexts (no `z-index`, no `isolate`, no `transform` on them). The pill sits at `z-index: -1` inside the item. Otherwise a pill moving forward paints over the labels it passes.
- **Scope:** one pill per set (in motion: `<LayoutGroup id={useId()}>` around each set). Without it, two tab sets on a page fly their pills between each other.
- **Corners:** if the pill changes width between items of different sizes and is animated by scale (motion's `layoutId` does this), give `borderRadius` as a number so motion corrects it. Animating `width` + `x` instead keeps corners true by itself.
- **When the set can move during the slide** (content below it changing height in a centred layout), a layout animation measured once aims at where the set *will* be and the pill floats away from its row. Either keep the set still (anchor it to the top, reserve height) or place the pill by offsets inside the set (see `code.md`).
- **First paint:** the pill is simply there. With reduced motion it jumps.

### Gliding row highlight ★
**Use:** the focused or hovered row in a vertical list: menus, selects, command palettes, sidebars, search results, presets.

- One highlight glides between rows on spring snappy. Keyboard focus and mouse hover move the same highlight.
- **Hover is mouse-only.** On leaving the list (or moving onto a label or separator), the highlight fades out *where it was* (150ms, opacity only: it's a fill, never blurred).
- **Coming back:** onto a row while it's still fading, it glides on from there and its opacity recovers. Once it has gone, the next appearance fades in at the new row; it never flies over from a stale spot. (In motion: give each appearance a fresh `layoutId`.)
- **Fresh per opening:** a menu that reopens starts with no highlight history.
- **While typing changes the list** (search, filtering), the highlight jumps instead of gliding, decided in the same render the rows change, so it never glides through a reordering list.
- **Scrolling lists:** a layout animation in a scroll container needs the scroller marked (`layoutScroll` in motion) or it drifts while scrolling. Alternatively place it by offsets relative to the scroller.
- **Destructive rows:** the highlight crossfades to a red tint as it lands (two fills, opacity), instead of snapping colour at the start of the trip.
- **No focus ring on rows** when the highlight is the focus indicator (as in a select or menu).

### Shared travelling mark
**Use:** a choice's mark moving between *separate* controls: radio dots, the picked day in a calendar.

- At rest each control draws its own mark, so nothing is measured and the page reflows freely.
- On a change, one shared mark is drawn at the group's level, travels from the old control's centre to the new one's (spring snappy), then hands back to the new control's own mark in the same frame.
- Centres come from offsets, so zoom doesn't double the trip.
- **Place it with a speed reset** before animating (motion: `value.jump(x)`, not `set(x)`), or the spring counts the placement as velocity and overshoots on the first trip.
- Mid-trip, a new choice leaves from where the mark is, keeping its speed.
- Variant "stretch": the front leaves first and the back follows 80ms later, so the dot stretches into a capsule and lands round.
- In a calendar, the picked number turns light only once the travelling circle covers it.

---

## 2. Size

### Height glide ★
**Use:** content that changes height in place: tab panels, accordions, popovers whose content grows, a validation message appearing, a list filtering, a toast changing text.

- The wrapper glides from the old height to the new on a **tween** (350ms ease-out) or spring smooth. Never spring snappy or bouncy: overshoot bounces everything below.
- **Clip only while moving** (`overflow: hidden` during the glide, removed after) so focus rings and shadows aren't cut at rest.
- **Measure with a ResizeObserver** on an inner wrapper; it fires after layout and before paint, so the new size is never shown first.
- **Interrupted:** start from the current animated height, not from where it was going.
- **First paint:** no glide. Reduced motion: instant.
- **Stage the content against the box:** opening, the box leads and the content follows 80ms later, settling 6px down through the blur (350ms ease-out). Closing, the content leaves first and quickly (150ms ease-in), then the empty box folds. Text is never squeezed while readable.
- **Two glides never nest.** A list that glides inside a popover that glides moves in two steps; let the outer one own it.
- **Keep the controls still:** if the gliding content sits in a vertically centred container, everything above it moves too. Anchor the container to the top, or reserve the tallest state's height.
- **Spacing that changes with the height glides with it** (a section moving 4px further from its neighbours while open: a margin transition on the same timing).

### Width and size morph
**Use:** a shared surface that changes shape between contents: a mega-menu panel switching sections, a hover card moving from one link to the next, a sidebar narrowing to icons.

- Width and height glide together (220ms ease-out tween), never a spring. A scale would distort borders, radius and text.
- The content inside swaps through the blur with a 12px slide towards the side you moved.
- Centre the content in the morphing frame, so it doesn't ride a moving edge.
- **First opening:** no morph; the first size is simply there.
- A sidebar narrowing to icons: width on 350ms ease-in-out (starts and lands softly, never a spring), labels leave through the blur fast (150ms ease-in) so text is gone before the width closes on it, come back slower (350ms ease-out). Pictures slide into the narrow column with a transform, not by animating padding.

### Keeping widths fixed
- A control that changes its text (Save → Saving… → Saved, Copy → Copied) lays every state out invisibly in one grid cell, so its width is the widest state's from the start.
- Numbers use tabular figures (`font-variant-numeric: tabular-nums`).
- A typewriter or rotating word reserves the longest phrase's width with an invisible copy in the same cell.
- A pill whose label varies (a slider's value) measures its content and glides its width on the same spring as its other movement.

---

## 3. Content coming and going

### The blur
Content that appears sharpens in from `blur(6px)` as it fades; content that leaves blurs out as it fades. It's softer and more physical than a fade. Use it for: popovers, tooltips, dialogs, tab panels, list items, messages, swapped labels and icons, chips, an empty state, a picture loading.

Not for: fills and highlights (checkbox fill, toggle colour, a pill, a row highlight), hover states, full-screen overlays (too costly), scroll-edge fades, a surface that slides (a drawer is a surface moving, not content appearing).

Clear the `filter` when the entrance ends: a leftover `filter: blur(0)` still makes a stacking context and a containing block for fixed children.

### Swap in place ★
**Use:** a label, icon or value replaced in the same spot.

- Old: lifts 6px and blurs away (exit). New: rises 6px in from blurred (enter). 220ms ease-out both (an in-place swap uses ease-out on both sides, so it never feels sluggish).
- They overlap in one grid cell; the cell's width is held (see above).
- Deleting can sink back the way it came (direction from a `custom` value).
- A check that replaces an icon draws itself in.
- `initial={false}` so the first label doesn't animate.

### List and grid entrance
- Each item rises 12px through the blur, 50ms apart, 350ms ease-out.
- Only for items appearing because of an action (revealing more, a new page of results, a menu opening). A list that's there on load is just there.
- A pasted code or a burst of changes staggers left to right the same way.
- Items removed: fade and blur out where they were (out of the flow at once, so the others glide into place on spring snappy, transform only).

### Directional panels
**Use:** switching between siblings in an order: tabs, calendar months, wizard steps, a folder browser.

- The new panel slides 12px in from the side you moved towards (from the right going forward), through the blur, 220ms ease-out.
- The old panel goes at once (simplest; nothing overlaps), or slides 12px out the other way on 150ms ease-out when they should overlap (`popLayout`).
- Direction comes from the items' order or offsets, mirrored in right-to-left pages.
- A month name or title swaps in place through the blur.

### Trails that grow (breadcrumbs that follow you)
- A new level grows out of the one before it: slides 8px out from the left through the blur (350ms ease-out), the separator first and the name 80ms later.
- A level you leave slides back in (150ms ease-in); the rest glide to their places (spring snappy, position only).
- The level you were on dims smoothly to a link: put the colour on the level, not the element, so it transitions when the element changes.
- Keyed by path, so a static trail never moves.

---

## 4. Floating surfaces

### Popover, menu, select
- Opens out of its trigger: scale 96% → 100% through the blur, 150ms ease-out, `transform-origin` on the trigger's side (flipped when it flips). Closes back into it: 80ms ease-in.
- CSS keyframes are enough and run before JavaScript hydrates.
- Sub-menus get a deeper shadow so they lift off the menu they overlap; render them in a portal (a parent's leftover `transform`/`filter` would trap and clip them).
- A chevron that leads to a sub-menu nudges 2px towards it while open.
- The surface's height glides when its content changes size (see height glide).
- **Long lists:** no scroll arrows. Scroll natively, cap the height (~18rem), soft fades at the edges that can scroll, and open with the selected option centred.

### Tooltip and hover card hand-over
- The first tooltip waits (300ms), then opens out of its trigger through the blur.
- Moving along a row of triggers (a toolbar), the next ones appear **at once, with no animation**, and the previous one goes in the same frame, while a tooltip is showing or closed less than 300ms ago. After the window, the next waits and animates again.
- Keyboard focus follows the same rule; the first focus animates.
- A hover card can go further: one card that moves. The new card starts on the old card's box and glides to its own place and size (220ms ease-out, `x`/`y` + `width`/`height`), its content sliding 12px in from the side it moved towards. Clear inline styles when it lands.
- Tooltips describe; they don't name. An icon button keeps its own `aria-label`.

### Dialog ★
- **Enter:** scale 96% → 100% on spring snappy, opacity and blur on 220ms ease-out (so the blur never overshoots).
- **It grows out of what opened it:** `transform-origin` = the trigger's centre, relative to the window. Measure once, as the window mounts, from the focused element (or the trigger), using the window's offset box (unscaled).
- **Exit:** timed, 220ms ease-in, back to 96% through the blur. Never a spring on the way out: the page shouldn't wait.
- **Backdrop:** a plain fade. Never blur the whole page.
- **Usable at once after closing:** while the exit plays, the backdrop and the window ignore the pointer (`pointer-events: none`), so a click on the page works. Focus returns to the trigger only if it went away with the window (someone may already have clicked a field).
- A confirmation dialog: focus starts on Cancel, the backdrop doesn't close it, narrower than a normal dialog. No shake when the backdrop is clicked.
- A command palette sits near the top (not centred), so the search field stays put while the results' height glides.

### Drawer / sheet
- Slides from its edge on spring snappy; leaves on 220ms ease-in. No blur (a surface moving).
- **No gap at the edge:** spring snappy overshoots ~1%, which lifts the panel off the screen edge for a frame. Extend the panel 8px past its edge (with a border or padding in its own colour) so the overshoot shows more panel, not a gap.
- Clicks go through while it leaves; focus returns as for dialogs.

---

## 5. Controls

### Button hover and press ★
- One tint layer behind the label (`::before`, `background: currentColor`), so it works on every variant.
- Hover: the tint fades to 10% opacity while rising 4px from the bottom (150ms ease-out). Press: deepens to 15%, instantly.
- No scale, no shadow, no glow, no per-variant hover colours. Pure CSS.
- Links: fade an underline in (`text-decoration-color: transparent` → `currentColor`), so nothing shifts.
- `cursor: pointer`; `type="button"` by default.

### Toggle thumb (switch)
- The thumb is placed by numbers (`x` and its own width), not by a layout animation, on spring snappy. Layout animations double inside zoomed or scaled parents.
- **Hover:** the thumb stays at its end and stretches 2px towards the other side. Not straight after a change (it would look like it wants to go back).
- **Press:** stretches further. **Change:** stays stretched for the trip, settles round at the far end.
- **The "on" colour follows the thumb:** a fill under it, driven only by the thumb's live position (derived motion values), always ending at the thumb's far edge. Its opacity follows the trip's progress p as `min(1, 1.6·√p)`, the last 3% counted as home. Going off is going on played backwards: solid while the thumb travels, zero exactly as it arrives, so no ring is left.
- Never use timers to sync the colour and the thumb; they drift.
- No shadows on track or thumb.

### Checkbox and drawn marks
- **Checking:** the fill grows from 60% as it fades in (220ms ease-out; ease-out so it never overshoots the box), and the check draws itself in (`pathLength` 0 → 1, 220ms ease-out, 80ms after).
- **Unchecking** is checking played backwards: the check erases (150ms ease-in), the fill waits 80ms then shrinks back and fades.
- **Indeterminate:** a dash that draws the same way; between checked and indeterminate the fill stays and one mark erases while the other draws.
- **No dots:** a round line cap at length 0 still draws a dot. Tie the mark's opacity to its length.
- Use one check path everywhere (checkbox, copied, success, menu items) so the product feels like one family.

### Slider: the value thumb
- At rest: a thin track (4px) and a small dot (14px). Reaching for it (mouse over the slider, keyboard focus, a press) grows the dot into a pill (26px tall, as wide as its value + 10px each side, at least 46px) with the value inside, on spring snappy, centred on the thumb so growing never moves it. The number comes through the blur.
- Moving, the pill stretches along the track with its speed (up to 25%, full at ~900px/s) and settles round when it stops.
- The track thickens (×1.5) while a thumb is open.
- A click on the track glides the thumb there (spring); a drag follows the pointer exactly (no spring, speed reset). The range fill follows the *drawn* thumb, so it never runs ahead.
- Place the thumb with a percentage (`left: x%`), so server HTML is right before anything is measured.
- The value inside rolls (see numbers).

---

## 6. Values

### Numbers that roll
- Each digit is a column that slides to its new digit (transform), rising as the number grows and falling as it shrinks. Never tween through every number (a price counting 12.99 → 13.00 → … looks cheap).
- Characters that stay glide to new places (FLIP); new characters fade in; leaving ones fade out where they were. The frame's width animates as a transform. Mask the top and bottom edges (~0.25em) so digits roll in and out of sight softly.
- A long-tested curve: a spring sampled into CSS `linear()` over 900ms for movement, 450ms ease-out for fades.
- The easy route in React: the MIT-licensed `@number-flow/react` package does all of this well.
- Lighter version for steppers: each changed place rolls a whole line (old out, new in, 100% of the line height), places staggered 50ms from the right, blur on 350ms ease-out.
- Tabular figures; screen readers get the final value only (`role="img"` + `aria-label`, or a hidden live region).

### Continuous progress ★
- A value that keeps updating (an upload reporting every 0.7s) rises continuously, never in steps that slide and stop.
- Each change lasts as long as the gap since the previous change, at an even (linear) pace, while updates keep coming (gap under ~1s). A change after a longer pause eases in (350ms ease-out).
- Never a spring: overshoot shows progress that isn't done, and passes 100% at the end.
- A bar's fill moves (`translateX` of a full-width fill), not resizes. A ring draws its arc (`pathLength`); at 0 its round cap would draw a dot, so tie opacity to length.
- The percentage label counts through every number in step with the fill (the one place a counting tween is right: it's the bar read aloud).
- Indeterminate: a 40%-wide segment sweeping across (1.5s ease-in-out, repeating), or a quarter arc turning; with reduced motion a pulse, not a still segment (a still segment reads as a value).

### Stepper progress
- Moving on: the step left behind swaps its number for a drawn check, the line between fills (scaleX, 350ms ease-in-out tween), and the next step's ring grows in (from 0.8) as the fill arrives.
- Jumping several steps fills each line in turn, one after the other, each step getting its check as the fill reaches it.
- Going back plays it backwards.
- Fills and colours only fade; only the number (content) uses the blur.

---

## 7. Lists and data

### Reordering rows (FLIP) ★
- When the order changes (sorting), put each moved row back where it was drawn with `translateY`, then spring it to 0 (spring snappy). Rows stay real table rows; only a transform moves.
- Only a change of order moves. Rows added, removed or resized take their places at once (filtering and pagination don't animate).
- Measure with offsets. Mid-glide, a new sort leaves from where each row is now. Reset speed when placing.
- Needs stable keys.
- The sort arrow is one arrow that turns 180° (spring snappy), not two icons swapping; unsorted it's hidden and fades in on hover or focus; it always keeps its room so the label never shifts.
- Row borders belong to the cells (`border-collapse: separate`, `border-spacing: 0`), or a gliding row leaves its line behind.

### Long lists in popups
- Native scroll, capped height, the selected item opens centred.
- Soft fades over the edges that can scroll, shown only while there's more that way.
- Put the fade overlays *outside* the scroll container; inside, they scroll and inflate `scrollHeight`. Measure the list's end from its last visible child.
- Add search past ~10 options; keep focus in the search field and move the highlight with arrows.

### Scroll areas
- Fades at edges that can scroll, coloured by the area's own background (`background: inherit` + a static mask), so they match any surface.
- A slim scrollbar (4px) that thickens to 8px under the pointer or while dragging, by scale from the outer edge; it fades in on hover and out 600ms after.
- An area with a name is a focusable region, so the keyboard can scroll it.

---

## 8. Feedback

### Async action on a button
- idle → loading → success or error → idle after 2s.
- Content swaps through the blur with a 6px rise, at a fixed width (all states in one cell).
- Spinner while loading; a check or cross draws itself in.
- Error: the danger colour. Success: stays neutral; the drawn check carries the meaning.
- While busy: `aria-busy`, clicks ignored, *not* `disabled` (keeps focus). A polite live region says "Loading", "Done" or what failed.
- No shake.

### Validation messages
- The message follows the value: it shows while the rule is broken and goes as soon as it's met (not only on submit, not only on blur once the user is fixing it).
- It glides open and shut (height + opacity + blur, 220ms ease-out) inside a polite live region, linked with `aria-describedby`. The field's border colour fades with it.
- Text fields themselves never move.

### Toasts
- Slide in from the screen edge (y from 100% of their height) through the blur on spring snappy; leave back to the edge on 220ms ease-in.
- **The deck:** older toasts tuck behind the newest, each 12px further out and 5% narrower, taking the front toast's height so only an even edge shows; their content fades out through the blur. Hover or keyboard focus fans them into a list 12px apart (spring snappy).
- Height changes (a tucked toast, changed content) glide on a tween.
- Swipe: follows the finger exactly; short of the threshold springs back; past it carries on off screen fading.
- Pause the close timer while hovered or focused and while the tab is in the background; the time left carries over.
- `toast.promise`: the loading content swaps to success or error in place.
- With reduced motion: a plain list, opacity only.

### Wrong and right codes (one-time codes, PINs)
- **Wrong:** the field shakes its head once (x: 0, −8, 7, −5, 3, −1, 0px over 500ms ease-out) as its borders turn to the danger colour. The only acceptable shake.
- **Right:** a wave left to right, each box swelling 6% and settling (350ms ease-out, 50ms apart) as its border turns solid.
- Typing: each character rises in through the blur; the focus box glides to the next box (spring snappy); once full, the focus box fades so the code reads as a whole.
- Colour only with reduced motion.

---

## 9. Loops

### General rules ★
- Run loops on the compositor: Web Animations (`element.animate`) or CSS on `transform`/`opacity`. Never React state per frame.
- Pause off-screen (IntersectionObserver) and in hidden tabs (`visibilitychange`). Cancel on unmount.
- Keep several loops in step: start Web Animations at `startTime = 0` on the document timeline, so a skeleton mounting late sweeps in phase with the others.
- **Pausing eases to a stop** instead of freezing (hover, focus, a pause control): pause the animation and step its `currentTime` by hand each frame at a speed easing from 1 to 0 over 350ms; resume the same way. Don't ease `playbackRate` every frame on a compositor animation: the clocks drift and it snaps on release.
- Anything moving for more than 5 seconds next to other content needs a way to pause it (WCAG 2.2.2). Focus inside should stop it.
- With reduced motion: still (a marquee becomes a scrollable row; a sheen becomes a still block; a spinner pulses opacity).

### Spinner
- Calm, 1–2s per cycle, constant speed (linear), drawn in the text's colour.
- Animate a transform string or a stroke offset through Web Animations, so it keeps moving while the main thread is busy (exactly when spinners show).
- A finish state beats a disappearing spinner: e.g. one line travelling round an infinity path (a dash, `pathLength` 100, 24 long, offset −100 every 1.6s linear); when done, the line stops where it is and grows to fill the whole path (800ms ease-out) as the faint track fades.
- Hide it from screen readers when text beside it already says what's happening.

### Skeleton sheen
- A band one step lighter than the block slides across (transform only), 2s period: 1.5s sweep ease-in-out, 0.5s rest. One hue, lightness only.
- All skeletons in step (`startTime = 0`). The loading region carries `aria-busy` and a visually hidden label; the skeleton blocks are `aria-hidden`.
- Content replacing skeletons comes through the blur; skeleton and content share one grid cell so nothing below moves.

### Text shimmer
- Muted text with a light band sweeping across: a copy of the text in the foreground colour inside a masked band; the band slides one way and the copy slides back the same amount, so letters never move and only light does. Transform only (animating `background-position` with `background-clip: text` repaints every frame).
- Same 2s clock as skeletons.

---

## 10. Images, pages and layout

### Picture blur-in
- A picture that loads after its placeholder (initials, a colour) sharpens in from 6px blur as it fades in (220ms ease-out), over the placeholder; the placeholder goes once it's fully in.
- Only when the placeholder was actually on screen first. A cached image ready on the first render just shows: no replaying entrances on reopening a menu.

### Theme change
- A View Transition reveal (`document.startViewTransition`): a circle or wipe growing from the click point (or the button's centre for keyboard), 450–1000ms ease-in-out, because it crosses the whole screen.
- Apply the theme synchronously inside the transition callback (in React: `flushSync`), so the new snapshot already has it.
- The toggle icon morphs one drawing (sun rays shrinking, a mask sliding to carve the moon), transforms and opacity only.
- Skip the transition with reduced motion.

### Layout that never shifts
- Reserve the space of the largest state (button widths, a typewriter's longest phrase, a demo's tallest content).
- Placeholders match their content's size and share its grid cell.
- Centred layouts re-centre when their content changes height; anchor interactive content to the top when its height changes.
- Server-rendered HTML should already show the final state (place things with percentages, not measured pixels, so nothing jumps on hydration).
