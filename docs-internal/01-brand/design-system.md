# Design system

The single reference for every visual value in the library and its website. The code is the source of truth; this document explains it. If they ever disagree, fix the document.

- **Status:** v1, adopted 2026-10-08
- **Live view:** run `pnpm dev`, then open `/lab/tokens` (development only)
- **Decisions:**
  - `03-decisions/0001-typography-geist.md`
  - `03-decisions/0002-brand-colour-navy.md`
  - `03-decisions/0003-brand-direction-neutral-first.md` (what was tried, what was rejected and why)

---

## 1. Principles

1. **Neutral first, colour on purpose.** The interface is near-black in dark mode and white in light mode. The brand colour appears only where it means something.
2. **One tone per gradient.** A gradient keeps one hue and chroma and moves lightness only, by about ±0.055. There are never multi-colour gradients.
3. **No glow, no grain.** Both were tried and removed. Depth comes from a top highlight, soft neutral shadows and gentle lightness shifts.
4. **Nothing hardcoded.** Every colour, size, space, radius, shadow, duration and easing comes from a token. `pnpm check:tokens` enforces this.
5. **Accessible by default.**
   - Every interactive element has a visible focus ring.
   - Text meets contrast targets.
   - Every animation respects `prefers-reduced-motion`.
6. **Dark first.** Dark is the default theme. Light is designed with the same care, not inverted.

---

## 2. Where the tokens live

```
packages/ui/src/styles/
├─ palette.css   primitive colour scales (GENERATED, do not edit)
├─ theme.css     semantic colours, elevation and gradients, light and dark
├─ tokens.css    type, spacing, radius, layout, motion, layering
└─ globals.css   Tailwind bridge, base styles, brand utilities (the only file apps import)
packages/ui/src/lib/motion.ts   motion tokens for motion/react (mirrors tokens.css)
scripts/tokens/generate-palette.mjs   colour generator (edit hues here)
scripts/check-tokens.mjs             enforcement
```

Apps import the whole system with one line: `@import "@fewtone/ui/globals.css";`.

**Changing colours:**
1. Edit the hue numbers in `scripts/tokens/generate-palette.mjs`.
2. Run `pnpm tokens`.
3. Check the result at `/lab/tokens` in both themes.

---

## 3. Colour

### 3.1 Brand: Navy
| | Value |
|---|---|
| Hue / chroma / solid lightness | 258 / 0.14 / 0.46 |
| Solid (both themes) | `oklch(0.46 0.14 258)` |
| Gradient top / bottom | `oklch(0.515 0.14 258)` → `oklch(0.405 0.14 258)` |
| Highlight pool | `oklch(0.53 0.14 258 / 0.9)` |
| Text on brand | white |

**Where the brand colour is allowed**

| Place | How |
|---|---|
| Footer | `surface-brand-footer`, with the wordmark in `text-gradient-on-brand` |
| Pro and premium cards | `surface-brand` |
| Beta badge | `edge-shine` badge: a solid Navy edge with two light shines travelling round it. (It was the "New" badge; New tags were removed everywhere, owner 2026-10-14.) |
| Announcement pill, Pro link | `edge-brand` (border fades from brand to neutral) |
| Text selection | automatic (`--selection`) |
| Info status | `info-*` tokens alias the brand scale |
| Launch moments | OG images, social cards, announcement banners |

**Where it never appears:**
- navigation and body text
- primary buttons, which stay neutral: black on light, white on dark
- borders and focus rings
- component previews in the docs

### 3.2 Neutrals
A pure grey scale with no hue and no chroma. It follows the 12-step role model from Radix.

| Step | Role | Light L | Dark L |
|---|---|---|---|
| 1 | App background | 1.00 | 0.13 |
| 2 | Subtle background (cards in dark, sidebar) | 0.985 | 0.16 |
| 3 | Element fill | 0.965 | 0.195 |
| 4 | Element hover | 0.945 | 0.225 |
| 5 | Element active / selected | 0.925 | 0.255 |
| 6 | Subtle border | 0.905 | 0.285 |
| 7 | Border (inputs) | 0.875 | 0.33 |
| 8 | Strong border, focus ring | 0.81 | 0.42 |
| 9 | Solid | 0.62 | 0.52 |
| 10 | Solid hover | 0.57 | 0.58 |
| 11 | Muted text | 0.48 | 0.72 |
| 12 | Text | 0.17 | 0.97 |

