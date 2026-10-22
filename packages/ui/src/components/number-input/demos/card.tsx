import { NumberInput } from "@fewtone/ui/components/number-input/number-input";

/** The index card's preview: one quantity field. The page itself opens on a quantity and a price. */
export default function NumberInputCard() {
  return <NumberInput aria-label="Quantity" defaultValue={3} min={1} max={99} className="w-32" />;
}
