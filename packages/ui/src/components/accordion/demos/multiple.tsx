import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fewtone/ui/components/accordion/accordion";

/**
 * Each section opens and closes on its own. The box is as tall as all three open, so the preview never
 * changes height.
 */
export default function AccordionMultiple() {
  return (
    <div className="min-h-72 w-full max-w-md">
      <Accordion type="multiple" defaultValue={["shipping"]}>
        <AccordionItem value="shipping">
          <AccordionTrigger>Shipping</AccordionTrigger>
          <AccordionContent>Orders arrive in three to five working days.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="returns">
          <AccordionTrigger>Returns</AccordionTrigger>
          <AccordionContent>Send it back within 30 days for a full refund.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="warranty">
          <AccordionTrigger>Warranty</AccordionTrigger>
          <AccordionContent>Two years on every part, with free repairs.</AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
