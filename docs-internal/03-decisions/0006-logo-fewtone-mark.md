# 0006 · Logo: the FewTone mark, unchanged

- **Status:** Accepted (2026-10-12, by the owner)

## Context
FewTone UI needed a logo before the docs site, so it could be used from the start. FewTone, the studio behind the library, already has a mark: a solid block with a liquid white shape cut through it, two thin slits, and the same shape when rotated 180°. It is used on fewtone.com, often in white on a dark orb.

We explored a separate FewTone UI mark over 16 rounds. None of them beat the studio mark.

| Direction | Examples | Why it was rejected |
|---|---|---|
| Geometric and motion symbols | Focus tile, sparks, orbits, easing curves | Generic. They look like stock icons or other brands' clichés: Motion's dot with speed lines, shadcn's `//`, LottieFiles' curve. |
| Letter marks | A geometric F | The owner ruled out letters. Every geometric F reads as Framer, Figma or Flutter. |
| Dimensional marks | Isometric keys, cel-shaded blocks | Too 3D, and too detailed at 16 px. |
| Liquid (metaball) marks | Pill, ring and dot fusing; splash; droplets | The owner liked the liquid feel, but no abstract shape landed. Several were called "nonsense": they didn't mean anything at a glance. |
| Recognisable UI objects | A toggle, a window or a slider with a liquid detail | Too literal. "Understandable" was a hint, not a brief to draw UI controls. |
| Seven unrelated ideas | Tones, Halftone, Stagger, Lift, Bento, Pop, Morph | Good craft, but none felt like *the* brand. |
| Derived from the FewTone mark | Frame, Slash, Kit, Wireframe, Toned, Pill | Close. They showed that the studio mark already carries the liquid identity the owner wanted. |

Two further questions came up once the mark was chosen:

| Question | Options | Outcome |
|---|---|---|
| How to write the name in the logo | `fewtone/ui` (code style, like shadcn/ui), `FewTone/ui`, `FewTone UI` | **FewTone UI.** The other two gave the brand a second spelling next to the studio's, and the slash borrows shadcn's signature. |
| Logo animation | Pieces assembling, half-turn loader, hover parting; then liquid motion inside the channel (pour, bloom, ripple on hover, flow loader, fill progress) | **No logo animation.** The owner decided it isn't needed. Motion belongs to the components, and the logo stays still. |

## Decision
**FewTone UI uses the FewTone mark exactly as it is, static, with the name written "FewTone UI" in Geist** ("FewTone" in full ink, "UI" softer).

There are two versions (the stacked one was retired on 2026-10-12, see the update below):

| Version | Where | In code |
|---|---|---|
| Horizontal: mark and name side by side | Header (`text-body-lg`), footer (`text-h1`, `tone="brand"`), mobile menu | `Logo` |
| Mark only | Small, square places: favicon, app icon, avatars | `LogoMark` |

- **Source files:** `apps/www/public/Logo/`
  - `Logo_mark.svg`: the mark
  - `Logo_black.svg`: the FewTone studio lockup (mark and "FewTone"), kept for the studio, not used by FewTone UI
  - `favicon.ico`: 32 px
- **In code:** `Logo` and `LogoMark` are in `apps/www/components/logo.tsx`. The mark is an inline SVG in `currentColor`, so it takes the text colour of wherever it sits.
- **Spacing:** the gap is 0.4 × the text size (`--space-logo-gap`).
- **Colour:** one colour only, never a gradient, never Navy:
  - near-black (`--foreground`) on light
  - near-white (`--foreground`) on dark
  - white (`--brand-foreground`) on the Navy footer
- **Size:**
  - **In the horizontal logo:** the mark is 0.9 × the text size (`--size-logo-inline`). Set the size with a text class on `Logo`, and the mark and the gap follow. The name sits on a line box exactly 1em tall (`leading-none`), so its capitals stay centred on the mark.
  - **On its own:** `LogoMark` is sized by height with `--size-logo-sm` (1rem) or `--size-logo-lg` (2.5rem).
  - The width always follows the mark's 42:30 shape.
- **Icons:** in `apps/www/app/`, which Next.js links automatically:
  - `favicon.ico`: the studio favicon
  - `icon.svg`: switches between black and white with the browser's colour scheme
  - `apple-icon.png`: 180 px, white mark on near-black

## Consequences
- One brand across the studio and the library. There is no second mark to maintain.
- The logo never animates. Don't add intro, hover or loading animations to it.
- The mark is not a `packages/ui` component. It belongs to the site, not to what users install.
- Don't propose a new FewTone UI symbol, another spelling or logo motion again unless FewTone itself rebrands. The tables above record what was tried.
- **Still to do:** a social (Open Graph) image when the docs site shell lands.

## Update (2026-10-12): bigger header logo, horizontal footer
The owner asked for three changes after seeing the live site:
- **Header name:** "FewTone UI" was too small at 14 px. It is now 18 px (`text-body-lg`).
- **Centring:** the name didn't sit centred on the mark. It is now centred (`leading-none` on the name).
- **Footer:** it uses the horizontal logo, side by side, instead of the stacked one.

To support these, the horizontal logo became one component that scales with its text class (the em-based tokens above). The stacked version is retired.
