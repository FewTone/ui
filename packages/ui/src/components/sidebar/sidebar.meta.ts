import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "sidebar",
  title: "Sidebar",
  description:
    "An accessible React sidebar for Next.js and Tailwind CSS: collapses to icons or off canvas, with a gliding active indicator and a sheet on phones.",
  kind: "component",
  category: "Navigation",
  tags: ["sidebar", "navigation", "app shell", "collapsible", "menu", "layout"],
  keywords: [
    "react sidebar",
    "nextjs sidebar",
    "shadcn sidebar",
    "tailwind sidebar",
    "collapsible sidebar",
    "sidebar navigation",
    "app sidebar",
    "dashboard sidebar",
    "sidebar menu",
    "mobile sidebar",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-22",
  files: ["sidebar.tsx"],
  usage: {
    code: `import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { HomeIcon, InboxIcon } from "lucide-react"
import Link from "next/link"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="Home">
                  <Link href="/">
                    <HomeIcon />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Inbox">
                  <Link href="/inbox">
                    <InboxIcon />
                    <span>Inbox</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center px-4">
          <SidebarTrigger />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}`,
  },
  demos: [
    {
      name: "app-shell",
      title: "An app shell",
      description:
        "Pick a page and the highlight glides to it. Collapse with the trigger, the rail on the sidebar's edge or ⌘B / Ctrl+B: down to icons, the labels leave through a soft blur, the Settings section folds and its row holds the highlight, and each icon names itself in a tooltip. On a phone the sidebar opens as a sheet.",
    },
  ],
  // The page opens on a whole app shell; the index card shows three rows
  preview: { template: "full-bleed", height: "lg", card: "card" },
  api: [
    {
      name: "SidebarProvider",
      description:
        "Wraps the sidebar and the content beside it, and holds the open state. It sets --sidebar-width (16rem) and --sidebar-width-icon (3rem); change them through its style. Also accepts every div prop.",
      props: [
        { name: "open", type: "boolean", description: "Whether the sidebar is open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "true", description: "Whether it starts open." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description:
            "Called when it opens or collapses, for example to save the choice. The sheet on phones keeps its own state.",
        },
        {
          name: "shortcut",
          type: "string | false",
          default: '"b"',
          description:
            "The letter that toggles the sidebar with ⌘ or Ctrl. It's ignored while typing in a field. false turns it off, for example when a page shows several sidebars.",
        },
      ],
    },
    {
      name: "Sidebar",
      description:
        "The sidebar itself: a navigation landmark, sticky beside the content. Below 768px it opens as a Sheet from its side instead. Also accepts every nav prop.",
      props: [
        {
          name: "collapsible",
          type: '"offcanvas" | "icon" | "none"',
          default: '"offcanvas"',
          description:
            "What collapsing does: slide it away, narrow it to its icons (labels become tooltips), or nothing.",
        },
        {
          name: "side",
          type: '"left" | "right"',
          default: '"left"',
          description: "The edge it's on. Put a right sidebar after SidebarInset.",
        },
        {
          name: "aria-label",
          type: "string",
          default: '"Sidebar"',
          description: "The landmark's name, and the sheet's title on phones.",
        },
      ],
    },
    {
      name: "SidebarTrigger",
      description:
        "An icon button that opens and collapses the sidebar (the sheet on phones), named Toggle sidebar, with aria-expanded and aria-controls. Its panel icon shows the state: the divider slides in as the sidebar narrows. Also accepts every Button prop; children replace the icon.",
      props: [],
    },
    {
      name: "SidebarRail",
      description:
        "A strip along the sidebar's edge that toggles it on click, with a line that shows on hover. For the mouse only: the trigger is the keyboard and screen reader path. Place it inside Sidebar.",
      props: [],
    },
    {
      name: "SidebarInset",
      description: "The main content beside the sidebar, a main landmark. Also accepts every main prop.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the single child instead of a main, when the page already has one.",
        },
      ],
    },
    {
      name: "SidebarHeader",
      description: "The top of the sidebar, for a team switcher or a search. A div.",
      props: [],
    },
    {
      name: "SidebarContent",
      description:
        "The scrolling middle, holding the groups. The highlights for the current page and the hovered row glide behind its rows. A div.",
      props: [],
    },
    {
      name: "SidebarFooter",
      description: "The bottom of the sidebar, for the signed-in user or settings. A div.",
      props: [],
    },
    {
      name: "SidebarGroup",
      description: "A section of the content, with a label and a menu. A div.",
      props: [],
    },
    {
      name: "SidebarGroupLabel",
      description:
        "A group's heading. Down to icons it fades away through a blur and keeps its place, so no row moves.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the single child (for example a button) as the label.",
        },
      ],
    },
    {
      name: "SidebarGroupContent",
      description: "Wraps a group's content when it's more than a menu. A div.",
      props: [],
    },
    {
      name: "SidebarMenu",
      description: "A list of rows (ul).",
      props: [],
    },
    {
      name: "SidebarMenuItem",
      description: "One row's list item (li), holding its button and, optionally, a badge or a sub-menu.",
      props: [],
    },
    {
      name: "SidebarMenuButton",
      description:
        "A row: an icon, then a label in a span. Down to icons, everything after the icon fades away. A button, or with asChild your link. Also accepts every button prop.",
      props: [
        {
          name: "isActive",
          type: "boolean",
          default: "false",
          description:
            'Marks the current page: the highlight glides behind it, and it gets aria-current="page".',
        },
        {
          name: "tooltip",
          type: "string | TooltipContent props",
          description:
            "Names the row in a tooltip while the sidebar is down to its icons. It doesn't show otherwise.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description:
            "Row height: 28, 32 or 48px. lg suits a team switcher or a user, with a 32px picture first.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description:
            "Render the single child (for example a Next.js Link) as the row. On phones, following a link closes the sheet.",
        },
      ],
    },
    {
      name: "SidebarMenuBadge",
      description:
        "A count or status at a row's end, placed inside its SidebarMenuItem after the button. Down to icons it fades away and a dot on the icon's corner takes its place.",
      props: [],
    },
    {
      name: "SidebarMenuCollapsible",
      description:
        "A menu item whose row opens a sub-menu, built on Radix Collapsible. Down to icons it folds away, remembers whether it was open, and its row holds the highlight for a current page inside. Also accepts every li prop.",
      props: [
        { name: "open", type: "boolean", description: "Whether the section is open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Whether it starts open." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when it opens or closes.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Stops it opening or closing." },
      ],
    },
    {
      name: "SidebarMenuCollapsibleTrigger",
      description:
        "The section's row, with a chevron that turns as it opens. Down to icons, clicking it opens the sidebar with the section showing. Also accepts every SidebarMenuButton prop.",
      props: [],
    },
    {
      name: "SidebarMenuCollapsibleContent",
      description:
        "The section's sub-menu. It opens and closes with a smooth height change and a soft blur. Also accepts every Radix Collapsible Content prop.",
      props: [],
    },
    {
      name: "SidebarMenuSub",
      description: "Rows under a row, along a quiet line (ul). Down to icons it's hidden.",
      props: [],
    },
    {
      name: "SidebarMenuSubItem",
      description: "One sub-row's list item (li).",
      props: [],
    },
    {
      name: "SidebarMenuSubButton",
      description: "A sub-row: a link by default. Also accepts every a prop.",
      props: [
        {
          name: "isActive",
          type: "boolean",
          default: "false",
          description: 'Marks the current page, with aria-current="page".',
        },
        {
          name: "size",
          type: '"sm" | "md"',
          default: '"md"',
          description: "Text size: text-xs or text-sm.",
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Render the single child (for example a Next.js Link) as the sub-row.",
        },
      ],
    },
    {
      name: "SidebarSeparator",
      description:
        "A quiet line between parts of the sidebar, decorative (hidden from screen readers). A div; also accepts every native div prop.",
      props: [],
    },
    {
      name: "useSidebar",
      description:
        'Reads the sidebar from inside SidebarProvider: state ("expanded" or "collapsed"), open, setOpen, openMobile, setOpenMobile, isMobile and toggleSidebar.',
      props: [],
    },
  ],
  primitives: ["Radix Collapsible", "Radix Dialog (Sheet)", "Radix Tooltip"],
  // The trigger and each section are disclosures (aria-expanded, aria-controls) inside a navigation landmark
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/",
  related: ["sheet", "tooltip", "tabs"],
  ai: {
    whenToUse:
      "Use Sidebar for an app's main navigation beside the page: a dashboard or settings area with groups of links, collapsing to icons or off canvas, and a sheet on phones. Mark the current page with isActive. For a short set of views inside a page use Tabs; for a panel of actions or a form use Sheet.",
  },
} satisfies ItemMeta;
