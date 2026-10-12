# 2026-10-12 · First deploy

**What happened:**
- **Repo:** moved from the owner's personal GitHub account to `FewTone/ui`. It stays private.
- **Deploys:** they run from the owner's machine through `pnpm deploy:preview` and `pnpm deploy:prod`, using a separate FewTone Vercel account (team `few-tone`, project `fewtone-ui`). The setup and the reasons are in ADR 0005.
- **First deploy:** it built on Vercel with pnpm 11.7.0 (through Corepack) and Node 24. Every page was prerendered. `/lab/*` and the `coming-soon` placeholder render as 404s.
- **Domain:** `ui.fewtone.com` is added to the project. It is waiting for two DNS records at Hostinger: CNAME `ui` and TXT `_vercel`.
- **Line endings:** Git's `core.autocrlf=true` had checked files out with CRLF, which broke `pnpm check`. A new `.gitattributes` (`* text=auto eol=lf`) keeps checkouts LF.

**Open:**
- **Empty component list in production:** the only item, Example, is a draft, so `/components` shows nothing yet. Point the domain once Button ships, or accept the empty list for now.
- **Broken GitHub link:** the header links to `github.com/FewTone/ui`, which is a 404 for visitors while the repo is private.
- **Token rotation:** the deploy token was pasted in chat, so regenerate it and update `.env.deploy.local`.
