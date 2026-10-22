/**
 * Every kind of item FewTone UI ships (ADR 0008).
 * Adding a kind here gives it a URL segment, a sidebar section, an index page and SEO,
 * with no route or navigation code changes. Plain data only: the index script runs this file in Node.
 */

export type PreviewTemplate = "centered" | "full-bleed" | "viewport";

export type KindConfig = {
  /** Singular label, used in page titles: "React Button Component" */
  label: string;
  /** Plural label, used in the sidebar and breadcrumbs */
  plural: string;
  /** First URL segment: /components/button */
  segment: string;
  /** Sidebar order */
  order: number;
  /** shadcn registry item type */
  registryType: "registry:ui" | "registry:component" | "registry:block" | "registry:hook" | "registry:lib";
  /** How the demo is framed on the page */
  template: PreviewTemplate;
  /** h1 of the index page */
  heading: string;
  /** One sentence under the h1, also the meta description */
  intro: string;
  /** Show the index page even before any item of this kind exists */
  alwaysShow: boolean;
};

export const kinds = {
  component: {
    label: "Component",
    plural: "Components",
    segment: "components",
    order: 1,
    registryType: "registry:ui",
    template: "centered",
    heading: "React components",
    intro:
      "Free, open-source React components for Next.js, built with Tailwind CSS and Radix. Copy the source or install them with the shadcn CLI.",
    alwaysShow: true,
  },
  background: {
    label: "Background",
    plural: "Backgrounds",
    segment: "backgrounds",
    order: 2,
    // registry:ui, like components: shadcn installs them into components/ui, which is where the import rewrite
    // (@/components/ui/<file>) and the Manual install paths point. registry:component landed them in
    // components/ and broke the imports between a background's own files (2026-10-16).
    registryType: "registry:ui",
    template: "full-bleed",
    heading: "React backgrounds",
    intro: "Free, open-source background effects for React and Next.js, built with Tailwind CSS.",
    alwaysShow: false,
  },
  block: {
    label: "Block",
    plural: "Blocks",
    segment: "blocks",
    order: 3,
    registryType: "registry:block",
    template: "viewport",
    heading: "React blocks and sections",
    intro: "Free, open-source page sections for React and Next.js: heroes, pricing, features and more.",
    alwaysShow: false,
  },
  hook: {
    label: "Hook",
    plural: "Hooks",
    segment: "hooks",
    order: 4,
    registryType: "registry:hook",
    template: "centered",
    heading: "React hooks",
    intro: "Small, typed React hooks used across FewTone UI, ready to copy into your project.",
    alwaysShow: false,
  },
} as const satisfies Record<string, KindConfig>;

export type KindName = keyof typeof kinds;
