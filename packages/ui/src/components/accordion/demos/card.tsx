import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fewtone/ui/components/accordion/accordion";

/** The index card's preview: two closed questions. The page itself opens on a longer FAQ. */
export default function AccordionCard() {
  return (
    <Accordion type="single" collapsible className="w-64">
      <AccordionItem value="accessible">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>Yes. It follows the WAI-ARIA accordion pattern.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="nextjs">
        <AccordionTrigger>Does it work with Next.js?</AccordionTrigger>
        <AccordionContent>Yes, server components included.</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
