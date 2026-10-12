# 2026-10-12 · Research and the website shell (Phase 2)

## What happened
- **Research:**
  - 12 UI libraries' component pages, plus beUI (the owner's design pick), checked from their server HTML, sitemaps and screenshots.
  - Written up in `06-research/2026-10-12-component-pages.md`, with a report artifact (claude.ai/artifact/APDHJdGXZ1zYRWdbPkYrwV).
- **Owner decisions:**
  - generic, search-friendly wording rather than motion-centred
  - beUI's layout, but FewTone UI's own identity
  - two columns, with no "On this page" list
  - Related components instead of prev/next
  - no Accessibility section on component pages
  - one component per page
  - item addresses without `/docs`
  - a basic landing page for now

  Recorded in ADR 0007.
- **Content model (ADR 0008):**
  - `registry/kinds.ts` and `schema.ts` (zod), plus one `<name>.meta.ts` per item
  - `scripts/build-index.mjs` validates the metadata and writes the typed index and the demo map; `pnpm check` fails if they are stale
  - a draft `example` component exercises the page; drafts show in development only
- **Website:**
  - **Pages:** landing (`(site)`), `/components` and `/components/<name>` through one generic `[kind]/[slug]` route, and three MDX guides
  - **Shell:** header with ⌘K search and a light / dark / system switch, sidebar, mobile drawer
  - **Item page:** Preview / Usage / Code tabs, CLI or Manual install with a remembered package manager, API table, related cards, Copy page menu
- **SEO:**
  - per-page metadata and canonical
  - prebuilt social images (`next/og`)
  - TechArticle, BreadcrumbList and CollectionPage JSON-LD
  - a sitemap with real dates and robots.txt
  - all content in the server HTML
- **Checks:**
  - `pnpm check` and `pnpm build` pass; every page is prerendered.
  - The production HTML uses `ui.fewtone.com` for canonical links and social images.
  - The phone layout works (long commands scroll inside their box).
  - A temporary `background` item got its own page, sidebar section and kind filter, sitemap entry and social image with no route code. It was removed afterwards.

## Fixes found along the way
- **`cn()`:** tailwind-merge didn't know our type tokens and dropped `text-label`, `text-caption` and the like next to colour classes. It is now extended in `packages/ui/src/lib/utils.ts`.
- **Token checker:** it now skips fenced code samples in `.mdx` guides.
- **Instant navigation:** pages read `params` inside `<Suspense>`, with a skeleton fallback, which clears Next 16.4's instant-navigation warning.
- **Stale route types:** `.next/dev/types` left over from an older dev server broke `tsc`. Delete `.next/dev` if that happens again.

## Open
- The landing page is basic and will be polished later.
- "Open in v0", the registry JSON and real components come in Phase 3, starting with Button.
- `llms.txt` and `.md` pages come in Phase 5.
- **Git:** everything is merged into `main`. The owner wants to work directly on `main` for now, with no feature branches.
