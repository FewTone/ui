# 0002 · Brand colour: Navy, used sparingly

- **Status:** Accepted (2026-10-08, by the owner)
- **Builds on:** ADR 0003 (neutral-first brand direction)

## Context
- The owner wants a very minimal product: a plain near-black or white interface, with one colour reserved for meaningful places.
- Blue was liked but felt overused.
- Midnight and Clay were shortlisted, each with six variations. Navy, the brighter Midnight variation, holds up best in dark mode.

## Decision
- **Brand colour:** Navy, `oklch(0.46 0.14 258)`. It appears only in:
  - the footer
  - Pro and premium surfaces
  - "New" signals
  - the announcement and Pro badge edges
  - text selection
  - the info status
- **Gradients:** one tone. Hue and chroma stay fixed and lightness moves ±0.055 (the "Deeper" option), with a slightly lighter pool at the top.
- **Removed effects:** no glow and no grain.
- **Status colours:** deep and muted, in Navy's tone:
  - success: hue 150
  - warning: hue 70, with near-black text on the solid
  - danger: hue 25
  - info: reuses Navy
- **Neutrals:** pure grey, with no tint.

## Consequences
- Primary buttons stay neutral, so the brand never competes with actions.
- Navy and info share a hue. That is intentional: info is the brand speaking.
- Every value is generated from `scripts/tokens/generate-palette.mjs`, so changing the brand later means editing a few numbers and running `pnpm tokens`.
