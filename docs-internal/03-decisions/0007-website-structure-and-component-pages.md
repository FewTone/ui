# 0007 · Website structure and component pages

- **Status:** Accepted (2026-10-12, by the owner)
- **Research:** `docs-internal/06-research/2026-10-12-component-pages.md` (13 sites)

## Context
Before building the docs site, we studied how 12 popular UI libraries, plus beUI, lay out their component pages. Developers expect one familiar page. The owner's choices on top of that:
- **Layout reference:** beUI's layout (beui.dev/components), with FewTone UI's own visual identity. We don't copy beUI's cards or styling.
- **Component pages:** two columns, with no "On this page" list. **Related components** replace prev/next at the bottom.
- **Full width** (owner, 2026-10-12): the header and the sidebar layout span the whole screen, with no `max-w-wide` box. The sidebar sits against the left edge, and component pages use all the width that's left. Guides keep a readable line length through the MDX wrapper (`max-w-docs`). The card grid goes up to four columns at `2xl`.
- **Spacing and borders follow beUI** (owner, 2026-10-12: "same to same as beUI, not colors or radius"; "remove the sidebar borders and mostly from everywhere").
  - **Spacing:** measured from beui.dev's computed styles: the shell, sidebar, page rhythm, cards, tabs, code blocks and tables. Every value is a named `--space-*` token in `tokens.css`, which the owner asked for so the rhythm can be tuned in one place. See `design-system.md` §6.
  - **Borders:** see §6 for where they appear. The header shows its bottom border only after scrolling.
  - **Page titles and headings:** page titles use `text-h2`. Section titles (Installation, Examples, API reference, Related) use `text-h3`, larger than the example and API titles inside them, and sections are separated by space alone, with no divider lines (owner, 2026-10-13; before that, 14px headings on thin rules, after beUI).
  - **Kept our own:** colours, radius and the type tokens.
- **Our own identity, not beUI's** (owner, 2026-10-13: the cards, switchers and New badge looked "exact same to same" as beUI). Spacing still follows beUI; these pieces are FewTone's own:
  - **Item cards are a gallery.** A live preview tile shows the item's first demo, made `inert` so it can't be focused, clicked or read by screen readers. The title link stretches over the card, so the demo's controls never nest inside an anchor. Demos use `useId`, since a demo can now appear more than once on a page. The "New" row on an index only shows when part of the list is new.
  - **The card's look** (owner, 2026-10-13, picked in a Lab exploration):
    - **Framed:** one outer card (white with a hairline in light, raised grey in dark) holds the preview tile with a 12px frame round it. The corners stay concentric (`--radius-card`).
    - **The tile** is the `preview` colour, one gray step past muted, because muted was too close to the card to tell apart.
    - **The text** sits 32px in from the card's sides, with 24px under the description, measured to the letters (`trim-leading-end`).
    - **A 20px title** (`text-h4`), with no arrow.
    - **Rejected:** the card without an outer frame, a single surface with no tile, a flush tile and 4px and 8px frames, a sunken tile, and even 12px spacing all round, which looked cramped.
  - **Switchers are "Framed · ink"** (owner, 2026-10-13, picked on the real page in the Lab):
    - **The pill:** no track; the active option is a solid ink pill with inverted text, gliding between options. This covers Preview/Usage/Code and the package manager in install steps.
    - **The frame:** the example sits in the item card's frame, a 12px frame round a preview-coloured tile, with the switcher in the frame's top row.
    - **Rejected:** underline tabs (shipped briefly), the grey track (too close to beUI), soft, outline, capsule and icon tabs, the plain Framed pill, and Framed · paper.
    - **Clicks:** a click shows no focus ring anywhere on the site; the ring is for the keyboard only (`data-modality`, globals.css).
  - **The New badge** (owner, 2026-10-13) is the word alone, with no dot, in a pill with a solid Navy edge. Two light shines travel round the edge on opposite sides (the `edge-shine` utility: 15% wide each side, 65% towards white, one lap in 3s). It's a thin line with no glow. The full badge also shows in the sidebar. It's transparent inside, so it sits cleanly on cards and the sidebar's highlighted row. With reduced motion, the shines rest on the left and right.
    - **Rejected:** a static Navy-fade edge, a soft Navy ring with one streak, comet, single-orbit, lap-and-rest and sweep shines, the Navy dot, and a dot-only sidebar.
  - **The page actions** (owner, 2026-10-13) sit on one line beside the title:
    - **The install command:** in the secondary colours, with the package manager chosen in our own Select and the long registry URL shortened on screen.
    - **Copy prompt:** a filled, text-only button.
    - **Installation below** holds the manual steps only. It starts 288px tall, fading into the page, with "View all steps" to open it and "Show less" to fold it (`Expandable`); tabbing into a hidden step opens it.
    - **Rejected:** the ⋯ menu, a Copy page split button with Open in v0, ChatGPT and Claude, the command and prompt in Installation tabs, and a command block under the description.
    - **Spacing:** the description is 24px from the framed preview (`--space-hero`).
  - **Gone:** the Source / ARIA pattern / Built on row under the description. The metadata stays and feeds the prompt.
