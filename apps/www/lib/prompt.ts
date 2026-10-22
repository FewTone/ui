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

/**
 * "Copy prompt" on the MCP guide (/docs/mcp): a brief that has a coding assistant connect itself to the FewTone
 * UI MCP server. The assistant knows which tool it is, so the brief gives the setup for each one and asks it to
 * pick its own. It edits only the MCP config, merging into what's there, and checks the connection at the end.
 */
export function mcpPrompt() {
  const url = absoluteUrl("/mcp");
  const entry = (body: string) => `${fence}json\n${body}\n${fence}`;
  return `# Connect yourself to the FewTone UI MCP server

FewTone UI is a library of accessible React components for Next.js and Tailwind CSS v4, installed as source code with the shadcn CLI. Its MCP server lets you search the components, read their docs, props and examples, and get the command that installs them. Add it to your own MCP configuration so you can use it in this project.

- **Server:** \`fewtone-ui\`
- **URL:** ${url}
- **Transport:** Streamable HTTP (remote). No API key, no login, no headers. It's read-only: it never sees or changes code.
- **Docs:** ${absoluteUrl("/docs/mcp")}

## Rules

- Change only the MCP configuration. Don't touch any other file, setting or server.
- If the config file already exists, merge the \`fewtone-ui\` entry into it. Keep every other entry exactly as it is, and keep the file valid JSON.
- If a \`fewtone-ui\` entry already exists with this URL, leave it. If it points somewhere else, ask me before changing it.
- If something below doesn't match your setup, stop and ask me instead of guessing.

## 1. Work out which assistant you are, then add the server

Use the setup for yourself. Prefer the project's config, so it's shared with the repo, unless I asked for it everywhere.

**Claude Code:** run this in the project's root:

${fence}bash
claude mcp add --transport http fewtone-ui ${url}
${fence}

(Add \`--scope project\` to write it to \`.mcp.json\` for everyone on the repo, or \`--scope user\` for all my projects.)

**Cursor:** in \`.cursor/mcp.json\` (this project) or \`~/.cursor/mcp.json\` (all projects):

${entry(`{
  "mcpServers": {
    "fewtone-ui": { "url": "${url}" }
  }
}`)}

**VS Code (GitHub Copilot):** in \`.vscode/mcp.json\`. Note the key is \`servers\`, not \`mcpServers\`, and \`type\` is required:

${entry(`{
  "servers": {
    "fewtone-ui": { "type": "http", "url": "${url}" }
  }
}`)}

**Windsurf:** in \`~/.codeium/windsurf/mcp_config.json\`. Note the key is \`serverUrl\`:

${entry(`{
  "mcpServers": {
    "fewtone-ui": { "serverUrl": "${url}" }
  }
}`)}

**Claude desktop app or claude.ai:** you can't add it yourself. Tell me to open Settings → Connectors → Add custom connector, and paste ${url}.

**Any other assistant:** if it supports remote MCP servers over Streamable HTTP, add \`${url}\` the way its docs describe. If it only runs local (stdio) servers, connect through mcp-remote (it needs Node.js):

${entry(`{
  "mcpServers": {
    "fewtone-ui": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "${url}"]
    }
  }
}`)}

## 2. Check that it works

1. Some assistants only load new servers after a restart or a reload. If the FewTone UI tools don't show up, tell me exactly what to restart and stop there.
2. Once it's connected, you should have five tools: \`search_components\`, \`list_components\`, \`get_component\`, \`get_component_example\` and \`get_install_command\`.
3. Call \`search_components\` with the query "button" and confirm that Button comes back.

## 3. How to use it from now on

When I ask for UI that FewTone UI might have:

1. Find the component with \`search_components\` (describe what I need) or \`list_components\`.
2. Read it with \`get_component\` before using it, and \`get_component_example\` for its examples.
3. Install it with the command from \`get_install_command\`, using this project's package manager. It needs \`components.json\`. Never run \`shadcn init\` in a project that already has it: it rewrites the theme.
4. Import it from \`@/components/ui/<name>\` and follow its usage.

## When you're done

Reply with the config file you changed (or the command you ran), whether the test search worked, and anything I still need to do, such as restarting.
`;
}

