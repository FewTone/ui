# Motion and interaction standard

Always on, for every UI change: library components, demos and the site. The owner set these patterns while building the site (2026-10-12 to 2026-10-14). New work uses them without being asked. The full token spec is in `docs-internal/01-brand/design-system.md` §9.

## Principles
- **Motion explains a change.** It shows where something went, what opened, or what's active now. Nothing moves just to decorate: no hover tilts, bounces or wiggles (the owner removed a hover tilt on 2026-10-14).
- **Content comes and goes through the blur, not a plain fade** (owner, 2026-10-15). Anything that appears, leaves or swaps sharpens in from a 6px blur as it fades, with the movement its pattern already has: popovers, tooltips, dialogs, tab panels, list items, messages, swapped labels and icons. Use `blur` / `swap` from `@fewtone/ui/lib/motion`, or the CSS `animate-blur-in` / `animate-blur-out`, `rise-in`, `scale-in` and `popover-in` / `popover-out`. ADR 0011.
  - **Still a plain fade:** full-screen overlays, fills and highlights (Checkbox fill, Switch colour, Toggle Group pill, row highlights), hover states and scroll-edge fades. A blurred solid shape reads as a glow.
  - **Reduced motion:** opacity only, no blur. Where a component doesn't branch on it, use `blur.shown` as the hidden value.
  - **Clean up:** an imperative `animate()` clears `filter` when it finishes, so no stacking context is left behind.
