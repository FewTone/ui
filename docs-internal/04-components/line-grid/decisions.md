# Line Grid: decisions

**Status:** published directly, without a Lab step (2026-10-16, built from the roadmap's Backgrounds entry, "Subtle animated backgrounds for heroes and sections"). Kind `background` (`/backgrounds/line-grid`, full-bleed preview), category Backgrounds, beside Dot Grid and Gradient Drift. The page opens on a short hero over the panning grid with the cell size in a Select at the top right. The index card shows the grid alone, still (`preview.card`).

- **What it is:** thin grid lines that fill their parent from behind, for heroes and sections. A layer, not content: `absolute inset-0 -z-10 overflow-hidden pointer-events-none`, `aria-hidden`. It goes first inside a `relative isolate` section: without a stacking context on the parent, `-z-10` slips behind the parent's own background.
- **How it's drawn:** two `linear-gradient`s repeated every `size` px (default 40) draw 1px lines, one vertical and one horizontal per cell. No SVG.
- **Colour:** `currentColor`, with `text-border` on the layer (the colour shadcn uses for lines), at `opacity` 1. So any `text-*` class recolours it, and it uses only shadcn's colours. Neutral, no glow.
- **The edge fade:** the same radial mask as Dot Grid (solid to 30%, then a half-cosine ease to nothing, so there's no rim), on the outer layer. It stays put while the lines move underneath, so the edges never travel. `fade={false}` turns it off.
- **Server-safe:** `line-grid.tsx` has no `"use client"`. The lines are plain HTML and CSS, so they render without JavaScript, and without `pan` no JavaScript ships for the grid. The pan is `line-grid-pan.tsx`, a small client part.
- **Motion (the crafted detail): a seamless pan.**
  - **One oversized layer:** the lines sit on a layer one cell larger up and to the left. Still, that changes nothing (the lines fall on the same pixels). Panning, the layer slides one cell down and to the right and starts again; the pattern repeats every cell, so the restart lands on identical pixels and the loop has no seam.
  - **Transform only:** a Web Animation on `transform`, composited by the browser without repainting. The Web Animations API directly, as Skeleton's sheen does: an endless loop that can pause and play needs nothing more.
  - **The pace:** a cell every 12s at `speed` 1 (24 × `duration.slower`, the same way Skeleton derives its period), on a linear curve. It's ambient: steady, never easing in and out each cell, and slow enough to read as still at a glance. `speed` scales it; 0 holds it still.
  - **Only while it can be seen:** paused off-screen (IntersectionObserver) and while the tab is hidden (`visibilitychange`).
  - **Reduced motion:** no pan; the plain grid.
  - **First paint:** still. The pan starts from the resting position once React runs, so there's no jump.
  - **Clean up:** the animation is cancelled and the observer and listener removed on unmount, or when the size, speed or motion preference changes.
- **Demos:**
  - **Behind a hero (the page's hero):** the section fills the full-bleed preview (`self-stretch`, `preview.height: "lg"`), with `pan` on and the cell size (24, 40 or 64px) in a Select at the top right.
  - **Card:** the grid alone at 24px cells, still, in a `h-28` box stretched over the card tile's padding with `-inset-5`. Still, so the index page stays calm.
- **Tests:** a layer hidden from screen readers and the pointer, behind its siblings; the cell size reaches the lines and the oversized layer; opacity; the fade on and off; still unless `pan`; the pan's keyframes (one cell), 12s at speed 1, 6s at speed 2, none at speed 0; paused off-screen and in a hidden tab, playing again on screen; cancelled and disconnected on unmount; still with reduced motion; axe on a section using it. jsdom has neither the Web Animations API nor IntersectionObserver, so both are recording stubs, restored after each test.
- **Not built yet:** a pan direction prop (always down and to the right); dashed or thicker lines; a highlighted cell under the pointer; other fade shapes (towards the bottom only).