/**
 * "Copy prompt" on the Smooth UI guide (/docs/smooth-ui): a brief that has a coding assistant install the Smooth
 * UI skill in the project it's working in, check the install, and then use it. Like the MCP brief, the assistant
 * picks its own setup. It adds only the skill's folder, never overwrites one without asking, and doesn't start
 * changing the UI until asked: installing a skill is setup, not permission to restyle the app.
 */
export function skillPrompt() {
  const zip = absoluteUrl("/skills/smooth-ui.zip");
  const page = absoluteUrl("/docs/smooth-ui");
  return `# Install the Smooth UI skill in this project

Smooth UI is an Agent Skill: Markdown instructions that teach you how to make a web interface feel smooth, calm and premium. It holds motion rules, exact timings, which animation pattern fits which change, recipes for about 40 common controls, working React code, known pitfalls and a step-by-step audit. It's free and MIT licensed, and it isn't tied to any component library.

- **Skill:** \`smooth-ui\` (a folder with \`SKILL.md\` and \`references/\`)
- **Download:** ${zip}
- **Docs:** ${page}

Install it for this project, check it, then read it. Don't change any UI yet.

## Rules

- Add only the \`smooth-ui\` skill folder. Don't change any other file, setting or dependency.
- If a \`smooth-ui\` skill folder already exists, stop and ask me before replacing it.
- If the project is a git repository, don't commit anything.
- If something below doesn't match your setup, stop and ask me instead of guessing.

## 1. Install it

**Preferred, the skills CLI** (it puts the skill where your assistant reads skills from). Run it in the project's root:

${fence}bash
npx skills add FewTone/ui --skill smooth-ui
${fence}

If it asks which assistant or where to install, choose this project (not global) and the assistant you are. If the command fails (no network to GitHub, or it can't find the skill), use the download instead.

**Fallback, the download.** Work out which skills folder you read from:

- Claude Code: \`.claude/skills/\`
- Assistants that follow the shared convention (Codex, Cursor, others): \`.agents/skills/\`
- Anything else: the folder your own docs name for skills. If you don't support skills at all, say so and skip to step 4.

Then download the zip and unzip it into that folder, so the result is \`<skills folder>/smooth-ui/SKILL.md\`. The zip already contains the \`smooth-ui/\` folder, so unzip into the skills folder itself, not into a new \`smooth-ui\` folder.

macOS, Linux or Git Bash:

${fence}bash
mkdir -p .claude/skills
curl -fsSL ${zip} -o smooth-ui.zip
unzip -q smooth-ui.zip -d .claude/skills
rm smooth-ui.zip
${fence}

Windows PowerShell:

${fence}powershell
New-Item -ItemType Directory -Force .claude/skills | Out-Null
Invoke-WebRequest ${zip} -OutFile smooth-ui.zip
Expand-Archive smooth-ui.zip -DestinationPath .claude/skills
Remove-Item smooth-ui.zip
${fence}

(Replace \`.claude/skills\` with your own skills folder.)

## 2. Check the install

1. \`<skills folder>/smooth-ui/SKILL.md\` exists, and its frontmatter says \`name: smooth-ui\`.
2. \`<skills folder>/smooth-ui/references/\` holds \`tokens.md\`, \`patterns.md\`, \`components.md\`, \`code.md\`, \`pitfalls.md\` and \`audit.md\`.
3. There's no extra nesting such as \`smooth-ui/smooth-ui/SKILL.md\`. If there is, move the inner folder up one level.

Some assistants only pick up a new skill after a restart or a reload. If yours does, tell me exactly what to restart.

## 3. Read it now

Read \`SKILL.md\` in full (it's short). Don't read the reference files yet: open each one when a task needs it, as \`SKILL.md\` says. From now on, follow it whenever you build or change UI in this project.

## 4. If you don't support skills

Tell me, and suggest adding one line to this project's agent instructions (\`AGENTS.md\`, \`CLAUDE.md\` or your rules file) that points to the skill's \`SKILL.md\`. Only add it if I say yes.

## When you're done

Reply with:

- where the skill is now (the folder path) and how you installed it
- whether the check passed, and anything I need to restart
- three short lines on what the skill will change about how you build UI
- one question: would I like you to run its audit (\`references/audit.md\`) on this project now?
`;
}
