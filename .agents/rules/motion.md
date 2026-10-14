# Motion and interaction standard

Always on, for every UI change: library components, demos and the site. The owner set these patterns while building the site (2026-10-12 to 2026-10-14). New work uses them without being asked. The full token spec is in `docs-internal/01-brand/design-system.md` §9.

## Principles
- **Motion explains a change.** It shows where something went, what opened, or what's active now. Nothing moves just to decorate: no hover tilts, bounces or wiggles (the owner removed a hover tilt on 2026-10-14).
- **Only `transform` and `opacity` move.** Height is the one exception, through the height pattern below.
- **Use the presets:**
  - springs: `spring.snappy` (small controls), `spring.smooth` (panels), `spring.bouncy` (rare delight)
  - durations and easings: `duration.*` and `ease.*` from `@fewtone/ui/lib/motion`, and `duration-(--duration-*)` / `ease-*` in CSS
  - never invent numbers
- **Reduced motion, always.** CSS durations collapse automatically. JavaScript animations check `useReducedMotion()` and use `{ duration: 0 }`, or opacity only.
- **Nothing animates on first paint.** Use `initial={false}`. A state the user didn't just change, such as a choice restored from storage, jumps instead of gliding.
- **One indicator per instance.** Scope shared-layout animations with `LayoutGroup id={useId()}` (library) or `PillGroup` (site), so two sets on a page never trade an indicator.
- **Clean up.** Cancel Web Animations when they finish, remove injected styles, and disconnect observers. A forwards-filling animation left behind breaks the next one.
- **Cost.** Prefer GPU-only (transform, opacity) over clip-path, and clip-path over mask, filter or blur. Never animate a full-screen blur.

## Which pattern to use
| Situation | Pattern | Reuse |
|---|---|---|
| Active item in a horizontal set: tabs, segmented control, filter | A pill or underline that **slides** to the active item (`layoutId`, `spring.snappy`). The item is `relative`, the set `isolate`. | Site: `Pill` and `PillGroup` (`apps/www/components/motion/pill.tsx`); `SlidingTabList` for Radix Tabs (`components/docs/sliding-tab-list.tsx`) |
| Active or hovered row in a vertical list: sidebar, menu, results, listbox | **One** highlight that glides between rows (transform only, works in scroll containers). Hover highlights are mouse-only and fade out on leave. It jumps (`instant`) while typing changes the list. | Site: `RowIndicator` + `useRowBox` (`components/motion/row-indicator.tsx`). Library: a `layoutId` pill inside the focused item, with `layoutScroll` on the scroller (Select) |
| Content that changes height: tab panels, an opening section, accordion | The wrapper **glides** to the new height on an eased tween (`duration.slow`, `ease.out`), never a spring, because overshoot bounces the page. Clip only while moving. Instant with reduced motion. | Site: `AutoHeight` (`components/motion/auto-height.tsx`). Library default: Radix's `--radix-*-content-height` with CSS keyframes, same timing (decide this for good when Accordion is built) |
| Long section | Show a fixed height with a fade and "View all …". Once open, a sticky "View less" floats at the bottom of the screen with a shadow and lands at the section's end. Pressing it folds the section while gliding back to the heading, and focus returns. Hidden items fade and rise 12px, staggered by 0.05s. | `Expandable` (`components/docs/expandable.tsx`) |
| Popover, select, menu, tooltip | CSS keyframes `animate-popover-in` / `animate-popover-out`, scaling from `--radix-*-transform-origin` | Select |
| Dialog, drawer, sheet | Radix Dialog with `forceMount` inside `AnimatePresence`. It enters on `spring.snappy` and exits on a timed `duration.base` + `ease.in`, so the page never feels stuck. The overlay fades. | `mobile-nav.tsx`, `command-menu.tsx` |
| A control's knob or thumb moving between ends | Place it with numbers, not by measuring: `x` and its own width, on `spring.snappy`. **Hover:** the thumb stays at its end and stretches 2px towards the other side; it never shifts, and doesn't stretch straight after a change. **Press:** it stretches further. **A change:** it stays stretched for the trip, then settles round at the far end. **The "on" colour follows the thumb:** a pill under it, driven only by the thumb's live position (motion values), so going off is going on played backwards. It always ends at the thumb's far edge, and its opacity follows the thumb's progress (1.6√p, with the last 3% counted as home). Going on, it fades in as it sweeps across. Going off, it stays solid most of the way and reaches zero exactly as the thumb arrives, so no ring is left. Never use timers that let the colour and the thumb drift apart. No shadows. | Switch |
| An icon that represents a state (copy → copied, sun → moon) | Morph or cross-swap on `spring.snappy`, with `initial={false}`. A bigger moment can morph one drawing (Theme Toggle's `SunMoon`: masks and transforms only). | `copy-button.tsx`, Theme Toggle |
| Hover and press on a button | **No scale, glow or shadow** (owner, 2026-10-14). One tint layer (`::before`, `bg-current`) behind the label. It fades to 10% while rising 4px from the bottom on hover, and deepens to 15% on press. Links fade their underline in instead. `cursor-pointer`. | Button |
| Hover (other elements) | Colour and background transitions only (`duration-(--duration-fast) ease-out`) | everywhere |
| A validation message | It follows the value. It shows while the rule is broken and goes as soon as it's met, gliding open and shut (opacity and height, `duration.base`, `ease.out`) inside a polite live region. The field's border colour fades with it. | Input's Invalid demo |
| Long list in a popup | No scroll arrows: the list scrolls natively (capped at 18rem), with soft fades at the edges that can scroll. The selected option opens centred. Add search for long lists (Select's `searchable`). | Select |
| Items appearing in a list or grid | Fade and rise 12px, staggered by 0.05s (`duration.slow`, `ease.out`) | `Expandable` |
| Theme change | Theme Toggle / `revealTheme()` (View Transitions) | Theme Toggle |

## Pitfalls already hit
- A gliding indicator painted over the rows it passes: make the container `isolate`, and don't give the rows their own stacking context (Select, 2026-10-13).
- `layoutId` breaks inside scroll containers. Use `RowIndicator`, or `layoutScroll` on the scroller.
- Transforms on SVG: a CSS transform replaces the `transform` attribute. Wrap the element in a `<g transform>` and animate the inner element.
- Masks and ids: every instance needs its own id (`useId()`), because pages render many copies.
- `layout` animations measure on-screen boxes, so they double their movement inside CSS `zoom` or a scaled parent (the zoomed Switch preview overshot its track). For controls, place them with numbers instead (`x`, width).
- Overlays that depend on scroll position (fades) go outside the scroll container, and the list's end is measured from its last shown child. A gliding highlight and in-list overlays inflate `scrollHeight`.
