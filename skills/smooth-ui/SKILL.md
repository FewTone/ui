---
name: smooth-ui
description: Makes any web interface feel smooth, calm and premium. Motion, micro-interactions, visual polish and accessibility rules, with exact timings and ready code, learned from building a full React component library. Use when building or changing UI (buttons, forms, tabs, menus, dialogs, toasts, sliders, lists, loading states), when adding animations or transitions, when asked to make an app "smoother", "more polished" or "premium", or when reviewing a UI for quality.
---

# Smooth UI

The difference between a UI that works and one that feels premium is a few hundred small decisions about motion, timing, focus and restraint. This skill holds those decisions: the rules, the exact numbers and the patterns, each one tested in a real component library and kept because it held up.

It works with any stack. The examples use React, Tailwind CSS and `motion` (Framer Motion, `motion/react`), because that's where the patterns were built. Each pattern also says what it's doing, so you can carry it to CSS, Vue, Svelte or anything else.

## How to use this skill

**Building something new:** read the rules below, pick the pattern for each moving part from the map, and use the timings from `references/tokens.md`. Check the component's recipe in `references/components.md` before writing it.

**Making an existing UI smoother:** follow the audit in `references/audit.md`. It walks the app part by part, fixes the highest-value problems first and reports what changed.

**Always:** match the project. Use its existing motion library, tokens, components and naming. If it has no motion tokens, add the set from `references/tokens.md` once, in one place, then use only those. Install a motion library only if the project uses React and needs JavaScript animation; plain CSS covers a lot of this skill.

| File | Read it when |
|---|---|
| `references/tokens.md` | Setting up or choosing durations, easings, springs, the blur, keyframes (CSS and JS, ready to paste) |
| `references/patterns.md` | Choosing how something moves: the full pattern catalogue with the reasoning and values |
| `references/components.md` | Building or fixing a specific control: per-component recipes |
| `references/code.md` | You want working code: hooks and components for the core patterns |
| `references/pitfalls.md` | Something animates wrong (jumps, overshoots, floats, flickers, leaves residue) |
| `references/audit.md` | Reviewing or upgrading an existing UI |

## The rules

These hold everywhere. They're short on purpose; the reasons are in the reference files.

### Motion
1. **Motion explains a change.** It shows where something went, what opened, or what's active now. If it doesn't explain anything, cut it. No hover tilts, wobbles, bounces, floating, glows or parallax for decoration.
2. **Content comes and goes through a blur, not a plain fade.** Anything that appears, leaves or swaps sharpens in from a 6px blur while it fades, with whatever movement its pattern already has (a popover still scales, a list item still rises). Fills, highlights, hover states, full-screen overlays and scroll-edge fades stay plain fades: a blurred solid shape reads as a glow.
3. **Animate only `transform` and `opacity`.** The exceptions, each used deliberately: height (and width) that glides to fit new content, a tiny icon stroke drawing itself (`pathLength` / `stroke-dashoffset`), the 6px blur on content that comes and goes.
4. **Use one small set of timings.** Durations 80 / 150 / 220 / 350 / 500ms, an ease-out, an ease-in and an ease-in-out, three springs. Never invent a number in a component. See `references/tokens.md`.
5. **Springs for position, tweens for size and progress.** Things that move (an indicator, a thumb, a panel) use a spring, so they can be interrupted and keep their speed. Things that resize (height, width) or report progress use an eased tween or a heavily damped spring, because overshoot bounces the page or shows progress that isn't real.
6. **Exits are faster than entrances.** Enter on ease-out over 220–350ms; leave on ease-in over 150–220ms. Nobody waits for something they dismissed.
7. **Every animation can be interrupted.** A new change starts from where things are now, at the speed they're moving, never from the end or the start. Toggle twice fast and it turns round mid-way.
8. **Nothing animates on first paint.** The page arrives in its final state. Only a change the user just made animates. A state restored from storage or the server jumps.
9. **Reduced motion is always respected.** With `prefers-reduced-motion: reduce`: no movement, no blur, no loops; opacity changes only, or instant. CSS durations collapse to ~0 through the tokens; JavaScript checks the preference itself.
10. **One indicator per set.** A sliding pill, an underline or a row highlight is one element that moves, scoped to its own set, so two sets on a page never trade it.
11. **Measure in layout pixels, not on-screen boxes.** Use `offsetLeft`/`offsetTop`/`offsetWidth`, not `getBoundingClientRect`, for anything you animate between. On-screen boxes double the movement inside a zoomed or scaled parent and go wrong when the parent moves.
12. **Clean up.** Clear inline `filter`, `transform`, `height` and `will-change` when an animation ends. Cancel loops, disconnect observers, stop animations on unmount. A leftover `filter` or `transform` creates a stacking context that breaks the next thing.
13. **Nothing jumps in size.** A button that swaps "Save" → "Saving…" → "Saved" keeps one width (lay every state out in one grid cell). Reserve room for content that will appear, or glide to the new size.

