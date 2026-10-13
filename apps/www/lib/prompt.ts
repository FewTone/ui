import { tokensCss } from "@fewtone/ui/registry/index.generated";
import type { Item } from "@fewtone/ui/registry/schema";
import { readSource, toProjectImports } from "./code";
import { items } from "./content";
import { registryTarget } from "./install";
import { absoluteUrl } from "./site";

/*
 * "Copy prompt": a self-contained brief a user pastes into their AI coding assistant (Claude Code,
 * Cursor, Copilot, ChatGPT…) to add one component. Generated from the same derived install data as the
 * registry JSON (ADR 0009), so it never drifts from the real component.
 *
 * Priorities, in order: change nothing the user didn't ask for, then install correctly, then verify.
 */

const fence = "```";
const baseName = (path: string) => path.split("/").pop() ?? path;
/** "motion@^14.0.0" → ["motion", "^14.0.0"] */
const splitDependency = (dependency: string) => {
  const at = dependency.lastIndexOf("@");
  return at > 0 ? [dependency.slice(0, at), dependency.slice(at + 1)] : [dependency, ""];
};

export async function itemPrompt(item: Item): Promise<string> {
  const files = await Promise.all(
    item.files.map(async (file) => ({
      target: `components/ui/${baseName(file)}`,
      code: toProjectImports(await readSource(`${item.dir}/${file}`)).trimEnd(),
    })),
  );
  const { dependencies, registry } = item.install;
  const needsMotion = registry.includes("motion");
  const motionSource = needsMotion ? (await readSource("lib/motion.ts")).trimEnd() : null;
  const builtOn = registry
    .filter((name) => name !== "tokens" && name !== "motion")
    .map((name) => items.find((other) => other.name === name))
    .filter((other) => other !== undefined);
  const packages = dependencies.map(splitDependency);
  const packageNames = packages.map(([name]) => name).join(" ");
  const pageUrl = absoluteUrl(item.href);
  const cliTarget = registryTarget(item.name);
  const fileList = [...files.map((file) => file.target), ...(needsMotion ? ["lib/motion.ts"] : [])];

  const api = item.api
    .map((part) => {
      const props = part.props
        .map(
          (prop) =>
            `  - \`${prop.name}${prop.required ? "" : "?"}\`: \`${prop.type}\`${prop.default ? ` (default ${prop.default})` : ""}. ${prop.description}`,
        )
        .join("\n");
      return `- **${part.name}**${part.description ? `: ${part.description}` : ""}\n${props}`;
    })
    .join("\n");

  const sections = [
    `# Add the FewTone UI ${item.title} component to this project

You are adding one UI component to an existing React project. Make the smallest change that works and leave everything else exactly as it is. If anything below doesn't match this project, stop and ask me instead of guessing.

**${item.title}**: ${item.description}
Docs: ${pageUrl}${item.ai.whenToUse ? `\nWhen to use it: ${item.ai.whenToUse}` : ""}

It will add ${fileList.map((file) => `\`${file}\``).join(", ")}${packages.length > 0 ? `, the npm package${packages.length > 1 ? "s" : ""} ${packages.map(([name]) => `\`${name}\``).join(", ")}` : ""}, and a few CSS variables (only ones the project doesn't define yet).`,

    `## 1. Inspect first (read only, change nothing)

1. **Package manager:** \`pnpm-lock.yaml\` → pnpm, \`yarn.lock\` → yarn, \`bun.lock\`/\`bun.lockb\` → bun, otherwise npm. Use it for every command below.
2. **Requirements:** React 19 and Tailwind CSS v4 (the global CSS file has \`@import "tailwindcss"\`). If Tailwind is v3 or missing, stop and tell me: this component uses Tailwind v4 syntax.
3. **Paths:** read \`components.json\` if it exists and note the \`ui\`, \`lib\` and \`utils\` aliases. Without it, use \`components/ui\`, \`lib\` and \`lib/utils\` under the project's \`@/\` path alias (see \`tsconfig.json\`), inside \`src/\` if the project uses one.
4. **Conflicts:** if ${files.map((file) => `\`${file.target}\``).join(" or ")} already exists, do not overwrite it. Stop and ask me whether to replace it or use another name.${
      needsMotion
        ? `
5. **Motion presets:** if \`lib/motion.ts\` already exists and is not FewTone UI's (FewTone UI's exports \`spring\` with \`snappy\`, \`smooth\` and \`bouncy\`), skip step 2 and use step 3, which puts the presets in \`lib/fewtone-motion.ts\` instead.`
        : ""
    }
