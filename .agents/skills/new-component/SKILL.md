---
name: new-component
description: How to build a new FewTone UI component, or change an existing one, so it follows the project's design, motion and component standards. Use whenever the owner asks for a component, a variant, a demo or a change to one in packages/ui/src/components.
# Internal to this repo: hidden from `npx skills add FewTone/ui` (only smooth-ui is public)
metadata:
  internal: true
---

# Building or changing a FewTone UI component

The owner asks for components one at a time. Build exactly the one requested, nothing more. Always follow `.agents/rules/design.md`, `.agents/rules/motion.md` and `.agents/rules/components.md`.

## 1. Before writing code
- **Read what exists:**
  - the nearest existing component (`button`, `select` and `switch` are the references)
  - its `docs-internal/04-components/<name>/decisions.md`
  - the motion pattern table in `motion.md`
- **Check the reference for craft and spacing.** The owner's design reference is beui.dev/components. shadcn sets the API naming, Radix the behaviour.
- **Decide the interaction before coding**, using `motion.md`: what slides, what glides, what fades, and what stays still. Reuse an existing pattern before inventing one.
- **Ask the owner** only when the answer changes what gets built: which variants, or a behaviour that is genuinely open. Otherwise pick the conventional default and say so afterwards.

## 2. Build
1. Write the component, meta, tests and demos (layout in `components.md`), in the portable vocabulary.
2. Make the hero demo show the component's range: a compact centred grid with names underneath, and any demo setting as a `Select` in the top right.
3. Add examples only for what the hero can't show.
4. Run `pnpm index`.

## 3. Check: the work isn't done until all of this passes
1. **`pnpm check`:** lint, index freshness, types, token rules and tests.
2. **Visual review is the owner's** (owner, 2026-10-14). They check the real page at `http://localhost:3000/components/<name>` themselves and say what to change. Don't take screenshots or script the browser unless asked, or unless something can't be judged by eye (for example timing); say so first.
3. **If the owner reports that the page disagrees with the code, restart `pnpm dev` first.** On this machine the dev server has served stale CSS and stale server HTML.

## 4. Record
- `docs-internal/04-components/<name>/decisions.md`: why it's built this way, the motion choices, and what isn't built yet.
- A significant choice gets an ADR in `docs-internal/03-decisions/`.
- Add a line to AGENTS.md's status, and a note to today's `docs-internal/08-log/` file.

## 5. Hand over
- **Don't commit, push or deploy.** The owner does all three.
- **Report:**
  - what was built
  - what you verified, and how
  - anything you couldn't check
  - the URL to look at

## Changing an existing component
- **Same standards.** If an older component breaks a rule in `.agents/rules/`, mention it. Fix it only when the change touches that code, or when the owner asks.
- **Keep the public API stable.** Rename or remove props only when asked, and say so in the report: users have copied the source.
- **Update the records:** bump `updatedAt` in the meta, and update `decisions.md` when the reasoning changes.
