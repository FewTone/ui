# 0011 · The blur for content that comes and goes

- **Status:** Accepted (2026-10-15, by the owner)
- **Builds on:** ADR 0009 (component distribution); the motion standard in `.agents/rules/motion.md`

## Context
Loading Button and Copy Button swap their content through a blur: the old lifts away blurring, and the new rises 6px from blurred. The owner liked it and asked for it "everywhere in the app … instead of fade". Until then, popovers, tooltips, tab panels, list items and messages only faded.

## Decision
- **Content that appears, leaves or swaps sharpens in from a 6px blur as it fades.** It keeps the movement its pattern already had: a popover still scales from its trigger, list items still rise 12px, a tab panel still slides 12px.
- **One value, in one place:**
  - JavaScript: `blur` (`hidden: "blur(6px)"`, `shown: "blur(0px)"`) and `swap` (the 6px rise through the blur) in `packages/ui/src/lib/motion.ts`. That file ships to users as the `motion` registry item.
  - CSS: the keyframes in `tokens.css` use the same 6px. `pnpm check:tokens` fails if the two drift apart.
- **Renamed:** `animate-fade-in` / `animate-fade-out` are now `animate-blur-in` / `animate-blur-out`. `rise-in`, `scale-in` and the shipped `popover-in` / `popover-out` blur too.
- **Applied to:**
  - library: Select's popover (keyframes); Copy Button and Loading Button (now the shared `swap`); Input's Invalid demo message
  - site: preview tab panels, Expandable (items, "View all", "View less"), the search window and its Enter arrow, the header tooltip
- **Still a plain fade:**
  - full-screen overlays, because a full-screen blur is too costly (motion standard)
  - fills and highlights: Checkbox's fill, Switch's colour, Toggle Group's pill, the row highlights. A blurred solid shape reads as a glow, which ADR 0003 rules out.
  - hover states and scroll-edge fades, which aren't content coming or going
  - Theme Toggle's `fade` reveal, a full-screen View Transition
- **Reduced motion:** opacity only. CSS durations collapse on their own. In JavaScript, components that don't already branch on it use `blur.shown` as their hidden value.
- **Clean up:** imperative `animate()` calls clear `filter` when they finish, so a leftover `filter` doesn't create a stacking context or a containing block for fixed elements.

## Consequences
- Every new component and page uses the blur for content that comes and goes, without being asked.
- The `motion` and `tokens` registry items change. A user who reinstalls a component gets the blurred popover keyframes and the new exports in `lib/motion.ts`.
- Animating `filter` costs a little more than opacity alone. It stays small: a 6px blur on bounded elements, never the whole screen.
