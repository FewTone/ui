import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "switcher",
  title: "Switcher",
  description:
    "An accessible React segmented control for Next.js: one choice from a few options, with a pill that slides to the one you pick.",
  kind: "component",
  category: "Buttons",
  tags: ["switcher", "segmented control", "tabs", "radio", "toggle", "view switcher"],
  keywords: [
    "react segmented control",
    "nextjs segmented control",
    "react switcher",
    "view switcher",
    "segmented button",
    "tailwind segmented control",
    "shadcn segmented control",
    "animated segmented control",
  ],
  status: "stable",
  addedAt: "2026-10-14",
  updatedAt: "2026-10-14",
  files: ["switcher.tsx"],
  usage: {
    code: `import { Switcher, SwitcherItem } from "@/components/ui/switcher"

export function RangeSwitcher() {
  return (
    <Switcher defaultValue="week" aria-label="Range">
      <SwitcherItem value="day">Day</SwitcherItem>
      <SwitcherItem value="week">Week</SwitcherItem>
      <SwitcherItem value="month">Month</SwitcherItem>
    </Switcher>
  )
}`,
  },
  demos: [
    {
      name: "variants",
      title: "Variants",
      description:
        "Default has a muted track; Outline a bordered track and pill. The pill matches the theme, dark in dark mode and light in light mode. Pick an option and the pill slides to it. There's always a choice.",
    },
    {
      name: "icons",
      title: "Icons",
      description: "Name each icon-only option with aria-label, so screen readers can tell them apart.",
    },
    { name: "icons-and-text", title: "Icons and text" },
  ],
  // The page opens on both variants; the index card shows a single Switcher
  preview: { card: "card" },
  api: [
    {
      name: "Switcher",
      description:
        "One choice from a few: a radiogroup, built on Radix Toggle Group. Arrow keys move between options; Home and End jump to the ends. Give it a name with aria-label.",
      props: [
        { name: "value", type: "string", description: "The chosen option, when you control it." },
        { name: "defaultValue", type: "string", description: "The option chosen at first." },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called with the new option. Clicking the chosen option again keeps it.",
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
      name: "SwitcherItem",
      props: [
        { name: "value", type: "string", required: true, description: "The value this option picks." },
        { name: "disabled", type: "boolean", default: "false", description: "Skips the option." },
      ],
    },
  ],
  primitives: ["Radix Toggle Group"],
  related: ["toggle-group", "select"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/radio/",
  ai: {
    whenToUse:
      "Use Switcher for one choice from two to five short options that change a view, like Day / Week / Month or List / Grid. Use Toggle Group when options switch on and off independently, Select for longer lists, and Tabs when each option shows its own panel.",
  },
} satisfies ItemMeta;
