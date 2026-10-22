# Gradient Drift: decisions

**Status:** published directly, without a Lab step (2026-10-16, built from the roadmap's Backgrounds entry, "Subtle animated backgrounds for heroes and sections"). Kind `background` (`/backgrounds/gradient-drift`, full-bleed preview), category Backgrounds, beside Dot Grid and Line Grid. The page opens on a short hero over the field with the speed in a Select at the top right. The index card shows the field alone, drifting (`preview.card`).

- **What it is:** a soft gradient field whose shapes drift extremely slowly behind a hero or a section. A layer, not content: `absolute inset-0 -z-10 overflow-hidden pointer-events-none`, `aria-hidden`. It goes first inside a `relative isolate` section: without a stacking context on the parent, `-z-10` slips behind the parent's own background.
- **The brand's gradient rule (ADR 0003, design.md):** one hue, lightness only, about ±0.055, never several colours, no glow, no grain.
  - Three soft shapes over whatever is behind, the whole layer at `opacity` 0.05 (group opacity, so overlapping shapes can't add up past it).
  - **Neutral by default:** `foreground` for two shapes and `muted-foreground` for the third, so the field has a little depth while staying grey. On FewTone's palette that's at most about +0.057 lightness in dark mode and −0.036 in light (alpha blending in sRGB is uneven between the two).
  - **`tone="primary"`:** the theme's primary colour for all three, one hue. On FewTone's own site primary is a neutral, so it looks the same as neutral here; in a branded project it takes the brand.
  - Colours come from `text-*` classes and `currentColor`, so only shadcn's colours are used.
- **The blur is baked in:** each shape is a `radial-gradient(closest-side, …)` that eases out to nothing along a half cosine, so it reads as a blurred pool with no rim. There's no CSS blur filter, animated or not (motion.md: never animate a large blur).
- **The shapes follow the section:** positions and sizes are percentages of the layer, so on a wide hero they're wide pools and on a phone taller ones.
- **Motion (the crafted detail): three pools that never settle into a pattern.**
  - Each slides about a fifth of its own size and grows or shrinks a little (to 1.1, 0.92 or 1.08), there and back (`direction: "alternate"`) on `ease.inOut`, so it never jolts at either end.
  - **The pace:** the slowest way is 20s at `speed` 1 (40 × `duration.slower`, the same way Skeleton derives its period); the three run at 1, 1.3 and 1.7 times that (20, 26 and 34s each way), so the field doesn't repeat the same way in a short while. `speed` scales it; 0 holds it still.
  - **Transform only:** Web Animations on `transform`, composited by the browser. The Web Animations API directly: endless loops that pause and play need nothing more.
  - **Only while it can be seen:** paused off-screen (IntersectionObserver) and while the tab is hidden (`visibilitychange`), as the roadmap brief asked.
  - **Reduced motion:** a still field.
  - **First paint:** the server renders the still field, and the drift starts from it once React runs, so there's no jump.
  - **Clean up:** every animation is cancelled and the observer and listener removed on unmount, or when the speed or motion preference changes.
- **One client file:** unlike Dot Grid and Line Grid, the motion is the point here and it needs effects, so `gradient-drift.tsx` is a single `"use client"` file. It still renders the field on the server.
- **Demos:**
  - **Behind a hero (the page's hero):** the section fills the full-bleed preview (`self-stretch`, `preview.height: "lg"`). The speed (1×, 2× or 4×) is in a Select at the top right, because at 1× the drift is slow enough to read as still while reviewing.
  - **Card:** the field alone in a `h-28` box, stretched over the card tile's padding with `-inset-5`, so the pools fill the tile.
- **Tests:** a layer hidden from screen readers and the pointer, behind its siblings; three neutral pools at 5% with the blur in a gradient and no filter; primary tone and opacity; each pool drifts there and back, forever, at 20, 26 and 34s; faster at speed 2, none at speed 0; paused off-screen and in a hidden tab, playing again on screen; cancelled and disconnected on unmount; still with reduced motion; the ref passes through; axe on a section using it. jsdom has neither the Web Animations API nor IntersectionObserver, so both are recording stubs, restored after each test.
- **Not built yet:** a number-of-shapes or placement prop; drifting towards the pointer; a `tone` for other theme colours (`secondary`, `accent`); banding is possible on very large, very dark screens (there's no grain to hide it, by the brand rule), which the owner should judge on the dev server.
