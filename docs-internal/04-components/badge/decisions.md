# Badge: decisions

**Status:** published directly, without a Lab step (2026-10-16, built from the roadmap note "Small status labels, including one with a shining edge"). The page opens on every variant, named underneath, with As a link as the one example. The index card shows three badges in a row (`preview.card`).

- **What it is:** a small label for a status, a version, a count or a category. A `span`, or with `asChild` its single child (Radix Slot), so a link stays a real link.
- **API follows shadcn:** `variant` (`default | secondary | destructive | outline`) and `asChild`, plus an exported `badgeVariants`. The fifth variant, `shine`, is ours.
- **Look:**
  - `rounded-full`, `text-xs` medium, `px-2 py-0.5`, a 1px border on every variant (transparent on the filled ones), so all five are the same 22px height.
  - Flat: no shadows. Icons size themselves to 12px (`[&>svg]:size-3`, shadcn's size for `text-xs`).
  - Destructive is the solid danger red with `destructive-foreground`, like the Destructive button.
  - As a link (`[a&]:hover:`), the background shifts: primary and destructive to 90%, the rest to `accent`. Colour only, no movement.
  - No `overflow-hidden` (shadcn has it): it would clip the shine's ring, which sits over the border.
- **Shine** (the roadmap's "shining edge"): the outline badge with two lights travelling round its edge on opposite sides. It's the neutral twin of the site's Beta badge (`edge-shine`, Navy, site-only), with the same 15% spread either side of each light and the same 3s lap.
  - **Neutral only:** the lights are `currentColor`, the label's colour (`foreground`), over the badge's `border` edge. In dark mode that's light travelling over a dark grey edge; in light mode, ink over a light grey edge. Never Navy.
  - **Not a glow:** a 1px line, no blur, no spread, no shadow.
  - **Clear inside,** so it sits on any surface (card, muted, preview canvas): a ring layer over the border masks away everything but its 1px edge (`mask` with `content-box exclude`, the site badge's technique, with the `-webkit-` pair first for older browsers).
  - **Cost:** the site badge animates a registered custom property (`--shine-angle`) in a conic gradient, which repaints every frame. Here the gradient is drawn once on a square inside the ring, and the square turns (`transform: rotate`). The mask is static, so the browser only composites. Motion hands a `transform` string animation to the Web Animations API, so it runs off the main thread. The square is 1.5 times the badge's width (`w-3/2 aspect-square`), so its corners never show as it turns; the ring is `overflow-clip`, so it never adds scroll overflow.
  - **A client part:** the lights live in `badge-shine.tsx` (`"use client"`, motion). `badge.tsx` has no `"use client"`, so Badge stays a server component; it renders `BadgeShine` only for `shine`. With `asChild`, `Slot.Slottable` puts the shine inside the child.
  - **Reduced motion:** nothing turns, and the lights rest on the left and right ends (the site badge does the same).
  - **First paint:** the server renders the lights at rest (0turn, left and right), and the turn starts from there after hydration, so there's no jump.
  - **The angle, not the perimeter:** like the site badge, the lights move at a constant angle round the centre, so on a long label they slow along the sides and quicken round the ends. Constant speed along the edge needs `offset-path` or a measured SVG path; not worth it for a few-letter badge.
- **Mask colour:** `linear-gradient(black 0 0)` in the inline mask. Only its alpha counts; Theme Toggle's mask uses `black` the same way, and the token check allows it.
- **Demos:** Variants (hero: Verified with an icon, Draft, Failed, v2.4.0, Beta, each named underneath), As a link (outline with an arrow, and a shine link), and the card.
- **Tests:** a span with its variant, asChild link, the shine layer is `aria-hidden` and leaves the label alone, the shine goes inside an asChild child, the lights turn, they stay still with reduced motion (the hook stubbed), axe on every variant.
- **Not built yet:** sizes (shadcn has none), a dot or a remove button, and a shine on the filled variants (the light would need its own colour on each fill).
