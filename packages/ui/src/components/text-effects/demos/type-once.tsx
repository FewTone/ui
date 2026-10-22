import { Typewriter } from "@fewtone/ui/components/text-effects/text-effects";

/** One phrase, typed once: the caret breathes for a moment, then fades away. */
export default function TypewriterOnce() {
  return <Typewriter phrases="Your workspace is ready." className="text-sm" />;
}
