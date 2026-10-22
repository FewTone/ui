# Card: decisions

**Status:** published directly, without a Lab step (2026-10-16, built from the roadmap note "A surface for grouped content"). The page opens on one Overview hero (three cards, each named underneath) and has no examples. The index card shows a single small card (`preview.card`).

- **What it is:** a surface for grouped content. shadcn's parts and names: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`, plus an exported `cardVariants`. A server component: no motion, no `"use client"`.
- **API:**
  - `size` (`sm | md`, default `md`): 24px padding and gaps, or 16px for dense grids (stats, settings). shadcn's newest Card has the same `sm`; we name the default `md`, like every other FewTone size. Child parts read it through `group-data-[size=sm]/card:`.
  - `asChild` on `Card` (Radix Slot), so a link can be the whole card.
  - `asChild` on `CardTitle`, so it can be a heading at the level the page needs. shadcn renders a `div` because the level depends on the page; ours does too by default.
- **Look:**
  - `rounded-lg bg-card text-card-foreground`, depth from `shadow-sm` plus a 1px hairline drawn as `ring-1 ring-border`. That's the recipe of the site's own cards (`shadow-card`: a hairline plus a soft lift), in the portable vocabulary: `shadow-card` is site-only. The ring sits outside the box, so it never changes the layout. In dark mode `card` is a step lighter than the page, so the lightness shift carries most of the depth.
  - **Why a hairline at all** (design.md: few borders): in a stock shadcn theme `card` equals `background` in light mode, so a shadow alone barely separates a white card from a white page. If the owner prefers shadow only, drop `ring-1 ring-border` from `cardVariants`.
  - **Header grid without arbitrary values:** shadcn uses `grid-rows-[auto_auto]` and `has-data-[slot=card-action]:grid-cols-[1fr_auto]`, which the token check rejects. Here the header is `grid-cols-1` and `CardAction` sits at `col-start-2`, which creates an implicit `auto` column beside the `1fr` one: the same layout.
  - `[.border-b]:pb-6` on the header and `[.border-t]:pt-6` on the footer keep shadcn's behaviour for blocks that add a rule there.
  - The footer has `gap-2` built in (shadcn has none), since it almost always holds buttons.
- **Link card (the crafted detail):** rendered as a link (`[a&]:` classes, like Badge), the surface lifts a step on hover, from `card` to `muted`: a background transition (`duration-fast`, `ease-out`), the motion standard's "Hover (other elements)" row. No scale, tilt or shadow change. The focus ring goes round the whole card. Everything inside is read as the link's name, so the docs say to keep link cards short.
- **Demos:** Overview (hero: "Create project" with every part and two Inputs, named Default; "Team plan" at `size="sm"` with a Badge action and a footer button, named "Small, with an action"; a GitHub link card, named Link), and the card (one small card with an action).
- **Tests:** every part and its slot, the title as an h3 through `asChild`, a div by default, `size`, a whole-card link reached with Tab, native props, axe.
- **Not built yet:** an image-first card (shadcn's `has-[>img:first-child]:pt-0`), a stretched-link pattern for cards that hold other controls besides the link (one link over the card with buttons above it), and an interactive card that's a button.
