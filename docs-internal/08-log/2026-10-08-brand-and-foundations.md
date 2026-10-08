# 2026-10-08 · Brand, design system and project setup

## What happened
- **Brand exploration:** three rounds, recorded in `01-brand/explorations/README.md`.
  - Multi-colour mesh gradients were rejected.
  - Single-hue gradients with glow and grain were good, but too much.
  - Accepted: a neutral near-black and white site, with one accent used sparingly, one-tone gradients, no glow and no grain.
- **Typography:** Geist + Geist Mono (ADR 0001).
- **Brand colour:** shortlisted to Midnight and Clay, then the owner chose **Navy** (ADR 0002). Status colours were retuned to match Navy's deep, muted tone.
- **Design system:** built as code in `packages/ui/src/styles` and specified in `01-brand/design-system.md`.
  - Tailwind's default palette is removed.
  - `pnpm check:tokens` enforces "nothing hardcoded".
- **Scaffold:** a monorepo with pnpm 11, Turborepo 2.11, Next.js 16.4 (`apps/www`, using Cache Components and the Turbopack Tailwind loader), and `packages/ui` as the design-system and component source.
- **Verified:**
  - `pnpm check` passes (lint, typecheck, token check).
  - `pnpm build` passes.
  - The compiled CSS contains the tokens and no default palette.
  - The dev server serves `/` and `/lab/tokens` with status 200.
  - `/lab` returns 404 in production.

## Open questions
- **Library name:** `untitled/ui` and `@workspace/*` are placeholders.
- **Geist stylistic alternates:** which ones, if any, to enable.

## Next
Phase 2 of the plan: docs site shell (layout, navigation, MDX pipeline, component page template). Then Phase 3: the component pipeline and the Lab, with Button as the first end-to-end component.
