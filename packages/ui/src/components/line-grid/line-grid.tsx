import { LineGridPan } from "@fewtone/ui/components/line-grid/line-grid-pan";
import { cn } from "@fewtone/ui/lib/utils";
import type { ComponentProps, CSSProperties } from "react";

/*
 * Thin grid lines behind a hero or a section (owner's roadmap, 2026-10-16: "Subtle animated backgrounds for
 * heroes and sections"). Drop it straight inside a `relative isolate` element; it fills it from behind.
 * - Two CSS gradients repeated every `size` px draw 1px lines in the text colour (`text-border`, the colour
 *   shadcn uses for lines, so a `text-*` class recolours it). Neutral by default, no glow.
 * - It dissolves towards the edges through a radial mask (`fade`) on the layer, which stays put while the lines
 *   move under it, so the edges never travel.
 * - The lines sit on a layer one cell larger up and to the left. Static, that changes nothing (the lines fall on
 *   the same pixels); panning, it's what lets the lines slide one cell and loop without a seam.
 * - Server-safe: the lines are plain HTML and CSS, so they render without JavaScript. The optional pan is
 *   LineGridPan, a small client part; without `pan`, no JavaScript ships for the grid.
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

const lines =
  "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)";

export type LineGridProps = Omit<ComponentProps<"div">, "children"> & {
  /** The size of each cell, in px */
  size?: number;
  /** Fade the lines out towards the edges */
  fade?: boolean;
  /** The lines' opacity, from 0 to 1 */
  opacity?: number;
  /** Slide the grid slowly and endlessly, one cell at a time (off with reduced motion) */
  pan?: boolean;
  /** How fast it pans: 1 is a cell every 12 seconds, 2 twice as fast. 0 holds it still */
  speed?: number;
};

/**
 * Grid lines that fill their parent from behind. Put it first inside a `relative isolate` section.
 * Their colour is the text colour: `text-border` by default, any `text-*` class to change it.
 */
function LineGrid({
  size = 40,
  fade = true,
  opacity = 1,
  pan = false,
  speed = 1,
  className,
  style,
  ...props
}: LineGridProps) {
  const grid: CSSProperties = {
    top: -size,
    left: -size,
    right: 0,
    bottom: 0,
    backgroundImage: lines,
    backgroundSize: `${size}px ${size}px`,
  };

  return (
    <div
      aria-hidden
      data-slot="line-grid"
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden text-border", className)}
      style={{
        opacity,
        ...(fade ? { maskImage: fadeMask, WebkitMaskImage: fadeMask } : {}),
        ...style,
      }}
      {...props}
    >
      {pan ? (
        <LineGridPan size={size} speed={speed} style={grid} />
      ) : (
        <div data-slot="line-grid-lines" className="absolute" style={grid} />
      )}
    </div>
  );
}

export { LineGrid };
