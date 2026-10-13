# FewTone UI

These are accessible, customizable React components for Next.js and Tailwind CSS, made by FewTone. Smooth motion is one quality among others, not the headline: describe the library in the plain words people search for (React components, Next.js, Tailwind, accessible, copy-paste). It is a personal library for now and will be open-sourced (MIT) later. Components are distributed as a shadcn-compatible registry (`npx shadcn add @fewtone/<name>`) and as an npm package.

## Name and handles
- **Brand:** FewTone UI, always written that way in text and in the logo. Lowercase only where people type it: `@fewtone/ui`, `npx fewtone`, `ui.fewtone.com`.
- **Logo:** the FewTone mark, unchanged, static and in one colour (`currentColor`). Two versions:
  - horizontal: `Logo`, used in the header and the footer and sized with a text class
  - the mark alone: `LogoMark`

  Both components are in `apps/www/components/logo.tsx` (ADR 0006).
- **Site, registry, llms.txt and MCP:** `ui.fewtone.com`, hosted on Vercel through one CNAME at Hostinger (ADR 0005).
- **Packages:**
  - shadcn namespace: `@fewtone`
  - npm: `@fewtone/ui` (this is also the workspace package name)
  - CLI: `npx fewtone`
- **GitHub:** `FewTone/ui`

This file is the entry point for every AI agent (Claude, Codex, Cursor, Gemini, Copilot). It is a map: read the linked docs for details.

## Stack
- **Repo:** pnpm 11 workspaces + Turborepo
- **App:** Next.js 16.4 (App Router, Turbopack, Cache Components) in `apps/www`
- **Styling:** Tailwind CSS v4, loaded through `@tailwindcss/turbopack`, not PostCSS
- **Behaviour and motion:**
  - Radix (`radix-ui`) for accessible behaviour
  - `motion` (Framer Motion, imported from `motion/react`)
- **Fonts:** Geist + Geist Mono, self-hosted via the `geist` package
- **Tooling:** TypeScript strict, Biome for lint and format

## Layout
```
apps/www/                  website (ADR 0007)
  app/(site)/              landing page: header, hero, Navy footer
  app/(browse)/[kind]/     every kind's index (/components) and item pages (/components/button)
  app/(browse)/docs/       guides as page.mdx files (/docs, /docs/installation, /docs/theming)
  app/lab/                 dev-only Lab
  app/sitemap.ts · robots.ts · opengraph-image.tsx   SEO, all from metadata
  components/docs/         preview tabs, install, code blocks, props table, cards, sidebar
  lib/                     content index helpers, nav, guides list, Shiki, install commands
packages/ui/               SOURCE OF TRUTH: design system, components and their metadata
  src/styles/              palette.css (generated) · theme.css · tokens.css · globals.css
  src/lib/                 utils.ts (cn) · motion.ts (durations, easings, springs)
  src/registry/            kinds.ts · schema.ts · *.generated.* (ADR 0008)
  src/components/<name>/   <name>.tsx · <name>.meta.ts · demos/*.tsx
scripts/build-index.mjs    validates every *.meta.ts and writes the item index (pnpm index)
scripts/tokens/            colour generator (pnpm tokens)
scripts/check-tokens.mjs   design-system enforcement (pnpm check:tokens)
docs-internal/             long-term project memory (see map below)
```

**Adding an item:** create `packages/ui/src/<folder>/<name>/` with the source, `<name>.meta.ts` and `demos/`, then run `pnpm index`. Its page, sidebar entry, search entry, social image and sitemap entry follow automatically. A new kind (backgrounds, blocks…) is one entry in `registry/kinds.ts`.

## Commands
| Command | What it does |
|---|---|
| `pnpm dev` | Run the site (rebuilds the item index first). The token reference is at `/lab/tokens`. |
| `pnpm build` | Production build |
| `pnpm index` | Rebuild the item index after editing any `*.meta.ts` |
| `pnpm check` | Lint + item index freshness + typecheck + token check. **Run this before saying work is done.** |
| `pnpm lint` / `pnpm format` | Biome |
| `pnpm tokens` | Regenerate `palette.css` after changing hues in `scripts/tokens/generate-palette.mjs` |
| `pnpm deploy:preview` / `pnpm deploy:prod` | Deploy the site from this machine to the FewTone Vercel account. Needs a token in `.env.deploy.local` (see `scripts/deploy.mjs` and ADR 0005). The owner runs deploys, commits and pushes; agents don't. |

