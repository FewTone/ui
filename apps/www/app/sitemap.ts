import type { MetadataRoute } from "next";
import { getKinds, items } from "@/lib/content";
import { guides } from "@/lib/guides";
import { absoluteUrl, site } from "@/lib/site";

/** Every public page with its real last-change date, all from metadata. Drafts are excluded in production. */
export default function sitemap(): MetadataRoute.Sitemap {
  const latest = (dates: string[]) => dates.reduce((max, date) => (date > max ? date : max), site.updatedAt);

  return [
    { url: site.url, lastModified: site.updatedAt },
    ...guides.map((guide) => ({ url: absoluteUrl(guide.href), lastModified: guide.updatedAt })),
    ...getKinds().map((kind) => ({
      url: absoluteUrl(`/${kind.segment}`),
      lastModified: latest(kind.items.map((item) => item.updatedAt)),
    })),
    ...items.map((item) => ({ url: absoluteUrl(item.href), lastModified: item.updatedAt })),
  ];
}
