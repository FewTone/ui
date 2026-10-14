# 0010 · Theme Toggle: View Transition reveals

- **Status:** Accepted (2026-10-14, by the owner, after comparing options in the Lab on 2026-10-13/14)
- **Builds on:** ADR 0003 (neutral first), 0009 (component distribution)

## Context
The site's theme toggle switched instantly. The owner wanted the switch to feel special: the new theme should spread across the page, with background, text and every component changing together inside the moving edge. They also wanted creative options that still perform well. Fourteen reveals were built and compared in a temporary Lab page, `/lab`.

## Decision
- **Ship it as a library component, Theme Toggle** (`packages/ui/src/components/theme-toggle/`), installable like every other item. Developers choose the reveal and the speed with props:
  - `reveal`: one name, `"random"`, a list to pick from at random, or `"none"`
  - `speed`: `"quick"` (450ms), `"medium"` (700ms), `"slow"` (1000ms) or a number of milliseconds

  `revealTheme()` is exported for menus and shortcuts.
- **The site uses it with `reveal="random"` and `speed="slow"`** (owner). Each switch picks one of the eleven reveals, never the same one twice in a row, so visitors see the component's range. Visitors get no setting for it.
- **The eleven reveals:**

  | Reveal | What happens | Cost |
  |---|---|---|
  | `circle` | A circle grows from the click | clip-path |
  | `shrink` | The old theme closes into the click | clip-path |
  | `ink` | An organic, wobbling blob spreads from the click | clip-path (64-point polygon) |
  | `tide` | A rolling wave rises from the bottom | clip-path (51-point polygon) |
  | `page-turn` | The old page swings away in 3D on its left edge | transform and opacity only |
  | `fade` | A cross-fade | opacity only |
  | `wipe-right` | A straight edge sweeps left to right | clip-path |
  | `wipe-down` | A straight edge sweeps top to bottom | clip-path |
  | `feather` | A soft-edged sweep left to right | mask (repaints; the heaviest) |
  | `curtain` | Opens from the centre | clip-path |
  | `diagonal` | Spreads from the top-left corner | clip-path |

- **How it works:**
  - The View Transitions API snapshots the page.
  - `flushSync(() => setTheme(...))` applies the theme through next-themes, inside the transition, so the new snapshot already has it. This works with whatever attribute the user's provider sets.
  - Each reveal is a set of Web Animations keyframes on `::view-transition-new(root)` or `::view-transition-old(root)`, computed from the click point and the screen. That makes organic shapes like Ink and Tide exact.
- **Self-contained:** while a switch runs, the component adds a small style element, so users install no CSS:
  - no default cross-fade
  - the old snapshot on top for Shrink and Page turn
  - no CSS transitions, so colours don't fade twice

  Afterwards it removes that style and cancels its animations.
- **Fallbacks:** with no View Transitions support, or with reduced motion on, the switch is instant.

## Rejected
- **Blinds:** eight slats opening together (owner: removed).
- **Lens:** a circle with the new theme zooming in inside it (owner: disliked).
- **Zoom through:** the old theme scaling up and dissolving (owner: disliked).
- **Radar:** a hand sweeping clockwise round the click (owner: disliked).
- **A reveal picker or speed setting for site visitors:** the owner chose a random reveal at a fixed slow speed.
- **Reveals as CSS keyframes in the site stylesheet:** the first version. Organic shapes can't be computed in CSS, and it needed CSS in the user's project.
- **A blurred Fade:** an animated full-screen blur is expensive, so Fade is opacity only.

## Consequences
- Theme Toggle depends on `next-themes`, now a dependency of `packages/ui`. That is also shadcn's dark-mode setup, so it fits users' projects.
- **Animations must be cancelled.** Fill-forwards animations on the pseudo-elements are never removed by the browser; left in place, they apply to the next switch. This bug was found and fixed during the exploration.
- The Lab's theme page and its option store were deleted. The component's page demos every reveal and speed.