## Golden rules
1. **Nothing hardcoded.** Every colour, size, space, radius, shadow, duration and easing comes from a token. Read `docs-internal/01-brand/design-system.md` before writing UI.
   - **Layout spacing uses the named `--space-*` tokens** (design-system §6, measured from beUI): `gap-(--space-nav-group)`, `mt-(--space-title)`. Never use raw steps like `py-8`. The 4px scale is only for small gaps inside a control.

   `pnpm check:tokens` fails on:
   - raw colours
   - arbitrary Tailwind values
   - default palette classes
   - off-grid spacing
2. **Neutral first.** The UI is near-black or white. The brand colour (Navy) appears only in:
   - the footer
   - Pro and premium surfaces
   - "New" signals
   - badge edges
   - text selection

   Primary buttons are neutral. There is no glow and no grain.
3. **Accessible by default.**
   - Radix for behaviour
   - keyboard support and a visible focus ring
   - `prefers-reduced-motion` respected (CSS is automatic; in JavaScript use `useReducedMotion()`)
4. **Motion** uses the presets in `@fewtone/ui/lib/motion` (`spring.snappy`, `spring.smooth`, `spring.bouncy`). Animate only `transform` and `opacity`.
5. **`packages/ui` is the source of truth.** Registry JSON, docs, the npm build and AI files are generated from it, never hand-copied.
6. **The Lab (`/lab`) is internal and dev-only.** Users customise the copied source in their own projects. There is no public customiser.
7. **Version-specific docs:** read `apps/www/AGENTS.md` (Next.js) and the Turborepo block below before changing framework or build config.
8. **Record decisions.**
   - Significant choices get an ADR in `docs-internal/03-decisions/`.
   - Component thinking goes in `docs-internal/04-components/<name>/`.
   - Meaningful sessions get a note in `docs-internal/08-log/`.

## docs-internal map
| Folder | Contents |
|---|---|
| `01-brand/` | `design-system.md`, the spec for every visual value |
| `03-decisions/` | ADRs: 0001 typography (Geist), 0002 brand colour (Navy), 0003 brand direction (neutral first, plus rejected directions; read this before proposing visual changes), 0004 library name (FewTone UI), 0005 hosting (Vercel on ui.fewtone.com), 0006 logo (the FewTone mark, unchanged; lists every rejected direction), 0007 website structure and component pages, 0008 content model and SEO baseline |
| `06-research/` | Research with sources. The 2026-10-12 note covers how 12 UI libraries build component pages (layout, conventions, SEO); read it before changing the docs site. |
| `08-log/` | Dated session notes |

Planned but not created yet: `00-vision`, `02-architecture`, `04-components`, `05-workflows`, `07-roadmap`, and `.agents/` for internal skills and rules.

Exploration files (mockups, drafts) are temporary. Once a decision is made, record it in an ADR, including what was rejected and why, then delete the files.

## Status (2026-10-12)
**Done:**
- brand (Navy, neutral first)
- typography (Geist)
- design-system tokens and their enforcement
- monorepo + Next.js scaffold
- name (FewTone UI) and hosting decision (Vercel)
- logo (the FewTone mark) in the header, footer, favicons and the Lab
- website shell (Phase 2):
  - landing page, components index, item pages and guides
  - ⌘K search, mobile drawer
  - the metadata-driven content model and full SEO baseline (ADRs 0007 and 0008)

**Next** (from the approved plan):
- component pipeline and the Lab (registry JSON from the same index), with Vitest and CI
- Button as the first end-to-end component
- AI layer (llms.txt, MCP, skills)
- npm package and CLI
- deploy to Vercel on `ui.fewtone.com`

**Open:**
- claiming the npm org `@fewtone` (owner action)

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
