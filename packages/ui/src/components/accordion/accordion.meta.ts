import type { ItemMeta } from "../../registry/schema.ts";

export default {
  name: "accordion",
  title: "Accordion",
  description:
    "An accessible React accordion for Next.js: sections that open and close with a smooth height change, as one card, separate cards or plain rows. Built on Radix.",
  kind: "component",
  category: "Navigation",
  tags: ["accordion", "collapsible", "faq", "disclosure", "expand collapse"],
  keywords: [
    "react accordion",
    "nextjs accordion",
    "tailwind accordion",
    "shadcn accordion",
    "animated accordion",
    "faq accordion",
    "accordion card",
    "react collapsible",
    "expand collapse react",
  ],
  status: "stable",
  addedAt: "2026-10-16",
  updatedAt: "2026-10-19",
  files: ["accordion.tsx"],
  usage: {
    code: `import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export function Faq() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="refunds">
        <AccordionTrigger>Can I get a refund?</AccordionTrigger>
        <AccordionContent>Yes, within 30 days of your purchase.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="shipping">
        <AccordionTrigger>How long does shipping take?</AccordionTrigger>
        <AccordionContent>Three to five working days.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}`,
  },
  demos: [
    {
      name: "variants",
      title: "Card, separated and plain",
      description:
        "One section open at a time. It glides open as its answer sharpens in and the chevron turns; separated sections also move apart from their neighbours.",
    },
    {
      name: "multiple",
      title: "Several open at once",
      description: 'With type="multiple", each section opens and closes on its own.',
    },
  ],
  // The page opens on the three looks side by side, tall enough for any section open (the demos reserve it);
  // the index card shows two closed questions
  preview: { height: "lg", card: "card" },
  api: [
    {
      name: "Accordion",
      description:
        "The root, built on Radix Accordion. Also accepts every Radix Accordion Root prop. Arrow keys move between the questions; Home and End jump to the ends.",
      props: [
        {
          name: "variant",
          type: '"card" | "separated" | "plain"',
          default: '"card"',
          description:
            "Card is one surface with a rule between sections. Separated makes each section its own card, and an open one moves apart from the rest. Plain is rows and rules only, for inside a surface that's already a card.",
        },
        {
          name: "type",
          type: '"single" | "multiple"',
          required: true,
          description: "Single opens one section at a time; multiple lets each open on its own.",
        },
        {
          name: "value",
          type: "string | string[]",
          description: "The open section (single) or sections (multiple), when you control them.",
        },
        {
          name: "defaultValue",
          type: "string | string[]",
          description: "The section or sections open at first.",
        },
        {
          name: "onValueChange",
          type: "(value: string) => void | (value: string[]) => void",
          description:
            "Called when a section opens or closes. Single sends an empty string once it's closed.",
        },
        {
          name: "collapsible",
          type: "boolean",
          default: "false",
          description: "Single only: the open section closes when its question is pressed again.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Prevents opening or closing any section.",
        },
      ],
    },
    {
      name: "AccordionItem",
      description:
        "One section: a row between quiet rules (card and plain), or its own small card (separated).",
      props: [
        {
          name: "value",
          type: "string",
          required: true,
          description: "Names the section in the accordion's value.",
        },
        {
          name: "disabled",
          type: "boolean",
          default: "false",
          description: "Prevents opening or closing it.",
        },
      ],
    },
    {
      name: "AccordionTrigger",
      description:
        "The question: a button inside a heading (h3), with aria-expanded. On hover the row tints (card and separated) and the chevron brightens; the chevron turns on a spring as the section opens.",
      props: [{ name: "children", type: "ReactNode", required: true, description: "The question." }],
    },
    {
      name: "AccordionContent",
      description:
        "The answer, a region named by its question. Its height glides on a spring while the answer follows through a blur, clipped only while it moves. Closed, it stays in the page, hidden until found, so find in page opens it.",
      props: [
        {
          name: "className",
          type: "string",
          description:
            "Applies to the inner block, so padding and text styles never fight the height animation.",
        },
      ],
    },
  ],
  primitives: ["Radix Accordion"],
  related: ["tabs"],
  ariaPattern: "https://www.w3.org/WAI/ARIA/apg/patterns/accordion/",
  ai: {
    whenToUse:
      'Use Accordion for FAQs and long pages split into sections people scan and open one by one. Use type="multiple" when sections are independent. Card is the default; separated suits a few large sections, and plain goes inside a surface that is already a card (a Card, Sheet or Dialog). Use Tabs when one panel at a time should show in the same place, and don\'t hide content people need to compare side by side.',
  },
} satisfies ItemMeta;
