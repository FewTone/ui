import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/docs/breadcrumbs";
import { ItemGrid } from "@/components/docs/item-card";
import { PageSkeleton } from "@/components/docs/page-skeleton";
import { breadcrumbList, JsonLd } from "@/components/json-ld";
import { getKindBySegment, getKinds } from "@/lib/content";
import { absoluteUrl, site } from "@/lib/site";

export async function generateStaticParams() {
  return getKinds().map((kind) => ({ kind: kind.segment }));
}

export async function generateMetadata({ params }: PageProps<"/[kind]">): Promise<Metadata> {
  const { kind: segment } = await params;
  const kind = getKindBySegment(segment);
  if (!kind) return {};
  const href = `/${kind.segment}`;
  return {
    title: kind.heading,
    description: kind.intro,
    alternates: { canonical: href, types: { "text/markdown": `${href}.md` } },
    openGraph: {
      type: "website",
      siteName: site.name,
      url: href,
      title: `${kind.heading} – ${site.name}`,
      description: kind.intro,
    },
  };
}

/** The page body reads params inside Suspense, so client navigations show the shell instantly */
export default function KindPage({ params }: PageProps<"/[kind]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <KindContent params={params} />
    </Suspense>
  );
}

/** All items of one kind, A–Z, with no categories and no "New" row (owner, 2026-10-14: no New tags anywhere) */
async function KindContent({ params }: Pick<PageProps<"/[kind]">, "params">) {
  const { kind: segment } = await params;
  const kind = getKindBySegment(segment);
  if (!kind) notFound();

  const href = `/${kind.segment}`;
  const trail = [{ name: kind.plural, href }];

  return (
    <article>
      <header>
        <Breadcrumbs trail={trail} />
        <h1 className="mt-(--space-title) text-h2">{kind.heading}</h1>
        <p className="mt-(--space-intro) max-w-prose text-body text-muted-foreground">{kind.intro}</p>
      </header>

      {kind.items.length === 0 ? (
        <div className="mt-(--space-page) grid justify-items-start gap-(--space-heading) rounded-xl bg-muted p-(--space-content-y)">
          <h2 className="text-h4">The first {kind.plural.toLowerCase()} are on the way</h2>
          <p className="text-body-sm text-muted-foreground">
            Get your project ready in the meantime: FewTone UI works with the shadcn CLI.
          </p>
          <Link
            href="/docs/installation"
            className="focus-ring rounded-sm text-label underline underline-offset-4 hover:text-muted-foreground"
          >
            Read the installation guide
          </Link>
        </div>
      ) : (
        // One list, no categories (owner, 2026-10-13)
        <section aria-labelledby="all" className="mt-(--space-page)">
          <h2 id="all" className="sr-only">
            All {kind.plural.toLowerCase()}
          </h2>
          <div>
            <ItemGrid items={[...kind.items].sort((a, b) => a.title.localeCompare(b.title))} />
          </div>
        </section>
      )}

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: kind.heading,
            description: kind.intro,
            url: absoluteUrl(href),
            hasPart: kind.items.map((item) => ({
              "@type": "TechArticle",
              headline: item.title,
              url: absoluteUrl(item.href),
            })),
          },
          breadcrumbList(trail),
        ]}
      />
    </article>
  );
}
