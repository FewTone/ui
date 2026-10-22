import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "command",
  title: "Command",
  description:
    "An accessible React command menu for Next.js and Tailwind CSS: a ⌘K palette that filters and ranks as you type, with groups, shortcuts and a gliding highlight.",
  kind: "component",
  category: "Navigation",
  tags: ["command", "command palette", "cmdk", "search", "menu", "spotlight", "keyboard"],
  keywords: [
    "react command palette",
    "react command menu",
    "shadcn command",
    "react cmdk",
    "cmd k menu",
    "nextjs command palette",
    "tailwind command palette",
    "spotlight search react",
    "kbar alternative",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["command.tsx"],
  usage: {
    code: `import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export function Palette() {
  return (
    <CommandDialog shortcut="k">
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          <CommandItem onSelect={() => {}}>Dashboard</CommandItem>
          <CommandItem keywords={["preferences"]}>Settings</CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}`,
  },
  demos: [
    {
      name: "default",
      title: "Command menu",
      description:
        "Type to filter: the best matches rise to the top, groups with nothing left hide, and the list glides to its new height. The arrow keys move the highlight, Home and End jump, and Enter runs the item. Try “stg” or “invoices”.",
    },
    {
      name: "dialog",
      title: "Command palette",
      description:
        "CommandDialog puts it in a dialog near the top of the screen. Open it from the button or with ⌘J (Ctrl J on Windows and Linux); this site already uses ⌘K for its own search. Escape or the backdrop closes it.",
    },
  ],
  // The page opens on a full menu; the index card shows a short one
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "Command",
      description:
        "The root: the search, the highlight and the filtering. Put a CommandInput and a CommandList inside.",
      props: [
        {
          name: "label",
          type: "string",
          description: "The search field's accessible name. Defaults to its placeholder.",
        },
        {
          name: "filter",
          type: "(text: string, search: string, keywords?: string[]) => number",
          description:
            "Scores an item against the search, from 0 (hidden) to 1 (exact). The default ranks exact matches, then word starts, then anywhere, then keywords, then letters in order. Export: commandFilter.",
        },
        {
          name: "shouldFilter",
          type: "boolean",
          default: "true",
          description: "Set false to filter yourself, for example results fetched as you type.",
        },
        {
          name: "loop",
          type: "boolean",
          default: "false",
          description: "ArrowDown on the last item goes back to the first, and ArrowUp the other way.",
        },
        {
          name: "value",
          type: "string",
          description: "The highlighted item's value, when you control it.",
        },
        { name: "defaultValue", type: "string", description: "The item highlighted at first." },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called when the highlight moves to another item.",
        },
        {
          name: "search",
          type: "string",
          description: "The search, when you control it here (CommandInput's value does the same).",
        },
        {
          name: "onSearchChange",
          type: "(search: string) => void",
          description: "Called with the search as it changes.",
        },
      ],
    },
    {
      name: "CommandInput",
      description:
        "The search field. It keeps focus and the keyboard, and points screen readers at the highlighted item. Also accepts every input prop.",
      props: [
        { name: "value", type: "string", description: "The search, when you control it." },
        {
          name: "onValueChange",
          type: "(search: string) => void",
          description: "Called with the search as it changes.",
        },
        { name: "placeholder", type: "string", description: "The hint in the empty field." },
      ],
    },
    {
      name: "CommandList",
      description:
        "The listbox. It scrolls past 18rem, with soft fades at the ends, and glides to its new height as results change.",
      props: [
        { name: "label", type: "string", default: '"Results"', description: "The list's accessible name." },
      ],
    },
    {
      name: "CommandEmpty",
      description:
        "Shown when nothing matches. It comes in through the blur, and screen readers hear it from a status line.",
      props: [
        {
          name: "children",
          type: "ReactNode",
          default: '"No results found."',
          description: "The message.",
        },
      ],
    },
    {
      name: "CommandGroup",
      description:
        "Items under a heading. It hides when none of its items match; while searching, the group with the best match comes first.",
      props: [
        { name: "heading", type: "ReactNode", description: "The heading, which also names the group." },
      ],
    },
    {
      name: "CommandItem",
      description: "One item. Enter or a click runs it; the pointer moves the highlight.",
      props: [
        {
          name: "onSelect",
          type: "(value: string) => void",
          description: "Runs the item, with its value.",
        },
        {
          name: "value",
          type: "string",
          description: "What onSelect receives. Defaults to the item's text; keep it unique.",
        },
        {
          name: "keywords",
          type: "string[]",
          description: "More words the search matches, for example “preferences” for Settings.",
        },
        {
          name: "textValue",
          type: "string",
          description: "The text the search matches, when the content isn't plain text.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Skips the item." },
        {
          name: "forceMount",
          type: "boolean",
          default: "false",
          description: "Always shown, whatever the search.",
        },
      ],
    },
    {
      name: "CommandShortcut",
      description: "A keyboard shortcut at the end of an item. The search doesn't match it.",
      props: [],
    },
    {
      name: "CommandSeparator",
      description: "A line between groups. It hides while searching.",
      props: [
        {
          name: "alwaysRender",
          type: "boolean",
          default: "false",
          description: "Keep it while searching.",
        },
      ],
    },
    {
      name: "CommandDialog",
      description:
        "The palette in a Dialog, near the top of the screen. Put CommandInput and CommandList inside. Also accepts every Command prop.",
      props: [
        {
          name: "shortcut",
          type: "string",
          description:
            "Opens and closes it with ⌘ (Ctrl on Windows and Linux) plus this key, for example “k”.",
        },
        { name: "open", type: "boolean", description: "Whether it's open, when you control it." },
        { name: "defaultOpen", type: "boolean", default: "false", description: "Whether it starts open." },
        {
          name: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when it opens or closes. Close it from an item's onSelect to run and dismiss.",
        },
        {
          name: "title",
          type: "string",
          default: '"Command palette"',
          description: "Names the dialog for screen readers.",
        },
        {
          name: "description",
          type: "string",
          default: '"Search for a command to run."',
          description: "Describes the dialog for screen readers.",
        },
        {
          name: "showCloseButton",
          type: "boolean",
          default: "false",
          description: "Shows a close button in the corner. Escape and the backdrop close it either way.",
        },
      ],
    },
  ],
  primitives: ["Radix Dialog"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/",
  related: ["combobox", "dialog"],
  ai: {
    whenToUse:
      "Use Command for a searchable list of pages and actions, inline or as a ⌘K palette (CommandDialog). Use Combobox to pick a form value from a long list, Dropdown Menu for a short menu of actions on a button, and Select for a short list of values.",
  },
} satisfies ItemMeta;
