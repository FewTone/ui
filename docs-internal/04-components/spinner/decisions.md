# Spinner: decisions

**Status:** published directly, without a Lab step (2026-10-16, built from the roadmap note "A small loading indicator"). The page opens on the three sizes and one in a button, named underneath, with With text as the one example. The index card shows the three sizes alone (`preview.card`).

- **What it is:** Loading Button's spinner on its own: a faint ring (25% opacity) with a quarter arc going round it, 2.5 strokes on a 24 grid, round caps, in `currentColor`, so it takes the text's colour.
- **API:** `size` (`sm | md | lg`, the icon sizes: 14, 16 and 20px, so it can stand in for an icon) and an `aria-label` that defaults to "Loading". Every native span prop passes through. shadcn's Spinner is a Lucide icon with `animate-spin`; ours is drawn, because `animate-spin` isn't in the portable vocabulary.
- **Motion:**
  - One turn a second at a constant speed (`duration.slower * 2`, linear), Loading Button's pace.
  - The turn is a `transform` string animation, which motion hands to the Web Animations API, so it keeps turning while the main thread is busy, which is exactly when a spinner shows. Loading Button animates motion's `rotate` instead, which runs in JavaScript each frame.
  - The drawing turns inside a still wrapper, so the spinner's own box, margins and classes never turn, and no transform lands on the SVG (motion.md's SVG pitfall).
  - **Reduced motion:** it doesn't turn; the opacity pulses between 1 and 0.4 (`duration.slower * 3`, `ease.inOut`), as in Loading Button. Switching remounts the loop, so the other never lingers.
  - **Before hydration it's still:** motion only starts once React runs in the browser. A spinner rendered on the server (a Suspense fallback) shows a still arc until then. A CSS keyframe would turn from the first paint; see "Not built yet".
- **Accessibility:** `role="status"`, named by `aria-label`. Inside a button or beside text that already says what's happening, the spinner is `aria-hidden`; otherwise the button's name would become "Loading Saving…". The With text example puts `role="status"` on the row instead, so it's read once as its text. Live regions added to the page together with their content aren't always announced; for a reliable announcement, keep a live region on the page and change its text (as Loading Button does).
- **Demos:** Sizes (hero: Small, Medium, Large, and a disabled outline Button with "Saving…"), With text, and the card.
- **Tests:** a status named Loading, another name and a size, it turns, it pulses instead with reduced motion (the hook stubbed), a hidden spinner leaves the button's name alone, axe.
- **Not built yet:** a CSS-only version (it needs a shipped rotate keyframe), and Loading Button using this component instead of its own copy.
