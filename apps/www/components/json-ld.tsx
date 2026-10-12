import { absoluteUrl, site } from "@/lib/site";
import type { Crumb } from "./docs/breadcrumbs";

type Data = Record<string, unknown>;

/** Structured data for search engines. `<` is escaped so content can never close the script tag. */
export function JsonLd({ data }: { data: Data | Data[] }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD must be inline; the content is escaped
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export const organization = {
  "@type": "Organization",
  name: site.studio.name,
  url: site.studio.url,
};

export function breadcrumbList(trail: Crumb[]): Data {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.href),
    })),
  };
}
