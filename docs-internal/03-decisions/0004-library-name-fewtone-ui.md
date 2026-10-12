# 0004 · Library name: FewTone UI

- **Status:** Accepted (2026-10-09, by the owner)
- **Replaces:** the `untitled/ui` and `@workspace/ui` placeholders

## Context
The name had to be a real word or a short invented one that sounds cool and premium, and it had to be easy to remember. About ten rounds were tried. They are recorded here so nobody proposes them again:

| Round | Direction | Examples | Why it was rejected |
|---|---|---|---|
| 1 | Material and finish words | anodize, patina, velour | Tied to the rejected matte-gradient look |
| 2 | Soft, premium real words | sigil, sable, umbra, atoll, vesper | Too soft. "gambit" came closest ("good but not cool") |
| 3 | Sharp strategy words | feint, riposte, gimbal, caper, saber | "Sounds complicated" |
| 4 | Everyday words, grouped by feel | swish, koi, dusk, mint, ace | Too plain |
| 5 | Foreign words, first names, slang | kuro, nyx, lowkey, enzo, afterglow | The liked ones are already brands |
| 6 | Unused coined words and compounds | inkfox, noxa, moonmoth, sprezza | Not memorable |
| 7 | Names with a product story | juice, keyframe, cheatcode, darkhorse | Not liked |
| 8 | 4–5 letters | zeno, ryze, kata, omen, rune, riff | "Too much like that" |
| 9 | Power and comic words (taste-matched) | kapow, gloss, posh, flash, mega | "All bad" |
| 10 | Patterns from the owner's favourite names | moonwalk, undertone, reflow, dazzle, hubble | No Hindi words, and no spin-offs of the reference names |

**Lessons:**
- The owner wants a name that hits instantly.
- Checking availability first produced obscure words. The better order is to explore first and check only the picks.
- Every short, memorable word is already somebody's brand. The only clash that matters is with another UI library or a known dev tool.

## Decision
Use the owner's studio brand: **FewTone UI**. The code-style mark is `fewtone/ui`.

> **Update (2026-10-12):** the code-style mark is retired. The name is written "FewTone UI" everywhere, including the logo (ADR 0006). Lowercase stays only in what people type: `@fewtone/ui`, `npx fewtone`, `ui.fewtone.com`.

| Channel | Handle | Checked 2026-10-08 |
|---|---|---|
| Install | `npx shadcn add @fewtone/<name>` | `@fewtone` is not among the shadcn directory's 430 registries |
| npm | `@fewtone/ui` | npm org `@fewtone` is free |
| CLI | `npx fewtone` | npm package `fewtone` is free; `fewtone-ui` is also free |
| Site | `ui.fewtone.com` | The owner owns `fewtone.com`, and the subdomain is unused |
| GitHub | `FewTone/ui` | The org already belongs to the owner |

## Consequences
- No domain to buy. One brand covers the studio and the library.
- The workspace package is renamed from `@workspace/ui` to `@fewtone/ui`, so the code matches what users install.
- **Owner action:** create the npm org `@fewtone` soon, to hold the name.
- At launch, submit `@fewtone` to the shadcn registry directory so the install command works without any setup.
