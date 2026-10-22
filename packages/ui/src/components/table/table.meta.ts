import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "table",
  title: "Table",
  description:
    "An accessible React table for Next.js and Tailwind CSS: rows and columns with sortable headers, selectable rows and rows that glide when sorted.",
  kind: "component",
  category: "Display",
  tags: ["table", "data table", "grid", "sort", "rows", "columns"],
  keywords: [
    "react table",
    "nextjs table",
    "tailwind table",
    "shadcn table",
    "sortable table",
    "data table",
    "table component",
    "animated table",
    "aria-sort",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["table.tsx", "table-motion.tsx"],
  usage: {
    code: `import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function Invoices() {
  return (
    <Table>
      <TableCaption>Recent invoices</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>INV-1048</TableCell>
          <TableCell className="text-right">$1,250.00</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}`,
  },
  demos: [
    {
      name: "invoices",
      title: "Invoices",
      description:
        "Sort by date or amount and the rows glide to their new places. Pick rows with the checkboxes; a picked row is muted. The footer holds the total.",
    },
  ],
  // The page opens on the sortable invoices; the index card shows three plain rows
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "Table",
      description:
        "The table, inside a container that scrolls sideways when the columns don't fit. Also accepts every native table prop. Name it with a TableCaption or aria-label.",
      props: [],
    },
    {
      name: "TableHeader",
      description: "The header rows (thead). Its rows don't take the hover.",
      props: [],
    },
    {
      name: "TableBody",
      description:
        "The body (tbody). When its rows change order, for example on a sort, they glide to their new places; give each row a stable key. Instant with reduced motion.",
      props: [],
    },
    {
      name: "TableFooter",
      description: "The footer rows (tfoot), for totals. A line above it, in medium weight.",
      props: [],
    },
    {
      name: "TableRow",
      description: "A row (tr). Also accepts every native tr prop.",
      props: [
        {
          name: "data-state",
          type: '"selected"',
          description: "Marks the row as selected: it takes a muted background.",
        },
      ],
    },
    {
      name: "TableHead",
      description:
        'A header cell (th). Also accepts every native th prop. Add className="text-right" for a column of numbers; a sort arrow then goes before the label.',
      props: [
        {
          name: "sort",
          type: '"ascending" | "descending" | "none"',
          description:
            "The column's sort. The sorted column gets aria-sort; the arrow points up for ascending and turns down for descending.",
        },
        {
          name: "onSort",
          type: "() => void",
          description:
            "Makes the label a button that sorts the column. Called when it's pressed; update sort in response. Unsorted columns show their arrow on hover.",
        },
      ],
    },
    {
      name: "TableCell",
      description: "A data cell (td). Also accepts every native td prop, such as colSpan.",
      props: [],
    },
    {
      name: "TableCaption",
      description: "The table's title, shown below it and read as its name.",
      props: [],
    },
    {
      name: "TableSortButton",
      description:
        "The button TableHead renders for a sortable column. Use it directly only for a header of your own, and set aria-sort on that header yourself. Also accepts every native button prop.",
      props: [
        {
          name: "direction",
          type: '"ascending" | "descending" | "none"',
          default: '"none"',
          description: "Which way the arrow points; hidden until hover when none.",
        },
      ],
    },
  ],
  related: ["pagination", "checkbox", "badge", "scroll-area"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/",
  ai: {
    whenToUse:
      "Use Table for data people compare across rows and columns: invoices, orders, users. Make a column sortable with TableHead's sort and onSort, and add a Checkbox column for picking rows. Use a list for single-column content, and Pagination below the table for long data.",
  },
} satisfies ItemMeta;