All values are written `oklch(L 0 0)`.

### 3.3 Status colours
They are deep and muted, in the same tone as Navy: low chroma and similar lightness, so they inform without shouting. Info reuses the brand scale.

| Status | Solid (9) | Subtle bg light / dark (3) | Border light / dark (6) | Text light / dark (11) | Text on solid |
|---|---|---|---|---|---|
| Success | `oklch(0.52 0.105 150)` | `0.955 0.015 150` / `0.229 0.026 150` | `0.865 0.04 150` / `0.357 0.049 150` | `0.42 0.095 150` / `0.78 0.079 150` | white |
| Warning | `oklch(0.66 0.11 70)` | `0.955 0.015 70` / `0.238 0.028 70` | `0.865 0.042 70` / `0.384 0.052 70` | `0.52 0.099 70` / `0.79 0.083 70` | near-black |
| Danger ("Signal red", owner 2026-10-14) | `oklch(0.55 0.2 27)` | `0.955 0.028 27` / `0.236 0.05 27` | `0.865 0.076 27` / `0.377 0.094 27` | `0.45 0.18 27` / `0.78 0.15 27` | white |
| Info | = Navy solid | = Navy 3 | = Navy 6 | = Navy 11 | white |

Each status colour must always come with an icon or a label. Colour is never the only signal.

### 3.4 Semantic tokens (what components use)
Components use only these, as Tailwind utilities (`bg-card`, `text-muted-foreground`, `border-border`...). The names match shadcn/ui so registry components drop straight into existing projects. The primitive scales (`--gray-*`, `--navy-*`...) are **not** exposed as utilities.

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | gray-1 | gray-1 | Page |
| `foreground` | gray-12 | gray-12 | Main text |
| `card`, `popover` | white | gray-2 | Raised surfaces |
| `muted` | gray-3 | gray-3 | Quiet fills, code blocks |
| `muted-foreground` | gray-11 | gray-11 | Secondary text |
| `accent` | gray-4 | gray-4 | Hover surface (shadcn name, not the brand) |
| `preview` / `preview-hover` | gray-4 / gray-5 | gray-4 / gray-5 | Item card preview tile, one step past muted so it stands apart from the card |
| `--shine` | Navy 65% towards white | same | The light shines on the Beta badge's edge (`edge-shine`) |
| `overlay` | black 40% | black 60% | Behind dialogs |
| `border` | gray-6 | gray-6 | Dividers, card edges |
| `input` | gray-7 | gray-7 | Input borders |
| `ring` | gray-8 | gray-8 | Focus ring (neutral) |
| `primary` / `primary-foreground` | gray-12 / gray-1 | gray-12 / gray-1 | Main buttons |
| `secondary` / `secondary-foreground` | gray-3 / gray-12 | gray-3 / gray-12 | Secondary buttons |
| `brand`, `brand-foreground` | navy-9, white | navy-9, white | Brand surfaces |
| `brand-subtle`, `brand-border`, `brand-text` | navy-3, navy-7, navy-11 | same steps (dark scale) | Badges, edges, brand text |
| `success-*`, `warning-*`, `danger-*`, `info-*` | step 9 / 3 / 6 / 11 | same steps | Status UI |
| `destructive` | = danger | = danger | shadcn alias |
| `chart-1…5` | navy-9, navy-7, success-9, warning-9, gray-9 | same | Charts |
| `sidebar-*` | shadcn sidebar set | | Sidebar component |

Each status colour has five tokens: `<status>`, `<status>-foreground`, `<status>-subtle`, `<status>-border` and `<status>-text`.

### 3.5 Theming mechanics
- Themes are class-based: `.dark` on `<html>`, set by `next-themes` with the default theme `dark`.
- Every semantic token is also declared on `.light` and `.dark`, so you can scope a theme to any element. For example, a docs preview can show both themes side by side with `<div className="dark">`.
- Use the `dark:` variant only for rare one-off differences. Prefer a token that already changes per theme.

---

## 4. Gradients and surfaces

