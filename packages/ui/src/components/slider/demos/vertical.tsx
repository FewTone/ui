import { Slider } from "@fewtone/ui/components/slider/slider";

const bands = [
  { label: "Bass", value: 60 },
  { label: "Mid", value: 40 },
  { label: "Treble", value: 70 },
];

/**
 * orientation="vertical": at least 11rem tall, filling a taller container. Up and Right raise the value,
 * and the thumb's pill shows the value.
 */
export default function SliderVertical() {
  return (
    <ul className="flex items-start justify-center gap-16">
      {bands.map((band) => (
        <li key={band.label} className="flex flex-col items-center gap-3">
          <Slider orientation="vertical" aria-label={band.label} defaultValue={[band.value]} />
          <span className="text-xs text-muted-foreground">{band.label}</span>
        </li>
      ))}
    </ul>
  );
}
