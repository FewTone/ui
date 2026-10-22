"use client";

import { NumberTicker } from "@fewtone/ui/components/number-ticker/number-ticker";
import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useGlide, useSliderValue, useTrackPointer } from "./use-slider";

/*
 * Concept 3, the value thumb: a thin track and a small round thumb that, the moment you reach for it (hover,
 * focus, drag), grows into a pill with the value inside. The number is the thumb, so there's no tooltip to
 * float or follow. Back at rest it shrinks to a dot. General purpose, and quiet until it's used.
 * - The number flows (owner, 2026-10-22: "add the animation in the number"): our Number Ticker, so its digits
 *   roll as it changes and a quick drag counts through the values.
 * - The pill stretches along the track with its speed (up to a quarter, like Switch's thumb) and settles
 *   round when it stops; the track thickens while the pill is open.
 */

/** The thumb at rest, and grown into a pill, in px */
const DOT = 14;
const PILL = { width: 46, height: 26 };
/** Moving, the pill stretches along the track by up to a quarter, full at this speed in px a second */
const STRETCH = 0.25;
const FULL_SPEED = 900;
/** Open, the track thickens from 4px to 6px */
const THICK = 1.5;

export function ValueThumb() {
  const [value, setValue] = useState(64);
  const slider = useSliderValue({ value, onChange: setValue, label: "Speed", valueText: (v) => `${v}%` });
  const reduce = useReducedMotion() ?? false;
  const track = useRef<HTMLDivElement>(null);
  const size = useMotionValue(256);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const pointer = useTrackPointer((fraction) =>
    slider.set(slider.min + fraction * (slider.max - slider.min)),
  );
  const drawn = useGlide(slider.progress, pointer.dragging);
  const open = hovered || focused || pointer.dragging;

  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const measure = () => size.set(node.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [size]);

  const x = useTransform([drawn, size], ([p = 0, width = 0]: number[]) => p * width);
  // The faster it moves, the longer the pill; at rest, round again
  const speed = useVelocity(x);
  const stretch = useTransform(speed, (velocity) =>
    reduce ? 1 : 1 + STRETCH * Math.min(1, Math.abs(velocity) / FULL_SPEED),
  );

  return (
    <div
      ref={track}
      {...slider.props}
      {...pointer.handlers}
      role="slider"
      tabIndex={0}
      aria-valuenow={value}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocus={(event) => setFocused(event.currentTarget.matches(":focus-visible"))}
      onBlur={() => setFocused(false)}
      className="focus-ring relative h-11 w-64 cursor-pointer touch-none rounded-lg select-none"
    >
      <motion.span
        aria-hidden
        className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-muted"
        initial={false}
        animate={{ scaleY: open && !reduce ? THICK : 1 }}
        transition={reduce ? { duration: 0 } : spring.snappy}
      >
        <motion.span className="absolute inset-0 origin-left bg-primary" style={{ scaleX: drawn }} />
      </motion.span>
      {/* The thumb: a dot at rest, a pill with the value while it's reached for */}
      <motion.span
        aria-hidden
        className="absolute top-1/2 left-0 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-primary text-caption font-medium text-primary-foreground tabular-nums"
        style={{ x, scaleX: stretch }}
        initial={false}
        animate={open ? PILL : { width: DOT, height: DOT }}
        transition={reduce ? { duration: 0 } : spring.snappy}
      >
        <motion.span
          initial={false}
          animate={
            open
              ? { opacity: 1, filter: blur.shown, scale: 1 }
              : { opacity: 0, filter: reduce ? blur.shown : blur.hidden, scale: 0.6 }
          }
          transition={
            reduce
              ? { duration: 0 }
              : { duration: open ? duration.base : duration.fast, ease: open ? ease.out : ease.in }
          }
        >
          {/* The digits roll as the value changes; nothing rolls when the pill first opens */}
          <NumberTicker value={value} from={value} startOnView={false} />
        </motion.span>
      </motion.span>
    </div>
  );
}
