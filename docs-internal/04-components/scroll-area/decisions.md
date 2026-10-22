# Scroll Area: decisions

**Status:** published directly, without a Lab step (2026-10-16, built from the roadmap note "Scrolling with soft fades at the edges"). The page opens on a vertical tag list and a horizontal row of file cards, named underneath. The index card shows one short list (`preview.card`).

- **What it is:** shadcn's two parts, `ScrollArea` and `ScrollBar`, on Radix Scroll Area. Scrolling stays native (wheel, touch, keyboard, momentum); Radix hides the browser's scrollbar and draws its own over the content. `ScrollArea` has a vertical bar; a horizontal `ScrollBar` goes inside it, as in shadcn.
- **Soft fades at the edges that can scroll** (the brief's micro-interaction), as in Select's list:
  - One per side. Each shows only while there's more content that way and goes when you reach the end, so they answer "is there more?" without a scrollbar.
  - Measured from the scroller on scroll and on resize (a `ResizeObserver` on the scroller and its content), with a 1px tolerance. Right-to-left is handled: there `scrollLeft` runs from 0 to negative, read from Radix's `dir`.
  - **Overlays outside the scroller** (motion.md pitfall): inside it they'd scroll with the content and add to its size.
  - **Coloured by the area's own background:** each fade is `bg-inherit` with a static mask that thins it out (`mask-b-from-0%` and friends), so it matches whatever colour the area has. The area is `bg-background` by default; on a card or a popover, `bg-card` / `bg-popover` keeps the fades true. A colour gradient (`from-background`, Select's way) would need the fade elements themselves restyled on every other surface.
  - **A plain fade** (ADR 0011: scroll-edge fades aren't content coming or going), `duration-fast`. The first measure happens before the first paint with transitions off; they switch on a frame later, so nothing fades in on load.
- **The scrollbar:**
  - Radix's `hover` type: it fades in while the pointer is over the area and out 600ms after it leaves (`forceMount`, so it can fade rather than vanish; a hidden bar ignores the pointer).
  - **A slim thumb that thickens** when you point at the bar or drag it: 4px at rest, 8px under the pointer, so it's easy to grab without crowding the content. It grows from the area's edge.
  - **Scale, not width:** Radix positions the thumb with an inline `transform`, so the line we see is the thumb's `::before`, which scales on its own (`scale-x-50` → `scale-x-100`, origin at the outer edge, flipped in right-to-left). The rounded ends squash a little at rest; at 4px that's invisible.
  - Colour: `border` at rest, `muted-foreground/50` while pointed at or dragged.
  - It sits above the fades (`z-10` in the area's own layer), so its ends never fade with the content.
- **A name makes a region:** with `aria-label` or `aria-labelledby` (moved from the root to the scroller), the scroller is `role="region"` with `tabIndex={0}`, so keyboard users can reach it and scroll with the arrow keys even when nothing inside can take focus (WCAG 2.1.1; axe's `scrollable-region-focusable`). Without a name it stays a plain box, so lists full of links don't get an extra tab stop. The focus ring is drawn inside the edge, because the area clips at its rounded corners.
- **No borders in the demos** (design.md: few borders): the areas are `bg-background` panels on the canvas. The usage snippet leaves it to the user.
- **Tests:** a named area is a focusable region and an unnamed one isn't; the fades follow the scroll position (top, bottom, both) and sideways scrolling, with none when the content fits (sizes and scroll positions stubbed, since jsdom has no layout); axe.
- **Not built yet:** a `viewportRef` for scrolling from code (chat logs that stick to the bottom), a prop to turn the fades off, fade sizes, and scroll snapping.
