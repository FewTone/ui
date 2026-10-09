# 2026-10-09 · Cleanup, name and hosting

## What happened
- **Cleanup:**
  - Deleted the brand explorations, `foundations.html` and the research notes; their lessons are kept in ADR 0003.
  - New convention: exploration files are temporary.
  - Two commits: `09b14fc` (baseline) and `447d765` (cleanup).
- **Name:** about ten naming rounds (see ADR 0004). The owner chose their studio brand, **FewTone UI**.
  - Every handle needed is free or already owned: `@fewtone` on shadcn and npm, the `FewTone` GitHub org, and `ui.fewtone.com`.
- **Hosting:** `fewtone.com` must stay on Hostinger.
  - Cloudflare Workers can't attach to a subdomain whose DNS lives elsewhere without Cloudflare for SaaS and a second domain.
  - Chose Vercel with one CNAME on the free Hobby plan; no paid tier is planned (ADR 0005).
- **Repo:**
  - The placeholders `untitled/ui` and `@workspace/ui` are now FewTone UI and `@fewtone/ui`.
  - The name board was deleted.

## Open
- The owner needs to create the npm org `@fewtone`.
- Logo round next: symbol + wordmark, and wordmark only.

## Next
Logo, then Phase 2 (docs site shell).
