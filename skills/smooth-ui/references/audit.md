# Audit: making an existing UI smoother

A repeatable pass over a project. Do it in order: the early steps make every later fix cheaper. Change only what the pass finds; don't redesign the product, rename things or restyle its brand.

## 1. Read the project (no changes)

- **Stack:** framework, styling (Tailwind, CSS modules, CSS-in-JS), component primitives (Radix, React Aria, Headless UI, custom), motion library if any (`motion`/Framer Motion, GSAP, react-spring, CSS only).
- **Tokens:** are durations, easings, colours and spacing defined once? Search for raw values: `ms`, `cubic-bezier`, `transition:`, `animation:`, `duration-`, `ease-`, `spring`.
- **Inventory:** list every interactive and moving part: buttons, toggles, tabs, menus, selects, dialogs, drawers, toasts, tooltips, accordions, lists that change, loading states, numbers that change, progress, forms with validation.
- **Reduced motion:** is `prefers-reduced-motion` handled anywhere?

Write the inventory down. It's the checklist for the rest.

## 2. Set up the foundation

- Add the token set from `tokens.md` (or map onto the project's existing one): five durations, three easings, three springs, the 6px blur, the shared keyframes.
- Add the reduced-motion block (durations collapse) and a JavaScript check where JS animates.
- Replace scattered raw timings with tokens as you touch each file.

## 3. Fix in this order (highest value first)

1. **Layout jumps.** Buttons that change width, content that pops in and pushes the page, heights that snap, centred layouts that re-centre under the pointer. → hold widths, glide heights, reserve space, anchor to the top.
2. **Things that appear and vanish with no transition.** Popovers, menus, dialogs, tooltips, toasts, messages. → the floating-surface entrances, the blur, the dialog growing from its trigger.
3. **Active states that jump.** Tabs, segmented controls, nav items, menu rows. → a sliding indicator, a gliding highlight.
4. **Feedback that's missing.** Async buttons with no loading or result, copy with no confirmation, validation only on submit. → the async button, the copy swap, live validation.
5. **Animations that feel wrong.** Bouncy springs on sizes, slow exits, linear easing on UI, `transition: all`, animating `width`/`top`/`left` for movement, scale on button press, hover glows. → replace with the pattern and tokens.
6. **Loops.** Spinners and skeletons out of step or running off-screen; marquees that freeze. → the loop rules.
7. **Details.** Drawn checks, number rolls, stagger on revealed lists, chevron turns, sub-menu nudges.

## 4. Check each part

For every item in the inventory:

- [ ] It matches a pattern in `SKILL.md`'s map, with the pattern's values.
- [ ] It uses tokens only.
- [ ] First paint is still (`initial={false}` or equivalent).
- [ ] Reduced motion: instant or opacity-only.
- [ ] Interrupting it mid-way turns it round from where it is.
- [ ] Only `transform`, `opacity` (and the sanctioned height/width glide, stroke draw, 6px blur) animate.
- [ ] Exits are quicker than entrances.
- [ ] Nothing left behind afterwards: inline `filter`/`transform`/`height`, observers, loops.
- [ ] Focus is visible and never lost; async results are announced; hover is mouse-only.
- [ ] No layout shift in the surrounding page.

## 5. Verify in a browser

Unit tests can't see motion. For each changed part:

- Trigger it, then trigger it again mid-animation.
- Check it in light and dark mode, at phone width, and with reduced motion turned on (DevTools → Rendering → Emulate `prefers-reduced-motion`).
- Watch the Performance panel for long frames during the animation; only compositor work should show for transform/opacity animations.
- Inspect the element after the animation: no leftover inline styles.

## 6. Report

Give the owner a short list:

- What changed, per part, in plain words ("Tabs: the underline now slides to the chosen tab; panels glide to their height").
- Anything skipped and why (a library limitation, a brand decision that needs them).
- What still needs their eye in a browser.

Keep it to what they'd notice using the product, not the implementation.
