import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "slider",
  title: "Slider",
  description:
    "An accessible React slider for Next.js and Tailwind: one value or a range, with a thumb that grows into a pill showing its value as you reach for it.",
  kind: "component",
  category: "Forms",
  tags: ["slider", "range slider", "range", "input range", "form"],
  keywords: [
    "react slider",
    "react range slider",
    "nextjs slider",
    "tailwind slider",
    "shadcn slider",
    "radix slider",
    "price range slider",
    "dual range slider",
    "animated slider",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-22",
  files: ["slider.tsx"],
  usage: {
    code: `import { Slider } from "@/components/ui/slider"

export function Volume() {
  return <Slider aria-label="Volume" defaultValue={[60]} max={100} step={1} />
}`,
  },
  demos: [
    {
      name: "single-and-range",
      title: "Single and range",
      description:
        "Reach for a thumb (hover, Tab, drag) and it grows from a dot into a pill with its value inside, the number flowing as it changes, while the track thickens. Click the track and the thumb glides there; drag and it follows the pointer, the pill stretching with its speed.",
    },
    {
      name: "labelled",
      title: "With a label",
      description:
        "A visible label names the thumb through aria-labelledby, with the value beside it. An Intl format (hours) shows in the pill and gives screen readers the same text.",
    },
    {
      name: "vertical",
      title: "Vertical",
      description:
        'orientation="vertical": at least 11rem tall, filling a taller container. Up and Right raise the value, and the pill grows from the thumb just the same.',
    },
  ],
  // The page opens on two sliders; the index card shows one
  preview: { card: "card" },
  api: [
    {
      name: "Slider",
      description:
        'Also accepts every native div prop. One number in value for one thumb, two for a range. aria-label or aria-labelledby names the thumbs; each thumb is a role="slider" with the full keyboard.',
      props: [
        {
          name: "value",
          type: "number[]",
          description: "The values, when you control them: one per thumb.",
        },
        {
          name: "defaultValue",
          type: "number[]",
          default: "[min]",
          description: "The values at first. Two numbers make a range.",
        },
        {
          name: "onValueChange",
          type: "(value: number[]) => void",
          description: "Called on every change, while dragging too.",
        },
        {
          name: "onValueCommit",
          type: "(value: number[]) => void",
          description: "Called once a drag ends or a key changes the value.",
        },
        { name: "min", type: "number", default: "0", description: "The lowest value." },
        { name: "max", type: "number", default: "100", description: "The highest value." },
        { name: "step", type: "number", default: "1", description: "The values snap to steps of this size." },
        {
          name: "minStepsBetweenThumbs",
          type: "number",
          default: "0",
          description: "How many steps a range's thumbs keep apart.",
        },
        {
          name: "format",
          type: "Intl.NumberFormatOptions",
          description:
            'How the value is written in the thumb\'s pill and for screen readers (aria-valuetext), for example { style: "currency", currency: "USD" }.',
        },
        {
          name: "locale",
          type: "string",
          default: '"en-US"',
          description: "The locale to format in. Fixed by default so the server and the browser agree.",
        },
        {
          name: "thumbLabels",
          type: "string[]",
          description:
            "A name for each thumb. Without it a range's thumbs are named from aria-label, for example “Price, minimum”.",
        },
        {
          name: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Vertical is at least 11rem tall and fills a taller container.",
        },
        {
          name: "inverted",
          type: "boolean",
          default: "false",
          description: "Puts the lowest value at the other end.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents interaction." },
        {
          name: "name",
          type: "string",
          description: "Submits the values with a form, through a hidden input per thumb.",
        },
      ],
    },
  ],
  primitives: ["WAI-ARIA slider pattern"],
  related: ["number-input", "switch", "input"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/slider/",
  ai: {
    whenToUse:
      "Use Slider to pick a value or a range where its place between a minimum and a maximum matters more than the exact number: volume, price filters, sizes. Use NumberInput when people need to type or nudge an exact number.",
  },
} satisfies ItemMeta;
