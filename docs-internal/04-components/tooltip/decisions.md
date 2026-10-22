# Tooltip: decisions

**Status:** published (2026-10-16), built with Popover and Hover Card as the floating-surface family. Waiting for the owner's review on the dev server.

- **What it is:** a short text hint on hover and keyboard focus, on Radix Tooltip (`role="tooltip"`, linked to its trigger with `aria-describedby`). It describes; it doesn't name. An icon-only Button keeps its own `aria-label`. Escape, a click and a pointer-down close it; touch doesn't open it (Radix).
- **API:** shadcn's parts, `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent`. Like shadcn, a `Tooltip` outside a provider still works: it wraps itself in its own. Unlike shadcn, it only does that when there's no provider above, so a provider around a toolbar or the app is shared (shadcn wraps every Tooltip in its own provider, which breaks Radix's skip-delay between tooltips).
- **Look:** `rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground`, `z-(--z-tooltip)`, `max-w-xs` with balanced wrapping. Inverted from the page, so no shadow and no arrow. `sideOffset={4}`, like the rest of the family.
- **Delay:** 300ms (`delayDuration`), the same as the site header's tooltip. Radix's default is 700ms and shadcn's is 0; 0 opens tooltips on every pass of the pointer. `skipDelayDuration` stays at Radix's 300ms.
- **The detail: fast along a toolbar.**
  - **The first tooltip** waits for the delay, then opens out of its trigger through the blur (`animate-popover-in` from `--radix-tooltip-content-transform-origin`).
  - **The next ones,** while a tooltip is showing or closed less than `skipDelayDuration` ago, appear at once with no animation and take the last one's place. The one before goes in the same frame (`invisible` while Radix waits out its closing keyframes) instead of blurring out under the new one.
  - **Leaving the row,** the last tooltip closes back into its trigger (`animate-popover-out`). After the window, the next one waits and animates again.
  - **Keyboard:** the same. Radix opens on focus with no delay; Tab along the row hands over the same way, and the first focus animates.
  - **Not Radix's `instant-open` state:** Radix marks every focus-opened tooltip `instant-open`, so keying the animation off it would never animate a keyboard user's first tooltip. Each tooltip's open is controlled by our `Tooltip`, which asks the provider's group whether it's following another.
  - **A Radix quirk worked around:** when one tooltip hands over to the next, the closing one starts Radix's skip timer even though the next is showing, so resting on a tooltip for longer than the window brought the delay back for the one after. The provider stays "warm" while a tooltip shows and for the skip window after, and its tooltips get `delayDuration={0}` meanwhile. A test fails without it.
  - **Unmounting while open** counts as closing, so the group never stays warm.
  - **First paint:** a `defaultOpen` tooltip counts as following, so it's simply there.
  - **Reduced motion:** CSS durations collapse on their own; there's no JavaScript animation.
- **Demos:**
  - **Hero (A toolbar):** ghost icon Buttons (Undo, Redo | Add a comment, Share, Download) with a separator, under one provider, and a Side Select in the top-right corner. The group has no `role`: Biome asks for a `fieldset` there, and a real toolbar would need arrow-key roving (Radix Toolbar), which is out of scope here.
  - **Card demo:** three buttons, no setting.
  - **No examples:** nothing else needs showing yet.
- **Tests:** focus opens it and it describes the trigger; hover opens after the delay; Escape closes and keeps focus; the first animates and the next (Tab) follows without animating, then after the window animates again; pointer hand-over; staying fast after resting longer than the window; no provider; axe closed and open. Radix's pointer grace area needs layout, so the resting test uses `disableHoverableContent`.
- **Not built yet:** an arrow; a keyboard-shortcut slot; a tooltip that glides between triggers (one shared surface moving along the toolbar), which would need its own positioning.
