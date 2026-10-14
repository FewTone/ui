# Theme Toggle: decisions

See ADR 0010 for why it exists, the reveals and what was rejected.

- **What it is:** a Button (outline, icon size by default) that switches next-themes between light and dark. It shows the theme you'd switch to: a moon on light, a sun on dark.
- **The icon is one morphing SVG (`SunMoon`, owner 2026-10-14):**
  - **Rays:** they spin and shrink away going to the moon, and pop back one after another (staggered) going to the sun.
  - **Moon:** the core swells to radius 9 on `spring.bouncy`, and a mask circle (radius 6.4) slides in to carve the crescent, with Lucide's proportions.
  - **Stars:** two twinkle in beside the moon.
  - **Rules:** transforms and opacity only; no motion with reduced motion; a `useId` mask ID per instance.
  - **Server render:** before the theme is known, two static drawings switch with `dark:`.
- **Labels:** "Switch to dark theme" or "Switch to light theme". It says "Switch theme" until the theme is known in the browser; until then CSS (`dark:`) picks the icon, so nothing flashes.
- **Origin:** the pointer position on a click, or the button's centre when it's pressed with the keyboard (`event.detail === 0`).
- **Applying the theme:** `flushSync(() => setTheme(theme))` inside `startViewTransition`. React flushes next-themes' effect synchronously, so the attribute or class is on `<html>` before the new snapshot is taken. This was verified in Chrome: the theme had changed by `transition.ready`.
- **Random:** a module-level "last pick" means two switches in a row never use the same reveal. A list narrows the pool.
- **Easing:** `ease.inOut` from `lib/motion.ts`. Durations are props; the three named speeds are 450, 700 and 1000ms, longer than the UI duration tokens because a reveal crosses the whole screen.
- **The user's `onClick` runs first;** calling `preventDefault()` there skips the switch.
- **Not built yet:**
  - a three-way light / dark / system menu
  - reveals for themes other than light and dark (`revealTheme` already accepts any theme name)
- **Index card shows one toggle** (owner, 2026-10-14: the reveals grid looked cramped in the card). This uses the new `preview.card` meta field, which names a card-only demo (`demos/card.tsx`). The index generator registers it and `ItemCard` prefers it. The component page is unchanged.
