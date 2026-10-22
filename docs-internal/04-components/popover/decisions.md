# Popover: decisions

**Status:** published (2026-10-16), built with Tooltip and Hover Card as the floating-surface family. Waiting for the owner's review on the dev server.

- **What it is:** rich content anchored to a trigger (a small form, settings, filters, a share link), on Radix Popover. It's a non-modal dialog: focus moves into it on open and back to the trigger on close; Escape and a click outside close it. `modal` stays available.
- **API:** shadcn's parts, `Popover`, `PopoverTrigger`, `PopoverAnchor`, `PopoverContent`, `PopoverClose`, plus `PopoverHeader`, `PopoverTitle` and `PopoverDescription` (shadcn added these too). Title and Description are Radix's own, so they label and describe the dialog automatically; axe's `aria-dialog-name` needs a name, so every popover should have a title or an `aria-label`. `PopoverContent` defaults: `align="center"`, `sideOffset={4}`, `w-72`, `p-4`.
- **Surface:** Select's list, so the family matches: `rounded-lg border border-border bg-popover shadow-md`, `z-(--z-popover)`. No arrow.
- **Opening and closing:** CSS keyframes `animate-popover-in` / `animate-popover-out`, scaling from `--radix-popover-content-transform-origin` through the blur (ADR 0011). It grows out of whichever side it's on, flipped or not.
- **The detail: its height glides.** When the content changes size (more fields, a message, the next step), the popover glides to the new height instead of jumping.
  - **How:** a ResizeObserver on the content element itself. It runs after layout and before paint, so the new size is never shown: the height is pinned at the old value and tweened to the new one with motion's `animate()` (`duration.slow`, `ease.out`, the height pattern; never a spring, whose overshoot would bounce). Then the inline height is cleared, so the content is `auto` again.
  - **No wrapper element:** users' `className="grid gap-4"` on the content keeps applying to their children. A change that happens mid-glide is picked up when the glide lets go, and glides again from there.
  - **Clipping:** `overflow: hidden` only while it moves.
  - **First paint and reduced motion:** the first measurement never animates; with reduced motion there's no observer and the change is instant.
  - **Why an inner `PopoverSurface`:** `PopoverContent` stays mounted while closed (Radix's Portal unmounts what's under it), so the hook lives in a component that mounts with each opening and measures fresh every time. It forwards the ref Radix's Presence passes through the Portal.
  - **Measured with `offsetHeight`:** layout pixels, so the opening scale (a transform) doesn't count.
  - **On `side="top"`:** Radix's floating-ui repositions on every resize, so the bottom edge stays on the trigger while the top glides. Its position update may trail the height by a frame; check by eye.
- **Demos:**
  - **Hero (Dimensions and Share):** two outline Buttons. Dimensions is a form of Inputs with a Limit size Switch that adds two fields, which come in through the blur (`animate-popover-in`) while the popover glides open around them. Share pairs a read-only link Input with Copy Button.
  - **Examples:** Side and alignment (four triggers, an Align Select in the corner), and Anchored to a field (`PopoverAnchor` on a search field with a filter button; the popover takes the field's width with `w-(--radix-popover-trigger-width)`, and `PopoverClose` closes it).
  - **Preview height `lg`,** so the open popover mostly fits the canvas.
- **Tests:** trigger semantics (`aria-haspopup`, `aria-expanded`), the dialog's name and description, focus moving in and returning on Escape, PopoverClose, the glide (a stubbed ResizeObserver and `offsetHeight`: it clips while it moves, then lets go), axe closed and open.
- **Not built yet:** an arrow; an opt-out for the glide (content that animates its own height, such as an accordion inside, would glide in two steps); a width glide.
