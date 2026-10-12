/** Site-wide facts used by metadata, structured data, the sitemap and the footer. */
export const site = {
  name: "FewTone UI",
  url: "https://ui.fewtone.com",
  title: "FewTone UI: Accessible React Components for Next.js and Tailwind CSS",
  description:
    "Free, open-source React components for Next.js, built with Tailwind CSS and Radix. Install them with the shadcn CLI or copy the source and make it yours.",
  github: "https://github.com/FewTone/ui",
  studio: { name: "FewTone", url: "https://fewtone.com" },
  /** Last meaningful change to the landing page, for the sitemap */
  updatedAt: "2026-10-12",
} as const;

/** Absolute URL for a site path */
export function absoluteUrl(path: string) {
  return new URL(path, site.url).toString();
}
