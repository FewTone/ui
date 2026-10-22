import { GradientDrift } from "@fewtone/ui/components/gradient-drift/gradient-drift";

/**
 * The index card's preview: the field alone. It reaches past the tile's padding (-inset-5), so the shapes fill the
 * whole tile.
 */
export default function GradientDriftCard() {
  return (
    <div className="relative isolate h-28 w-full">
      <GradientDrift className="-inset-5" />
    </div>
  );
}
