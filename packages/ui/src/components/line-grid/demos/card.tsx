import { LineGrid } from "@fewtone/ui/components/line-grid/line-grid";

/**
 * The index card's preview: the grid alone, still. It reaches past the tile's padding (-inset-5), so the lines
 * run to the tile's edges and fade out there.
 */
export default function LineGridCard() {
  return (
    <div className="relative isolate h-28 w-full">
      <LineGrid size={24} className="-inset-5" />
    </div>
  );
}
