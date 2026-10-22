import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Item } from "@fewtone/ui/registry/schema";
import { cacheLife } from "next/cache";
import { readSource, toProjectImports } from "./code";
import { getKinds, type Kind } from "./content";
import { guides } from "./guides";
import { addCommands } from "./install";
import { itemFacts, itemMarkdown } from "./markdown";
import { getRoadmap } from "./roadmap";
import { absoluteUrl, site } from "./site";

/*
 * The site for AI tools, as Markdown: a `.md` version of every page (the page's URL plus `.md`, rewritten to
 * app/md in next.config.ts), `/llms.txt` (the llmstxt.org index) and `/llms-full.txt` (every page in one file).
 * Built from the same index and guide sources as the HTML, so they never drift. Everything here runs at build
 * time: the routes are prerendered.
 */

const fence = "```";

/** A page's Markdown address */
export const markdownUrl = (href: string) => absoluteUrl(`${href}.md`);

/** One item's page: the docs, what to know before using it, every example's code and the related items */
async function itemDocument(item: Item) {
  const examples = await Promise.all(
    item.demos.map(async (demo) => {
      const code = toProjectImports(await readSource(`${item.dir}/demos/${demo.name}.tsx`)).trimEnd();
      return [`### ${demo.title}`, demo.description ?? "", `${fence}tsx\n${code}\n${fence}`]
        .filter(Boolean)
        .join("\n\n");
    }),
  );
  const related = item.related
    .map((name) =>
      getKinds()
        .flatMap((kind) => kind.items)
        .find((other) => other.name === name),
    )
    .filter((other) => other !== undefined)
    .map((other) => `- [${other.title}](${markdownUrl(other.href)}): ${other.description}`);
  return [
    itemMarkdown(item).trimEnd(),
    itemFacts(item),
    `## Examples\n\n${examples.join("\n\n")}`,
    related.length > 0 ? `## Related\n\n${related.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Items grouped by category, categories A–Z (the site's index has no order of its own), items in index order */
function byCategory(items: Item[]) {
  const categories = new Map<string, Item[]>();
  for (const item of items) categories.set(item.category, [...(categories.get(item.category) ?? []), item]);
  return [...categories].sort(([a], [b]) => a.localeCompare(b));
}

/** A kind's index page (/components): every item by category */
function kindDocument(kind: Kind) {
  const sections = byCategory(kind.items).map(
    ([category, members]) =>
      `## ${category}\n\n${members.map((item) => `- [${item.title}](${markdownUrl(item.href)}): ${item.description}`).join("\n")}`,
  );
  return [`# ${kind.heading}`, kind.intro, ...sections].join("\n\n");
}

/** The roadmap page, from the same plan as /roadmap */
function roadmapDocument() {
  const { groups, counts } = getRoadmap();
  const labels = { available: "Available", next: "Next up", planned: "Planned" } as const;
  return [
    "# Roadmap",
    "The components FewTone UI has today, what's being built next, and what's planned.",
    `${counts.available} available · ${counts.next} next up · ${counts.planned} planned`,
    ...groups.map(
      ({ group, entries }) =>
        `## ${group}\n\n${entries
          .map(
            (entry) =>
              `- ${entry.href ? `[${entry.title}](${markdownUrl(entry.href)})` : entry.title} (${labels[entry.status]}): ${entry.note}`,
          )
          .join("\n")}`,
    ),
  ].join("\n\n");
}

/** A guide's MDX source, read once at build time */
async function readGuide(href: string) {
  "use cache";
  cacheLife("max");
  const parts = href.split("/").filter(Boolean).slice(1);
  return readFile(path.join(process.cwd(), "app", "(browse)", "docs", ...parts, "page.mdx"), "utf8");
}

/** The FAQ block's entries, from its source (plain quoted strings, as the guides write them) */
function faqMarkdown(list: string) {
  const pairs = [
    ...list.matchAll(/question:\s*("(?:[^"\\]|\\.)*")\s*,\s*answer:\s*("(?:[^"\\]|\\.)*")/g),
  ].map(([, question = '""', answer = '""']) => `**${JSON.parse(question)}**\n\n${JSON.parse(answer)}`);
  if (pairs.length !== (list.match(/question:/g) ?? []).length)
    throw new Error('llms: a FAQ entry in a guide isn\'t in the plain `question: "…", answer: "…"` form');
  return pairs.join("\n\n");
}

/** What installing each component adds, as the guide's table shows it */
function installTable() {
  const items = getKinds().find((kind) => kind.name === "component")?.items ?? [];
  const rows = items.map((item) => {
    const files = [
      ...item.files.map((file) => `components/ui/${file.split("/").pop()}`),
      ...(item.install.registry.includes("motion") ? ["lib/motion.ts"] : []),
    ];
    const packages = item.install.dependencies.map((dependency) => dependency.replace(/(.)@.*$/, "$1"));
    return `| [${item.title}](${markdownUrl(item.href)}) | ${files.join(", ")} | ${packages.join(", ") || "none"} |`;
  });
  return ["| Component | Files | npm packages |", "| --- | --- | --- |", ...rows].join("\n");
}

