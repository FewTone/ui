import { kinds } from "@fewtone/ui/registry/kinds";
import type { Item } from "@fewtone/ui/registry/schema";
import { readSource, toProjectImports } from "./code";
import { items } from "./content";
import { addCommands, type PackageManager, registryTarget } from "./install";
import { itemMarkdown } from "./markdown";
import { absoluteUrl, site } from "./site";

/*
 * What the MCP server (app/mcp/route.ts) answers, as Markdown for the assistant to read. Everything comes from
 * the same generated index as the pages and the registry (ADR 0008, 0009), so the server never drifts from the
 * site. Kept apart from the route so the answers can be read and tested without MCP.
 */

const fence = "```";

/** How the server introduces itself to an assistant when it connects */
export const instructions = `${site.name}: accessible, customizable React components for Next.js and Tailwind CSS v4, built on Radix with smooth motion. Each component installs as source code into the user's project with the shadcn CLI, like shadcn/ui.

How to help with it:
1. Find components with search_components (describe what the user needs) or list_components.
2. Read one with get_component before using it: when to use it, its install command, usage and props. Its examples are in get_component_example.
3. Install with the command from get_install_command, in a project that has components.json (shadcn init). Never run shadcn init in an existing project: it rewrites the theme.
4. Import from "@/components/ui/<name>" and follow the usage. Components take the project's shadcn colours and work in light and dark.

Setup and theming: ${absoluteUrl("/docs/installation")}`;

/** One line about an item, for lists and search results */
function summary(item: Item) {
  const beta = item.status === "beta" ? " (beta)" : "";
  return `- **${item.title}** \`${item.name}\`${beta}: ${item.description}`;
}

/** Every item, or one category's, grouped by kind and category */
export function listComponents(category?: string) {
  const wanted = category?.trim().toLowerCase();
  const shown = items.filter((item) => !wanted || item.category.toLowerCase() === wanted);
  if (shown.length === 0) {
    const categories = [...new Set(items.map((item) => item.category))].join(", ");
    return `No components in the category "${category}". Categories: ${categories}.`;
  }
  const groups = new Map<string, Item[]>();
  for (const item of shown) {
    const key = `${kinds[item.kind].plural}: ${item.category}`;
    groups.set(key, [...(groups.get(key) ?? []), item]);
  }
  const sections = [...groups].map(([group, members]) => `## ${group}\n${members.map(summary).join("\n")}`);
  return `# ${site.name}: ${shown.length} ${shown.length === 1 ? "item" : "items"}\n\n${sections.join("\n\n")}\n\nRead one with get_component, using its name in backticks.`;
}

/** Words that say nothing about which component fits */
const stopWords = new Set(
  "a an and are as at be but by component components do for from i in into is it me my need of on or our that the this to ui use want we with you your".split(
    " ",
  ),
);

/** Lowercase words, without stop words and a plural s, so "tabs" finds "tab" and the other way round */
function words(text: string) {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length > 1 && !stopWords.has(word))
    .map((word) => (word.length > 3 && word.endsWith("s") ? word.slice(0, -1) : word));
}

/**
 * How well an item fits a request: each query word found in a field scores that field's weight, and the whole
 * query as a phrase in the item's title, tags or keywords scores extra. Names and titles weigh most, then the
 * phrases people search for, then what the item is for.
 */
function score(item: Item, query: string) {
  const fields: [string, number][] = [
    [`${item.name} ${item.title}`, 6],
    [[...item.tags, ...item.keywords].join(" "), 3],
    [item.category, 2],
    [item.ai.whenToUse ?? "", 2],
    [item.description, 1],
  ];
  const asked = words(query);
  let total = 0;
  for (const [text, weight] of fields) {
    const found = new Set(words(text));
    for (const word of asked) if (found.has(word)) total += weight;
  }
  const phrase = query.trim().toLowerCase();
  const named = [item.title, item.name, ...item.tags, ...item.keywords].map((text) => text.toLowerCase());
  if (phrase && named.some((text) => text === phrase || text.includes(phrase))) total += 8;
  return total;
}

