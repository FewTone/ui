# 0013 · Smooth UI, a public skill for any project

- **Status:** Accepted (2026-10-22, owner: "a skill which is not on how to use FewTone UI… for anyone to copy and add into their project to make their project UI smoother… all the rules and how to make things which we have improved in this library")
- **Builds on:** the motion standard (`.agents/rules/motion.md`), the design standard (`.agents/rules/design.md`), ADR 0011 (the blur), every component's `decisions.md`

## Context
Building the library produced a large body of hard-won detail: exact timings, which patterns to use where, what makes motion feel premium, and the bugs that make it feel off. It lived in internal docs written for this repo. The owner wanted it packaged so anyone can drop it into their own project, whatever their stack, and get the same quality from their AI assistant.

## Decision
- **A public Agent Skill, `smooth-ui`, at `skills/smooth-ui/`** (the folder the plan reserved for public skills). Agent Skills format: `SKILL.md` with `name` and `description` frontmatter, plus `references/` loaded on demand, so the always-loaded part stays short (111 lines).
- **Library-agnostic.** No FewTone names, tokens or install steps. Values are given as plain numbers (80/150/220/350/500ms, the three cubic-beziers, the three springs, 6px blur), with CSS and JS ready to paste. Code examples use React, Tailwind and `motion` (where the patterns were built), and each pattern says what it does so it carries to other stacks. It tells the agent to use the project's own tokens and libraries first.
- **Contents:** the rules (motion, look, behaviour), a pattern map, a never-list and a definition of done in `SKILL.md`; references for tokens, the pattern catalogue, ~40 component recipes, working code, pitfalls (each from a real bug here) and an audit procedure for upgrading an existing UI.
- **Code is checked:** the snippets in `references/code.md` type-check against `motion` 14 and React 19 types (checked 2026-10-22).
- **The look is generalised, not imposed:** "neutral first, no glow, few borders, flat controls" are given as defaults, without our Navy or brand specifics. The skill tells the agent not to restyle a product's brand during an audit.
- **Separate from the planned "how to use FewTone UI" skill** (plan §6), which is still to be built.

## Consequences
- Installable with `npx skills add FewTone/ui --skill smooth-ui` once the repo is pushed, or by copying the folder. A README covers both and the Claude apps.
- When the internal motion rules change, this skill should change with them. It's a hand-written distillation, not generated, because it rewrites the rules for a reader outside this repo.
- **The page and the download (owner, 2026-10-22):** `/docs/smooth-ui` (a guide, in the docs sidebar, search and sitemap) explains it, with **Download skill** (outlined) and **Copy prompt** (filled, the main action; owner 2026-10-22) beside its title, and install steps for the skills CLI, Claude Code, the Claude apps and other assistants. The zip is generated with the index (`scripts/skills/build-skill-zips.mjs`, run by `build-index.mjs`) into `apps/www/public/skills/<name>.zip`, gitignored like the registry: Node's own zlib, no dependency, byte-for-byte the same each build (sorted paths, a fixed date, LF endings), holding the `smooth-ui/` folder as the Claude apps' upload and `.claude/skills/` expect. Any new folder in `skills/` gets a zip too.
- **Copy prompt** copies `skillPrompt()` (`apps/www/lib/prompt.ts`): the assistant installs the skill with the skills CLI, or downloads and unzips the zip into its own skills folder (Claude Code `.claude/skills`, the shared `.agents/skills`), with bash and PowerShell commands; it never replaces an existing `smooth-ui` folder without asking, commits nothing, checks the files and nesting, reads only `SKILL.md`, changes no UI yet, and ends by offering the skill's audit.
- Not built yet: listing it in skill directories.
