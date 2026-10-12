# 0007 · Website structure and component pages

- **Status:** Accepted (2026-10-12, by the owner)
- **Research:** `docs-internal/06-research/2026-10-12-component-pages.md` (13 sites)

## Context
Before building the docs site, we studied how 12 popular UI libraries, plus beUI, lay out their component pages. Developers expect one familiar page. The owner's choices on top of that:
- **Layout reference:** beUI's layout (beui.dev/components), with FewTone UI's own visual identity. We don't copy beUI's cards or styling.
- **Component pages:** two columns, with no "On this page" list. **Related components** replace prev/next at the bottom.
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
