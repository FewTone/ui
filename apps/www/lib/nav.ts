import { getKinds, isNew } from "./content";
import { guides } from "./guides";

export type NavLink = { title: string; href: string; badge?: "New" | "Beta" };
export type NavSection = {
  id: string;
  /** Shown above the links; a section without one (Home) is just its links */
  label?: string;
  /** Set for kind sections, so the sidebar can filter by kind */
  kind?: string;
  count?: number;
  links: NavLink[];
};

/** Sidebar sections: Home (every component), the guides, then one section per kind, from the content index */
export function getNavSections(): NavSection[] {
  return [
    { id: "home", links: [{ title: "Home", href: "/components" }] },
    {
      id: "guides",
      label: "Getting started",
      links: guides.map((guide) => ({ title: guide.title, href: guide.href })),
    },
    ...getKinds().map((kind) => ({
      id: kind.name,
      label: kind.plural,
      kind: kind.name,
      count: kind.items.length,
      links: kind.items.map((item) => ({
        title: item.title,
        href: item.href,
        badge: isNew(item) ? ("New" as const) : item.status === "beta" ? ("Beta" as const) : undefined,
      })),
    })),
  ];
}

export type SearchEntry = { title: string; href: string; group: string; description: string };

/** Everything ⌘K can find */
export function getSearchEntries(): SearchEntry[] {
  return [
    ...guides.map((guide) => ({
      title: guide.title,
      href: guide.href,
      group: "Getting started",
      description: guide.description,
    })),
    ...getKinds().flatMap((kind) => [
      {
        title: `All ${kind.plural.toLowerCase()}`,
        href: `/${kind.segment}`,
        group: kind.plural,
        description: kind.intro,
      },
      ...kind.items.map((item) => ({
        title: item.title,
        href: item.href,
        group: kind.plural,
        description: item.description,
      })),
    ]),
  ];
}
