import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "combobox",
  title: "Combobox",
  description:
    "An accessible React combobox for Next.js and Tailwind CSS: type in the field to filter and pick one option, or several as chips, with a gliding highlight.",
  kind: "component",
  category: "Forms",
  tags: ["combobox", "autocomplete", "typeahead", "multi select", "chips", "select", "form"],
  keywords: [
    "react combobox",
    "shadcn combobox",
    "react autocomplete",
    "nextjs combobox",
    "react multi select",
    "tailwind combobox",
    "searchable select react",
    "react select with search",
    "tags input react",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-16",
  files: ["combobox.tsx"],
  usage: {
    code: `import { Combobox } from "@/components/ui/combobox"

const frameworks = [
  { value: "next", label: "Next.js" },
  { value: "astro", label: "Astro" },
  { value: "nuxt", label: "Nuxt", keywords: ["vue"] },
]

export function FrameworkPicker() {
  return (
    <Combobox
      aria-label="Framework"
      options={frameworks}
      placeholder="Pick a framework"
      emptyText="No framework found."
    />
  )
}`,
  },
  demos: [
    {
      name: "pickers",
      title: "One value or several",
      description:
        "Type in the field to filter, use the arrow keys or the pointer to move, and Enter or a click to pick. With multiple, choices become chips: the list stays open, Backspace in an empty field removes the last one, and the field grows smoothly when they wrap.",
    },
    {
      name: "groups",
      title: "Groups and long lists",
      description:
        "Options with a group are listed under it as a heading, and keywords widen the search: try IST or Pacific. renderOption adds detail to each row while the field shows the label. Long lists scroll, with soft fades at the ends.",
    },
  ],
  // The page opens on both kinds with a size setting; the index card shows one field
  preview: { card: "card" },
  api: [
    {
      name: "Combobox",
      description:
        "A text field with a list of options below it, built on Command and Radix Popover. Give it a visible label (<label htmlFor> with its id) or an aria-label. Also accepts every input prop, passed to the field.",
      props: [
        {
          name: "options",
          type: "{ value: string; label: string; keywords?: string[]; disabled?: boolean; group?: string }[]",
          required: true,
          description:
            "The options. The search matches the label and keywords; options with the same group are listed under it.",
        },
        {
          name: "multiple",
          type: "boolean",
          default: "false",
          description: "Pick several, shown as chips. The value is then a string[].",
        },
        {
          name: "value",
          type: "string | string[]",
          description:
            "The chosen value (or values, with multiple), when you control it. An empty string is none.",
        },
        { name: "defaultValue", type: "string | string[]", description: "The value chosen at first." },
        {
          name: "onValueChange",
          type: "(value: string | string[]) => void",
          description: "Called when the choice changes: a string, or a string[] with multiple.",
        },
        { name: "placeholder", type: "string", description: "The hint in the empty field." },
        {
          name: "emptyText",
          type: "ReactNode",
          default: '"No results found."',
          description: "Shown when nothing matches.",
        },
        {
          name: "renderOption",
          type: "(option) => ReactNode",
          description: "Custom content for a row in the list. The field still shows the label.",
        },
        {
          name: "size",
          type: '"sm" | "md"',
          default: '"md"',
          description: "The height of one line: Select's small and medium.",
        },
        {
          name: "name",
          type: "string",
          description: "Submits the value with a form (one hidden input per value with multiple).",
        },
        {
          name: "filter",
          type: "(text: string, search: string, keywords?: string[]) => number",
          description: "Scores an option against the search; 0 hides it. Defaults to Command's ranking.",
        },
        {
          name: "onSearchChange",
          type: "(search: string) => void",
          description: "Called with the search as it changes.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents typing and opening." },
        {
          name: "aria-invalid",
          type: "boolean",
          description: "Marks the value as wrong: a destructive border and focus ring.",
        },
      ],
    },
  ],
  primitives: ["Radix Popover", "Command"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/",
  related: ["select", "command", "input"],
  ai: {
    whenToUse:
      "Use Combobox to pick one value, or several, from a long list by typing, such as a framework, a country or labels. Use Select for a short list without typing, Radio Group for 2 to 4 visible options, and Command for a menu of pages and actions.",
  },
} satisfies ItemMeta;
