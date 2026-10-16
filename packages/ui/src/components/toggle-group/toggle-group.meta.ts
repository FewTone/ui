import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "toggle-group",
  title: "Toggle Group",
  description:
    "An accessible React toggle group for Next.js: buttons you switch on and off independently, like Bold, Italic and Underline in a toolbar.",
  kind: "component",
  category: "Buttons",
  tags: ["toggle group", "toggle", "toolbar", "formatting", "multi select", "filter"],
  keywords: [
    "react toggle group",
    "shadcn toggle group",
    "nextjs toggle group",
    "toggle buttons",
    "toolbar toggle buttons",
    "tailwind toggle group",
    "multi select buttons",
    "radix toggle group",
  ],
  status: "stable",
  addedAt: "2026-10-14",
  updatedAt: "2026-10-14",
  files: ["toggle-group.tsx"],
  usage: {
    code: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function Formatting() {
  return (
    <ToggleGroup defaultValue={["bold"]} aria-label="Formatting">
      <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
    </ToggleGroup>
  )
}`,
  },
  demos: [
    {
      name: "variants",
      title: "Variants",
      description:
        "Default has a muted track; Outline a bordered track and pill. The pill matches the theme, dark in dark mode and light in light mode. Each option you switch on fades its own pill in.",
    },
    {
      name: "days",
      title: "Days",
      description: "Text options work the same way, here picking the days to repeat on.",
    },
    {
      name: "disabled",
      title: "A disabled option",
      description: "Disabled options don't respond and the arrow keys skip them.",
    },
  ],
  // The page opens on both variants; the index card shows a single Toggle Group
  preview: { card: "card" },
  api: [
    {
      name: "ToggleGroup",
      description:
        "Options switched on and off independently: a toolbar of pressed buttons, built on Radix Toggle Group. Arrow keys move between options; Home and End jump to the ends. For one choice, use Switcher. Give it a name with aria-label.",
      props: [
        { name: "value", type: "string[]", description: "The options switched on, when you control them." },
        { name: "defaultValue", type: "string[]", description: "The options switched on at first." },
        {
          name: "onValueChange",
          type: "(value: string[]) => void",
          description: "Called with every option that's on, after each change.",
        },
        {
          name: "variant",
          type: '"default" | "outline"',
          default: '"default"',
          description:
            "Default: a muted track. Outline: a bordered track, with a bordered pill. The pill is dark in dark mode and light in light mode.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "32, 36 or 40px tall, matching Button.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Disables every option." },
      ],
    },
    {
      name: "ToggleGroupItem",
      props: [
        {
          name: "value",
          type: "string",
          required: true,
          description: "The value this option adds when it's on.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Skips the option." },
      ],
    },
  ],
  primitives: ["Radix Toggle Group"],
  related: ["switcher", "button"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/",
  ai: {
    whenToUse:
      "Use ToggleGroup for options people switch on and off independently, like text formatting, weekdays or notification channels. Use Switcher for one choice from a few, and Checkbox for options in a form.",
  },
} satisfies ItemMeta;
