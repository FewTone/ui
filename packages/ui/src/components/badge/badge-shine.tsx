"use client";

import { duration } from "@fewtone/ui/lib/motion";
import { motion, useReducedMotion } from "motion/react";

/*
 * The lights travelling round a shine Badge's edge. The only client part of Badge, so Badge stays server-safe.
 * - How: a ring the size of the badge masks away everything but its 1px edge (a static mask, painted once).
 *   Inside it, a square holding a conic gradient (two lights on opposite sides, the site Beta badge's 15%
 *   spread) turns. Only a transform moves, so the browser composites it without repainting, and motion hands it
 *   to the Web Animations API, off the main thread. One lap takes 3s, the site badge's pace.
 * - The lights are `currentColor`, the label's colour, over the badge's own `border` edge: light on dark in dark
 *   mode, ink on light in light mode. A line only, no blur or spread, so it never reads as a glow.
 * - With reduced motion nothing turns, and the lights rest on the left and right.
 */

// Everything but a 1px ring is masked away, so the badge stays clear inside. Only the mask's alpha counts. The
// prefixed pair is for browsers without the standard property; the standard one comes last, so it wins.
const ring = {
  borderRadius: "inherit",
  WebkitMask: "linear-gradient(black 0 0) content-box, linear-gradient(black 0 0)",
  WebkitMaskComposite: "xor",
  mask: "linear-gradient(black 0 0) content-box exclude, linear-gradient(black 0 0)",
} as const;

// Two lights, each brightest at a quarter of the way round and gone 15% either side of it
const lights = {
  background:
    "conic-gradient(transparent 10%, currentColor 25%, transparent 40% 60%, currentColor 75%, transparent 90%)",
} as const;

function BadgeShine() {
  const reduce = useReducedMotion() ?? false;
  return (
    <span
      aria-hidden
      data-slot="badge-shine"
      className="pointer-events-none absolute -inset-px overflow-clip p-px"
      style={ring}
    >
      {/* A square half as wide again as the badge, centred, so it covers every corner as it turns */}
      <motion.span
        key={reduce ? "rest" : "turn"}
        className="absolute top-1/2 left-1/2 aspect-square w-3/2 -translate-x-1/2 -translate-y-1/2"
        style={lights}
        animate={reduce ? undefined : { transform: ["rotate(0turn)", "rotate(1turn)"] }}
        transition={{ duration: duration.slower * 6, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      />
    </span>
  );
}

export { BadgeShine };
