"use client";

import { duration, ease, spring } from "@fewtone/ui/lib/motion";
import {
  type AnimationPlaybackControls,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";

/*
 * The dots near the pointer brightening: the only client part of Dot Grid, so the grid itself stays server-safe.
 * - What it is: one round window, a few hundred px across, that follows the pointer. Inside it, the same dots in
 *   `foreground`, a step brighter (darker in light mode) than the grid's: lightness only, no colour and no glow.
 *   Its edge eases out along the same half-cosine falloff as the grid's fade, so there's no rim.
 * - Cheap: no per-dot JavaScript. The window moves with a transform, and its dots are pulled back by the same
 *   amount, modulo one tile, so they sit exactly on the grid's dots wherever the window is. Both offsets are
 *   whole pixels, so the dots stay crisp.
 * - The pointer: it listens on the grid's parent (the grid ignores the pointer). The window follows on
 *   spring.smooth, a soft lag that reads as light, not a cursor. Arriving, it appears where the pointer is (placed
 *   with jump(), so the spring doesn't sweep it in from where it last left) and fades in; leaving, it fades out.
 *   Mouse only, as hover highlights are: a touch has no hover.
 * - Positions are in the grid's own pixels, scaled back from on-screen ones, so it lines up inside CSS zoom or a
 *   scaled parent too.
 * - With reduced motion it never shows. It's still rendered, invisible, so the server and client HTML match.
 */

/** How far the window reaches from the pointer, in tiles */
const REACH = 10;

/** a mod b, always positive (JavaScript's % keeps the sign of a) */
const wrap = (a: number, b: number) => ((a % b) + b) % b;

function DotGridHighlight({ size, pattern, mask }: { size: number; pattern: string; mask: string }) {
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const radius = size * REACH;

  // Where the pointer is, and the window following it on a soft spring
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, spring.smooth);
  const y = useSpring(pointerY, spring.smooth);
  const opacity = useMotionValue(0);
  // The window's corner, centred on the spring, in whole pixels
  const left = useTransform(x, (value) => Math.round(value - radius));
  const top = useTransform(y, (value) => Math.round(value - radius));
  // The bright dots, pulled back onto the grid's own tiles
  const patternX = useTransform(left, (value) => -wrap(value, size));
  const patternY = useTransform(top, (value) => -wrap(value, size));

  useEffect(() => {
    const node = ref.current;
    const layer = node?.parentElement;
    const area = layer?.parentElement;
    if (!node || !layer || !area || reduce) return;

    let shown = false;
    let fading: AnimationPlaybackControls | undefined;
    const fadeTo = (value: number) => {
      fading?.stop();
      fading = animate(opacity, value, { duration: duration.slow, ease: ease.out });
    };

    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = layer.getBoundingClientRect();
      const scale = layer.offsetWidth > 0 ? box.width / layer.offsetWidth : 1;
      const pointer = { x: (event.clientX - box.left) / scale, y: (event.clientY - box.top) / scale };
      if (shown) {
        pointerX.set(pointer.x);
        pointerY.set(pointer.y);
        return;
      }
      shown = true;
      pointerX.jump(pointer.x);
      pointerY.jump(pointer.y);
      x.jump(pointer.x);
      y.jump(pointer.y);
      fadeTo(1);
    };
    const leave = () => {
      if (!shown) return;
      shown = false;
      fadeTo(0);
    };

    area.addEventListener("pointermove", move);
    area.addEventListener("pointerleave", leave);
    return () => {
      area.removeEventListener("pointermove", move);
      area.removeEventListener("pointerleave", leave);
      fading?.stop();
      opacity.jump(0);
    };
  }, [reduce, pointerX, pointerY, x, y, opacity]);

  return (
    <motion.div
      ref={ref}
      data-slot="dot-grid-highlight"
      className="absolute top-0 left-0 overflow-hidden text-foreground"
      style={{
        x: left,
        y: top,
        opacity,
        width: radius * 2,
        height: radius * 2,
        maskImage: mask,
        WebkitMaskImage: mask,
      }}
    >
      <motion.div
        className="absolute top-0 left-0"
        style={{
          x: patternX,
          y: patternY,
          width: radius * 2 + size,
          height: radius * 2 + size,
          backgroundImage: pattern,
          backgroundSize: `${size}px ${size}px`,
        }}
      />
    </motion.div>
  );
}

export { DotGridHighlight };
