import { Button } from "@fewtone/ui/components/button/button";
import { CopyButton } from "@fewtone/ui/components/copy-button/copy-button";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Crumb } from "@/components/docs/breadcrumbs";
import { Command } from "@/components/docs/package-manager";
import { breadcrumbList, JsonLd, organization } from "@/components/json-ld";
import { getKinds } from "@/lib/content";
import { guides } from "@/lib/guides";
import { addCommands } from "@/lib/install";
import { mcpPrompt, skillPrompt } from "@/lib/prompt";
import { absoluteUrl, site } from "@/lib/site";

/*
 * Blocks the guide pages (app/(browse)/docs/**\/page.mdx) can use without importing them
 * (registered in mdx-components.tsx). Everything comes from the content index, so the guides
 * never fall out of date as components are added.
 */

/**
 * The MCP guide's title with Copy prompt beside it, laid out like an item page's header (item-article.tsx): the
 * same filled Copy Button, text only. It copies a brief that has an assistant connect itself (lib/prompt.ts).
 */
export function McpTitle({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-(--space-stack)">
      <h1 className="text-h2">{children}</h1>
      <CopyButton
        value={mcpPrompt()}
        variant="default"
        size="sm"
        copiedText="Copied"
        icon={false}
        className="rounded-lg text-label"
      >
        Copy prompt
      </CopyButton>
    </div>
  );
}

/**
 * A public skill's guide title with its two ways in beside it: Download (`public/skills/<name>.zip`, built by
 * scripts/skills/build-skill-zips.mjs), outlined, and Copy prompt (owner, 2026-10-22), filled, as the main
 * action: it copies a brief that has an assistant install the skill itself (lib/prompt.ts). Laid out like an
 * item page's header and the MCP guide's.
 */
export function SkillTitle({ name, children }: { name: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-(--space-stack)">
      <h1 className="text-h2">{children}</h1>
      <div className="flex flex-wrap items-center gap-(--space-header-actions)">
        <Button asChild variant="outline" size="sm" className="rounded-lg text-label">
          <a href={`/skills/${name}.zip`} download>
            Download skill
          </a>
        </Button>
        <CopyButton
          value={skillPrompt()}
          variant="default"
          size="sm"
          copiedText="Copied"
          icon={false}
          className="rounded-lg text-label"
        >
          Copy prompt
        </CopyButton>
      </div>
    </div>
  );
}

/** The real install command for one item, with the package-manager switch and a copy button */
export function InstallCommand({ name }: { name: string }) {
  return <Command commands={addCommands(name)} />;
}

/** "motion@^14.0.0" → "motion" */
const packageName = (dependency: string) => dependency.replace(/(.)@.*$/, "$1");

/**
 * What installing each component adds to a project: its files and npm packages, from the same derived
 * install data as the registry (ADR 0009). The tokens are added once, by the first install.
 */
export function InstallTable() {
  const items = getKinds().find((kind) => kind.name === "component")?.items ?? [];
  const cell = "border-b px-4 py-2 align-top";
  return (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full text-left text-body-sm">
        <thead>
          <tr>
            {["Component", "Files", "npm packages"].map((heading) => (
              <th
                key={heading}
                className="border-b bg-muted px-4 py-2 text-caption font-medium text-muted-foreground"
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.name}>
              <td className={cell}>
                <Link
                  href={item.href}
                  className="focus-ring rounded-sm font-medium underline underline-offset-4"
                >
                  {item.title}
                </Link>
              </td>
              <td className={`${cell} font-mono text-caption`}>
                {[
                  ...item.files.map((file) => `components/ui/${file.split("/").pop()}`),
                  ...(item.install.registry.includes("motion") ? ["lib/motion.ts"] : []),
                ].join(", ")}
              </td>
              <td className={`${cell} font-mono text-caption`}>
                {item.install.dependencies.map(packageName).join(", ") || "none"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export type FaqEntry = { question: string; answer: string };

/**
 * Questions and answers, shown on the page and described for search engines (FAQPage) from the same
 * text, so the two always match. Answers are plain sentences.
 */
export function Faq({ entries }: { entries: FaqEntry[] }) {
  return (
    <>
      <dl className="grid gap-(--space-heading)">
        {entries.map((entry) => (
          <div key={entry.question} className="grid gap-1">
            <dt className="text-body font-medium text-foreground">{entry.question}</dt>
            <dd className="text-body text-muted-foreground">{entry.answer}</dd>
          </div>
        ))}
      </dl>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: entries.map((entry) => ({
            "@type": "Question",
            name: entry.question,
            acceptedAnswer: { "@type": "Answer", text: entry.answer },
          })),
        }}
      />
    </>
  );
}

/** A guide's trail: just the guide ("Installation"), as the components index shows just "Components" */
function guideTrail(href: string): Crumb[] {
  const guide = guides.find((entry) => entry.href === href);
  return guide ? [{ name: guide.title, href: guide.href }] : [];
}

/** Structured data for a guide: the article and its breadcrumb, from the guides list */
export function GuideJsonLd({ href }: { href: string }) {
  const guide = guides.find((entry) => entry.href === href);
  if (!guide) return null;
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "TechArticle",
          headline: guide.headline,
          description: guide.description,
          url: absoluteUrl(guide.href),
          dateModified: guide.updatedAt,
          author: organization,
          publisher: organization,
          isPartOf: { "@type": "WebSite", name: site.name, url: site.url },
        },
        breadcrumbList(guideTrail(guide.href)),
      ]}
    />
  );
}
