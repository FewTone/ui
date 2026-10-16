import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "radio-group",
  title: "Radio Group",
  description:
    "An accessible React radio group for Next.js forms, where the selected dot travels to the new choice, built on Radix Radio Group.",
  kind: "component",
  category: "Forms",
  tags: ["radio", "radio group", "radio button", "form", "choice"],
  keywords: [
    "react radio group",
    "react radio button",
    "nextjs radio group",
    "tailwind radio button",
    "shadcn radio group",
    "animated radio button",
    "radio card",
  ],
  status: "stable",
  addedAt: "2026-10-15",
  updatedAt: "2026-10-15",
  files: ["radio-group.tsx"],
  usage: {
    code: `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function Density() {
  return (
    <RadioGroup defaultValue="comfortable" aria-label="Density">
      <div>
        <RadioGroupItem id="comfortable" value="comfortable" />
        <label htmlFor="comfortable">Comfortable</label>
      </div>
      <div>
        <RadioGroupItem id="compact" value="compact" />
        <label htmlFor="compact">Compact</label>
      </div>
    </RadioGroup>
  )
}`,
  },
  demos: [
    {
      name: "travel",
      title: "Slide and stretch",
      description:
        "Pick another option and the dot travels to it: straight across, or stretching on the way and landing round.",
    },
    {
      name: "horizontal",
      title: "In a row",
      description: "Left and right arrow keys move along the row, and the dot follows.",
    },
    {
      name: "cards",
      title: "Cards",
      description:
        "Each card is the radio's label, so the whole card picks it. Its border follows the choice.",
    },
    { name: "disabled", title: "Disabled", description: "One option can't be picked; arrow keys skip it." },
  ],
  // The page opens on both ways of travelling; the index card shows a single group
  preview: { card: "card" },
  api: [
    {
      name: "RadioGroup",
      description:
        "Also accepts every Radix Radio Group prop. Arrow keys move the choice; Tab leaves the group.",
      props: [
        { name: "value", type: "string", description: "The chosen value, when you control it." },
        { name: "defaultValue", type: "string", description: "The value chosen at first." },
        {
          name: "onValueChange",
          type: "(value: string) => void",
          description: "Called when the user picks another option.",
        },
        {
          name: "travel",
          type: '"slide" | "stretch"',
          default: '"slide"',
          description: "How the dot travels to the new choice: straight across, or stretching on the way.",
        },
        {
          name: "size",
          type: '"sm" | "md"',
          default: '"md"',
          description: "16 or 20px radios, the sizes of Checkbox and Switch.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          description: "Which arrow keys move the choice. Both work when it's left out.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Prevents interaction with every option.",
        },
        {
          name: "required",
          type: "boolean",
          default: "false",
          description: "A choice is needed to submit the form.",
        },
        { name: "name", type: "string", description: "Submits the chosen value with a form." },
      ],
    },
    {
      name: "RadioGroupItem",
      description: "One radio. Give it an id and a visible label with htmlFor.",
      props: [
        { name: "value", type: "string", required: true, description: "The value this radio picks." },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents picking this option." },
      ],
    },
  ],
  primitives: ["Radix Radio Group"],
  related: ["checkbox", "switcher", "switch"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/radio/",
  ai: {
    whenToUse:
      "Use RadioGroup for one choice from a few options that should all stay visible, in forms and settings. Use Select for long lists, Switcher for a compact segmented control, and Checkbox when several can be picked.",
  },
} satisfies ItemMeta;
