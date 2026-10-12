# 0005 · Hosting: Vercel on ui.fewtone.com

- **Status:** Accepted (2026-10-09, by the owner)
- **Replaces:** the original plan's "Cloudflare Workers via OpenNext"

## Context
The site needs to serve:
- the docs
- the registry JSON (`/r/*.json`)
- `llms.txt` and the `.md` routes
- an MCP endpoint

Hard constraint: `fewtone.com` stays on Hostinger. Hostinger holds the domain, its DNS (`ns1/ns2.dns-parking.com`), a static-site plan, and other subdomains and products. The app uses Next 16 features (Cache Components, partial prefetching).

| Option | Change at Hostinger | Next 16 features | Cost |
|---|---|---|---|
| **A. Vercel** | 1 CNAME `ui` | Native | Free (Hobby) |
| B. Cloudflare Workers via Cloudflare for SaaS | 1 CNAME `ui`, plus a second domain held on Cloudflare | Unconfirmed: Cloudflare steers new apps to vinext rather than OpenNext | Free (100 hostnames) |
| C. Move only DNS to Cloudflare | All records re-created on Cloudflare, email included | Same uncertainty as B | Free |
| D. Static export on Hostinger | New subdomain folder | Lost: no MCP endpoint, no server features | Free |

Option C conflicts with the constraint. Workers custom domains require the zone to be on Cloudflare, which is why B needs the extra domain.

## Decision
**A: Vercel, on the free Hobby plan.**
1. Add `ui.fewtone.com` to the Vercel project.
2. Add one CNAME record `ui` in Hostinger hPanel, with the value Vercel shows.

Nothing else on `fewtone.com` changes. No paid tier is planned, which fits Hobby's non-commercial rule.

## Consequences
- We get Next 16 support out of the box and preview deployments for every PR.
- **Keep the code host-agnostic.** Use no Vercel-only APIs. To move hosts later, change the CNAME target in one place.
- **Revisit this decision if** a paid tier is added or the site starts selling FewTone services. Hobby is non-commercial, so at that point either upgrade to Vercel Pro ($20/mo) or switch to option B.

## Update (2026-10-12): how we deploy
The owner's personal Vercel account is busy with other projects and holds their GitHub login (Vercel links a GitHub account to only one Vercel account). So the site deploys to a **separate FewTone Vercel account (Hobby)**, from the owner's machine with the Vercel CLI, not through Vercel's Git integration.

- **Commands:** `pnpm deploy:preview` and `pnpm deploy:prod` run `scripts/deploy.mjs`.
- **Bounded to this repo:**
  - the token lives in `.env.deploy.local`
  - the project link and the CLI's own config folder live in `.vercel/`

  Both are gitignored and never uploaded. The script never reads or changes the global Vercel login, and it ignores any `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID` left in the shell, so other projects on the machine are untouched.
- **Build settings kept in the repo:**
  - Root Directory `apps/www`, chosen when linking
  - Node 24.x through `engines` in `apps/www/package.json`
  - pnpm 11 through Corepack (`--build-env ENABLE_EXPERIMENTAL_COREPACK=1`)

  `.vercelignore` skips `docs-internal` and `.turbo`.
- **Repo location:** Vercel's free plan refuses private repos owned by a GitHub organization, and checks commit authors on them. So the repo either stays private on the owner's personal account until launch, or becomes public as `FewTone/ui`.
- **Rejected:**
  - Git integration on the personal account: it is over its usage.
  - Several free accounts to spread usage, and hiding `.git/HEAD` so Vercel can't read the commit author. Vercel's fair-use rules forbid getting around its limits, and a suspension would take ui.fewtone.com down with it.
