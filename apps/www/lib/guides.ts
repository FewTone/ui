/** Guide pages under /docs. Each one is an `app/(browse)/docs/.../page.mdx` file. */
export const guides = [
  {
    title: "Introduction",
    href: "/docs",
    description: "What FewTone UI is, how it works, and what you get.",
    updatedAt: "2026-10-12",
  },
  {
    title: "Installation",
    href: "/docs/installation",
    description: "Add FewTone UI components to a Next.js project with the shadcn CLI, or copy them by hand.",
    updatedAt: "2026-10-12",
  },
  {
    title: "Theming",
    href: "/docs/theming",
    description: "Change colours, radius and fonts with CSS variables, in light and dark mode.",
    updatedAt: "2026-10-12",
  },
] as const;

export type Guide = (typeof guides)[number];