- **Copy prompt** (owner, 2026-10-13): every item page has a prompt for the user's AI assistant, from the Copy prompt button in the header. `apps/www/lib/prompt.ts` generates it from the same derived install data as the registry. Its order is: inspect the project (package manager, Tailwind v4, aliases, conflicts), install with the CLI (never `shadcn init`), install by hand with the exact source, tokens and motion file, typecheck, then report the files touched. Its rule is to change nothing else: no overwrites, no theme changes, only missing variables.
- **Sliding indicators and stacking:** the items in a set must not be stacking contexts. Only the set is `isolate`, so the indicator passes behind every label in both directions. With isolated items, an indicator moving right or down painted over the items it passed (fixed 2026-10-13, Select included).
- **Theme switch** (owner, 2026-10-12): one button with a tooltip ("Switch to dark theme" or "Switch to light theme") that flips between light and dark. It replaces the three-way light / dark / system switch. Until someone clicks it, the site follows the default theme. The icon turns in on `spring.snappy`; with reduced motion it only fades.
- **No Accessibility section** on component pages. Components stay accessible by default; it just isn't a docs section.
- **Wording:** generic and search-friendly ("Accessible React components for Next.js"), not centred on motion.
- **One component per page.** Variations are Examples on that page. A truly different component (for example a Loading Button) gets its own page and address.

## Decision

### Addresses
| URL | Page |
|---|---|
| `/` | Landing page (basic for now): hero, **View components** → `/components`, **Get started** → `/docs/installation`, install line, three short points, Navy footer |
| `/<kind>` | Index of a kind, for example `/components`: h1, sentence, a "New" row, then every item grouped by category |
| `/<kind>/<name>` | One item, for example `/components/button`. There is no `/docs` in item addresses |
| `/docs`, `/docs/installation`, `/docs/theming` | Guides, written as `page.mdx` files |

- **One dynamic route pair** (`app/(browse)/[kind]` and `[kind]/[slug]`) serves every kind. Unknown addresses return a 404.
- **Two layouts:**
  - `(site)`: header, content, Navy footer
  - `(browse)`: header, sidebar and content (two columns), with a small footer line

### Component page, top to bottom
1. Breadcrumb (Components › Button)
2. h1 (with a New, Beta or Draft badge), then the **Copy page** menu: copy as Markdown, Open in ChatGPT, Open in Claude
3. The one-sentence description
4. Info row: Source, ARIA pattern (if any), primitives
5. The hero demo in **Preview / Usage / Code** pill tabs. **Replay** appears only if the item animates
6. Installation: CLI or Manual tabs, with a pnpm / npm / yarn / bun switch remembered per browser. Manual lists the dependencies, the source and the import paths
7. Examples: one h3 and one demo (Preview / Code) each
8. API reference: Prop / Type / Default / Description
9. Related components (cards)
10. Last updated, Edit on GitHub

**Site-wide:**
- **Header:** logo, Components, Docs, ⌘K search, light / dark / system switch, GitHub.
- **Sidebar:** Getting started, then one section per kind with a count. A filter by kind appears once there are two kinds.
- **On phones:** a menu drawer.

## Consequences
- Pages look and work the way developers expect from shadcn-style libraries.
- Every section is optional: it shows only when the item's metadata has data for it.
- **Every tab panel stays in the server HTML,** including inactive tabs, for search engines and AI tools.
- **Revisit later:**
  - a richer landing page
  - live prop controls (from the Lab's `controls`)
  - "Open in v0" once the registry is live (Phase 3)
  - `llms.txt` and `.md` pages (Phase 5)