| Utility | What it does | Where |
|---|---|---|
| `surface-brand` | One-tone Navy gradient, lighter pool top-left, top highlight, depth shadow (outline ring in dark) | Pro card, premium blocks |
| `surface-brand-footer` | Same tone, pool centred at the top, top highlight | Site footer |
| `text-gradient-heading` | Headline shades from full ink at the top to softer grey at the bottom | Hero and page titles |
| `text-gradient-on-brand` | Same idea, on a brand surface | Footer wordmark |
| `bg-gradient-primary` | Neutral main button with a soft vertical shade | Primary buttons |
| `edge-brand` | 1px border fading from brand to neutral. Set `[--edge-fill:var(--card)]` when it sits on a card. | Announcement pill, Pro link |
| `edge-shine` | 1px solid Navy edge with two light shines travelling round it (`--shine-width` 15% each side, one lap per `--shine-lap` 3s). Transparent inside; rests with reduced motion. No glow. | New and Beta badges |
| `trim-leading-end` | Pulls back the empty half-line under the last line of text, so the space below is measured to the letters | Item card description |
| `divider-fade` | 1px divider that fades out at both ends | Section separators |
| `focus-ring` | Standard focus outline for custom interactive elements | Any custom control |

---

## 5. Typography

**Family:**
- Geist for everything.
- Geist Mono for code, install commands, keyboard shortcuts and uppercase eyebrow labels.
- Both are self-hosted from the `geist` npm package through `next/font/local`, which exposes `--font-geist-sans` and `--font-geist-mono`.
- Utilities: `font-sans`, `font-mono`.

**Weights:**

| Utility | Weight | Use |
|---|---|---|
| `font-regular` | 400 | Body text |
| `font-medium` | 500 | Labels, buttons |
| `font-semibold` | 600 | Headings |
| `font-bold` | 700 | Rare emphasis |

**Scale.** Each size utility sets the line height, tracking and weight with it.

| Utility | Size | Line height | Tracking | Weight | Use |
|---|---|---|---|---|---|
| `text-display` | clamp 44 → 72px | 1 | −0.055em | 600 | Hero headline |
| `text-h1` | clamp 36 → 48px | 1.05 | −0.05em | 600 | Page title |
| `text-h2` | 32px | 1.15 | −0.04em | 600 | Section title |
| `text-h3` | 24px | 1.3 | −0.03em | 600 | Subsection |
| `text-h4` | 20px | 1.4 | −0.02em | 600 | Small heading |
| `text-body-lg` | 18px | 1.6 | −0.01em | 400 | Lead paragraphs |
| `text-body` | 16px | 1.65 | 0 | 400 | Default text |
| `text-body-sm` | 14px | 1.55 | 0 | 400 | Dense UI, captions under cards |
| `text-label` | 13px | 1.4 | 0 | 500 | Buttons, labels, nav |
| `text-caption` | 12px | 1.35 | +0.005em | 500 | Meta text |
| `text-overline` | 12px | 1.3 | +0.06em | 500 | Eyebrows (pair with `font-mono uppercase`) |
| `text-code` | 14px | 1.6 | 0 | 400 | Code (pair with `font-mono`) |

**Size rules:**
- Only `display` and `h1` change size with the viewport. Everything else is fixed.
- Override tracking or leading with `tracking-*` or `leading-*` only for a documented reason.

**Tracking tokens:** `display`, `tighter`, `tight`, `normal`, `wide`, `caps`.
**Leading tokens:** `none`, `tight`, `snug`, `normal`, `relaxed`.

---

## 6. Spacing and layout

There are two layers:

1. **Layout tokens (`--space-*`).** These set the site's rhythm and are measured from beUI (ADR 0007). Use them for page structure, the sidebar, cards, tabs, code blocks and tables, for example `gap-(--space-nav-group)` or `mt-(--space-title)`. Change a value once in `tokens.css` and every page follows. **Don't write `py-8` or `mt-10` for layout.** Use a token, or add one with a comment.
2. **The 4px scale.** Only for small gaps inside a control, like an icon beside its label (`gap-1.5`). `p-1` = 4px, `p-4` = 16px. **Allowed steps:** `0, px, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32`. Any other step fails `pnpm check:tokens`.

**Shell**

