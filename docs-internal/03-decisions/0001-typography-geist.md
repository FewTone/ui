# 0001 · Typography: Geist + Geist Mono

- **Status:** Accepted (2026-10-08, by the owner)
- **Context file:** `01-brand/foundations.html` (section 5 and 6), research in `06-research/typography-2026-10.md`

## Context
The library and docs need one type system that is free to ship in an MIT repo (SIL OFL), works well for UI and display sizes, and has a matching mono for code and install commands. Four OFL options were shown side by side: Inter + JetBrains Mono, Geist + Geist Mono, Instrument Sans + Instrument Serif, and Inter + Newsreader.

## Decision
Use **Geist** for all text and **Geist Mono** for code, commands, keyboard shortcuts and uppercase eyebrow labels. No separate display face.

- **Weights:** 400 for body, 500 for labels and buttons, 600 for headings, 700 for rare emphasis.
- **Tracking:** follows Vercel's Geist scale:
  - about −0.055em at display sizes
  - −0.05em for h1
  - −0.04em at 32px
  - about −0.02em at 20px
  - 0 for body text
- **Sizes:** display and h1 use `clamp()`; everything else is a fixed size.

## Consequences
- **Font files:** self-host from the `geist` npm package with `next/font/local`. The Google Fonts build drops the stylistic sets (ss01–ss11).
- **Identity:** Geist is Vercel's typeface and the Next.js default, so the type alone won't set the brand apart. The brand colour, footer, layout and motion have to carry the identity.
- **Tabular figures:** Geist has them (`tnum`), so animated counters stay aligned.
