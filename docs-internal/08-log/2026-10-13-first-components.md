# 2026-10-13 · First components, working installs, site motion

**Asked by the owner:**
- motion wherever there is a hover or a sliding indicator
- the first basic components: Button, Dropdown, Input, Toggle
- working `shadcn add` installs

Clarified with the owner:
- the components are built fresh
- "Dropdown" means **Select**
- "Toggle" means both **Toggle** (the pressed button) and **Switch** (the on/off setting)
- installs must work now

**Done:**
- **Research:**
  - the shadcn CLI 4.21 registry source
  - motion 14 and Radix 1.7 APIs
  - beUI's motion techniques
  - a review pass on the plan, which caught pill stacking, scroll-container pitfalls, theme-type overwrite prompts, Turbo caching of `public/r`, and Radix Select's detached closed list
- **Distribution (ADR 0009):**
  - **Shared code:** `shared.ts` holds the token allow-list; `imports.ts` is shared by the site and the generator.
  - **Generator:** `scripts/registry/build-registry.mjs` derives dependencies from imports and writes `apps/www/public/r` (gitignored).
  - **Build plumbing:** Turbo outputs, inputs and env; `/r/*` CORS and noindex headers.
  - **Commands:** URL install commands everywhere.
  - **Manual tab:** built from the derived data, including a paste-ready tokens CSS block.
  - **Vocabulary rules:** `check-tokens` enforces the portable vocabulary in components, and the named type tokens on the site.
- **Spike:** `create-next-app` + `shadcn init` in the scratchpad, then all five components installed from `localhost`.
  - Tokens were added without overwriting anything, the user's `cn` was untouched, and `lib/motion.ts` arrived only with Select and Switch.
  - Re-installing changed nothing.
  - `next build` passed.
  - Screenshots show the components in the user's palette, and the Select pill gliding.
- **Components:** Button, Toggle, Input, Select and Switch, each with meta, demos, an API table and tests (17 tests, axe included). The draft Example is deleted.
- **Site motion:**
  - `MotionConfig reducedMotion="user"`
  - a `Pill` (with `PillGroup`) for the preview and install tabs, the package-manager switch (no slide on load) and the kind filter
  - a `RowIndicator` for the sidebar (current page, plus mouse hover) and search results (instant while typing; arrow keys now scroll the active result into view)
  - the drawer slides in on a spring and exits on a timed curve
  - the copy icon swaps to a check
- **Docs:**
  - ADR 0009
  - `design-system.md` §13
  - `04-components/*/decisions.md` (the folder now exists)
  - installation and theming guides
  - AGENTS.md

**Found along the way:**
- **Headless Chrome screenshots** need `Emulation.setFocusEmulationEnabled` (the `--focus` flag in the scratch screenshot script). Without it, focus-driven UI (the Select pill, tooltips) never shows.
- **Vitest + jsdom** on this machine starts slowly when every file boots at once, so `testTimeout` is 30s.

**Open:**
- **Owner actions:**
  - the PR adding `@fewtone` to shadcn's directory (I can draft the entry)
  - deploy with `pnpm deploy:prod`
- **Next:** the Lab with knobs, CI, ToggleGroup, Loading Button, Dropdown Menu.

## Later the same day: owner feedback round

**Asked:**
- the cards and the Preview/Usage/Code switcher looked the same as beUI's
- remove Toggle
- fix the sliding indicator passing over content when it moves right or down
- remove the Source / ARIA / Built on row
- add a Copy prompt for AI assistants
- a New badge that isn't beUI's

**Done** (ADR 0007, ADR 0009 updated):
- **Toggle** removed: component, docs, related links and the registry.
- **Stacking fix:** set items are no longer stacking contexts; only the set (tab list, popover, filter) is `isolate`. Verified in the browser: options and tabs show `isolation: auto`.
- **Gallery cards** with inert live previews and a stretched title link. Demos switched to `useId`, and the New row hides when everything is new.
- **Underline tabs** for Preview/Usage/Code, CLI/Manual/AI prompt and the package manager.
- **New badge:** a Navy dot in an `edge-brand` pill; only the dot in the sidebar.
- **Copy prompt:** `lib/prompt.ts` (about 17 KB for Select), a header button, and an "AI prompt" install tab. Copy page moved into the ⋯ menu.

## Later still: card and New badge, explored in the Lab

