# Skeleton: decisions

**Status:** published directly, without a Lab step (2026-10-16, built from the roadmap note "Placeholders while content loads"). Category Feedback, as on the roadmap (beside Spinner). The page opens on Placeholders (a profile row and a card, named underneath), with "Loading, then content" as the one example. The index card shows the profile row alone (`preview.card`).

- **What it is:** shadcn's Skeleton: one `div` you shape with classes (`h-4 w-40`, `size-10 rounded-full`), `bg-muted rounded-md`. shadcn's pulses with `animate-pulse`, which isn't in the portable vocabulary; ours has a sheen.
- **Server-safe:** `skeleton.tsx` has no `"use client"`, so it renders in `loading.tsx` and Suspense fallbacks as a server component. The sheen is `skeleton-sheen.tsx`, a small client part, as Badge does with its shine.
- **Motion (the crafted detail): a calm sheen, every skeleton in step.**
  - A band one step lighter than the block (a gradient from transparent through `background/60`, `foreground/5` in dark mode, back to transparent) sits just outside the block and slides across it. One neutral hue, lightness only, never a colour. The `dark:` split is because no single shadcn colour is lighter than `muted` in both themes (`background` is lighter in light mode, darker in dark).
  - **Transform only:** the band moves with the `translate` property (Tailwind v4's translate utilities set `translate`, not `transform`, so the animation uses the same property as the resting `-translate-x-full`). The browser composites it without repainting.
  - **In step:** each sheen is a Web Animation with `startTime = 0` on the document timeline, so its phase is the page's time modulo the period. Skeletons that mount at different moments (a list that streams in) still sweep together, as one loading surface. This is why it calls `element.animate()` directly: motion doesn't expose an animation's start time.
  - **Pace:** a 2s period (`duration.slower * 4`): a 1.5s sweep on `ease.inOut`, then a 0.5s rest. Calm, not a flicker.
  - **Right to left:** in an RTL page the sweep starts from the right (the direction is read once from the computed style).
  - **Reduced motion:** no animation; a still, muted block.
  - **Before hydration it's still** (as Spinner is): the sweep starts once React runs. Skeletons often show before hydration (streamed `loading.tsx`), so a CSS keyframe would sweep from the first paint; see "Not built yet".
  - **Clean up:** the animation is cancelled on unmount.
- **Accessibility:** `aria-hidden` on every skeleton: a grey block says nothing. The region that's loading carries `aria-busy="true"` and a visually hidden label ("Loading profile"); the demos and the usage snippet show it. The "Loading, then content" example adds a polite status that says "Loading profile" while it reloads, so a screen reader hears it start.
- **Demos:**
  - **Placeholders (hero):** a profile row (a 40px circle and two lines) and a card placeholder inside our Card, each named underneath.
  - **Loading, then content:** Reload swaps the profile for its skeleton for 1.5s. Both sit in one grid cell, so nothing below moves. The skeleton only fades (it's a fill), and the content comes back through the blur (`blur` from lib/motion; opacity only with reduced motion). The button stays enabled, so focus is never lost.
  - **Card:** the profile row.
- **Tests:** hidden from screen readers and shaped by classes (cn drops `rounded-md` for `rounded-full`); the sheen asks for a translate sweep, infinite, with `startTime` 0 on every skeleton; cancelled on unmount; still with reduced motion (the hook stubbed); axe inside a loading region. jsdom has no Web Animations API, so `Element.prototype.animate` is a recording stub, restored after each test.
- **Not built yet:** a CSS-only sheen that runs before hydration (needs a shipped `skeleton-sheen` keyframe in the tokens item, and loses the page-anchored phase unless it's paired with a negative delay); a `pulse` option; text-shaped presets (`SkeletonText` with a number of lines).
