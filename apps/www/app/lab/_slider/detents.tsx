"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useGlide, useSliderValue, useTrackPointer } from "./use-slider";

/*
 * Concept 4, detents: a classic track with a dot at every tenth. Dragged near a dot, the thumb snaps to it,
 * with a small pulse as it lands, like a click in a dial; between the dots any value still works. The dots
 * the range has passed turn light. General purpose, with round numbers easy to hit.
 */

const MARKS = 10;
/** How close, in steps, a drag has to come to a dot to snap onto it */
const PULL = 2;

export function Detents() {
  const [value, setValue] = useState(60);
  const slider = useSliderValue({ value, onChange: setValue, label: "Zoom", valueText: (v) => `${v}%` });
  const reduce = useReducedMotion() ?? false;
  const track = useRef<HTMLDivElement>(null);
  const knob = useRef<HTMLSpanElement>(null);
  const size = useMotionValue(256);
  const every = (slider.max - slider.min) / MARKS;
  const pointer = useTrackPointer((fraction) => {
    const wanted = slider.min + fraction * (slider.max - slider.min);
    const mark = Math.round((wanted - slider.min) / every) * every + slider.min;
    slider.set(Math.abs(wanted - mark) <= PULL ? mark : wanted);
  });
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

  // Landing on a dot, the thumb gives a small pulse: a click you can see
  const last = useRef(value);
  useEffect(() => {
    const was = last.current;
    last.current = value;
    const onMark = (value - slider.min) % every === 0;
    if (!onMark || was === value || reduce || !knob.current) return;
    animate(knob.current, { scale: [1, 1.25, 1] }, { duration: duration.base, ease: ease.out });
  }, [value, every, slider.min, reduce]);

  const x = useTransform([drawn, size], ([p = 0, width = 0]: number[]) => p * width);

  return (
    <div className="flex w-64 flex-col gap-2">
      <div
        ref={track}
        {...slider.props}
        {...pointer.handlers}
        className="focus-ring relative h-8 w-full cursor-pointer touch-none rounded-lg select-none"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-muted"
        >
          <motion.span className="absolute inset-0 origin-left bg-primary" style={{ scaleX: drawn }} />
        </span>
        {Array.from({ length: MARKS + 1 }, (_, index) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: the marks are fixed places
            key={index}
            aria-hidden
            className={`absolute top-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors duration-(--duration-fast) ease-out ${
              index * every + slider.min <= value ? "bg-primary-foreground/70" : "bg-foreground/30"
            }`}
            style={{ left: `${(index / MARKS) * 100}%` }}
          />
        ))}
        <motion.span
          aria-hidden
          className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2"
          style={{ x }}
        >
          <span ref={knob} className="block size-5 rounded-full border-2 border-primary bg-background" />
        </motion.span>
      </div>
      <div aria-hidden className="flex justify-between text-caption text-muted-foreground tabular-nums">
        <span>{slider.min}%</span>
        <span className="text-foreground">{value}%</span>
        <span>{slider.max}%</span>
      </div>
    </div>
  );
}
