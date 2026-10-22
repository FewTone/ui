import { TextReveal, TextShimmer, Typewriter } from "@fewtone/ui/components/text-effects/text-effects";

/*
 * The three effects side by side, named underneath. Replay plays the reveal and the typing again; the shimmer
 * keeps sweeping.
 */
export default function TextEffectsOverview() {
  return (
    <ul className="grid w-full max-w-2xl grid-cols-1 items-end justify-items-center gap-x-10 gap-y-8 sm:grid-cols-3">
      <li className="flex flex-col items-center gap-2">
        <TextShimmer className="text-sm font-medium">Generating a reply…</TextShimmer>
        <span className="text-xs text-muted-foreground">Shimmer</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <TextReveal className="text-base font-semibold tracking-tight">Ship it this afternoon</TextReveal>
        <span className="text-xs text-muted-foreground">Reveal</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        {/* The longest phrase, invisible, holds the width, so the line doesn't re-centre as it types */}
        <span className="grid text-base font-semibold tracking-tight">
          <span aria-hidden className="invisible col-start-1 row-start-1">
            Build dialogs
          </span>
          <span className="col-start-1 row-start-1">
            Build <Typewriter phrases={["forms", "menus", "dialogs"]} />
          </span>
        </span>
        <span className="text-xs text-muted-foreground">Typewriter</span>
      </li>
    </ul>
  );
}
