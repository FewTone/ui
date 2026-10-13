import type { Item } from "@fewtone/ui/registry/schema";
import { Breadcrumbs } from "@/components/docs/breadcrumbs";
import { ComponentPreview } from "@/components/docs/component-preview";
import { CopyPromptButton } from "@/components/docs/copy-prompt-button";
import { Expandable } from "@/components/docs/expandable";
import { InstallSection } from "@/components/docs/install-section";
import { ItemGrid } from "@/components/docs/item-card";
import { CommandChip } from "@/components/docs/package-manager";
import { PropsTable } from "@/components/docs/props-table";
import { StatusBadge } from "@/components/docs/status-badge";
import { breadcrumbList, JsonLd, organization } from "@/components/json-ld";
import { getRelated, isNew, itemDescription, itemTitle, type Kind } from "@/lib/content";
import { addCommands } from "@/lib/install";
import { itemPrompt } from "@/lib/prompt";
import { absoluteUrl, site } from "@/lib/site";

const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
// Section titles are larger than the example and API titles inside them; space alone separates sections, with
// no divider lines (owner, 2026-10-13). Spacing from tokens.
const sectionTitle = "scroll-mt-24 text-h3";
const section = "mt-(--space-block)";

/**
 * One item's page body: header, hero preview, install, examples, API, related. Sections without data are
 * skipped. Rendered by the item route.
 *
 * The header's actions (owner, 2026-10-13): the install command (package-manager dropdown, copy) and
 * Copy prompt, on one line beside the title. Installation below holds the manual steps.
 */
export async function ItemArticle({ kind, item }: { kind: Kind; item: Item }) {
  const [hero, ...examples] = item.demos;
  const related = getRelated(item);
  const url = absoluteUrl(item.href);
  const trail = [
    { name: kind.plural, href: `/${kind.segment}` },
    { name: item.title, href: item.href },
  ];
  const source = `${site.github}/tree/main/packages/ui/src/${item.dir}`;
  const updated = dateFormat.format(new Date(`${item.updatedAt}T00:00:00Z`));
  const prompt = await itemPrompt(item);

  return (
    <article>
      <header>
        <Breadcrumbs trail={trail} />
        <div className="mt-(--space-title) flex flex-wrap items-center justify-between gap-(--space-stack)">
          <h1 className="flex items-center gap-3 text-h2">
            {item.title}
            {isNew(item) ? <StatusBadge status="New" /> : null}
            {item.status === "draft" ? <StatusBadge status="Draft" /> : null}
          </h1>
          <div className="flex min-w-0 flex-wrap items-center gap-(--space-header-actions)">
            <CommandChip commands={addCommands(item.name)} />
            <CopyPromptButton prompt={prompt} />
          </div>
        </div>
        <p className="mt-(--space-intro) max-w-prose text-body text-muted-foreground">{item.description}</p>
      </header>

      {hero ? (
        <div className="mt-(--space-hero)">
          <ComponentPreview item={item} demo={hero.name} withUsage />
        </div>
      ) : null}

      <section aria-labelledby="installation" className={section}>
        <h2 id="installation" className={sectionTitle}>
          Installation
        </h2>
        <div className="mt-(--space-stack)">
          <Expandable more="View all steps">
            <InstallSection item={item} />
          </Expandable>
        </div>
      </section>

      {examples.length > 0 ? (
        <section aria-labelledby="examples" className={section}>
          <h2 id="examples" className={sectionTitle}>
            Examples
          </h2>
          <div className="mt-(--space-stack) grid grid-cols-1 gap-(--space-block)">
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
        <section aria-labelledby="api" className={section}>
          <h2 id="api" className={sectionTitle}>
            API reference
          </h2>
          <div className="mt-(--space-stack) grid grid-cols-1 gap-(--space-block)">
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
        <section aria-labelledby="related" className={section}>
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
