# Design standard

Always on, for every UI change. The spec with every value is `docs-internal/01-brand/design-system.md`. Brand reasoning is in ADRs 0002 and 0003. Read ADR 0003 before proposing anything visual.

## Look
- **Neutral first.** The UI is near-black (dark, the default) or white (light). Navy, the brand colour, appears only in:
  - the footer
  - Pro and premium surfaces
  - "New" signals (`StatusBadge`: a Navy edge with travelling shines)
  - badge edges
  - text selection

  Primary buttons are neutral.
- **No glow and no grain.** Gradients keep one hue and move lightness only (about ±0.055). There are never multi-colour gradients.
- **Few borders, as on beUI.** There's no border on the sidebar, cards, tabs or preview canvas, and none under the header until the page scrolls. Borders appear only on:
  - code blocks
  - the API table
  - section rules
  - icon buttons in the header
  - form fields
- **Depth** comes from soft neutral shadows (`shadow-card`) and lightness shifts, not outlines.
- **Controls are flat:** no shadows on buttons or switches (owner, 2026-10-14).
- **Calm and premium.** When unsure, take something away. The owner removes extras more often than they ask for them.

## Tokens: nothing hardcoded
- Every colour, size, space, radius, shadow, duration and easing comes from a token. `pnpm check:tokens` fails on:
  - raw colours
  - arbitrary values (`p-[13px]`)
  - default palette classes
  - off-grid spacing
- **Layout spacing uses the named `--space-*` tokens:** `gap-(--space-nav-group)`, `mt-(--space-block)`, `pt-(--space-content-first)`. Never write `py-8` or `mt-10` for layout. The 4px scale is only for small gaps inside a control.
  - If no token fits, add one to `tokens.css` with a comment saying what it spaces, plus a row in design-system.md §6.
  - Measure beUI's computed styles before guessing a value.
- **Site type:** named sizes (`text-h2`, `text-body`, `text-body-sm`, `text-label`, `text-caption`, `text-overline`). Library components use stock sizes instead (see components.md).
- **Sizes:** `--size-control-sm|md|lg` (32/36/40px) and `--size-icon-sm|md|lg`, so controls line up in a row.

## Accessibility
- Radix for behaviour: keyboard, focus trapping, ARIA. Follow the WAI-ARIA pattern and link it in the component's meta.
- A visible focus ring on everything interactive: `focus-ring` (site) or the outline-ring classes (library).
- Every control has a name. Visible labels use `<label htmlFor>`; hints and extra names use `aria-describedby`. Decorative icons get `aria-hidden`.
- Focus never gets lost. When the control that had focus disappears, move focus to its counterpart (for example, "View less" → "View all steps").
- Content hidden inside a collapsed area stays in the HTML and opens when keyboard focus enters it.
- Respect reduced motion (motion.md).

## Copy
- Use the plain words people search for: React components, Next.js, Tailwind CSS, accessible, copy-paste. Motion is one quality among others, never the headline.
- Labels are short and say what happens ("View all steps", "View less", "Switch to dark theme").