/** The items that best fit a request, best first */
export function rankComponents(query: string, limit = 5) {
  return items
    .map((item) => ({ item, score: score(item, query) }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((match) => match.item);
}

export function searchComponents(query: string, limit = 5) {
  const found = rankComponents(query, limit);
  if (found.length === 0)
    return `Nothing matched "${query}". Try other words, or list_components to see everything.`;
  const results = found.map(
    (item) =>
      `${summary(item)}${item.ai.whenToUse ? `\n  When to use it: ${item.ai.whenToUse}` : ""}\n  Docs: ${absoluteUrl(item.href)}`,
  );
  return `# Components for "${query}"\n\n${results.join("\n\n")}\n\nRead one with get_component before using it.`;
}

/** The item with this name, also found by its title ("Loading Button") or the @fewtone/ form */
export function findItem(name: string) {
  const wanted = name
    .trim()
    .toLowerCase()
    .replace(/^@fewtone\//, "")
    .replace(/\s+/g, "-");
  return items.find(
    (item) => item.name === wanted || item.title.toLowerCase().replace(/\s+/g, "-") === wanted,
  );
}

/** The answer when a name isn't an item: the closest ones instead */
export function unknownItem(name: string) {
  const near = rankComponents(name.replace(/[-_]/g, " "), 3);
  return `There's no component called "${name}".${near.length > 0 ? ` Did you mean ${near.map((item) => `\`${item.name}\``).join(", ")}?` : ""} Use search_components or list_components to find one.`;
}

/** Source files as they land in the user's project (`@/components/ui/...` imports) */
async function sourceFiles(item: Item) {
  return Promise.all(
    item.files.map(async (file) => {
      const code = toProjectImports(await readSource(`${item.dir}/${file}`)).trimEnd();
      return `### components/ui/${file.split("/").pop()}\n\n${fence}tsx\n${code}\n${fence}`;
    }),
  );
}

/** The component page as Markdown, with what an assistant needs before using it */
export async function getComponent(item: Item, includeSource: boolean) {
  const builtOn = item.install.registry.filter((name) => name !== "tokens" && name !== "motion");
  const facts = [
    item.status === "beta" ? "**Status:** beta, the API may change." : null,
    item.ai.whenToUse ? `**When to use it:** ${item.ai.whenToUse}` : null,
    item.primitives.length > 0 ? `**Built on:** ${item.primitives.join(", ")}.` : null,
    item.ariaPattern ? `**Accessibility pattern:** ${item.ariaPattern}` : null,
    item.install.dependencies.length > 0
      ? `**npm packages (installed by the CLI):** ${item.install.dependencies.join(", ")}.`
      : null,
    builtOn.length > 0
      ? `**Installs these FewTone UI components with it:** ${builtOn.map((name) => `\`${name}\``).join(", ")}.`
      : null,
  ].filter((fact) => fact !== null);
  const examples = item.demos
    .map((demo) => `- \`${demo.name}\`: ${demo.title}${demo.description ? `. ${demo.description}` : ""}`)
    .join("\n");
  const related =
    item.related.length > 0 ? `Related: ${item.related.map((name) => `\`${name}\``).join(", ")}.` : "";

  const parts = [
    itemMarkdown(item).trimEnd(),
    facts.join("\n"),
    `## Examples\nRead the code of one with get_component_example.\n\n${examples}`,
    related,
  ];
  if (includeSource) parts.push(`## Source\n\n${(await sourceFiles(item)).join("\n\n")}`);
  else parts.push("The source is installed by the CLI. Call get_component with include_source to read it.");
  return parts.filter(Boolean).join("\n\n");
}

/** One demo's code, the way it reads in the user's project */
export async function getExample(item: Item, demoName?: string) {
  const demo = demoName ? item.demos.find((entry) => entry.name === demoName) : item.demos[0];
  if (!demo)
    return `${item.title} has no example called "${demoName}". Examples: ${item.demos.map((entry) => `\`${entry.name}\``).join(", ")}.`;
  const code = toProjectImports(await readSource(`${item.dir}/demos/${demo.name}.tsx`)).trimEnd();
  const others = item.demos.filter((entry) => entry !== demo).map((entry) => `\`${entry.name}\``);
  return [
    `# ${item.title}: ${demo.title}`,
    demo.description ?? "",
    `${fence}tsx\n${code}\n${fence}`,
    others.length > 0 ? `Other examples: ${others.join(", ")}.` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** One shadcn command that adds every item asked for */
export function installCommand(found: Item[], packageManager: PackageManager) {
  const first = found[0];
  if (!first) return "";
  const prefix = addCommands(first.name)[packageManager].replace(registryTarget(first.name), "").trimEnd();
  return `${prefix} ${found.map((item) => registryTarget(item.name)).join(" ")}`;
}

export function getInstall(found: Item[], packageManager: PackageManager) {
  return `# Install ${found.map((item) => item.title).join(", ")}

${fence}bash
${installCommand(found, packageManager)}
${fence}

- Run it in the project's root. It needs \`components.json\`: in a project without one, run \`npx shadcn@latest init\` first. Never run \`init\` again in a project that has it, as it rewrites the theme.
- Requirements: React 19 and Tailwind CSS v4.
- The CLI writes each component to \`components/ui/\`, installs its npm packages and the components it builds on, and adds the CSS variables it needs without changing the project's existing ones.
- Then import it from \`@/components/ui/<name>\`.
- Setup and troubleshooting: ${absoluteUrl("/docs/installation")}`;
}
