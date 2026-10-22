import { DotGrid } from "@fewtone/ui/components/dot-grid/dot-grid";

/**
 * The index card's preview: the grid alone. It reaches past the tile's padding (-inset-5), so the dots run to the
 * tile's edges and fade out there.
 */
export default function DotGridCard() {
  return (
    <div className="relative isolate h-28 w-full">
      <DotGrid className="-inset-5" />
    </div>
  );
}
