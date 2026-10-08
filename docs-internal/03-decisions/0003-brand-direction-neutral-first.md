# 0003 · Brand direction: neutral first

- **Status:** Accepted (2026-10-08, by the owner)
- **History:** three brand rounds on 2026-10-07/08. The exploration files were deleted once this was decided; they are recoverable from the first commit (`09b14fc`).

## Context
The owner wanted a gradient brand with a "matte finish", and it had to work in both dark and light themes. Three rounds were shown:

| Round | Direction | Outcome |
|---|---|---|
| 1 | Four directions with 3–5 colours each: mesh, iridescent and anodized gradients | Rejected: too many colours, felt wrong |
| 2 | One hue per option, light→dark and light→glow gradients, visible grain | Good, not great: grain too strong, gradients jumped from very light to dark, colour too dominant |
| 3 | Neutral near-black/white site, one accent used sparingly, plus an optional premium layer | Accepted, with the edits listed below |

## Decision
- **The site is neutral.** Near-black in dark mode and white in light mode. The brand colour is *not* the primary colour, and primary buttons stay neutral.
- **The brand colour appears only where it means something:**
  - the footer
  - Pro and premium surfaces
  - "New" signals
  - badge edges
  - text selection

  The colour itself is Navy (ADR 0002).
- **Gradients use one tone.** Hue and chroma stay fixed and lightness varies by about 0.11 (the "Deeper" option). They are never multi-colour, and never jump from very light to dark.
- **Kept from round 3:**
  - the headline gradient text (full ink at the top, softer grey toward the bottom)
  - gradient-edged announcement and Pro badges
  - the shaded neutral primary button
- **Removed, so do not reintroduce them:**
  - grain or noise
  - all glows (hero, Pro card, footer)
  - the light-leak hairline at the top of the hero
  - mesh and iridescent gradients

## Consequences
- The brand is carried by restraint: colour shows up rarely, so each use stands out. Layout, type and motion carry the rest.
- **If glow or grain is ever revisited:**
  - Glow only reads in dark mode; light mode needs tinted washes or shadows instead.
  - Grain works best as an SVG `feTurbulence` noise used as a mask, kept to 3–6% visible and static.
- Gradients are interpolated in `oklch` with explicit tinted endpoints (never the `white` or `black` keywords). See `01-brand/design-system.md` §4.
