# 0009 · Component distribution: registry, tokens and a portable class vocabulary

- **Status:** Accepted (2026-10-13, by the owner, as part of the Phase 3a plan)
- **Builds on:** ADR 0005 (hosting), 0007 (website), 0008 (content model)

## Context
FewTone UI ships its components as source, through a shadcn-compatible registry, and users install them into their own projects. Three facts shaped how:

1. **Our classes don't exist in a user's project.** A component written in our site vocabulary loses `text-label`, `focus-ring`, `h-(--size-control-md)` and similar classes there, because those come from our design system.
2. **The user's `cn` would drop our type tokens.** Since 2026-09, new shadcn projects import `cn` from the npm `cn` package (`lib/utils.ts` is `export { cn } from "cn"`). Like stock tailwind-merge, it reads `text-label` as a colour and drops it when a text colour is also set. Shipping our own `lib/utils.ts` would collide with the user's file. The overwrite prompt defaults to No.
3. **What the shadcn CLI 4.21 allows:**
   - We can write the registry JSON ourselves.
   - `cssVars` from a dependency only add missing variables.
   - The `css` field supports `@keyframes` and `@media` blocks.
   - Imports are rewritten to the user's aliases: `@/lib/utils`, `@/lib/x` and `@/components/ui/x`.
   - A full URL installs with no setup. The short `@fewtone/x` form needs a listing in shadcn's directory or the user's `components.json`.

## Decision
- **A portable class vocabulary for library components** (`packages/ui/src/components/**`, demos included):
  - **Colours:** shadcn's semantic names only (background, foreground, primary, secondary, muted, accent, border, input, ring, popover, destructive).
  - **Text sizes:** Tailwind's stock `text-xs`/`text-sm`/`text-base`. Our site defines these with Tailwind's own values, so previews match what users get.
  - **Inner padding:** the 4px scale.
  - **Our other tokens:** through `(--token)`.
  - **Result:** components use the user's own `cn` and palette.
  - **Enforced by `pnpm check:tokens`:** no site type tokens, site-only colours, `focus-ring` or unshipped variables in components. In turn, the site (`apps/`) may not use the stock sizes.
- **A `tokens` registry item** (`registry:lib`, no files), installed as a dependency of every component. It ships:
  - control and icon sizes
  - durations and `--ease-spring`
  - `--z-popover`
  - the focus-ring width and offset
  - disabled opacity and press scale
  - `--destructive-foreground` (light and dark)
  - the `popover-in`/`popover-out` keyframes with literal easing
  - a reduced-motion block

  The allow-list lives in `packages/ui/src/registry/shared.ts`. The generator reads every value from `tokens.css`, `theme.css` and `palette.css`; nothing is copied by hand.
- **A `motion` registry item** (`lib/motion.ts`) for components that animate in JavaScript (Select, Switch).
- **Press feedback is CSS for Button:** `active:scale-(--scale-press)` with the `--ease-spring` curve. *Superseded 2026-10-14 (owner): no scale; press is a colour step, and `--scale-press` was removed.*
  - Server-safe, so `buttonVariants` works in server components.
  - No motion dependency for the most-installed items.
  - `asChild` behaves the same.

  JavaScript motion goes where it matters most: Select's gliding highlight and Switch's thumb. Each component checks `useReducedMotion()` itself, because it can't rely on our site's `MotionConfig`.
- **Everything is derived:**
  - `scripts/registry/build-registry.mjs`, run by `build-index.mjs`, writes `apps/www/public/r/<item>.json` and `registry.json`. The folder is gitignored and rebuilt before every dev and build.
  - npm dependencies come from each file's imports, with version ranges from `packages/ui/package.json`.
  - Registry dependencies come from imports too (motion, other components), plus tokens.
  - Relative imports are rejected.
  - The site's Manual tab reads the same derived data.
- **Install commands use the full URL** (`npx shadcn@latest add https://ui.fewtone.com/r/<name>.json`) until `@fewtone` is listed in shadcn's directory. `useNamespace` in `apps/www/lib/install.ts` flips them to the short form.

## Verified (2026-10-13 spike)
Fresh `create-next-app` + `shadcn init` (radix-nova, `cn` package), then installed from a local registry:
- All five components installed. `lib/utils.ts` was untouched.
- `lib/motion.ts` arrived with Select and Switch.
- The tokens landed in `:root`, `.dark`, `@theme inline` and a reduced-motion block. Re-installing changed nothing.
- `next build` passed, and the components rendered in the user's palette.
- The CLI writes harmless self-references such as `--size-control-md: var(--size-control-md)` into `@theme inline`; the unlayered `:root` value wins.

## Rejected
- **Shipping `lib/utils.ts` with an extended `cn`:** it collides with shadcn's file and the overwrite prompt defaults to No.
- **A `registry:theme` tokens item:** installing it directly triggers shadcn's "overwrite existing variables" prompt and skips the base style.
- **Generic CSS names** (`focus-ring`, `scale-in`): the `css` field replaces same-named rules and could clobber a user's own. We use `popover-in`/`popover-out` and outline utilities instead.
- **Requiring the `@fewtone` namespace:** first-time visitors would hit "Unknown registry". It becomes the default once the directory PR is merged.
- **Motion-based (`whileTap`) Button press:** it needs `"use client"`, breaks `buttonVariants` on the server, and adds motion to every Button install.

## Consequences
- **Adding a component:** write it in the portable vocabulary; `pnpm check` fails otherwise. Its registry JSON, dependencies and Manual steps follow automatically.
- **Changing a shipped token:** the next install of any component brings it, but only to projects that don't define it yet.
- **Owner action:** a PR adding `@fewtone` to shadcn's `apps/v4/registry/directory.json`.
