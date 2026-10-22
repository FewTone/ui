"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useGlide, useSliderValue, useTrackPointer } from "./use-slider";

/*
 * Concept 2, the split track (Android's Material 3 Expressive slider): a thick track split round a tall, thin
 * handle, filled before it and empty after, each part rounded where it meets the gap, with a dot marking the
 * far end. Pressing slims the handle and the gap closes in. General purpose: volume, brightness, any range.
 */

/** The handle's width, the gap either side of it, and the track's thickness, in px */
const HANDLE = 4;
const GAP = 6;
/** The radius where a part meets the gap: smaller than the outer ends, so the split reads as a cut */
const INNER = 4;

export function SplitTrack() {
  const [value, setValue] = useState(64);
  const slider = useSliderValue({
    value,
    onChange: setValue,
    label: "Brightness",
    valueText: (v) => `${v}%`,
  });
  const reduce = useReducedMotion() ?? false;
  const track = useRef<HTMLDivElement>(null);
  // The track's width, as a motion value so the drawn parts always use the latest measure
  const size = useMotionValue(256);
  const [pressed, setPressed] = useState(false);
  const pointer = useTrackPointer((fraction) =>
    slider.set(slider.min + fraction * (slider.max - slider.min)),
  );
  const drawn = useGlide(slider.progress, pointer.dragging);

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const measure = () => size.set(node.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [size]);

  // The gap widens a little at rest and closes in while pressed
  const gap = useMotionValue(GAP);
  useEffect(() => {
    gap.set(pressed && !reduce ? GAP - 2 : GAP);
  }, [pressed, reduce, gap]);

  // Each part is the whole track, clipped to its side of the handle (clip-path's own corners round the cut)
  const before = useTransform([drawn, gap, size], ([p = 0, g = GAP, width = 0]: number[]) => {
    const right = Math.max(0, width - (p * width - HANDLE / 2 - g));
    return `inset(0 ${Math.min(width, right)}px 0 0 round 999px ${INNER}px ${INNER}px 999px)`;
  });
  const after = useTransform([drawn, gap, size], ([p = 0, g = GAP, width = 0]: number[]) => {
    const left = Math.max(0, p * width + HANDLE / 2 + g);
    return `inset(0 0 0 ${Math.min(width, left)}px round ${INNER}px 999px 999px ${INNER}px)`;
  });
  const handleX = useTransform([drawn, size], ([p = 0, width = 0]: number[]) => p * width - HANDLE / 2);
  // The end's dot hides once the handle is upon it
  const dot = useTransform(drawn, (p) => (p > 0.94 ? 0 : 1));

  return (
    <div
      ref={track}
      {...slider.props}
      {...pointer.handlers}
      onPointerDown={(event) => {
        setPressed(true);
        pointer.handlers.onPointerDown(event);
      }}
      onPointerUp={() => {
        setPressed(false);
        pointer.handlers.onPointerUp();
      }}
      className="focus-ring relative h-11 w-64 cursor-pointer touch-none rounded-lg select-none"
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-primary"
        style={{ clipPath: before }}
      />
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-muted"
        style={{ clipPath: after }}
      />
      {/* The far end's stop */}
      <motion.span
        aria-hidden
        className="absolute end-1.5 top-1/2 size-1 -translate-y-1/2 rounded-full bg-primary/60"
        style={{ opacity: dot }}
      />
      {/* The handle: tall and thin; pressed, it slims */}
      <motion.span
        aria-hidden
        className="absolute top-0 left-0 h-full rounded-full bg-primary"
        style={{ x: handleX, width: HANDLE }}
        animate={{ scaleX: pressed && !reduce ? 0.5 : 1 }}
        transition={reduce ? { duration: 0 } : spring.snappy}
      />
    </div>
  );
}
