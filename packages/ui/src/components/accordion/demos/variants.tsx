import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  type AccordionVariant,
} from "@fewtone/ui/components/accordion/accordion";

const variants: { variant: AccordionVariant; label: string }[] = [
  { variant: "card", label: "Card" },
  { variant: "separated", label: "Separated" },
  { variant: "plain", label: "Plain" },
];

const questions = [
  {
    value: "accessible",
    question: "Is it accessible?",
    answer: "Yes. It follows the WAI-ARIA accordion pattern.",
  },
  {
    value: "nextjs",
    question: "Does it work with Next.js?",
    answer: "Yes, server components included.",
  },
  {
    value: "style",
    question: "Can I restyle it?",
    answer: "Yes. It's your code, styled with Tailwind CSS.",
  },
];

/*
 * The three looks side by side, named underneath, the first section open in each. Each one hangs from the top
 * of a box as tall as its tallest state (any section open, two-line answers), so opening and closing never
 * changes the preview's height or moves the labels.
 */
export default function AccordionVariants() {
  return (
    <ul className="flex w-full flex-wrap items-start justify-center gap-8">
      {variants.map(({ variant, label }) => (
        <li key={variant} className="flex w-64 flex-col gap-4">
          <div className="min-h-64">
            <Accordion type="single" collapsible defaultValue="accessible" variant={variant}>
              {questions.map(({ value, question, answer }) => (
                <AccordionItem key={value} value={value}>
                  <AccordionTrigger>{question}</AccordionTrigger>
                  <AccordionContent>{answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          <span className="text-center text-xs text-muted-foreground">{label}</span>
        </li>
      ))}
    </ul>
  );
}
