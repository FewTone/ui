# docs-internal

This folder is the project's long-term memory: why things are the way they are. It is not published. The public docs live in `apps/www`.

Start with the root `AGENTS.md` for the project overview and rules.

| Folder | What goes here | Status |
|---|---|---|
| `00-vision/` | Purpose, audience, principles, non-goals | planned |
| `01-brand/` | `design-system.md`, the spec for every visual value | active |
| `02-architecture/` | Monorepo layout and the generation pipeline (component → registry, npm, docs, AI files) | planned |
| `03-decisions/` | ADRs: one file per significant decision (context, decision, consequences) | active |
| `04-components/<name>/` | Per component: decisions, accessibility, motion, changelog, ideas | from Phase 3 |
| `05-workflows/` | How to add or edit components, test, release, deploy | planned |
| `06-research/` | Competitor and technique research with sources | empty, use when needed |
| `07-roadmap/` | Now / next / later, component backlog, Pro ideas | planned |
| `08-log/` | Dated session notes (`YYYY-MM-DD-topic.md`) | active |

## Conventions
- **ADRs** are numbered `0001-short-title.md` and are never deleted. A replaced ADR is marked "Superseded by 000N".
- **Explorations are temporary.** Once a decision is made, record it in an ADR, including what was rejected and why, so nobody proposes it again. Then delete the exploration files. Git history keeps them if they're ever needed.
- **The code beats the docs.** If a document disagrees with the code, fix the document.
