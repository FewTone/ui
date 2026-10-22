import { TextShimmer } from "@fewtone/ui/components/text-effects/text-effects";

/** The index card's preview: the shimmer, which keeps moving in a small tile. The page shows all three. */
export default function TextEffectsCard() {
  return <TextShimmer className="text-sm font-medium">Generating a reply…</TextShimmer>;
}
