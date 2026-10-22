# 0014 · llms.txt and a Markdown version of every page

- **Status:** Accepted (2026-10-23, owner: "start llms.txt and .md pages")
- **Builds on:** ADR 0008 (content model and SEO), 0012 (the MCP server); the plan's §6 ("llms: /llms.txt, /llms-full.txt, `<page>.md`")

## Context
AI assistants and AI search read sites better as Markdown than as HTML full of interface. The plan always had an llms layer; the MCP server (ADR 0012) covers assistants that connect to it, but most AI tools just fetch URLs.

## Decision
- **Every page has a Markdown version at its address plus `.md`:** `/docs.md`, `/docs/installation.md`, `/docs/mcp.md`, `/docs/smooth-ui.md`, `/roadmap.md`, `/components.md` and `/components/<name>.md`. One route (`app/md/[...path]/route.ts`) behind a rewrite in `next.config.ts` (`/:path*.md` → `/md/:path*`), prerendered for every path at build time. Unknown paths answer 404. Served as `text/markdown`.
- **`/llms.txt`** follows llmstxt.org: the site's name, a one-paragraph summary, how to install and the MCP server, then link lists to every page's `.md`: Docs (the guides), the components by category (A–Z), and Optional (llms-full.txt, the registry index, GitHub).
- **`/llms-full.txt`** is every page's Markdown in one file, each headed by its `.md` address and separated by rules.
- **One source:** everything comes from `apps/www/lib/llms.ts`, which reads the same index, guides list, roadmap plan and guide sources as the HTML.
  - **Component pages:** `itemMarkdown` (install, usage, API), `itemFacts` (status, when to use it, primitives, ARIA pattern, dependencies: moved to `lib/markdown.ts` and shared with the MCP server), every example's code with imports as they read in a user's project, and related items.
  - **Guides:** converted from their MDX source. The metadata export is dropped, each of the site's blocks is written out (the title blocks as a heading, `InstallCommand` as a bash block, `InstallTable` as a table, `Faq` as bold questions and answers, `GuideJsonLd` removed), and site links become absolute. **A block the converter doesn't know fails the build**, so a new block can't silently vanish from the Markdown.
- **Discovery:** each HTML page has `<link rel="alternate" type="text/markdown">` pointing to its `.md` (`alternates.types` in its metadata).
- **Search engines:** the `.md` copies send `X-Robots-Tag: noindex`, so the HTML page stays the one that's indexed (it's the canonical).

## Consequences
- New items and guides get their Markdown, and appear in llms.txt, with no extra work. A guide that adds a new MDX block needs a line in `guideMarkdown`.
- `llms-full.txt` is about 400 KB with every example's code; fine for tools that read a whole site.
- Not built yet: a "Copy page" / "View as Markdown" button on pages, and listing llms.txt in directories.
