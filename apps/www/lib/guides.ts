/**
 * Guide pages under /docs. Each one is an `app/(browse)/docs/.../page.mdx` file.
 * `description` feeds search, the sitemap and structured data; `headline` is the page's full title.
 * Theming was folded into Installation (owner, 2026-10-13); /docs/theming redirects there.
 * The roadmap (/roadmap, a TSX page fed by lib/roadmap.ts) is listed here too, so it's in the sidebar,
 * search and sitemap. Bump its updatedAt when the plan changes.
 */
export const guides = [
  {
    title: "Introduction",
    headline: "Introduction to FewTone UI – React Components for Next.js",
    href: "/docs",
    description:
      "Free, open-source, accessible React components for Next.js, built with Tailwind CSS v4 and Radix. Add them with the shadcn CLI or copy the source into your app.",
    updatedAt: "2026-10-13",
  },
  {
    title: "Installation",
    headline: "Install FewTone UI in Next.js with the shadcn CLI",
    href: "/docs/installation",
    description:
      "Install FewTone UI components in a Next.js project: requirements, one shadcn CLI command for pnpm, npm, yarn or bun, manual setup, theming and troubleshooting.",
    updatedAt: "2026-10-13",
  },
  {
    title: "MCP Server",
    headline: "FewTone UI MCP Server for Claude Code, Cursor and VS Code",
    href: "/docs/mcp",
    description:
      "Connect your AI assistant to the FewTone UI MCP server: it finds the right React component, reads its docs and examples, and installs it with the shadcn CLI. Free, no key.",
    updatedAt: "2026-10-22",
  },
  {
    title: "Smooth UI Skill",
    headline: "Smooth UI: an Agent Skill That Makes Any Web UI Feel Smooth and Premium",
    href: "/docs/smooth-ui",
    description:
      "A free Agent Skill for Claude Code, Cursor and other AI assistants: motion rules, timings, patterns and React code that make any web interface smoother and more polished.",
    updatedAt: "2026-10-22",
  },
  {
    title: "Roadmap",
    headline: "FewTone UI Roadmap: Upcoming React Components for Next.js",
    href: "/roadmap",
    description:
      "What FewTone UI has today, what's being built next and what's planned: accessible React components for Next.js and Tailwind CSS, from Dialog and Tabs to Toast.",
    updatedAt: "2026-10-16",
  },
] as const;

export type Guide = (typeof guides)[number];
