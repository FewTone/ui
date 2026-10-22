import type { Item } from "@fewtone/ui/registry/schema";
import { addCommands } from "./install";
import { absoluteUrl } from "./site";

const fence = "```";

/** What to know before using an item: its status, when to use it, what it's built on and what it installs */
export function itemFacts(item: Item) {
  const builtOn = item.install.registry.filter((name) => name !== "tokens" && name !== "motion");
  return [
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
  ]
    .filter((fact) => fact !== null)
    .join("\n");
}

/** The page as Markdown, for "Copy page" and AI assistants */
export function itemMarkdown(item: Item) {
  const parts = [
    `# ${item.title}`,
    item.description,
    `Source: ${absoluteUrl(item.href)}`,
    "## Installation",
    `${fence}bash\n${addCommands(item.name).npm}\n${fence}`,
  ];
  if (item.usage) parts.push("## Usage", `${fence}tsx\n${item.usage.code}\n${fence}`);
  if (item.api.length > 0) {
    parts.push("## API reference");
    for (const part of item.api) {
      if (item.api.length > 1) parts.push(`### ${part.name}`);
      parts.push(
        [
          "| Prop | Type | Default | Description |",
          "| --- | --- | --- | --- |",
          ...part.props.map(
            (prop) =>
              `| \`${prop.name}\` | \`${prop.type.replace(/\|/g, "\\|")}\` | ${prop.default ? `\`${prop.default}\`` : "–"} | ${prop.description} |`,
          ),
        ].join("\n"),
      );
    }
  }
  return `${parts.join("\n\n")}\n`;
}
