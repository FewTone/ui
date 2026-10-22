# Table: decisions

**Status:** published directly, without a Lab step (2026-10-16, built from the roadmap note "Data in rows and columns, with sortable headers"). The page opens on an invoices table: a checkbox column, status Badges, Date and Amount you can sort, and a footer total. The index card shows three plain rows (`preview.card`).

- **What it is:** a real HTML table with shadcn's parts: `Table` (inside a `table-container` that scrolls sideways), `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell` and `TableCaption`. Screen readers get rows, columns and headers for free; the caption names the table.
- **Two files, so most of it stays a server component:**
  - `table.tsx` has no `"use client"`. Head, rows and cells are plain elements, so a 500-row table rendered on the server hydrates no components per row.
  - `table-motion.tsx` holds the two client parts, `TableBody` (the glide) and `TableSortButton` (the arrow), and `table.tsx` re-exports them. Users import everything from `@/components/ui/table`.
- **Borders:** quiet dividers between rows (`border-border`), none round the outside, none under the last row, and one line above the footer (design.md: few borders).
  - **The lines belong to the cells,** with `border-separate border-spacing-0` on the table. In the collapsed model (Tailwind's default) row borders are painted by the table, so a gliding row would leave its line behind, and rows with a background would cover the lines mid-glide. Here a row carries its own line.
  - So `border-b` on a `TableRow` does nothing (shadcn puts it there); restyle the cells instead.
- **Rows:**
  - Hover is a colour change only (`hover:bg-muted/50`, `duration-fast`). Header and footer rows don't take it.
  - A selected row (`data-state="selected"`, shadcn's convention) is `bg-muted`, and stays muted under the pointer.
  - A cell holding a checkbox shrinks to it (`w-px`, no end padding), and the checkbox sits as a block, so it centres in the row without shadcn's 2px nudge.
- **Headers:** `text-muted-foreground`, medium, `text-start` (so right-to-left works). The sorted column's label turns to `foreground`, a second signal beside the arrow.
- **Sorting** (`TableHead` with `sort` and `onSort`):
  - The label becomes a button inside the header (the WAI-ARIA sortable table example), so the header cell keeps its role and the button gets the column's name.
  - `aria-sort` goes on the sorted column only (`ascending` / `descending`); unsorted columns carry none, as in the APG example and the ARIA spec's advice.
  - The table doesn't sort anything itself: `onSort` tells you, and you pass `sort` back. Ascending-first and flipping on a second press is the demo's choice, not the component's.
  - `TableSortButton` is exported for headers built by hand (set `aria-sort` yourself there).
- **The arrow** (the brief's micro-interaction):
  - One `ArrowUp` that turns 180° for descending on `spring.snappy`, so a re-sort reads as the same arrow flipping, not a new icon.
  - Unsorted, it's hidden and fades in (muted) on hover or keyboard focus, so you can tell a column sorts before pressing it.
  - When a column stops being sorted, it fades out pointing where it pointed, then resets its turn after the fade (`duration: 0` after `duration.fast`), so it never spins while leaving.
  - It always keeps its room, so the label never shifts. In a right-aligned column (`text-right` / `text-end` on the head, detected with `in-[.text-right]`), it goes before the label, so the label's edge lines up with the numbers below.
- **Rows glide when the order changes** (FLIP, `TableBody`):
  - A `MutationObserver` on the body sees React move the rows' nodes. It runs after the DOM changes and before the browser paints, so each moved row is put back where it was drawn (`translateY`) and springs to 0 on `spring.snappy`. Only a transform moves; rows stay real `tr`s.
  - **Places are offsets** (`offsetTop` from the body), not on-screen boxes, so zoom or a scaled parent can't double the trip (motion.md pitfall). Motion's `layout` was the alternative the brief allowed; FLIP also avoids making every row a motion component (and measuring every row on every render).
  - **Only a new order glides.** Rows added, removed or resized take their places at once, so filtering or a new page of data doesn't animate. A `ResizeObserver` notes places again when the table reflows.
  - **Mid-glide**, a new sort leaves from where each row is now (the current offset is added). Values are placed with `jump()`, so the spring doesn't count the jump as speed (the Radio Group pitfall).
  - Nothing animates on first paint; with reduced motion nothing moves. Transforms are cleared when a glide ends, and everything stops on unmount.
  - Needs a stable `key` per row; with index keys React rewrites the cells in place and there's nothing to glide.
- **Demo surface:** the invoices sit on `bg-background` with rounded corners, because the preview canvas is the `accent` grey: on it, `bg-muted` would read as a lighter (light mode) or darker (dark mode) band rather than a highlight. It's the page colour a real table sits on, not a box the component draws.
- **Tests:** table semantics and the caption's name, `data-state="selected"`, `aria-sort` absent then ascending then descending with the row order changing, sorting from the keyboard (Enter and Space), moved rows getting a glide transform while unmoved rows don't (offsets stubbed), axe sorted and unsorted.
- **Not built yet:** a data-table layer (TanStack: column visibility, filtering), sticky headers, column resizing, an empty-state row, scroll-edge fades on the sideways container (wrap it in Scroll Area for now), and a server-side sort link (a header that's a link to `?sort=` with the arrow).
