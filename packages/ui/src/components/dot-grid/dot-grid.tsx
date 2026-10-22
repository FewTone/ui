import { DotGridHighlight } from "@fewtone/ui/components/dot-grid/dot-grid-highlight";
import { cn } from "@fewtone/ui/lib/utils";
import type { ComponentProps } from "react";

/*
 * A fine dot pattern behind a hero or a section (owner's roadmap, 2026-10-16: "Subtle animated backgrounds for
 * heroes and sections"). Drop it straight inside a `relative isolate` element; it fills it from behind.
 * - One CSS background: a radial-gradient dot repeated every `size` px, drawn in the text colour
 *   (`text-muted-foreground`, so a `text-*` class recolours it) at a low opacity. Neutral by default, no glow.
 * - It dissolves towards the edges through a radial mask (`fade`), so it never ends on a hard line.
 * - Server-safe: the pattern is plain HTML and CSS, so it renders without JavaScript. The one optional motion,
 *   `highlight`, is DotGridHighlight, a small client part; without it, no JavaScript ships for the grid.
 * - A layer, not content: aria-hidden, pointer-events none, and `-z-10` under its siblings. The parent needs
 *   `isolate` (or any stacking context), or the layer slips behind the parent's own background.
 */

/**
 * Stops for a radial falloff that eases out to nothing along a half cosine, from `start` (%) to the edge.
 * A straight ramp shows a rim where it starts; this one has none.
 */
function falloff(color: string, start = 0) {
  return Array.from({ length: 6 }, (_, step) => {
    const t = step / 5;
    const strength = Math.round(500 * (1 + Math.cos(Math.PI * t))) / 10;
    return `color-mix(in oklab, ${color} ${strength}%, transparent) ${Math.round(start + (100 - start) * t)}%`;
  }).join(", ");
}

/** The edge fade: solid in the middle, gone at the edges (a mask, so only its alpha counts) */
const fadeMask = `radial-gradient(ellipse closest-side at center, ${falloff("black", 30)})`;

/** One dot per tile, in the current text colour, with a 1px soft edge so it stays round at any size */
const dots = (dotSize: number) => {
  const radius = dotSize / 2;
  return `radial-gradient(circle, currentColor ${Math.max(0, radius - 0.5)}px, transparent ${radius + 0.5}px)`;
};

export type DotGridProps = Omit<ComponentProps<"div">, "children"> & {
  /** The distance between dots, in px */
  size?: number;
  /** The diameter of each dot, in px */
  dotSize?: number;
  /** Fade the pattern out towards the edges */
  fade?: boolean;
  /** The pattern's opacity, from 0 to 1 */
  opacity?: number;
  /** Brighten the dots near the pointer (mouse only, off with reduced motion) */
  highlight?: boolean;
};

/**
 * A dot pattern that fills its parent from behind. Put it first inside a `relative isolate` section.
 * Its colour is the text colour: `text-muted-foreground` by default, any `text-*` class to change it.
 */
function DotGrid({
  size = 16,
  dotSize = 2,
  fade = true,
  opacity = 0.4,
  highlight = false,
  className,
  style,
  ...props
}: DotGridProps) {
  return (
    <div
      aria-hidden
      data-slot="dot-grid"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden text-muted-foreground",
        className,
      )}
      style={{
        opacity,
        backgroundImage: dots(dotSize),
        backgroundSize: `${size}px ${size}px`,
        ...(fade ? { maskImage: fadeMask, WebkitMaskImage: fadeMask } : {}),
        ...style,
      }}
      {...props}
    >
      {highlight ? (
        <DotGridHighlight
          size={size}
          pattern={dots(dotSize)}
          mask={`radial-gradient(closest-side, ${falloff("black")})`}
        />
      ) : null}
    </div>
  );
}

export { DotGrid };
