import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "number-input",
  title: "Number Input",
  description:
    "An accessible React number input for Next.js and Tailwind with step buttons, keyboard control, min and max, and Intl number formatting.",
  kind: "component",
  category: "Forms",
  tags: ["number input", "number field", "stepper", "spinbutton", "quantity", "form"],
  keywords: [
    "react number input",
    "nextjs number input",
    "tailwind number input",
    "shadcn number input",
    "react number field",
    "quantity input react",
    "react stepper input",
    "currency input react",
    "spinbutton",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-21",
  files: ["number-input.tsx"],
  usage: {
    code: `import { NumberInput } from "@/components/ui/number-input"

export function Quantity() {
  return (
    <>
      <label htmlFor="quantity">Quantity</label>
      <NumberInput id="quantity" defaultValue={1} min={1} max={99} />
    </>
  )
}`,
  },
  demos: [
    {
      name: "fields",
      title: "Quantity and price",
      description:
        "Step with the buttons or the arrow keys and the number rolls: the digits that change lift away as the new ones rise in, upwards for up and downwards for down. Hold a button to keep stepping. The price is formatted with Intl.NumberFormat.",
    },
    {
      name: "percent",
      title: "Percent",
      description:
        "A value from 0 to 1 shown as a percent, in steps of 5%. Page Up and Page Down take bigger steps; Home and End go to the ends.",
    },
    { name: "disabled", title: "Disabled" },
  ],
  // The page opens on two fields with a size setting; the index card shows one
  preview: { card: "card" },
  api: [
    {
      name: "NumberInput",
      description:
        "A spinbutton with step buttons. className styles the field; every other native input prop, id and ref included, goes to the input. Typed text is read when you leave the field or press Enter.",
      props: [
        {
          name: "value",
          type: "number | null",
          description: "The number, when you control it. null is an empty field.",
        },
        { name: "defaultValue", type: "number | null", default: "null", description: "The number at first." },
        {
          name: "onValueChange",
          type: "(value: number | null) => void",
          description:
            "Called with the new number after a step, after typing a number in range, or when you leave the field.",
        },
        { name: "min", type: "number", description: "The lowest number. Home goes here." },
        { name: "max", type: "number", description: "The highest number. End goes here." },
        {
          name: "step",
          type: "number",
          default: "1",
          description: "How much the arrow keys and the buttons change it.",
        },
        {
          name: "largeStep",
          type: "number",
          default: "step × 10",
          description: "How much Page Up and Page Down change it.",
        },
        {
          name: "format",
          type: "Intl.NumberFormatOptions",
          description:
            'How the number is shown, for example { style: "currency", currency: "USD" }. Typed text is read back the same way.',
        },
        {
          name: "locale",
          type: "string",
          description:
            "The locale for formatting and reading numbers. Set it when you render on the server, so the server and the browser agree.",
        },
        {
          name: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "32, 36 or 40px tall, matching Input.",
        },
        {
          name: "name",
          type: "string",
          description: "Submits the plain number with a form, through a hidden input.",
        },
        {
          name: "incrementLabel",
          type: "string",
          default: '"Increase"',
          description: "The plus button's accessible name.",
        },
        {
          name: "decrementLabel",
          type: "string",
          default: '"Decrease"',
          description: "The minus button's accessible name.",
        },
        {
          name: "aria-invalid",
          type: "boolean",
          description: "Marks the number as wrong: the border and focus ring turn destructive.",
        },
        { name: "disabled", type: "boolean", default: "false", description: "Prevents changes." },
        {
          name: "readOnly",
          type: "boolean",
          default: "false",
          description: "Shows the number without letting it change.",
        },
      ],
    },
  ],
  primitives: ["Button", "Intl.NumberFormat"],
  related: ["input", "slider", "button"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/",
  ai: {
    whenToUse:
      "Use NumberInput for numbers people type or nudge: quantities, prices, percentages, counts. Use Slider when the exact number matters less than its place in a range, and Input for numbers that aren't amounts, like phone or card numbers.",
  },
} satisfies ItemMeta;
