# FewTone UI

These are animated, accessible React components for Next.js, made by FewTone. It is a personal library for now and will be open-sourced (MIT) later. Components are distributed as a shadcn-compatible registry (`npx shadcn add @fewtone/<name>`) and as an npm package.

## Name and handles
- **Brand:** FewTone UI, always written that way in text and in the logo. Lowercase only where people type it: `@fewtone/ui`, `npx fewtone`, `ui.fewtone.com`.
- **Logo:** the FewTone mark, unchanged, static and in one colour (`currentColor`). Three versions:
  - horizontal: `Logo`
  - stacked: the footer
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
apps/www/                  website: docs, dev-only Lab (/lab), registry host (later)
packages/ui/               SOURCE OF TRUTH: design system + components
  src/styles/              palette.css (generated) · theme.css · tokens.css · globals.css
  src/lib/                 utils.ts (cn) · motion.ts (durations, easings, springs)
  src/components/          components (one folder each, added from Phase 3)
scripts/tokens/            colour generator (pnpm tokens)
scripts/check-tokens.mjs   design-system enforcement (pnpm check:tokens)
docs-internal/             long-term project memory (see map below)
```

## Commands
| Command | What it does |
|---|---|
| `pnpm dev` | Run the site. The token reference is at `/lab/tokens`. |
| `pnpm build` | Production build |
| `pnpm check` | Lint + typecheck + token check. **Run this before saying work is done.** |
| `pnpm lint` / `pnpm format` | Biome |
| `pnpm tokens` | Regenerate `palette.css` after changing hues in `scripts/tokens/generate-palette.mjs` |

## Golden rules
1. **Nothing hardcoded.** Every colour, size, space, radius, shadow, duration and easing comes from a token. Read `docs-internal/01-brand/design-system.md` before writing UI. `pnpm check:tokens` fails on:
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
| `03-decisions/` | ADRs: 0001 typography (Geist), 0002 brand colour (Navy), 0003 brand direction (neutral first, plus rejected directions; read this before proposing visual changes), 0004 library name (FewTone UI), 0005 hosting (Vercel on ui.fewtone.com), 0006 logo (the FewTone mark, unchanged; lists every rejected direction) |
| `08-log/` | Dated session notes |

Planned but not created yet: `00-vision`, `02-architecture`, `04-components`, `05-workflows`, `06-research`, `07-roadmap`, and `.agents/` for internal skills and rules.

Exploration files (mockups, drafts) are temporary. Once a decision is made, record it in an ADR, including what was rejected and why, then delete the files.

## Status (2026-10-12)
**Done:**
- brand (Navy, neutral first)
- typography (Geist)
- design-system tokens and their enforcement
- monorepo + Next.js scaffold
- name (FewTone UI) and hosting decision (Vercel)
- logo (the FewTone mark) in the header, footer, favicons and the Lab

**Next** (from the approved plan):
- docs site shell (including the Open Graph image)
- component pipeline and the Lab
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
