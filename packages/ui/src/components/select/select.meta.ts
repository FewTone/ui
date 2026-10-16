import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "select",
  title: "Select",
  description:
    "An accessible React select with a gliding highlight, groups, labels and a scrollable list, built on Radix Select.",
  kind: "component",
  category: "Forms",
  tags: ["select", "dropdown", "listbox", "form"],
  keywords: [
    "react select",
    "react dropdown",
    "nextjs select",
    "tailwind select",
    "shadcn select",
    "animated select",
  ],
  status: "stable",
  addedAt: "2026-10-13",
  updatedAt: "2026-10-14",
  files: ["select.tsx"],
  usage: {
    code: `import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function PlanPicker() {
  return (
    <Select defaultValue="pro">
      <SelectTrigger aria-label="Plan">
        <SelectValue placeholder="Choose a plan" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="free">Free</SelectItem>
        <SelectItem value="pro">Pro</SelectItem>
      </SelectContent>
    </Select>
  )
}`,
  },
  demos: [
    { name: "default", title: "Default" },
    {
      name: "groups",
      title: "Groups",
      description:
        "Group related options under a label, with a separator between groups. Options can be disabled.",
    },
    {
      name: "searchable",
      title: "Long lists with search",
      description:
        "Add searchable to SelectContent and a search field filters the options. Arrow keys move through the matches, Enter picks the highlighted one, and Escape closes. The list scrolls, with soft fades at the ends.",
    },
    { name: "sizes", title: "Sizes", description: "The trigger comes in Button's small and medium heights." },
  ],
  api: [
    {
      name: "Select",
      description: "The root. Also accepts every Radix Select Root prop.",
      props: [
        { name: "value", type: "string", description: "The selected value, when you control it." },
        { name: "defaultValue", type: "string", description: "The initially selected value." },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called when the user picks an option.",
        },
        { name: "name", type: "string", description: "Submits the value with a form." },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents opening." },
      ],
    },
    {
      name: "SelectTrigger",
      description: "The button that opens the list. Give it a label with aria-label or a <label htmlFor>.",
      props: [
        { name: "size", type: '"sm" | "md"', default: '"md"', description: "The height." },
        { name: "aria-invalid", type: "boolean", description: "Marks the value as wrong." },
      ],
    },
    {
      name: "SelectContent",
      description:
        "The list. Opens below the trigger and flips when there is no room. It scrolls past 18rem, with soft fades at the ends.",
      props: [
        {
          name: "searchable",
          type: "boolean",
          default: "false",
          description:
            "Adds a search field above the options, for long lists. Typing filters them, arrow keys move through the matches, and Enter picks the highlighted one.",
        },
        {
          name: "searchPlaceholder",
          type: "string",
          default: '"Search…"',
          description: "The search field's placeholder and accessible name.",
        },
        {
          name: "emptyMessage",
          type: "ReactNode | (search: string) => ReactNode",
          default: '"No results for “…”"',
          description: "Shown when nothing matches the search.",
        },
        {
          name: "position",
          type: '"popper" | "item-aligned"',
          default: '"popper"',
          description:
            "Popper sits below the trigger; item-aligned puts the selected option over it, like a native select.",
        },
        {
          name: "sideOffset",
          type: "number",
          default: "4",
          description: "Gap between the trigger and the list, in px.",
        },
      ],
    },
    {
      name: "SelectItem",
      props: [
        { name: "value", type: "string", required: true, description: "The value this option selects." },
        { name: "disabled", type: "boolean", default: "false", description: "Skips the option." },
        {
          name: "textValue",
          type: "string",
          description: "The text the search and typeahead match, when the option's content isn't plain text.",
        },
      ],
    },
  ],
  primitives: ["Radix Select"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/",
  related: ["input", "switch"],
  ai: {
    whenToUse:
      "Use Select to pick one value from a fixed list of about 5 to 30 options. Use radio buttons for 2 to 4 visible options, and a combobox with search for very long lists.",
  },
} satisfies ItemMeta;
