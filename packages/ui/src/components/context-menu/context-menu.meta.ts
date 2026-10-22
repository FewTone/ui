import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "context-menu",
  title: "Context Menu",
  description:
    "An accessible React context menu for Next.js: a right-click menu with a gliding highlight, shortcuts, checkbox and radio items and sub-menus, built on Radix.",
  kind: "component",
  category: "Overlays",
  tags: ["context menu", "right-click menu", "menu", "actions", "overlay"],
  keywords: [
    "react context menu",
    "react right click menu",
    "shadcn context menu",
    "nextjs context menu",
    "tailwind context menu",
    "radix context menu",
    "custom right click menu",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["context-menu.tsx"],
  usage: {
    code: `import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

export function FileActions() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="rounded-lg border p-6" tabIndex={0}>
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem>
          Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}`,
  },
  demos: [
    {
      name: "default",
      title: "Default",
      description:
        "Right-click the area, or long-press on touch. With the area focused, the keyboard's context-menu key or Shift+F10 opens it too. The settings and the text size keep this menu open, so you see the check draw in and the dot grow.",
    },
  ],
  api: [
    {
      name: "ContextMenu",
      description:
        "The root. It opens where the pointer is, so there's no open prop. Also accepts every Radix Context Menu Root prop.",
      props: [
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
      name: "ContextMenuTrigger",
      description:
        "The area that opens the menu on right-click or long-press. Give it tabIndex={0} so keyboard users can open it with the context-menu key or Shift+F10.",
      props: [
        {
          name: "asChild",
          type: "boolean",
          default: "false",
          description: "Use your own element, for example a card or a table row, instead of a span.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Leaves the browser's own menu.",
        },
      ],
    },
    {
      name: "ContextMenuContent",
      description:
        "The menu. It grows from the pointer through the blur, and moves to stay on screen. It scrolls when it's taller than the space left. Renders in a portal.",
      props: [
        {
          name: "alignOffset",
          type: "number",
          default: "0",
          description: "Shifts it from the pointer, in px.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "false",
          description: "Arrow keys wrap from the last item to the first, and back.",
        },
        {
          name: "collisionPadding",
          type: "number",
          default: "0",
          description: "Space to keep from the screen's edges, in px.",
        },
      ],
    },
    {
      name: "ContextMenuItem",
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
      name: "ContextMenuCheckboxItem",
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
      name: "ContextMenuRadioGroup",
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
      name: "ContextMenuRadioItem",
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
      name: "ContextMenuLabel",
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
      name: "ContextMenuGroup",
      description: 'Groups related items (role="group").',
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "The items, often after a ContextMenuLabel.",
        },
      ],
    },
    {
      name: "ContextMenuSeparator",
      description: "A line between groups.",
      props: [{ name: "className", type: "string", description: "Extra classes, merged with cn." }],
    },
    {
      name: "ContextMenuShortcut",
      description: "A shortcut hint at the end of an item.",
      props: [
        {
          name: "children",
          type: "ReactNode",
          required: true,
          description: "The keys, for example ⌘R. It only shows them: bind the keys yourself.",
        },
      ],
    },
    {
      name: "ContextMenuSub",
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
      name: "ContextMenuSubTrigger",
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
      name: "ContextMenuSubContent",
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
      ],
    },
    {
      name: "ContextMenuPortal",
      description:
        "Renders its children into document.body. ContextMenuContent and ContextMenuSubContent already use it.",
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
  primitives: ["Radix Context Menu"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/menubar/",
  related: ["dropdown-menu", "select"],
  ai: {
    whenToUse:
      "Use ContextMenu for shortcuts to actions on a specific area or object when people right-click it: a file, a canvas, a table row. Offer the same actions somewhere visible too, such as a DropdownMenu or buttons, because touch and keyboard users may never find a right-click menu.",
  },
} satisfies ItemMeta;
