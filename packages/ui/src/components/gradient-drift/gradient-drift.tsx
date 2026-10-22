"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import { type ComponentProps, useEffect, useRef } from "react";

/*
 * A soft gradient field behind a hero or a section, whose shapes drift extremely slowly (owner's roadmap,
 * 2026-10-16: "Subtle animated backgrounds for heroes and sections"). Drop it straight inside a `relative isolate`
 * element; it fills it from behind.
 * - The brand's gradient rule: one hue, lightness only, about ±0.055, never several colours, no glow, no grain.
 *   Three soft shapes in `foreground` and `muted-foreground` (or `primary`, with tone="primary") over whatever is
 *   behind, the whole layer at 5% opacity (one group, so overlapping shapes can't add up past it). On FewTone's
 *   palette that's at most about +0.057 lightness in dark mode and −0.036 in light.
 * - The blur is baked in: each shape is a radial gradient that eases out to nothing along a half cosine, so it
 *   reads as a blurred pool with no rim. No CSS blur filter, animated or not.
 * - The drift: each shape slides a fifth of its size and grows or shrinks a little, there and back on ease.inOut,
 *   every 20s or more (40 × duration.slower). The three run at different paces (1, 1.3 and 1.7 times), so the field
 *   never repeats the same way in a short while. Only transforms move, composited by the browser.
 * - It only runs while it can be seen: paused off-screen (IntersectionObserver) and while the tab is hidden.
 * - With reduced motion, or speed 0, it's a still field. It renders on the server as that still field and starts
 *   drifting from it once React runs, so there's no jump.
 * - A layer, not content: aria-hidden, pointer-events none, and `-z-10` under its siblings. The parent needs
 *   `isolate` (or any stacking context), or the layer slips behind the parent's own background.
 * - The Web Animations API directly: endless loops that pause and play need nothing more.
 */

/** One way of the slowest shape's drift at speed 1, in ms */
const DRIFT = duration.slower * 40 * 1000;
const easing = `cubic-bezier(${ease.inOut.join(", ")})`;

/**
 * Stops for a radial falloff that eases out to nothing along a half cosine, from the centre to the edge.
 * A straight ramp shows a rim; this one has none.
 */
const falloff = Array.from({ length: 6 }, (_, step) => {
  const t = step / 5;
  const strength = Math.round(500 * (1 + Math.cos(Math.PI * t))) / 10;
  return `color-mix(in oklab, currentColor ${strength}%, transparent) ${Math.round(100 * t)}%`;
}).join(", ");
const pool = `radial-gradient(closest-side, ${falloff})`;

/**
 * The shapes: where each rests (in % of the layer, so they follow its proportions), which shade it takes, where
 * it drifts to (in % of its own size) and how slowly.
 */
const blobs = [
  {
    place: { left: "-15%", top: "-30%", width: "60%", height: "90%" },
    shade: 0,
    to: "translate(18%, 16%) scale(1.1)",
    pace: 1,
  },
  {
    place: { left: "50%", top: "-20%", width: "60%", height: "80%" },
    shade: 1,
    to: "translate(-16%, 22%) scale(0.92)",
    pace: 1.3,
  },
  {
    place: { left: "15%", top: "45%", width: "70%", height: "80%" },
    shade: 0,
    to: "translate(12%, -18%) scale(1.08)",
    pace: 1.7,
  },
] as const;

/** Neutral by default: two greys a step apart. Primary uses the theme's main colour, one hue. */
const tones = {
  neutral: ["text-foreground", "text-muted-foreground"],
  primary: ["text-primary", "text-primary"],
} as const;

export type GradientDriftProps = Omit<ComponentProps<"div">, "children"> & {
  /** Neutral greys, or the theme's primary colour */
  tone?: keyof typeof tones;
  /** The field's opacity, from 0 to 1. The default keeps it within the brand's ±0.055 lightness */
  opacity?: number;
  /** How fast it drifts: 1 is the default calm pace, 2 twice as fast. 0 holds it still */
  speed?: number;
};

/**
 * A slowly drifting gradient field that fills its parent from behind. Put it first inside a
 * `relative isolate` section.
 */
function GradientDrift({
  tone = "neutral",
  opacity = 0.05,
  speed = 1,
  className,
  style,
  ref,
  ...props
}: GradientDriftProps) {
  const reduce = useReducedMotion() ?? false;
  const layer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = layer.current;
    if (!node || reduce || !(speed > 0)) return;
    const animations: Animation[] = [];
    Array.from(node.children).forEach((part, index) => {
      const blob = blobs[index];
      if (!blob || typeof part.animate !== "function") return;
      animations.push(
        part.animate([{ transform: "translate(0%, 0%) scale(1)" }, { transform: blob.to }], {
          duration: (DRIFT * blob.pace) / speed,
          direction: "alternate",
          iterations: Number.POSITIVE_INFINITY,
          easing,
        }),
      );
    });

    let onScreen = true;
    const update = () => {
      for (const animation of animations) {
        if (onScreen && !document.hidden) animation.play();
        else animation.pause();
      }
    };
    const observer =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver((entries) => {
            onScreen = entries.at(-1)?.isIntersecting ?? true;
            update();
          })
        : undefined;
    observer?.observe(node);
    document.addEventListener("visibilitychange", update);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
      for (const animation of animations) animation.cancel();
    };
  }, [reduce, speed]);

  return (
    <div
      ref={(node) => {
        layer.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      aria-hidden
      data-slot="gradient-drift"
      data-tone={tone}
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
      style={{ opacity, ...style }}
      {...props}
    >
      {blobs.map((blob) => (
        <div
          key={blob.pace}
          data-slot="gradient-drift-blob"
          className={cn("absolute", tones[tone][blob.shade])}
          style={{ ...blob.place, backgroundImage: pool }}
        />
      ))}
    </div>
  );
}

export { GradientDrift };
