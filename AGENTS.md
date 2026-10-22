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
  app/(browse)/docs/       guides as page.mdx files (/docs, /docs/installation); blocks in components/docs/guide-blocks.tsx
  app/(browse)/roadmap/    public roadmap; the plan is lib/roadmap.ts (status comes from the index: Available / Next up / Planned)
  app/lab/                 dev-only Lab: the home (/lab) holds components being built before they get a meta file (none right now); /lab/tokens; the header shows a Lab link in development only
  app/mcp/route.ts         the hosted MCP server (ui.fewtone.com/mcp, ADR 0012); its answers are lib/mcp.ts
  app/md/ · llms.txt/ · llms-full.txt/   every page as Markdown at its URL + `.md`, and the llms files (ADR 0014); built by lib/llms.ts
  app/sitemap.ts · robots.ts · opengraph-image.tsx   SEO, all from metadata
  components/docs/         preview tabs, install, code blocks, props table, cards, sidebar
  components/motion/       site motion: Pill (sliding tabs) · RowIndicator (sidebar, search)
  lib/                     content index helpers, nav, guides list, Shiki, install commands
  public/r/                the shadcn registry, GENERATED and gitignored (ADR 0009)
packages/ui/               SOURCE OF TRUTH: design system, components and their metadata
  src/styles/              palette.css (generated) · theme.css · tokens.css · globals.css
  src/lib/                 utils.ts (cn) · motion.ts (durations, easings, springs)
  src/registry/            kinds.ts · schema.ts · shared.ts (tokens shipped to users) · imports.ts · *.generated.*
  src/components/<name>/   <name>.tsx · <name>.meta.ts · <name>.test.tsx · demos/*.tsx
  src/test/                Vitest setup and the axe helper
scripts/build-index.mjs    validates every *.meta.ts, writes the item index and the registry (pnpm index)
scripts/registry/          registry generator: item JSON, tokens item, derived dependencies
scripts/tokens/            colour generator (pnpm tokens)
scripts/check-tokens.mjs   design-system enforcement (pnpm check:tokens)
.agents/rules/              always-on standards: design.md, motion.md, components.md
.agents/skills/             workflows (new-component); .claude/skills/ points to them for Claude Code
skills/smooth-ui/           PUBLIC Agent Skill for any project: our motion and polish rules, patterns and code (ADR 0013); /docs/smooth-ui, zipped by pnpm index into public/skills (generated, gitignored)
docs-internal/             long-term project memory (see map below)
```

**Adding an item:** create `packages/ui/src/<folder>/<name>/` with the source, `<name>.meta.ts`, `<name>.test.tsx` and `demos/`, then run `pnpm index`. Its page, sidebar entry, search entry, social image, sitemap entry and registry JSON (`/r/<name>.json`, with npm and registry dependencies derived from its imports) follow automatically. Write it in the portable vocabulary (design-system §13, ADR 0009) so it works in users' shadcn projects. A new kind (backgrounds, blocks…) is one entry in `registry/kinds.ts`.

## Commands
| Command | What it does |
|---|---|
| `pnpm dev` | Run the site (rebuilds the item index first). The token reference is at `/lab/tokens`. |
| `pnpm build` | Production build |
| `pnpm index` | Rebuild the item index and the registry after editing any `*.meta.ts` or component |
| `pnpm test` | Vitest + Testing Library + axe for every component (packages/ui) |
| `pnpm check` | Lint + item index freshness + typecheck + token check + tests. **Run this before saying work is done.** CI runs it, and `pnpm build`, on every push to main and every PR (`.github/workflows/ci.yml`, ADR 0015). |
| `REGISTRY_URL=http://localhost:3000 pnpm dev` | Serve the registry with local dependency URLs, to test `npx shadcn add http://localhost:3000/r/<name>.json` in a scratch app |
| `pnpm lint` / `pnpm format` | Biome |
| `pnpm tokens` | Regenerate `palette.css` after changing hues in `scripts/tokens/generate-palette.mjs` |
| `pnpm deploy:preview` / `pnpm deploy:prod` | Deploy the site from this machine to the FewTone Vercel account. Needs a token in `.env.deploy.local` (see `scripts/deploy.mjs` and ADR 0005). The owner runs deploys, commits and pushes; agents don't. |

## Standards (read before any UI work)
The owner's design, motion and component standards are always on. They apply to every new component and every change without being asked:
- `.agents/rules/design.md`: neutral first, tokens and named spacing, few borders, accessibility, copy
- `.agents/rules/motion.md`: which motion pattern to use where (sliding indicators, height that glides, sections that expand, overlays, icon morphs, press and hover) and the files to reuse
- `.agents/rules/components.md`: library files, the portable vocabulary, meta, demos and tests
- `.agents/skills/new-component/SKILL.md`: the step-by-step workflow for building or changing one component (Claude Code finds it through `.claude/skills/`)

The owner asks for components one at a time; build only the one requested.

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
   - badge edges
   - text selection

   Primary buttons are neutral. There is no glow and no grain.
3. **Accessible by default.**
   - Radix for behaviour
   - keyboard support and a visible focus ring
   - `prefers-reduced-motion` respected (CSS is automatic; in JavaScript use `useReducedMotion()`)
4. **Motion** uses the presets in `@fewtone/ui/lib/motion` (`spring.snappy`, `spring.smooth`, `spring.bouncy`). Animate only `transform` and `opacity`, with two exceptions:
   - Content that appears, leaves or swaps comes **through the blur** (`blur`, `swap`, or the CSS `animate-blur-in`/`out`, `popover-in`/`out`), never a plain fade (owner 2026-10-15, ADR 0011). Full-screen overlays, fills, highlights and hover still only fade.
   - Content that changes height glides to its new size through `AutoHeight` (`apps/www/components/motion/auto-height.tsx`, owner 2026-10-13). Examples are a tab set switching panels and a section opening.
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
| `03-decisions/` | ADRs: 0001 typography (Geist), 0002 brand colour (Navy), 0003 brand direction (neutral first, plus rejected directions; read this before proposing visual changes), 0004 library name (FewTone UI), 0005 hosting (Vercel on ui.fewtone.com), 0006 logo (the FewTone mark, unchanged; lists every rejected direction), 0007 website structure and component pages, 0008 content model and SEO baseline, 0009 component distribution (registry, tokens item, portable vocabulary), 0010 Theme Toggle reveals (View Transitions; the site plays a random reveal at slow speed), 0011 the blur for content that comes and goes (instead of a plain fade), 0012 the MCP server (hosted, keyless, read-only, at /mcp), 0013 the Smooth UI skill (our motion and polish lessons as a public skill for any project), 0014 llms.txt, llms-full.txt and a `.md` version of every page, 0015 CI on GitHub Actions (`pnpm check` and `pnpm build` on every push and PR) |
| `04-components/` | One folder per component with `decisions.md`: why it's built the way it is, and what's deliberately not built yet |
| `06-research/` | Research with sources. The 2026-10-12 note covers how 12 UI libraries build component pages (layout, conventions, SEO); read it before changing the docs site. |
| `08-log/` | Dated session notes |

`05-workflows/` holds step-by-step owner procedures (the shadcn directory listing). Planned but not created yet: `00-vision`, `02-architecture`, `07-roadmap`.

Exploration files (mockups, drafts) are temporary. Once a decision is made, record it in an ADR, including what was rejected and why, then delete the files.

## Status (2026-10-16)
**Done:**
- brand (Navy, neutral first)
- typography (Geist)
- design-system tokens and their enforcement
- monorepo + Next.js scaffold
- name (FewTone UI) and hosting decision (Vercel)
- logo (the FewTone mark) in the header, footer, favicons and the Lab
- website shell (Phase 2), live on `ui.fewtone.com`:
  - landing page, components index, item pages and guides
  - ⌘K search, mobile drawer
  - the metadata-driven content model and full SEO baseline (ADRs 0007 and 0008)
  - beUI spacing as `--space-*` tokens, few borders
- Phase 3a (ADR 0009):
  - the shadcn registry generated from the same index, with installs verified in a fresh Next app
  - the first components: Button, Input, Select, Switch (Toggle was built, then removed by the owner)
  - Copy Button (2026-10-14): published directly, without a Lab step; it shares Loading Button's blur + rise swap and drawn check. Since 2026-10-15 the site uses it for every copy action.
  - Checkbox (2026-10-15): published directly; the fill grows in and the check draws itself in, unchecking plays it backwards, and indeterminate draws a dash. Sizes match Switch.
  - Radio Group (2026-10-15): built in the Lab; the selected dot travels to the new choice, sliding (the default) or stretching like Switch's thumb
  - Switcher and Toggle Group (2026-10-14): split from one component by the owner. Switcher is one choice with a sliding pill; Toggle Group switches options on and off. Both come in Default and Outline and were built in the Lab first.
  - Loading Button (2026-10-14): idle, loading, success and error, with a blur + rise swap, Signal red errors and a neutral success; built in the Lab first
  - Theme Toggle (2026-10-14, ADR 0010): eleven View Transition reveals with a speed prop; the site header uses it with `reveal="random"` and `speed="slow"`
  - The whole roadmap (2026-10-16, owner: "build all the components in the roadmap"), 43 new items, awaiting the owner's review:
    - Forms: Textarea, Combobox, Slider, Input OTP, Number Input, Calendar, Date Picker (Field was built too, then removed by the owner on 2026-10-21)
    - Overlays: Dialog, Alert Dialog, Sheet, Popover, Tooltip, Hover Card, Dropdown Menu, Context Menu
    - Navigation: Tabs, Accordion, Breadcrumb, Pagination, Navigation Menu, Sidebar, Command
    - Feedback: Toast, Badge, Progress, Skeleton, Spinner (Alert was built too, then removed by the owner on 2026-10-19)
    - Display: Card, Avatar, Table, Scroll Area (Empty State, Kbd and Separator were built too, then removed by the owner on 2026-10-21)
    - Effects: Number Ticker, Marquee, Text Effects, Stepper
    - Backgrounds (their own kind, `/backgrounds`): Dot Grid, Line Grid and Gradient Drift were built, then removed by the owner on 2026-10-22; the kind stays, with no items
  - Vitest with axe
  - site motion: underline tabs, gliding sidebar and search indicators, drawer slide
  - FewTone identity over beUI: framed gallery cards with live previews, underline tabs, Copy prompt for AI assistants
  - Smooth UI skill (2026-10-22, ADR 0013): `skills/smooth-ui/`, a public Agent Skill for any project with the library's motion rules, timings, patterns, component recipes, checked code, pitfalls and an audit; not about FewTone UI. Keep it in step when motion.md changes
  - MCP server (2026-10-22, ADR 0012): hosted at `/mcp`, keyless and read-only, with five tools (search, list, get a component, get an example, the install command); setup for each assistant at `/docs/mcp`

**Next:**
- the internal Lab with knobs (`/lab/<name>`) (CI is done, 2026-10-23, ADR 0015)
- the owner's review of the 43 new items, then the changes it asks for
- new roadmap entries once the review is done (every current entry is built)
- AI layer: a "how to use FewTone UI" skill (the MCP server, the Smooth UI skill, llms.txt and the `.md` pages are done, 2026-10-22/23)
- npm package and CLI

**Open (owner actions):**
- the PR adding `@fewtone` to shadcn's registry directory (entry, steps and PR text in `docs-internal/05-workflows/shadcn-directory.md`), then flip `useNamespace` in `apps/www/lib/install.ts`

The npm org `@fewtone` is claimed (owner, 2026-10-14). The repo is MIT licensed (`LICENSE`, © FewTone, 2026-10-22).

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