### Look
14. **Neutral first.** Near-black and white surfaces, greys for structure, one accent used sparingly. Primary buttons can be neutral. Colour carries meaning (danger red), not decoration.
15. **No glow, no grain, no multi-colour gradients.** If a gradient is needed, keep one hue and move only lightness, a few percent.
16. **Few borders.** Depth comes from soft shadows and small lightness steps between surfaces. Borders are for form fields, code blocks, tables and dividing rules.
17. **Flat controls.** No shadows on buttons, switches or toggles, no scale on press. Hover and press are a tint.
18. **Calm.** When unsure, take something away. Users notice smoothness, not effects.

### Behaviour and accessibility
19. **Visible focus on everything interactive** (`:focus-visible`), and focus never gets lost. When the focused element disappears, move focus to its counterpart.
20. **Hover effects are for the mouse.** Use `(hover: hover)` / `pointerType === "mouse"`; touch never gets stuck in a hover state.
21. **Busy is not disabled.** A button doing work gets `aria-busy` and ignores clicks, but keeps focus. Disabling it drops the keyboard user to the top of the page.
22. **Moving things stay readable.** Announce results in a polite live region; hide duplicated or decorative copies from screen readers (`aria-hidden`, `inert`); anything that loops for more than 5 seconds can be paused.
23. **Hidden is not gone.** Collapsed content stays in the HTML (`hidden="until-found"` where possible) so find-in-page and search engines see it.

## The pattern map

| What's changing | Pattern | Key values |
|---|---|---|
| Active item in a row (tabs, segmented control, filter, pagination) | One pill or underline **slides** to it | spring snappy; the set is `isolate`, items aren't stacking contexts |
| Active or hovered row in a list (menu, select, sidebar, results) | One highlight **glides** between rows; hover is mouse-only and fades out where it left | spring snappy; jumps while typing changes the list |
| Content changes height (tab panel, accordion, popover, validation message) | The wrapper **glides** to the new height, clipped only while moving | 350ms ease-out tween, or a spring damped near 0.9 |
| Content swaps in place (button label, icon, count, title) | Old lifts away blurring, new rises 6px in from blurred | 220ms ease-out; fixed width |
| Items appear in a list or grid | Each rises 12px through the blur, staggered | 350ms ease-out, 50ms apart |
| Popover, menu, select, tooltip opens | Scales from 96% out of its trigger through the blur | in 150ms ease-out, out 80ms ease-in, origin = trigger side |
| Dialog opens | Grows out of the button that opened it, through the blur; backdrop only fades | spring snappy in, 220ms ease-in out |
| Drawer / sheet | Slides from its edge; no blur | spring snappy in, 220ms ease-in out; extend 8px past the edge |
| Panel switches with direction (tabs, months, wizard steps) | New content slides 12px in from the side you moved towards, through the blur | 220ms ease-out |
| A mark moves between separate controls (radio dot, picked date) | One shared mark travels between them, then hands back | spring snappy, measured from offsets |
| Toggle thumb or slider knob | Placed by numbers (`x`, width); stretches on press and while travelling | spring snappy |
| State icon (copy → check, sun → moon) | Swap through the blur, or morph one drawing; checks draw themselves in | 220ms; `pathLength` |
| Button hover and press | One tint layer behind the label: 10% on hover rising 4px, 15% on press | 150ms; no scale, no shadow |
| A number changes | Digits roll like an odometer, up when it grows, down when it shrinks | never tween through every number |
| Progress updates | Rises continuously at an even pace, never in steps, never a spring | each change lasts as long as the gap since the last |
| Rows reorder (sort) | FLIP: each row springs from where it was | spring snappy, offsets |
| Loading with no measure | A calm loop (a spinner, a sheen), paused off-screen | 1–2s periods, all in step |
| Async action on a button | Content swaps through states at a fixed width; spinner, then a drawn check or cross | back to idle after 2s |
| Wrong input (one-time code, password) | One head-shake, then calm | 500ms, x: 0, −8, 7, −5, 3, −1, 0 |
| A loop (marquee, sheen) pauses | Eases its speed to zero instead of freezing | 350ms ease-out |
| Hints along a toolbar | First tooltip waits and animates; the next ones appear at once | 300ms delay, 300ms hand-over window |
| Theme change | View Transition reveal from the click point | 450–1000ms |

Every row is explained, with variations and code, in `references/patterns.md`.

## Never

- Bounce or wiggle for decoration (one exception: a single head-shake for a wrong code).
- Scale buttons on press, add drop shadows on hover, or glow anything.
- Animate `width`, `height`, `top`, `left`, `margin` or colours every frame for movement (glide a wrapper's height instead; use `transform` for movement).
- Use `transition: all`.
- Animate on page load, or replay an entrance when a cached state renders.
- Let a spring overshoot a size, a progress value or a screen edge.
- Use timers that let two related things drift apart (drive one from the other's live value).
- Leave a disabled button where focus was, or a hover state on touch.
- Add a library for one effect plain CSS can do.

## Done means

- [ ] Every moving part maps to a pattern above and uses the shared tokens.
- [ ] First paint is still; reduced motion is opacity-only or instant.
- [ ] Interrupting any animation mid-way turns it round smoothly.
- [ ] No layout jumps: widths held, heights glide, nothing reflows under the pointer.
- [ ] Focus is visible and never lost; announcements exist for async results.
- [ ] No inline styles, `filter` or observers left behind (check the DOM after an animation).
- [ ] Checked at 60fps in a real browser, including in a zoomed or scaled container if the UI has one.
