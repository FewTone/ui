import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Breadcrumbs } from "@/components/docs/breadcrumbs";
import { ComponentPreview } from "@/components/docs/component-preview";
import { InstallSection } from "@/components/docs/install-section";
import { ItemGrid } from "@/components/docs/item-card";
import { PageActions } from "@/components/docs/page-actions";
import { PageSkeleton } from "@/components/docs/page-skeleton";
import { PropsTable } from "@/components/docs/props-table";
import { StatusBadge } from "@/components/docs/status-badge";
import { breadcrumbList, JsonLd, organization } from "@/components/json-ld";
import {
  getItem,
  getKindBySegment,
  getKinds,
  getRelated,
  isNew,
  itemDescription,
  itemTitle,
} from "@/lib/content";
import { itemMarkdown } from "@/lib/markdown";
import { absoluteUrl, site } from "@/lib/site";

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
    alternates: { canonical: item.href },
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

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
// Layout follows beUI (ADR 0007): small section headings, each section opens with a thin rule, spacing from tokens
const sectionTitle = "scroll-mt-24 text-body-sm leading-5 font-semibold";
const ruledSection = "mt-(--space-rule) border-t pt-(--space-rule)";

/** The page body reads params inside Suspense, so client navigations show the shell instantly */
export default function ItemPage({ params }: PageProps<"/[kind]/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ItemContent params={params} />
    </Suspense>
  );
}

/** One item: header, hero preview, install, examples, API, related. Sections without data are skipped. */
async function ItemContent({ params }: Pick<PageProps<"/[kind]/[slug]">, "params">) {
  const { kind: segment, slug } = await params;
  const kind = getKindBySegment(segment);
  const item = getItem(segment, slug);
  if (!kind || !item) notFound();

  const [hero, ...examples] = item.demos;
  const related = getRelated(item);
  const url = absoluteUrl(item.href);
  const trail = [
    { name: kind.plural, href: `/${kind.segment}` },
    { name: item.title, href: item.href },
  ];
  const source = `${site.github}/tree/main/packages/ui/src/${item.dir}`;
  const updated = dateFormat.format(new Date(`${item.updatedAt}T00:00:00Z`));

  return (
    <article>
      <header>
        <Breadcrumbs trail={trail} />
        <div className="mt-(--space-title) flex flex-wrap items-start justify-between gap-(--space-stack)">
          <h1 className="flex items-center gap-3 text-h2">
            {item.title}
            {isNew(item) ? <StatusBadge>New</StatusBadge> : null}
            {item.status === "draft" ? <StatusBadge>Draft</StatusBadge> : null}
          </h1>
          <PageActions markdown={itemMarkdown(item)} url={url} title={item.title} />
        </div>
        <p className="mt-(--space-intro) max-w-prose text-body text-muted-foreground">{item.description}</p>
        <ul className="mt-(--space-stack) flex flex-wrap gap-x-5 gap-y-2 text-label text-muted-foreground">
          <li>
            <a
              href={source}
              target="_blank"
              rel="noreferrer"
              className="focus-ring rounded-sm hover:text-foreground"
            >
              Source ↗
            </a>
          </li>
          {item.ariaPattern ? (
            <li>
              <a
                href={item.ariaPattern}
                target="_blank"
                rel="noreferrer"
                className="focus-ring rounded-sm hover:text-foreground"
              >
                ARIA pattern ↗
              </a>
            </li>
          ) : null}
          {item.primitives.length > 0 ? <li>Built on {item.primitives.join(", ")}</li> : null}
        </ul>
      </header>

      {hero ? (
        <div className="mt-(--space-page)">
          <ComponentPreview item={item} demo={hero.name} withUsage />
        </div>
      ) : null}

      <section aria-labelledby="installation" className={ruledSection}>
        <h2 id="installation" className={sectionTitle}>
          Installation
        </h2>
        <div className="mt-(--space-heading)">
          <InstallSection item={item} />
        </div>
      </section>

      {examples.length > 0 ? (
        <section aria-labelledby="examples" className={ruledSection}>
          <h2 id="examples" className={sectionTitle}>
            Examples
          </h2>
          <div className="mt-(--space-heading) grid grid-cols-1 gap-(--space-block)">
            {examples.map((demo) => (
              <div key={demo.name}>
                <h3 id={demo.name} className="scroll-mt-24 text-h4">
                  {demo.title}
                </h3>
                {demo.description ? (
                  <p className="mt-(--space-stack) text-body-sm text-muted-foreground">{demo.description}</p>
                ) : null}
                <div className="mt-(--space-stack)">
                  <ComponentPreview item={item} demo={demo.name} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {item.api.length > 0 ? (
        <section aria-labelledby="api" className={ruledSection}>
          <h2 id="api" className={sectionTitle}>
            API reference
          </h2>
          <div className="mt-(--space-heading) grid grid-cols-1 gap-(--space-block)">
            {item.api.map((part) => (
              <div key={part.name} className="grid grid-cols-1 gap-(--space-heading)">
                {item.api.length > 1 ? <h3 className="text-h4">{part.name}</h3> : null}
                {part.description ? (
                  <p className="text-body-sm text-muted-foreground">{part.description}</p>
                ) : null}
                <PropsTable props={part.props} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section aria-labelledby="related" className="mt-(--space-block) border-t pt-(--space-rule-lg)">
          <h2 id="related" className={sectionTitle}>
            Related {kind.plural.toLowerCase()}
          </h2>
          <div className="mt-(--space-stack)">
            <ItemGrid items={related} />
          </div>
        </section>
      ) : null}

      <footer className="mt-(--space-block) flex flex-wrap gap-x-5 gap-y-2 text-caption text-muted-foreground">
        <span>
          Last updated <time dateTime={item.updatedAt}>{updated}</time>
        </span>
        <a
          href={source}
          target="_blank"
          rel="noreferrer"
          className="focus-ring rounded-sm hover:text-foreground"
        >
          Edit on GitHub
        </a>
      </footer>

      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: itemTitle(item),
            description: itemDescription(item),
            url,
            datePublished: item.addedAt,
            dateModified: item.updatedAt,
            author: organization,
            publisher: organization,
            about: {
              "@type": "SoftwareSourceCode",
              name: `${item.title} (${site.name})`,
              programmingLanguage: "TypeScript",
              runtimePlatform: "React",
              codeRepository: site.github,
              license: "https://opensource.org/licenses/MIT",
            },
          },
          breadcrumbList(trail),
        ]}
      />
    </article>
  );
}