| Token | Value | Use |
|---|---|---|
| `--space-gutter` | 16 / 24 / 32px (base, md, xl) | Page edge, header and sidebar layout |
| `--space-shell` | 16 / 32px (base, xl) | Sidebar to content |
| `--space-content-top` / `--space-content-first` | 16px / 20px | Header to the sidebar's first row / to the content's first line: plus the row's padding, so every page's breadcrumb is level with "Home" |
| `--space-sidebar-end` | 16px | Sidebar links to its right edge |
| `--space-content-y` | 32px | Content and sidebar padding at the bottom; the footer line |
| `--space-header` / `-header-nav` / `-header-actions` | 16 / 24 / 8px | Header groups / nav links / buttons |
| `--space-section` | clamp(64px, 8vw, 128px) | Landing page sections |

**Sidebar**

| Token | Value | Use |
|---|---|---|
| `--space-nav-group` | 24px | Between groups |
| `--space-nav-label` | 6px | Group label to its links |
| `--space-nav-item-x` / `-y` | 10px / 4px | Link padding. With a 20px line (`leading-5`), rows are 28px. |

**Page**

| Token | Value | Use |
|---|---|---|
| `--space-title` | 16px | Breadcrumb to title |
| `--space-intro` | 8px | Title to description |
| `--space-page` | 40px | Page header to the first section; between index sections |
| `--space-hero` | 24px | Item page: the description to the framed hero preview |
| `--size-collapsed` / `--size-collapsed-fade` | 288px / 96px | A long section's starting height (Installation) and the fade at its foot (`Expandable`) |
| `--space-block` | 48px | Between examples; before Related |
| `--space-heading` | 12px | Section heading to its content |
| `--space-stack` | 16px | Section label to its grid; title row to description |
| `--space-grid` | 16px | Card grid gap |

**Surfaces**