${needsMotion ? 6 : 5}. **\`cn\` helper:** check that the \`utils\` file exports \`cn\`.`,

    `## 2. Install with the shadcn CLI (preferred)

Only if \`components.json\` exists. Never run \`shadcn init\` here: it rewrites the theme in the global CSS file.

${fence}bash
npx shadcn@latest add ${cliTarget}
${fence}

(Use \`pnpm dlx\`, \`yarn dlx\` or \`bunx --bun\` instead of \`npx\` to match the package manager. If the CLI asks to overwrite a file, answer no and ask me.)

The CLI writes the component, installs the npm packages, ${needsMotion ? "adds `lib/motion.ts`, " : ""}and adds the CSS variables without changing existing ones. If it succeeds, go to step 4. If there's no \`components.json\` or the CLI can't run, do step 3 instead.`,

    `## 3. Install by hand (only if step 2 wasn't possible)

${[
  packages.length > 0
    ? `**Install the packages** with the project's package manager (for example \`pnpm add ${packageNames}\`). FewTone UI is built against ${packages.map(([name, range]) => `\`${name} ${range}\``).join(", ")}. If the project already has one of them, keep its version unless it is an older major.`
    : null,
  `**If there's no \`cn\` helper**, install \`clsx\` and \`tailwind-merge\` and create the utils file:

${fence}ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
${fence}`,
  `**Add the CSS variables** to the global CSS file (the one with \`@import "tailwindcss"\`). Add only the variables and keyframes that are missing. Never change a value the project already defines, and don't touch any other rule. If the file already has \`:root\`, \`.dark\` or \`@theme inline\` blocks, add the lines to those blocks instead of creating new ones.

${fence}css
${tokensCss.trimEnd()}
${fence}`,
  motionSource
    ? `**Create \`lib/motion.ts\`** (in the \`lib\` alias folder) with exactly this content. If FewTone UI's version is already there, skip this. If a different \`lib/motion.ts\` exists, name this one \`lib/fewtone-motion.ts\` and change the component's \`@/lib/motion\` import to match.

${fence}ts
${motionSource}
${fence}`
    : null,
  builtOn.length > 0
    ? `**Add these FewTone UI components first**, the same way: ${builtOn.map((other) => `${other.title} (${absoluteUrl(other.href)})`).join(", ")}.`
    : null,
  ...files.map(
    (
      file,
    ) => `**Create \`${file.target}\`** (in the \`ui\` alias folder) with exactly this content. Only change the \`@/lib/...\` and \`@/components/...\` import paths if the project's aliases differ. Keep the first line if it is \`"use client"\`.

${fence}tsx
${file.code}
${fence}`,
  ),
]
  .filter((step) => step !== null)
  .map((step, index) => `${index + 1}. ${step}`)
  .join("\n\n")}`,

    `## 4. Check

- Run the project's typecheck (for example \`npx tsc --noEmit\`) and its lint command if it has one. Fix only problems in the files you added.
- Don't reformat, rename or refactor anything else. Don't change colours, fonts, other components or config files.`,

    `## 5. Use it
${item.usage ? `\n${fence}tsx\n${item.usage.code}\n${fence}\n` : ""}
API:
${api}

Keep it accessible: give it a visible label or an \`aria-label\`, and don't remove the focus styles.${item.ariaPattern ? ` Keyboard behaviour follows the WAI-ARIA pattern: ${item.ariaPattern}.` : ""}`,

    `## When you're done

Reply with a short list of every file you created or changed, and anything you skipped or couldn't do.`,
  ];

  return `${sections.join("\n\n")}\n`;
}
