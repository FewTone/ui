import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "breadcrumb",
  title: "Breadcrumb",
  description:
    "An accessible React breadcrumb for Next.js and Tailwind CSS: a trail of links whose levels animate as you move, with custom separators and a collapsed middle.",
  kind: "component",
  category: "Navigation",
  tags: ["breadcrumb", "breadcrumbs", "navigation", "trail", "path"],
  keywords: [
    "react breadcrumb",
    "nextjs breadcrumb",
    "tailwind breadcrumb",
    "shadcn breadcrumb",
    "breadcrumb component",
    "breadcrumb navigation",
    "collapsed breadcrumb",
    "animated breadcrumb",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-19",
  files: ["breadcrumb.tsx"],
  usage: {
    code: `import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

export function Trail() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/components">Components</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}`,
  },
  demos: [
    {
      name: "trails",
      title: "Trails",
      description:
        "Point at a link and its underline fades in. A long trail can fold its middle into a menu: the ellipsis opens a Dropdown Menu of the hidden levels. Pass any icon to BreadcrumbSeparator for a different mark.",
    },
    {
      name: "folders",
      title: "A trail that follows you",
      description:
        "Open a folder and the trail grows a level out of the one before it while the list moves on, row by row; press a level above and it plays backwards. Key each level by its path to get this.",
    },
  ],
  // The page opens on two trails with a setting; the index card shows one trail
  preview: { card: "card" },
  api: [
    {
      name: "Breadcrumb",
      description: "The nav landmark. Also accepts every native nav prop.",
      props: [
        {
          name: "aria-label",
          type: "string",
          default: '"Breadcrumb"',
          description: "The landmark's name.",
        },
      ],
    },
    {
      name: "BreadcrumbList",
      description:
        "The ordered list of levels. It wraps onto more lines when it runs out of room. Levels that come and go animate in and out, and the rest glide to their new places; give each level a key (its path) when you map over one.",
      props: [],
    },
    {
      name: "BreadcrumbItem",
      description: "One level (li), a motion element: it accepts every native li prop and motion's props.",
      props: [],
    },
    {
      name: "BreadcrumbLink",
      description: "A link to a level above. Also accepts every native a prop.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the single child, for example Next.js Link, with the link's styles.",
        },
      ],
    },
    {
      name: "BreadcrumbPage",
      description: 'The page you\'re on: the last item, as text, marked aria-current="page".',
      props: [],
    },
    {
      name: "BreadcrumbSeparator",
      description: "The mark between levels, hidden from screen readers.",
      props: [
        {
          name: "children",
          type: "ReactNode",
          default: "a chevron",
          description: "Your own mark, such as a slash icon. A chevron flips in right-to-left pages.",
        },
      ],
    },
    {
      name: "BreadcrumbEllipsis",
      description:
        "Stands for collapsed levels. Put it inside a DropdownMenuTrigger to list them, and name the trigger (aria-label).",
      props: [],
    },
  ],
  primitives: ["Radix Slot"],
  related: ["pagination", "dropdown-menu"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/",
  ai: {
    whenToUse:
      "Use Breadcrumb at the top of a page deep in a hierarchy (docs, settings, file folders) to show where it sits and link back up. Skip it on flat sites. Collapse the middle into a Dropdown Menu when a trail is long.",
  },
} satisfies ItemMeta;
