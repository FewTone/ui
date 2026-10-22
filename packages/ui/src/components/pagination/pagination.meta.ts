import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "pagination",
  title: "Pagination",
  description:
    "An accessible React pagination for Next.js and Tailwind CSS: page links with ellipses, Previous and Next, and a pill that slides to the current page.",
  kind: "component",
  category: "Navigation",
  tags: ["pagination", "pages", "pager", "navigation", "next", "previous"],
  keywords: [
    "react pagination",
    "nextjs pagination",
    "tailwind pagination",
    "shadcn pagination",
    "pagination component",
    "animated pagination",
    "pagination with ellipsis",
    "pager",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["pagination.tsx", "pagination-pill.tsx"],
  usage: {
    code: `import {
  getPaginationRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Pages as URLs (?page=3): links work in a server component
export function Pages({ page, pageCount }: { page: number; pageCount: number }) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href={\`?page=\${page - 1}\`} disabled={page === 1} />
        </PaginationItem>
        {getPaginationRange({ page, pageCount }).map((item, index) => (
          <PaginationItem key={item === "ellipsis" ? \`ellipsis-\${index}\` : item}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={\`?page=\${item}\`} isActive={item === page}>
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href={\`?page=\${page + 1}\`} disabled={page === pageCount} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}`,
  },
  demos: [
    {
      name: "pages",
      title: "Ten pages",
      description:
        "Pick a page and the pill slides to it. Ellipses stand for the pages in between, and the links keep their places as you move. Previous and Next turn off at the ends. Without an href, the links are buttons that change the page in place.",
    },
  ],
  // The page opens on the full pagination; the index card shows the page numbers alone
  preview: { card: "card" },
  api: [
    {
      name: "Pagination",
      description: "The nav landmark. Also accepts every native nav prop.",
      props: [
        {
          name: "aria-label",
          type: "string",
          default: '"Pagination"',
          description: "The landmark's name. Give each one its own name when a page has two.",
        },
      ],
    },
    {
      name: "PaginationContent",
      description: "The list of items (ul). The pill slides within it.",
      props: [],
    },
    {
      name: "PaginationItem",
      description: "One item (li), holding a link or an ellipsis.",
      props: [],
    },
    {
      name: "PaginationLink",
      description:
        "A page. A link with href, a button without one, or your router's Link with asChild. Styled with buttonVariants (ghost); also accepts every native a prop.",
      props: [
        {
          name: "isActive",
          type: "boolean",
          default: "false",
          description: 'The current page: it gets the pill and aria-current="page".',
        },
        {
          name: "href",
          type: "string",
          description:
            "The page's URL. Leave it out for a button that changes the page in place (use onClick).",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description:
            "Render the single child, for example Next.js Link, with the link's styles. When it's disabled, leave out the child's href too.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description:
            "Marks it aria-disabled, fades it and stops it: onClick isn't called and a link loses its href. A button keeps its focus.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg" | "icon" | "icon-sm" | "icon-lg"',
          default: '"icon"',
          description: "Button's sizes. Page numbers are square icon sizes.",
        },
      ],
    },
    {
      name: "PaginationPrevious",
      description:
        'A link to the previous page: a chevron, with the word Previous from the sm breakpoint. Named "Go to previous page". Takes PaginationLink\'s props.',
      props: [],
    },
    {
      name: "PaginationNext",
      description: 'A link to the next page, named "Go to next page". Takes PaginationLink\'s props.',
      props: [],
    },
    {
      name: "PaginationEllipsis",
      description: 'Stands for pages that aren\'t shown. Screen readers hear "More pages".',
      props: [],
    },
    {
      name: "getPaginationRange",
      description:
        'Works out which pages to show: returns page numbers and "ellipsis" for each gap. With enough pages the list is always the same length, so the links keep their places.',
      props: [
        { name: "page", type: "number", required: true, description: "The current page, from 1." },
        { name: "pageCount", type: "number", required: true, description: "How many pages there are." },
        {
          name: "siblingCount",
          type: "number",
          default: "1",
          description: "Pages shown either side of the current one.",
        },
        {
          name: "boundaryCount",
          type: "number",
          default: "1",
          description: "Pages always shown at the start and the end.",
        },
      ],
    },
  ],
  primitives: ["Radix Slot"],
  related: ["table", "breadcrumb", "switcher"],
  ai: {
    whenToUse:
      "Use Pagination below a list or table split into pages, such as search results or orders. Use hrefs when each page has its own URL, and buttons when the page changes in place. For a few views of the same data, use Switcher or Tabs instead.",
  },
} satisfies ItemMeta;