**How:** the owner compared options on a temporary `/lab/explore` page: side-by-side variants, then a live settings panel for the badge's shine. The page is deleted now that the choices have shipped.

**Picked** (ADR 0007):
- **Card:** framed with 12px round a `preview`-coloured tile, the text 32px in from the sides, 24px under the description, a 20px title and no arrow.
- **Badge:** the word alone in a solid Navy edge, with two shines travelling round it (`edge-shine`). The full badge also shows in the sidebar.

**New tokens and utilities:**
- `--space-card-frame`, `--space-card-x`, `--space-card-bottom` and `--radius-card`
- the `preview` / `preview-hover` colours
- `--shine`, `--shine-width` and `--shine-lap`
- `edge-shine` and `trim-leading-end`

`--space-grid-row` is gone: the cards have their own surface now, so rows use `--space-grid`.

**Found along the way:** drive D: filled up completely. A failed save emptied a Lab file, which was rebuilt from the session. The Turbo cache (`.turbo/cache`, 0.5 GB) was cleared to make room. Lab edits after that were saved to a temporary file first and then renamed into place.

## Later still: the component page, explored on the real page

**The Lab (`/lab`)** now renders the real component page (browse layout and `components/docs/item-article.tsx`, shared with the item route) with an options bar. The owner compared switcher styles and header actions there.

**Shipped:**
- **Switchers:** Framed · ink.
- **Header:** the install command (secondary colours, package manager in our Select) and a text-only Copy prompt, beside the title. Installation shows the manual steps.
- **Page layout:** 24px section titles with no divider lines, and the hero 24px under the description.
- **Site-wide:**
  - keyboard-only focus rings (`data-modality`)
  - minimal scrollbars with a stable gutter (and Radix's scroll-lock margin cancelled)

**Removed:**
- underline tabs
- the install tabs
- the ⋯ menu
- the Copy page split button and its v0, ChatGPT and Claude logos
- `--space-rule`, `--space-rule-lg`, `--space-tab-gap` and `--space-tab-pad`

**Afterwards:**
- **Installation** collapses to 288px with a fade and our Button to open it (`Expandable`).
- **Smooth motion:** the preview card and Installation glide to new heights (`AutoHeight`, the documented exception to rule 4). Panels slide in by direction, and hidden install steps rise in, staggered.
- **The header command** has a fixed width, in `ch`.
- **Lab:** with the page settled, the `/lab` exploration page and its options bar were removed. `/lab/tokens` remains.

## Later still: Home, and guides rewritten for search

- **Sidebar:** **Home** at the top (→ `/components`).
- **Theming:** removed. Its essentials are now Installation's "Customize the theme", and `/docs/theming` redirects there (308).
- **Introduction and Installation:** rewritten, longer and aimed at search.
  - **Titles:** absolute, under 60 characters. The descriptions are about 155 characters.
  - **Headings:** question-style.
  - **Links:** to every component.
  - **Structured data:** FAQ, TechArticle and BreadcrumbList (`guide-blocks.tsx`).
- **Guide blocks:** `ComponentGrid`, `InstallCommand`, `InstallTable` (generated from the install data), `Faq` (visible text and FAQPage from one source) and `GuideJsonLd`.

**Page tops:**
- The content starts at `--space-content-first`: 16px plus the sidebar row's 4px padding. Every page's first line is now level with the sidebar's "Home", measured at 77px on all four pages.
- Guides open with their title, with no breadcrumb: it only repeated the title. The title's capitals already sit level with "Home" (82px against 81px, measured).
- The components index is one A–Z grid, with no category groups.

**Found along the way:** drive C: filled up. 103 headless-Chrome profiles from the scratch screenshot and probe scripts (1.8 GB in %TEMP%) were never deleted. They are removed, and the scripts now delete their profile on exit.

**Search redesigned** (`command-menu.tsx`, `kbd.tsx`):
- **Header button:** a field-like button in the secondary colours, with key caps (⌘ K on a Mac, Ctrl K elsewhere). Its parts share one centre line (measured).
- **Window:** springs open and fades out quickly (motion inside Radix Dialog). Results have icon tiles, are ranked, and show the match underlined. The highlight glides between rows and an Enter arrow slides in on the active one. A footer shows the key hints; there is a clearer empty state.
- **Search is reset** only after the window has gone, so nothing changes while it leaves.

