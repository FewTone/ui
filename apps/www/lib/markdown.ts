import type { Item } from "@fewtone/ui/registry/schema";
import { addCommands } from "./install";
import { absoluteUrl } from "./site";

const fence = "```";

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
