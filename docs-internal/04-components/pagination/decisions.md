# Pagination: decisions

**Status:** published directly, without a Lab step (2026-10-16, built from the roadmap note "Move through pages of results"). The page opens on ten pages you can click through, with Previous, Next and ellipses. The index card shows the page numbers alone (`preview.card`), because Previous and Next with their labels are wider than a tile.

- **What it is:** shadcn's parts: `Pagination` (a `nav` named "Pagination"), `PaginationContent` (ul), `PaginationItem` (li), `PaginationLink`, `PaginationPrevious`, `PaginationNext` and `PaginationEllipsis`, plus `getPaginationRange`.
- **Links are ghost Buttons** (`buttonVariants`), so hover and press are Button's tint. They're muted and brighten on hover, and the current page is `foreground` with `aria-current="page"`.
- **A link, a button or your Link** (`PaginationLink`):
  - With `href` it's a link, for pages with their own URL; this works in a server component.
  - Without one it's a button, for pages changed in place (a table's). shadcn always renders an `a`, which without an href can't take focus.
  - With `asChild`, your router's Link (Next.js `Link`) takes the styles. Previous and Next support it too, through `Slot.Slottable`, so the chevron and label go inside your Link.
- **`disabled`** (Previous on the first page, Next on the last): `aria-disabled`, faded, and inert, because its `onClick` isn't passed on and a link loses its href.
  - A button keeps its focus. With the native `disabled`, pressing Next onto the last page would drop the keyboard to the top of the page (design.md: focus never gets lost). It stays in the tab order, announced as unavailable.
  - The handler is left out rather than wrapped, so the component never creates a function, and links still render in a server component.
  - With `asChild` it can't take your Link's href away; leave it out yourself (documented in the API table).
- **The pill** (the brief's micro-interaction): one pill in Button's outline look (`border-input bg-background`, shadcn's current-page style) marks the current page and slides to the new one on `spring.snappy` (`layoutId`, motion.md's sliding indicator). `LayoutGroup id={useId()}` scopes it to each Pagination, so two never trade a pill.
  - **Behind the link, not inside it:** Button clips its own hover tint (`overflow-hidden`, `isolate`), which would clip the pill while it slides. So the pill is a sibling inside the list item, and the list is the pill's layer (`isolate`), so it passes behind every link.
  - Its corners follow the link's (read from it, as Switcher does), so they stay true if it changes width between pages; a class draws them until then, including in server HTML.
  - Nothing moves on first paint; with reduced motion it jumps.
  - With links that load a new page, it slides only when the router keeps the component mounted (client navigation, such as Next.js searchParams); a full page load just shows it in place.
- **Two files:** `pagination.tsx` has no `"use client"`, so links and `getPaginationRange` work in server components; `pagination-pill.tsx` holds the client parts (the pill and its `LayoutGroup`).
- **`getPaginationRange({ page, pageCount, siblingCount = 1, boundaryCount = 1 })`:** MUI's algorithm. It returns page numbers and `"ellipsis"` for each gap. A gap of one page shows that page instead of an ellipsis, and with enough pages the list is always the same length (7 with the defaults). That way the links keep their places, so the pill moves one slot at a time near the ends and stays in the middle while the numbers change round it. The page is clamped into range.
- **Ellipsis:** read as "More pages" (an `sr-only` label). shadcn hides it with `aria-hidden` and adds that label too, which cancels it out.
- **Previous and Next** are named "Go to previous page" / "Go to next page", show a chevron always and the word from the `sm` breakpoint, and the chevrons flip in right-to-left pages.
- **Demos:** the hero names each number "Page N" for screen readers (the visible number is part of the name). No other examples: links look the same as the buttons, and the usage snippet shows the href version.
- **Tests:** `getPaginationRange` (few pages, the gaps at the start, middle and end, more siblings and boundaries, clamping); the nav's name and `aria-current` following a click; one pill; Previous and Next turning off at the ends, staying focused and doing nothing; the keyboard path; links with hrefs, and a disabled link losing its href; axe.
- **Not built yet:** a page-size select, a "Page 3 of 10" compact variant, jump-to-page input, and turning an ellipsis into a menu of the hidden pages.
