# 0012 · The FewTone UI MCP server

- **Status:** Accepted (2026-10-22, owner: "first I think we can start with the MCP server")
- **Builds on:** ADR 0005 (hosting), 0008 (content model), 0009 (component distribution); the plan's §6 distribution channels

## Context
AI coding assistants are a main way people find and add components. shadcn's own MCP server can already browse any registry listed in a project's `components.json`, but it only knows what's in the registry JSON: names, files and dependencies. It doesn't know when to use a component, its props or its examples. beUI's hosted, keyless MCP endpoint was the best example in the 2026-10 research.

## Decision
- **A hosted, keyless, read-only MCP server at `https://ui.fewtone.com/mcp`**, a route in the site (`apps/www/app/mcp/route.ts`). No separate service, no account and no key.
- **Library:** `mcp-handler` 2.3 (Vercel Labs) on the official MCP SDK v2 (`@modelcontextprotocol/server` 2.3). It turns the server into a web-standard `Request → Response` handler, so it isn't tied to Vercel (ADR 0005 keeps the code host-agnostic).
  - It serves the 2026-07-28 spec and falls back to stateless Streamable HTTP for 2025-era clients. Stateless, so no Redis or sessions. GET without a stream answers 405.
  - Rejected: the SDK's transport by hand (more code for the same result), `@modelcontextprotocol/sdk` 1.x (superseded), a stdio npm package (needs installing; the hosted URL works everywhere and stays current with the site).
- **Tools** (all read-only, with `readOnlyHint`):
  - `search_components`: ranks items for keywords or a description of what's being built (names and titles weigh most, then tags and keywords, category, `ai.whenToUse`, description). This covers the plan's `recommend_components` too.
  - `list_components`: every item by kind and category, or one category.
  - `get_component`: the page as Markdown (`lib/markdown.ts`: install, usage, API), plus when to use it, primitives, ARIA pattern, npm and registry dependencies, the examples, related items; the source on request (`include_source`).
  - `get_component_example`: one demo's code, imports rewritten to the user's paths.
  - `get_install_command`: one `shadcn add` for several items and a package manager, with the requirements.
- **One source:** answers come from `apps/www/lib/mcp.ts`, which reads the same generated index as the pages, so the server never drifts from the site. Drafts stay out in production, as on the site. Unknown names answer with the closest matches.
- **Source files at request time:** the route reads component and demo source with `readSource`. `outputFileTracingIncludes` ships `packages/ui/src/components/**/*.tsx` with the route, so the files exist in the deployed function.
- **Answers are Markdown text**, which every client reads. No structured output yet.
- **Docs:** `/docs/mcp` covers setup for Claude Code, Cursor, VS Code, Windsurf, the Claude apps and anything else (mcp-remote), the tools, example prompts and the shadcn MCP alternative. The Installation guide links to it. Beside its title, **Copy prompt** (owner, 2026-10-22) copies a brief (`mcpPrompt` in `lib/prompt.ts`) that has an assistant work out which tool it is, merge the server into its own MCP config without touching anything else, check the connection with a test search, and use the tools from then on.

## Consequences
- Every new item is in the server as soon as `pnpm index` runs: no MCP code to touch.
- The server is public and unauthenticated. It exposes only what the site and registry already publish.
- `/mcp` runs on every request (POST isn't cached). The work per call is small: an in-memory search, or a cached file read.
- Not built yet: usage analytics (`onEvent`), structured tool output, MCP resources and prompts, and a listing in MCP directories.
