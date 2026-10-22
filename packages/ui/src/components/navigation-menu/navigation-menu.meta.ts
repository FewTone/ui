import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "navigation-menu",
  title: "Navigation Menu",
  description:
    "An accessible React navigation menu for Next.js and Tailwind CSS: a top bar with rich dropdown panels that glide between sizes, built on Radix Navigation Menu.",
  kind: "component",
  category: "Navigation",
  tags: ["navigation menu", "navbar", "header", "mega menu", "dropdown", "navigation"],
  keywords: [
    "react navigation menu",
    "nextjs navigation menu",
    "tailwind navigation menu",
    "shadcn navigation menu",
    "react navbar",
    "react mega menu",
    "animated navigation menu",
    "header dropdown menu",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-21",
  files: ["navigation-menu.tsx"],
  usage: {
    code: `import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

export function SiteNav() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>Components</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-md grid-cols-2 gap-1">
              <li>
                <NavigationMenuLink href="/components/button">
                  <span className="font-medium">Button</span>
                  <span className="text-muted-foreground">Actions, in calm variants.</span>
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink href="/components/dialog">
                  <span className="font-medium">Dialog</span>
                  <span className="text-muted-foreground">A window that holds focus.</span>
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuIndicator />
      </NavigationMenuList>
    </NavigationMenu>
  )
}`,
  },
  demos: [
    {
      name: "header",
      title: "Site header",
      description:
        "Hover or open a trigger, then move to the other one: the panel glides to its new size, the content slides in from the side you moved towards, and the caret follows the open trigger. One highlight glides between the items.",
    },
    {
      name: "without-viewport",
      title: "Panels under their triggers",
      description:
        "With viewport={false}, each trigger opens its own small surface right under it, like a row of dropdowns, instead of one shared panel.",
    },
  ],
  // The page opens on the whole header with room for its panels; the index card shows the top bar alone
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "NavigationMenu",
      description:
        "The root, a nav landmark built on Radix Navigation Menu. Also accepts every Radix Navigation Menu Root prop. Hover opens a panel after a short delay; click, Enter and Space toggle it; ArrowDown opens it and moves in; Escape closes it.",
      props: [
        {
          name: "value",
          type: "string",
          description: "The open item, when you control it. An empty string is closed.",
        },
        { name: "defaultValue", type: "string", default: '""', description: "The item open at first." },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called with the item that opens, or an empty string when the menu closes.",
        },
        {
          name: "viewport",
          type: "boolean",
          default: "true",
          description:
            "Opens the panels in one shared surface under the list, which glides between their sizes. Set it to false to open each panel under its own trigger.",
        },
        {
          name: "delayDuration",
          type: "number",
          default: "200",
          description: "How long the pointer rests on a trigger before its panel opens, in milliseconds.",
        },
        {
          name: "skipDelayDuration",
          type: "number",
          default: "300",
          description: "How soon after leaving one trigger another opens without the delay, in milliseconds.",
        },
        {
          name: "aria-label",
          type: "string",
          default: '"Main"',
          description: "Names the landmark. Give each navigation menu on a page its own name.",
        },
      ],
    },
    {
      name: "NavigationMenuList",
      description: "The row of items. Place NavigationMenuIndicator inside it, after the items.",
      props: [{ name: "children", type: "ReactNode", description: "NavigationMenuItem elements." }],
    },
    {
      name: "NavigationMenuItem",
      description:
        "One item: a trigger with its content, or a link. One highlight glides to the item under the mouse, and otherwise rests on the open one.",
      props: [
        {
          name: "value",
          type: "string",
          description: "Names the item for value and onValueChange. One is made up when you leave it out.",
        },
      ],
    },
    {
      name: "NavigationMenuTrigger",
      description:
        "The button that opens its item's panel, with a chevron that turns over while it's open. Also accepts every Button element prop.",
      props: [
        { name: "disabled", type: "boolean", default: "false", description: "Can't be opened or focused." },
      ],
    },
    {
      name: "NavigationMenuContent",
      description:
        "The item's panel. In the viewport it slides 12px in from the side you moved towards through a soft blur, while the previous panel slides out the other way. Give what's inside a width (for example w-md on a grid), so the viewport knows the size to glide to.",
      props: [
        { name: "children", type: "ReactNode", description: "The panel's links and layout." },
        {
          name: "onEscapeKeyDown",
          type: "(event: KeyboardEvent) => void",
          description: "Called when Escape closes the menu. Call event.preventDefault() to keep it open.",
        },
      ],
    },
    {
      name: "NavigationMenuLink",
      description:
        "A link. In the list it looks like a trigger; inside a panel it's a row that fills on hover. Selecting it closes the menu.",
      props: [
        { name: "href", type: "string", description: "Where it goes." },
        {
          name: "active",
          type: "boolean",
          default: "false",
          description: 'Marks the current page (aria-current="page").',
        },
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Renders your own link instead, for example Next.js's Link.",
        },
        {
          name: "onSelect",
          type: "(event: Event) => void",
          description: "Called when the link is selected. Call event.preventDefault() to keep the menu open.",
        },
      ],
    },
    {
      name: "NavigationMenuIndicator",
      description:
        "A caret on the panel's top edge that points at the open trigger and slides along when another opens. It needs the viewport.",
      props: [{ name: "className", type: "string", description: "Classes for the caret." }],
    },
    {
      name: "NavigationMenuViewport",
      description:
        "The shared surface the panels open in. NavigationMenu renders it for you unless viewport is false. It opens through a soft blur, glides between panel sizes and closes quickly; with reduced motion it all happens at once.",
      props: [{ name: "className", type: "string", description: "Classes for the surface." }],
    },
    {
      name: "navigationMenuTriggerStyle",
      description: "The trigger's classes, for a link or button of your own in the list.",
      props: [
        { name: "()", type: "() => string", description: "Returns the class names. Merge your own with cn." },
      ],
    },
  ],
  primitives: ["Radix Navigation Menu"],
  related: ["dropdown-menu", "tabs", "breadcrumb", "sidebar"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/",
  ai: {
    whenToUse:
      "Use Navigation Menu for a website's top bar, where some items open panels of links (a docs or marketing site header). Use Dropdown Menu for a list of actions, Tabs to switch panels in place, Sidebar for an app's navigation, and a Sheet for the menu on small screens.",
  },
} satisfies ItemMeta;
