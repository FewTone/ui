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

There are three versions:

| Version | Where | In code |
|---|---|---|
| Horizontal: mark and name side by side | Header, navigation, docs | `Logo` |
| Stacked: mark above the name | Footer, large moments | `LogoMark` above the name (see the footer in `app/page.tsx`) |
| Mark only | Small, square places: favicon, app icon, avatars | `LogoMark` |

- **Source files:** `apps/www/public/Logo/`
  - `Logo_mark.svg`: the mark
  - `Logo_black.svg`: the FewTone studio lockup (mark and "FewTone"), kept for the studio, not used by FewTone UI
  - `favicon.ico`: 32 px
- **In code:** `Logo` and `LogoMark` are in `apps/www/components/logo.tsx`. The mark is an inline SVG in `currentColor`, so it takes the text colour of wherever it sits.
- **Spacing:** the mark sits close to the name, about 0.3 × the text size (`gap-1.5` in the header, `mb-3` in the footer).
- **Colour:** one colour only, never a gradient, never Navy:
  - near-black (`--foreground`) on light
  - near-white (`--foreground`) on dark
  - white (`--brand-foreground`) on the Navy footer
- **Size:** set by height, using `--size-logo-sm` (1rem, header) and `--size-logo-lg` (2.5rem, footer). The width follows the mark's 42:30 shape.
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
