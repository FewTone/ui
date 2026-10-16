# Library component standard

Always on when adding or changing anything in `packages/ui/src/components/`. Components ship as source into other people's shadcn projects (ADR 0009). The step-by-step workflow is `.agents/skills/new-component/SKILL.md`.

## Files
```
packages/ui/src/components/<name>/
  <name>.tsx          the component; exports the parts and any variants (buttonVariants)
  <name>.meta.ts      page, search, SEO and registry metadata (schema: src/registry/schema.ts)
  <name>.test.tsx     behaviour, keyboard and axe
  demos/*.tsx         one file per demo; the first one is the page's hero preview
docs-internal/04-components/<name>/decisions.md   why it's built this way, and what isn't built yet
```
After any change to these, run `pnpm index`, which regenerates the index and the registry. Pages, the sidebar, search, the sitemap, social images and `/r/<name>.json` follow from it.

## Code
- **Portable vocabulary only** (design-system §13), enforced by `pnpm check:tokens`:
  - shadcn colours
  - `text-xs`/`text-sm`/`text-base`
  - shipped tokens through `(--token)`
  - the outline-ring focus classes
  - `rounded-md`/`rounded-lg` (`rounded-sm`/`rounded-xs` only for the smallest controls, such as Checkbox)

  Never use site tokens (`--space-*`, `text-label`, `focus-ring`, brand or status colours). To ship a new token, add it to `src/registry/shared.ts` first.
- **Imports:** from `@fewtone/ui/...`, never relative paths. The generator rewrites them to the user's aliases and derives npm and registry dependencies from them. Any new npm package goes in `packages/ui/package.json`.
- **API shaped like shadcn:**
  - `variant` / `size` with `cva`
  - `asChild` where a different element makes sense
  - `data-slot="<name>"`
  - `className` merged with `cn`
  - native props passed through
  - React 19 `ref` as a prop
- **Server-safe:** no `"use client"` unless it needs state, effects or motion. CSS beats JavaScript for simple feedback (Button's press).
- **Composition:** build on our existing components (Theme Toggle renders `Button`, the Switch demo uses `Switch`) rather than restyling raw elements.
- **Motion:** follow `.agents/rules/motion.md`. Each component checks `useReducedMotion()` itself, because it can't rely on our site's `MotionConfig`.
- **Comments** explain why: a short block at the top of the file, and a line wherever something isn't obvious. Match the density of the existing components.

## Metadata and demos
- `status: "stable"` (or `beta` while the API may change). There are no "New" tags (owner, 2026-10-14). Set `addedAt` / `updatedAt`, and bump `updatedAt` on every user-visible change.
- `description` in search words ("An accessible React … for Next.js …").
- `keywords` people actually type, `related` items, `primitives`, `ariaPattern`, and `ai.whenToUse`.
- **API table:** every prop with its type, default and a plain-English description. Mention what it builds on ("Also accepts every Button prop").
- **The hero (first demo) shows the component's range at a glance:**
  - Lay it out as a compact grid centred in the preview.
  - Put any setting for the demo in a `Select` at the top right.
  - Name every variant underneath it.
- **Index cards** show the hero in a small tile. When the hero is busy (a grid, settings), add a one-control card demo and point `preview.card` at it in the meta. It shows only on cards, never on the page (Theme Toggle).
- **Small controls (a switch, a checkbox):** the hero can be a single control zoomed with the demo's `zoom` in the meta (for example `zoom: 2`). This changes the preview only; the code shown stays plain.
- **Examples** are only for something the hero can't show, such as a composition or a different trigger. Don't add an example that repeats the hero.
- **Demos:**
  - `"use client"` only when needed
  - no `Date` or `Math.random` (hydration)
  - labelled controls
  - stock text sizes

## Tests
- **What to test:** roles and names, the main interaction, the keyboard path, and `axeViolations(container)` returning `[]`.
- **Stubbing:** stub browser APIs that jsdom lacks on the spot (for example View Transitions or `element.animate`), and restore them in `afterEach`.
