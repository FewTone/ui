import { Slider } from "@fewtone/ui/components/slider/slider";

/** The index card's preview: one slider. The page itself opens on a single value and a range. */
export default function SliderCard() {
  return <Slider aria-label="Volume" defaultValue={[60]} className="max-w-40" />;
}
