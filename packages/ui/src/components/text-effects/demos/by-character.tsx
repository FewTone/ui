import { TextReveal } from "@fewtone/ui/components/text-effects/text-effects";

/** Character by character, for a short line. Each word stays whole across a line break. */
export default function TextRevealByCharacter() {
  return (
    <TextReveal by="character" className="text-base font-semibold tracking-tight">
      Calm by default
    </TextReveal>
  );
}