/**
 * A guide as plain Markdown: its metadata dropped, each of the site's blocks written out, and links made
 * absolute. A block this doesn't know fails the build, so nothing silently goes missing from the Markdown.
 */
function guideMarkdown(source: string) {
  let text = source
    .replace(/\r\n/g, "\n")
    .replace(/^export const metadata = \{[\s\S]*?\n\}\n/m, "")
    .replace(
      /<(McpTitle|SkillTitle)\b[^>]*>([\s\S]*?)<\/\1>/g,
      (_, _block, title: string) => `# ${title.trim()}`,
    )
    .replace(
      /<InstallCommand name="([a-z0-9-]+)" \/>/g,
      (_, name: string) => `${fence}bash\n${addCommands(name).npm}\n${fence}`,
    )
    .replace(/<InstallTable \/>/g, () => installTable())
    .replace(/<Faq\s+entries=\{(\[[\s\S]*?\])\}\s*\/>/g, (_, list: string) => faqMarkdown(list))
    .replace(/<GuideJsonLd[^>]*\/>\n?/g, "")
    .replace(/\]\(\//g, `](${site.url}/`);

  let inCode = false;
  for (const line of text.split("\n")) {
    if (line.startsWith(fence)) inCode = !inCode;
    else if (!inCode && /<[A-Z][A-Za-z]*[\s/>]/.test(line))
      throw new Error(`llms: a guide uses a block the Markdown version can't write out: ${line.trim()}`);
  }
  text = text.replace(/\n{3,}/g, "\n\n").trim();
  return text;
}

/** Every page with a Markdown version, as path segments: ["docs"], ["components", "button"], ["roadmap"] */
export function markdownPaths() {
  return [
    ...guides.map((guide) => guide.href.split("/").filter(Boolean)),
    ...getKinds().flatMap((kind) => [[kind.segment], ...kind.items.map((item) => [kind.segment, item.name])]),
  ];
}

/** The Markdown for a page, or null when there's no such page */
export async function markdownFor(segments: string[]): Promise<string | null> {
  const href = `/${segments.join("/")}`;
  let body: string | null = null;
  if (href === "/roadmap") body = roadmapDocument();
  else if (guides.some((guide) => guide.href === href)) body = guideMarkdown(await readGuide(href));
  else {
    const kind = getKinds().find((entry) => entry.segment === segments[0]);
    if (kind && segments.length === 1) body = kindDocument(kind);
    const item =
      kind && segments.length === 2 ? kind.items.find((entry) => entry.name === segments[1]) : undefined;
    if (item) body = await itemDocument(item);
  }
  return body === null ? null : `${body}\n`;
}

const intro = `${site.name}: free, open-source (MIT), accessible React components for Next.js and Tailwind CSS v4, built on Radix with smooth motion. Each component installs as source code into your project with the shadcn CLI (\`npx shadcn@latest add <url>\`), like shadcn/ui, and takes your project's shadcn theme.`;

/** /llms.txt: what the site is and where everything is, in the llmstxt.org format */
export function llmsTxt() {
  const docs = guides.map((guide) => `- [${guide.title}](${markdownUrl(guide.href)}): ${guide.description}`);
  const kinds = getKinds()
    .filter((kind) => kind.items.length > 0)
    .flatMap((kind) =>
      byCategory(kind.items).map(
        ([category, members]) =>
          `## ${kind.plural}: ${category}\n\n${members.map((item) => `- [${item.title}](${markdownUrl(item.href)}): ${item.description}`).join("\n")}`,
      ),
    );
  return `${[
    `# ${site.name}`,
    `> ${intro}`,
    [
      "Every page has a Markdown version at its address plus `.md`. Requirements: React 19, Tailwind CSS v4 and a project set up with `npx shadcn@latest init`.",
      `AI assistants can also use the ${site.name} MCP server at ${absoluteUrl("/mcp")} (Streamable HTTP, no key) to search components, read their docs and get install commands.`,
    ].join(" "),
    `## Docs\n\n${docs.join("\n")}`,
    ...kinds,
    `## Optional\n\n${[
      `- [Everything in one file](${absoluteUrl("/llms-full.txt")}): every guide and component page in one Markdown file`,
      `- [Registry index](${absoluteUrl("/r/registry.json")}): the shadcn registry, for \`npx shadcn add\``,
      `- [Source on GitHub](${site.github}): MIT licensed`,
    ].join("\n")}`,
  ].join("\n\n")}\n`;
}

/** /llms-full.txt: every guide and page in one file, with a rule between pages */
export async function llmsFullTxt() {
  const pages = await Promise.all(
    markdownPaths().map(async (segments) => {
      const body = await markdownFor(segments);
      return body ? `<!-- ${markdownUrl(`/${segments.join("/")}`)} -->\n\n${body.trim()}` : "";
    }),
  );
  return `${[`# ${site.name}`, `> ${intro}`, ...pages.filter(Boolean)].join("\n\n---\n\n")}\n`;
}
