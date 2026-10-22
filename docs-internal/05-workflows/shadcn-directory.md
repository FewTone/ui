# Listing @fewtone in shadcn's registry directory

Once listed, anyone can run `npx shadcn@latest add @fewtone/button` with no setup, and FewTone UI appears in shadcn's directory. Until then, the full-URL install works everywhere. Users can also opt in to the short form today by adding the registry to their `components.json` (Installation guide, "Use the @fewtone name").

Checked 2026-10-14 against shadcn's docs (ui.shadcn.com/docs/registry/registry-index) and the `main` branch of shadcn-ui/ui.

## Requirements and where we stand
| Requirement (shadcn's words) | Status |
|---|---|
| "The registry must be open source and publicly accessible." | Yes: `FewTone/ui` is public and MIT licensed (`LICENSE`, © FewTone, added 2026-10-22). The registry itself is public, with CORS `*`. |
| "The registry must be a valid JSON file that conforms to the registry schema specification." | Yes. The generator writes schema-shaped JSON. |
| "The registry is expected to be a flat registry with no nested items." | Yes: `/r/registry.json` and `/r/<name>.json` sit side by side. |
| "The `files` array, if present, must NOT include a `content` property." | Yes (checked on the live `/r/registry.json`). |
| Unique namespace matching `^@[a-zA-Z0-9][a-zA-Z0-9_-]*$` | `@fewtone` is free (443 entries checked). |
| Entry fields: `name`, `homepage`, `url` containing `{name}`, `description`, `logo`, optional `author`; nothing else | The entry below passes shadcn's schema (`apps/v4/lib/registry-directory.ts`), run locally with zod. |

## The entry
Add this object at the end of the array in `apps/v4/registry/directory.json` (the file isn't sorted), with a comma after the entry before it:

```json
{
  "name": "@fewtone",
  "homepage": "https://ui.fewtone.com",
  "url": "https://ui.fewtone.com/r/{name}.json",
  "description": "Accessible, customizable React components for Next.js and Tailwind CSS, built on Radix with smooth motion.",
  "author": "FewTone",
  "logo": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 42 30' fill='var(--foreground)'><path d='M0.01 29.99L0.01 10.42C0.01 10.42 10.1 10.15 11.19 11.49C12.29 12.83 8.03 13.84 8.03 16.09C8.03 18.34 11.19 20.48 11.19 20.48L11.19 29.99L0.01 29.99Z'/><path d='M0 12.96L0 0L29.27 0C29.27 0 29.82 7.09 25.21 8.73C20.59 10.36 14.49 7.21 10.97 8.73C7.45 10.24 12.82 11.03 10.97 12.63C9.11 14.23 0 12.96 0 12.96Z'/><path d='M41.7 0V19.58C41.7 19.58 31.61 19.85 30.52 18.5C29.42 17.16 33.68 16.15 33.68 13.9C33.68 11.65 30.52 9.51 30.52 9.51L30.52 0L41.7 0Z'/><path d='M41.7 17.03V30L12.43 30C12.43 30 11.88 22.91 16.49 21.27C21.11 19.63 27.21 22.79 30.73 21.27C34.25 19.76 28.88 18.97 30.73 17.37C32.59 15.77 41.7 17.03 41.7 17.03Z'/></svg>"
}
```

The logo is the FewTone mark (ADR 0006), its coordinates rounded to two decimals. Like the other entries, it fills with `var(--foreground)`, so it follows their light and dark themes.

## Steps (owner)
1. **Add the licence:** done 2026-10-22 (`LICENSE`, MIT, © FewTone). Optionally set the repo's description and homepage: `gh repo edit FewTone/ui --description "Accessible React components for Next.js and Tailwind CSS" --homepage https://ui.fewtone.com`.
2. **Deploy** (`pnpm deploy:prod`), so the live registry includes everything built so far, Theme Toggle included.
3. **Open the PR.** The easiest way is on GitHub's website, which avoids cloning shadcn's large monorepo:
   1. Open https://github.com/shadcn-ui/ui/blob/main/apps/v4/registry/directory.json and press the pencil icon. GitHub forks the repo for you.
   2. Go to the end of the file, add a comma after the last `}`, and paste the entry before the closing `]`.
   3. Commit to a new branch, for example `registry/fewtone`, and open the pull request using the text below.

   Their CI runs `pnpm --filter=v4 validate:registries`. We ran the same schema locally, so it should pass.
4. **After it's merged**, tell the agent to:
   - flip `useNamespace` to `true` in `apps/www/lib/install.ts`, so every install command becomes `npx shadcn@latest add @fewtone/<name>`
   - simplify the Installation guide's "Use the @fewtone name" section
   - redeploy
   - record it in ADR 0009

## PR text
**Title:** `feat(registry): add @fewtone`

**Body:**
> Adds **FewTone UI** (`@fewtone`): accessible, customizable React components for Next.js and Tailwind CSS, built on Radix with smooth motion.
>
> - Site: https://ui.fewtone.com
> - Registry index: https://ui.fewtone.com/r/registry.json
> - Source (MIT): https://github.com/FewTone/ui
>
> - [x] Open source and publicly accessible
> - [x] Flat registry: `registry.json` and `{name}.json` at `/r`
> - [x] No `content` in `registry.json` files
> - [x] Entry validated against `registryDirectorySchema`
