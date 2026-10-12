# 0008 · Content model and SEO baseline

- **Status:** Accepted (2026-10-12, by the owner)

## Context
The owner wants everything on the site to be data-driven: pages, navigation and SEO. That way, adding backgrounds, whole sections (blocks), templates or hooks later causes no rework. The research (`06-research/2026-10-12-component-pages.md`) also showed that no library gets every SEO basic right.

## Decision

### One metadata schema for every kind of item
- **`packages/ui/src/registry/kinds.ts`** lists the kinds: component, background, block, hook. Each kind has:
  - label and plural
  - URL segment
  - sidebar order
  - shadcn registry type
  - preview template: centered, full-bleed or viewport
  - index heading and intro
  - `alwaysShow`
- **`packages/ui/src/registry/schema.ts`** (zod) defines an item:
  - **Identity:** `name`, `title`, a one-sentence `description`, `kind`, `category`, `tags`, `keywords`
  - **Lifecycle:** `status` (draft, new, beta, stable, deprecated), `addedAt`, `updatedAt`, `tier`
  - **Files and dependencies:** `files`, `dependencies`, `registryDependencies`
  - **Docs content:** `usage`, `demos` (the first is the hero, the rest are Examples), `api`
  - **Behaviour and preview:** `primitives`, `ariaPattern`, `motion.animated`, `preview`
  - **Links and overrides:** `related`, `seo` overrides, `ai`, `controls`
- **Each item is a folder:** `<name>/<name>.meta.ts` next to its source and `demos/`.
- **`scripts/build-index.mjs`** validates every metadata file and writes two generated files:
  - `registry/index.generated.ts`: the typed data
  - `registry/demos.generated.tsx`: the demo components

  It checks:
  - that folder and file names match the item name
  - that the source files and demos exist
  - that names are unique across all kinds, because they are also registry names
  - that `related` and `registryDependencies` refer to real items

  It runs before `dev` and `build`. `pnpm check` fails if the generated files are stale. Node runs the TypeScript metadata directly, so metadata files use only erasable syntax and `.ts` imports.
- **Drafts** show in development only.

### What reads the index
- Routes and static params
- Sidebar, ⌘K search and kind index pages
- Related components and "New" badges
- Page sections
- Metadata, social images, JSON-LD and the sitemap
- **Later:** the shadcn registry JSON (Phase 3), `llms.txt` and `.md` pages (Phase 5)

### SEO baseline
- **Titles:** `metadataBase` is `https://ui.fewtone.com`, and the title template is `%s – FewTone UI`. Items use search-friendly titles ("React Button Component"), while the h1 stays the plain name.
- **Description:** the item's own sentence.
- **Per page:** a self-referencing canonical, Open Graph and Twitter tags, and a 1200×630 social image generated from the metadata (`next/og` with Geist, prebuilt at build time).
- **JSON-LD:**
  - Item pages: TechArticle (with SoftwareSourceCode), plus a BreadcrumbList that matches the visible breadcrumb.
  - Index pages: CollectionPage.
- **`sitemap.xml`:** uses each item's `updatedAt` as the real last-change date. **`robots.txt`:** allows everything except `/lab`.
- **All content is in the server HTML:** highlighted code (Shiki, cached, built at build time), install commands and tables. There is one h1, before any other heading.
- **Pages are prerendered.** With Cache Components, `generateStaticParams` must return at least one entry, so a placeholder is returned when a kind has no published items; it renders a 404. Pages read `params` inside `<Suspense>` (with a skeleton), so client navigations stay instant.

## Consequences
- **Adding a kind** means adding one entry to `kinds.ts`. **Adding an item** means adding one folder. No route, navigation or SEO code changes; this was verified with a temporary background item.
- Metadata quality now drives search quality. Write the description as one clear sentence, with the words people search for.
- **Two tooling fixes came out of this work:**
  - `cn()` now teaches tailwind-merge the design system's type and shadow tokens. Before, it dropped `text-label` and similar classes whenever a colour class was present.
  - The token checker now skips fenced code samples in MDX guides.
