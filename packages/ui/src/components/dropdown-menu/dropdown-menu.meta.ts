import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "dropdown-menu",
  title: "Dropdown Menu",
  description:
    "An accessible React dropdown menu for Next.js with a highlight that glides between items, shortcuts, checkbox and radio items and sub-menus, built on Radix.",
  kind: "component",
  category: "Overlays",
  tags: ["dropdown menu", "menu", "actions", "sub-menu", "overlay"],
  keywords: [
    "react dropdown menu",
    "shadcn dropdown menu",
    "nextjs dropdown menu",
    "tailwind dropdown menu",
    "radix dropdown menu",
    "animated dropdown menu",
    "react menu button",
    "account menu",
    "actions menu",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["dropdown-menu.tsx"],
  usage: {
    code: `import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function AccountMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Open menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="start">
        <DropdownMenuLabel>My account</DropdownMenuLabel>
        <DropdownMenuItem>
          Profile
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`,
  },
  demos: [
    {
      name: "account",
      title: "Account menu",
      description:
        "Items with shortcuts, a setting to switch, a sub-menu and a destructive Log out. Hover or use the arrow keys: one highlight glides between the items, and fades out when the pointer leaves.",
    },
    {
      name: "options",
      title: "Checkbox and radio items",
      description:
        "Checkbox items draw their check in and erase it backwards; radio items grow their dot. This menu stays open while you choose: call event.preventDefault() in onSelect.",
    },
    {
      name: "icons",
      title: "Icon trigger and icons",
      description:
        "An icon button opens a row's actions, and items can start with an icon. The highlight takes a red tint on a destructive item.",
    },
  ],
  api: [
    {
      name: "DropdownMenu",
      description: "The root. Also accepts every Radix Dropdown Menu Root prop.",
      props: [
        { name: "open", type: "boolean", description: "Whether the menu is open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Opens the menu at first." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when the menu opens or closes.",
        },
        {
          name: "modal",
          type: "boolean",
          default: "true",
          description:
            "While open, the rest of the page can't be scrolled or clicked, and screen readers only see the menu.",
        },
        {
          name: "dir",
          type: '"ltr" | "rtl"',
          description: "Reading direction. In rtl, sub-menus open to the left.",
        },
      ],
    },
    {
      name: "DropdownMenuTrigger",
      description:
        "The button that opens the menu. Enter, Space and ArrowDown open it from the keyboard and focus the first item.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Use your own button, for example Button, instead of a plain one.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents opening." },
      ],
    },
    {
      name: "DropdownMenuContent",
      description:
        "The menu. It opens from the trigger and closes back into it through the blur, and flips when there's no room. It scrolls when it's taller than the space left. Renders in a portal.",
      props: [
        {
          name: "align",
          type: '"start" | "center" | "end"',
          default: '"center"',
          description: "How it lines up with the trigger.",
        },
        {
          name: "side",
          type: '"top" | "right" | "bottom" | "left"',
          default: '"bottom"',
          description: "The side of the trigger it opens on, when there's room.",
        },
        {
          name: "sideOffset",
          type: "number",
          default: "4",
          description: "Gap between the trigger and the menu, in px.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: "Shifts it along the trigger, in px.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "false",
          description: "Arrow keys wrap from the last item to the first, and back.",
        },
      ],
    },
    {
      name: "DropdownMenuItem",
      description:
        "An action. One highlight glides to the item under the pointer or the keyboard, and fades out when the pointer leaves the items.",
      props: [
        {
          name: "variant",
          type: '"default" | "destructive"',
          default: '"default"',
          description: "Destructive is red, and the highlight takes a red tint as it lands on it.",
        },
        {
          name: "inset",
          type: "boolean",
          default: "false",
          description: "Indents the label to line up with items that start with an icon.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Skips the item." },
        {
          name: "onSelect",
          type: "(event: Event) => void",
          description:
            "Called when the item is picked with a click, Enter or Space. The menu then closes; call event.preventDefault() to keep it open.",
        },
        {
          name: "textValue",
          type: "string",
          description: "The text typeahead matches, when the item's content isn't plain text.",
        },
      ],
    },
    {
      name: "DropdownMenuCheckboxItem",
      description:
        "An item that switches a setting on and off. Its check draws itself in at the end of the row.",
      props: [
        {
          name: "checked",
          type: 'boolean | "indeterminate"',
          default: "false",
          description: "Whether it's on. Indeterminate draws a dash.",
        },
        {
          name: "onCheckedChange",
          type: "(checked: boolean) => void",
          description: "Called with the new state when it's picked.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Skips the item." },
        {
          name: "onSelect",
          type: "(event: Event) => void",
          description: "Call event.preventDefault() to keep the menu open while switching.",
        },
      ],
    },
    {
      name: "DropdownMenuRadioGroup",
      description: "Holds radio items, one of which is picked.",
      props: [
        { name: "value", type: "string", description: "The picked item's value." },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called with the new value when another item is picked.",
        },
      ],
    },
    {
      name: "DropdownMenuRadioItem",
      description: "One choice in a radio group. Its dot grows in at the end of the row.",
      props: [
        { name: "value", type: "string", required: true, description: "The value this item picks." },
        { name: "disabled", type: "boolean", default: "false", description: "Skips the item." },
        {
          name: "onSelect",
          type: "(event: Event) => void",
          description: "Call event.preventDefault() to keep the menu open while choosing.",
        },
      ],
    },
    {
      name: "DropdownMenuLabel",
      description: "A heading for the items below it. It isn't focusable.",
      props: [
        {
          name: "inset",
          type: "boolean",
          default: "false",
          description: "Indents it to line up with items that start with an icon.",
        },
      ],
    },
    {
      name: "DropdownMenuGroup",
      description: 'Groups related items (role="group").',
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "The items, often after a DropdownMenuLabel.",
        },
      ],
    },
    {
      name: "DropdownMenuSeparator",
      description: "A line between groups.",
      props: [{ name: "className", type: "string", description: "Extra classes, merged with cn." }],
    },
    {
      name: "DropdownMenuShortcut",
      description: "A shortcut hint at the end of an item.",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "The keys, for example ⌘K. It only shows them: bind the keys yourself.",
        },
      ],
    },
    {
      name: "DropdownMenuSub",
      description: "A sub-menu: wraps its trigger and its content.",
      props: [
        { name: "open", type: "boolean", description: "Whether the sub-menu is open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Opens it at first." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when it opens or closes.",
        },
      ],
    },
    {
      name: "DropdownMenuSubTrigger",
      description:
        "The item that opens a sub-menu, on hover, a click, Enter, Space or ArrowRight. It keeps the highlight while its sub-menu is open, and its chevron nudges towards it.",
      props: [
        {
          name: "inset",
          type: "boolean",
          default: "false",
          description: "Indents the label to line up with items that start with an icon.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Skips the item." },
      ],
    },
    {
      name: "DropdownMenuSubContent",
      description:
        "The sub-menu. It opens beside its trigger with its first item level with it, and has its own highlight. ArrowLeft goes back to the trigger; Escape closes the whole menu. Renders in a portal.",
      props: [
        {
          name: "sideOffset",
          type: "number",
          default: "4",
          description: "Gap between the menu and the sub-menu, in px.",
        },
        {
          name: "alignOffset",
          type: "number",
          default: "-5",
          description:
            "Shifts it along the trigger, in px. The default lines its first item up with the trigger.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "false",
          description: "Arrow keys wrap from the last item to the first, and back.",
        },
      ],
    },
    {
      name: "DropdownMenuPortal",
      description:
        "Renders its children into document.body. DropdownMenuContent and DropdownMenuSubContent already use it.",
      props: [
        {
          name: "container",
          type: "HTMLElement | null",
          default: "document.body",
          description: "Where to render instead.",
        },
      ],
    },
  ],
  primitives: ["Radix Dropdown Menu"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/",
  related: ["context-menu", "select", "button"],
  ai: {
    whenToUse:
      "Use DropdownMenu for actions or settings behind a button: an account menu, a row's More actions, view options. Use Select to pick a form value, ContextMenu for the same actions on right-click, and a popover for rich content or forms.",
  },
} satisfies ItemMeta;