| Token | Value | Use |
|---|---|---|
| `--space-canvas` | 40px | Preview canvas padding |
| `--size-card-preview` / `--space-card-tile` / `--space-card-text` | 152px / 20px / 12px | Item card: live preview tile height, its padding, tile to title |
| `--space-card-frame` / `--space-card-x` / `--space-card-bottom` | 12px / 20px / 12px | Item card: frame round the preview tile; text in from the frame (32px from the card's edge); below the description, with `trim-leading-end` (24px to the letters) |
| `--radius-card` | `--radius-xl` + the frame (26px) | Item card corners, concentric with the tile's |
| `--space-tab-x` / `--space-tab-y` | 14px / 6px | Switcher options (the ink pill) and the pill switches. `--space-tabs` (4px) is the sidebar filter's track padding and gap |
| `--space-bar-x` / `-y` | 12px / 6px | Code block top bar |
| `--space-code-x` / `-y` | 20px / 16px | Code block body |
| `--space-cell-x` / `-y` | 16px / 12px | Table cells |
| `--space-steps` / `--space-step-indent` | 32px / 40px | Manual install steps |

**Borders (beUI rules, ADR 0007).**
- **No border on:**
  - the header until the page scrolls
  - the sidebar
  - cards, which are two-tone: `bg-muted` outside, `bg-card` inside
  - tab lists, which are filled pills
  - the preview canvas, which is open
  - chips
- **Borders only on:**
  - code blocks
  - the API table (outline and row dividers)
  - section rules
  - popovers and dialogs
  - secondary buttons
  - the header's icon buttons

**Widths (`max-w-*`)**

| Utility | Width | Use |
|---|---|---|
| `xs` | 20rem | |
| `sm` | 24rem | |
| `md` | 28rem | |
| `lg` | 32rem | |
| `xl` | 36rem | |
| `heading` | 15ch | Headline line length |
| `prose` | 42rem | Reading width |
| `content` | 72rem | Page content |
| `docs` | 56rem | Docs content column, next to the sidebar |
| `wide` | 80rem | Full-bleed sections, header and docs shell |

**Component sizes**

| Token | Value | Use |
|---|---|---|
| `--size-control-sm` / `-md` / `-lg` | 32px / 36px / 40px | Button and input heights, e.g. `h-(--size-control-md)` |
| `--size-icon-sm` / `-md` / `-lg` | 14px / 16px / 20px | Icon sizes, e.g. `size-(--size-icon-md)` |
| `--size-logo-sm` / `-lg` | 16px / 40px | Height of `LogoMark` on its own, e.g. `h-(--size-logo-sm) w-auto`. The mark is the FewTone mark in `currentColor` (ADR 0006). |
| `--size-logo-inline` / `--space-logo-gap` | 0.9em / 0.4em | Mark height and gap inside the horizontal `Logo`. Both follow the name's font size, so `Logo` is sized with a text class (`text-body-lg` header, `text-h1` footer). |
| `--size-header` | 56px | Sticky site header height; also the sidebar's `top-(--size-header)` |
| `--size-sidebar` | 240px | Docs sidebar width |
| `--size-below-header` | `100dvh − header` | Height of the sticky docs sidebar |

**Merging classes:** `cn()` in `lib/utils.ts` uses tailwind-merge, extended with our type tokens (`text-label`, `text-caption`…) and shadow tokens. Without that extension, tailwind-merge reads `text-label` as a colour and drops it next to `text-muted-foreground`. When you add a type or shadow token, add it there too.

**Breakpoints** are Tailwind's defaults: `sm` 40rem, `md` 48rem, `lg` 64rem, `xl` 80rem, `2xl` 96rem.

---

## 7. Radius

| Utility | Value | Use |
|---|---|---|
| `rounded-xs` | 4px | Tiny marks, kbd |
| `rounded-sm` | 6px | Small chips |
| `rounded-md` | 8px | Inputs, menu items |
| `rounded-lg` | 10px | Buttons (also `--radius` for shadcn) |
| `rounded-xl` | 14px | Cards, footer |
| `rounded-2xl` | 18px | Large panels, Pro card |
| `rounded-3xl` | 24px | Hero media |
| `rounded-full` | pill | Badges, pills, toggles, avatars |

---

## 8. Elevation

The shadows are neutral. Dark mode uses deeper shadows plus a lit top edge on cards.

| Utility | Use |
|---|---|
| `shadow-xs`, `shadow-sm` | Buttons, small controls |
| `shadow-md` | Dropdowns, popovers |
| `shadow-lg` | Dialogs, sheets |
| `shadow-xl` | Rare, floating hero media |
| `shadow-card` | Cards: border plus soft lift (light), lit top edge plus border (dark) |
| `shadow-brand` | Depth under brand surfaces (dark adds a faint brand ring) |
| `shadow-highlight` | 1px inner top highlight on brand surfaces |

---

## 9. Motion

**Durations.** CSS uses `duration-(--duration-*)`. JavaScript uses `duration.*` from `@fewtone/ui/lib/motion`.

| Token | Value | Use |
|---|---|---|
| `instant` | 80ms | Hover colour, press |
| `fast` | 150ms | Toggles, small state changes |
| `base` | 220ms | Default enter and exit |
| `slow` | 350ms | Panels, larger movement |
| `slower` | 500ms | Page-level reveals |

**Easings.** CSS uses `ease-*`. JavaScript uses `ease.*`.

| Token | Curve | Use |
|---|---|---|
| `out` | cubic-bezier(0.22, 1, 0.36, 1) | Entering |
| `in` | cubic-bezier(0.55, 0, 1, 0.45) | Leaving |
| `in-out` | cubic-bezier(0.65, 0, 0.35, 1) | Moving within the page |
| `spring` (CSS only) | `linear()` approximation of a light spring | CSS-only bounce |

**Springs** (motion/react `spring.*`). These are the library's motion voice.

| Name | Stiffness / damping | Use |
|---|---|---|
| `snappy` | 520 / 38 | Toggles, tabs, small controls |
| `smooth` | 120 / 20 | Panels, sidebars, sections |
| `bouncy` | 300 / 15 | Rare moments of delight |

**The blur** (owner, 2026-10-15, ADR 0011). Content that appears, leaves or swaps sharpens in from a 6px blur as it fades, instead of only fading.

| Where | Use |
|---|---|
| JavaScript | `blur.hidden` (`blur(6px)`) / `blur.shown`, and `swap` (a 6px rise through the blur) from `@fewtone/ui/lib/motion` |
| CSS | every keyframe below that fades content also blurs it, with the same 6px (the token check keeps the two in step) |
| Not for | full-screen overlays, fills, highlights, hover or scroll-edge fades: those still only fade |
| Reduced motion | opacity only |

**Keyframe animations:** `animate-blur-in` and `animate-blur-out` (they were `fade-in` / `fade-out`), `animate-rise-in`, `animate-scale-in`, `animate-popover-in` / `animate-popover-out` (shipped to users), and `animate-caret-blink`.

**Press feedback:** a colour step, not a scale (owner, 2026-10-14). The `--scale-press` token was removed.

**Rules:**
- Animate only `transform` and `opacity`, plus the blur on content that comes and goes (above). The other exception is height: content that changes size glides to it through `AutoHeight` (owner, 2026-10-13).
  - **Transition:** an eased tween, `duration.slow` with `ease.out`. It's not a spring, because a spring's overshoot would bounce the page below.
  - **Clipping:** content is clipped only while it moves.
  - **Reduced motion:** it's instant.
  - **Where:** the Preview / Usage / Code card, and Installation opening (`duration.slower`).
- `prefers-reduced-motion` sets every CSS duration to 1ms automatically.
- JavaScript animations must also check `useReducedMotion()` and fall back to opacity, or to no motion.
- `motion.ts` must match `tokens.css`. The token check fails if they drift apart.

---

## 10. Layering, focus and states

**Z-index:** use `z-(--z-*)`.

| Token | Value |
|---|---|
| `base` | 0 |
| `raised` | 10 |
| `dropdown` | 1000 |
| `sticky` | 1100 |
| `overlay` | 1200 |
| `modal` | 1300 |
| `popover` | 1400 |
| `toast` | 1500 |
| `tooltip` | 1600 |

**Focus:**
- The base style is a 2px `ring` outline, offset by 2px, on `:focus-visible`.
- Custom controls use the `focus-ring` utility.

**Disabled:** `opacity-(--opacity-disabled)`, which is 0.5, plus `pointer-events-none`.

---

## 11. Rules (enforced by `pnpm check:tokens`)

1. No raw colours (`#hex`, `rgb()`, `hsl()`, `oklch()`...) outside `palette.css`, `theme.css` and `tokens.css`.
2. No Tailwind arbitrary values such as `p-[13px]` or `bg-[#fff]`. Use a token, or the `(--token)` syntax. Variants like `data-[state=open]:` are fine.
3. No Tailwind default palette classes (`bg-zinc-500`). They no longer exist and render nothing.
4. Padding, margin and gap use only the allowed spacing steps.
5. `lib/motion.ts` durations and easings match `tokens.css`.
6. Library components and their demos (`packages/ui/src/components/**`) use the portable vocabulary (§13), and the site (`apps/`) doesn't use the stock `text-xs`/`text-sm`/`text-base`.

For a genuine exception, add a `check-tokens-ignore` comment on the line and explain why in the component's `docs-internal/04-components/<name>/decisions.md`.

## 13. Library component vocabulary (ADR 0009)

Components are installed into other people's shadcn projects, which have shadcn's colours and their own `cn`, but not our tokens. So components in `packages/ui/src/components` use a smaller, portable vocabulary:

| Use | Not |
|---|---|
| shadcn colours: `background`, `foreground`, `primary`, `secondary`, `muted`, `accent`, `border`, `input`, `ring`, `popover`, `destructive` (+ `-foreground`) | `brand`, `success`, `warning`, `danger`, `info`, `overlay`, `sidebar` |
| stock text sizes `text-xs`, `text-sm`, `text-base` (Tailwind's values, also defined on our site) | `text-label`, `text-body-sm` and the other named sizes |
| shipped tokens via `(--token)`: `--size-control-*`, `--size-icon-*`, `--duration-*`, `--ease-spring`, `--z-popover`, `--focus-ring-*`, `--opacity-disabled` | `--space-*` and other site tokens |
| focus: `outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)` | the `focus-ring` utility |
| popovers: `animate-popover-in` / `animate-popover-out` | `animate-scale-in` and the other site animations |
| radius: `rounded-md` / `rounded-lg` (follows the user's `--radius`); `rounded-sm` and `rounded-xs` only for the smallest controls (Checkbox). `sm` follows `--radius` in shadcn's theme too; `xs` is Tailwind's 2px there, our 4px here. | fixed values |

The shipped list lives in `packages/ui/src/registry/shared.ts`. To ship a new token, add it there, then use it. The registry generator reads its value from the token files.

## 12. Adding or changing a token

1. Ask whether an existing token already does the job. Most needs are already covered.
2. Add it to the right layer:
   - colour scales: the generator
   - roles: `theme.css`
   - everything else: `tokens.css`
   - bridge it in `globals.css` only if it needs a Tailwind utility
3. Add it to this document and to `/lab/tokens`.
4. If it reflects a real design decision, record it as an ADR in `03-decisions/`.