- **Only `transform` and `opacity` move.** The exceptions:
  - height, through the height pattern below
  - a tiny icon stroke drawing itself in (`pathLength`, for example Loading Button's check)
  - the blur on content that comes and goes (above)
- **Use the presets:**
  - springs: `spring.snappy` (small controls), `spring.smooth` (panels), `spring.bouncy` (rare delight)
  - the blur: `blur.hidden` / `blur.shown`, and `swap` for content swapping in place
  - durations and easings: `duration.*` and `ease.*` from `@fewtone/ui/lib/motion`, and `duration-(--duration-*)` / `ease-*` in CSS
  - never invent numbers
- **Reduced motion, always.** CSS durations collapse automatically. JavaScript animations check `useReducedMotion()` and use `{ duration: 0 }`, or opacity only.
- **Nothing animates on first paint.** Use `initial={false}`. A state the user didn't just change, such as a choice restored from storage, jumps instead of gliding.
- **One indicator per instance.** Scope shared-layout animations with `LayoutGroup id={useId()}` (library) or `PillGroup` (site), so two sets on a page never trade an indicator.
- **Clean up.** Cancel Web Animations when they finish, remove injected styles, and disconnect observers. A forwards-filling animation left behind breaks the next one.
- **Cost.** Prefer GPU-only (transform, opacity) over clip-path, and clip-path over mask, filter or blur. The 6px blur on content that comes and goes is the standard (motion runs filter on the compositor); never animate a full-screen blur.

## Which pattern to use
| Situation | Pattern | Reuse |
|---|---|---|
| Active item in a horizontal set: tabs, segmented control, filter | A pill or underline that **slides** to the active item (`layoutId`, `spring.snappy`). The item is `relative`, the set `isolate`. | Site: `Pill` and `PillGroup` (`apps/www/components/motion/pill.tsx`); `SlidingTabList` for Radix Tabs (`components/docs/sliding-tab-list.tsx`). Library: Switcher (`layoutId` inside `LayoutGroup id={useId()}`, with the corner radius read from the option) |
| Active or hovered row in a vertical list: sidebar, menu, results, listbox | **One** highlight that glides between rows (transform only, works in scroll containers). Hover highlights are mouse-only and fade out on leave. It jumps (`instant`) while typing changes the list. | Site: `RowIndicator` + `useRowBox` (`components/motion/row-indicator.tsx`). Library: a `layoutId` pill inside the focused item, with `layoutScroll` on the scroller (Select) |
| Content that changes height: tab panels, an opening section, accordion | The wrapper **glides** to the new height on an eased tween (`duration.slow`, `ease.out`), never a spring, because overshoot bounces the page. Clip only while moving. Instant with reduced motion. | Site: `AutoHeight` (`components/motion/auto-height.tsx`). Library default: Radix's `--radix-*-content-height` with CSS keyframes, same timing (decide this for good when Accordion is built) |
| Long section | Show a fixed height with a fade and "View all …". Once open, a sticky "View less" floats at the bottom of the screen with a shadow and lands at the section's end. Pressing it folds the section while gliding back to the heading, and focus returns. Hidden items rise 12px through the blur, staggered by 0.05s; the buttons come and go through it too. | `Expandable` (`components/docs/expandable.tsx`) |
| Popover, select, menu, tooltip | CSS keyframes `animate-popover-in` / `animate-popover-out`: scaling from `--radix-*-transform-origin` through the blur. A simple tooltip can use `animate-blur-in`. | Select |
| Dialog, drawer, sheet | Radix Dialog with `forceMount` inside `AnimatePresence`. It enters on `spring.snappy` and exits on a timed `duration.base` + `ease.in`, so the page never feels stuck. A window comes through the blur; a drawer slides; the overlay only fades. | `mobile-nav.tsx`, `command-menu.tsx` |
| A choice's mark moving between separate controls (radio dots) | At rest each control shows its own mark. On a change, **one shared mark travels** from the old control's centre to the new one's, then hands back to the new control's own mark in the same frame. Centres come from offsets (layout pixels), not on-screen boxes, so zoom doesn't double the trip. Slide on `spring.snappy`, or stretch (the front leaves first, the back follows `duration.instant` later, landing round). Mid-trip, a new choice leaves from where the mark is. | Radio Group (`travel`) |
| A control's knob or thumb moving between ends | Place it with numbers, not by measuring: `x` and its own width, on `spring.snappy`. **Hover:** the thumb stays at its end and stretches 2px towards the other side; it never shifts, and doesn't stretch straight after a change. **Press:** it stretches further. **A change:** it stays stretched for the trip, then settles round at the far end. **The "on" colour follows the thumb:** a pill under it, driven only by the thumb's live position (motion values), so going off is going on played backwards. It always ends at the thumb's far edge, and its opacity follows the thumb's progress (1.6√p, with the last 3% counted as home). Going on, it fades in as it sweeps across. Going off, it stays solid most of the way and reaches zero exactly as the thumb arrives, so no ring is left. Never use timers that let the colour and the thumb drift apart. No shadows. | Switch |
| An icon that represents a state (copy → copied, sun → moon) | Swap through Loading Button's blur + rise, with a check that draws in, or morph on `spring.snappy`; `initial={false}` either way. A bigger moment can morph one drawing (Theme Toggle's `SunMoon`: masks and transforms only). | Copy Button (the site uses it for every copy action), Theme Toggle |
| Hover and press on a button | **No scale, glow or shadow** (owner, 2026-10-14). One tint layer (`::before`, `bg-current`) behind the label. It fades to 10% while rising 4px from the bottom on hover, and deepens to 15% on press. Links fade their underline in instead. `cursor-pointer`. | Button |
| Hover (other elements) | Colour and background transitions only (`duration-(--duration-fast) ease-out`) | everywhere |
| A validation message | It follows the value. It shows while the rule is broken and goes as soon as it's met, gliding open and shut through the blur (opacity, blur and height, `duration.base`, `ease.out`) inside a polite live region. The field's border colour fades with it. | Input's Invalid demo |
| Long list in a popup | No scroll arrows: the list scrolls natively (capped at 18rem), with soft fades at the edges that can scroll. The selected option opens centred. Add search for long lists (Select's `searchable`). | Select |
| Items appearing in a list or grid | Rise 12px through the blur, staggered by 0.05s (`duration.slow`, `ease.out`) | `Expandable` |
| Async action on a button | Loading Button: the content swaps through the blur with a 6px rise (`swap`: the old lifts away blurring, the new rises in from blurred) at a fixed width sized to the widest state. Spinner while loading; a check or cross draws in; solid destructive colour on error; back to idle after 2s. No shake. | Loading Button, Copy Button |
| Theme change | Theme Toggle / `revealTheme()` (View Transitions) | Theme Toggle |

## Pitfalls already hit
- A gliding indicator painted over the rows it passes: make the container `isolate`, and don't give the rows their own stacking context (Select, 2026-10-13).
- `layoutId` breaks inside scroll containers. Use `RowIndicator`, or `layoutScroll` on the scroller.
- Transforms on SVG: a CSS transform replaces the `transform` attribute. Wrap the element in a `<g transform>` and animate the inner element.
- Masks and ids: every instance needs its own id (`useId()`), because pages render many copies.
- `layout` animations measure on-screen boxes, so they double their movement inside CSS `zoom` or a scaled parent (the zoomed Switch preview overshot its track). For controls, place them with numbers instead (`x`, width).
- `MotionValue.set()` right before a spring counts the jump as speed, so the spring overshoots (Radio Group's first slide, 2026-10-15). Place a value with `jump()`, which resets the speed, before animating it.
- Overlays that depend on scroll position (fades) go outside the scroll container, and the list's end is measured from its last shown child. A gliding highlight and in-list overlays inflate `scrollHeight`.
