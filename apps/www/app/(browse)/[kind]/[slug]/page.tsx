import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ItemArticle } from "@/components/docs/item-article";
import { PageSkeleton } from "@/components/docs/page-skeleton";
import { getItem, getKindBySegment, getKinds, itemDescription, itemTitle } from "@/lib/content";
import { site } from "@/lib/site";

export async function generateStaticParams() {
  const params = getKinds().flatMap((kind) =>
    kind.items.map((item) => ({ kind: kind.segment, slug: item.name })),
  );
  // Cache Components needs at least one entry. Before anything is published, this placeholder renders a 404.
  return params.length > 0 ? params : [{ kind: "components", slug: "coming-soon" }];
}

export async function generateMetadata({ params }: PageProps<"/[kind]/[slug]">): Promise<Metadata> {
  const { kind, slug } = await params;
  const item = getItem(kind, slug);
  if (!item) return {};
  const title = itemTitle(item);
  const description = itemDescription(item);
  return {
    title,
    description,
    // The Markdown version, for AI tools (lib/llms.ts)
    alternates: { canonical: item.href, types: { "text/markdown": `${item.href}.md` } },
    openGraph: {
      type: "article",
      siteName: site.name,
      url: item.href,
      title: `${title} – ${site.name}`,
      description,
      publishedTime: item.addedAt,
      modifiedTime: item.updatedAt,
    },
    twitter: { card: "summary_large_image", title: `${title} – ${site.name}`, description },
  };
}

/** The page body reads params inside Suspense, so client navigations show the shell instantly */
export default function ItemPage({ params }: PageProps<"/[kind]/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ItemContent params={params} />
    </Suspense>
  );
}

/** Resolves the item, then renders its page body (components/docs/item-article.tsx) */
async function ItemContent({ params }: Pick<PageProps<"/[kind]/[slug]">, "params">) {
  const { kind: segment, slug } = await params;
  const kind = getKindBySegment(segment);
  const item = getItem(segment, slug);
  if (!kind || !item) notFound();
  return <ItemArticle kind={kind} item={item} />;
}
