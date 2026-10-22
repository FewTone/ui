# Smooth UI: an Agent Skill

An Agent Skill that teaches your AI coding assistant how to make any web interface feel smooth, calm and premium: the motion rules, exact timings, patterns, component recipes, working code and the pitfalls, learned building the FewTone UI component library.

It isn't about FewTone UI. It works in any project and any stack, though its code examples use React, Tailwind CSS and `motion`.

## Install

**With the skills CLI** (Claude Code, Cursor, Codex, Copilot and others):

```bash
npx skills add FewTone/ui --skill smooth-ui
```

**By hand:** copy this `smooth-ui` folder into your assistant's skills folder:

- Claude Code: `.claude/skills/smooth-ui/` in the project, or `~/.claude/skills/smooth-ui/` for every project
- Other assistants: wherever they read `SKILL.md` skills from (often `.agents/skills/`)

**Claude apps (claude.ai, desktop):** zip this folder and upload it under Settings → Capabilities → Skills.

## Use it

It loads on its own when you work on UI. Or ask directly:

- "Make this app's UI smoother."
- "Build a settings page with tabs, and make the tabs feel premium."
- "Audit the motion in this project and fix what feels off."
- "Why does my dropdown highlight jump?"

## What's inside

| File | What it holds |
|---|---|
| `SKILL.md` | The rules, the pattern map, what never to do, and the definition of done |
| `references/tokens.md` | Durations, easings, springs and keyframes, ready to paste (CSS and JS) |
| `references/patterns.md` | Every motion pattern, with the reasoning and values |
| `references/components.md` | Recipes for ~40 common controls |
| `references/code.md` | Working React code for the core patterns |
| `references/pitfalls.md` | Bugs that look like "it feels off", and their fixes |
| `references/audit.md` | A step-by-step pass for upgrading an existing UI |

MIT licensed, like the rest of FewTone UI.
