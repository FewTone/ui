"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { animate, useMotionValue, useReducedMotion } from "motion/react";
import { type KeyboardEvent, type PointerEvent, useEffect, useRef, useState } from "react";

/*
 * Lab only (owner, 2026-10-22: explore slider directions that have nothing to do with each other). Every
 * concept shares this: one value between min and max on a step, the WAI-ARIA slider's keys (arrows, Page
 * Up/Down, Home/End) and its attributes, so each one is a real slider whatever it looks like. Delete this
 * folder once a direction is chosen and built into packages/ui.
 */

export type SliderOptions = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
  /** What screen readers hear, for example "64%" */
  valueText?: (value: number) => string;
  orientation?: "horizontal" | "vertical";
};

/** Clamped to the range and rounded to the step */
export function settle(value: number, min: number, max: number, step: number) {
  const stepped = Math.round((value - min) / step) * step + min;
  const places = String(step).split(".")[1]?.length ?? 0;
  return Number(Math.min(max, Math.max(min, stepped)).toFixed(places));
}

export function useSliderValue({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  valueText,
  orientation = "horizontal",
}: SliderOptions) {
  const set = (next: number) => {
    const settled = settle(next, min, max, step);
    if (settled !== value) onChange(settled);
  };
  const big = Math.max(step, (max - min) / 10);

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowRight: step,
      ArrowUp: step,
      ArrowLeft: -step,
      ArrowDown: -step,
      PageUp: big,
      PageDown: -big,
    };
    if (event.key in moves) set(value + (moves[event.key] ?? 0));
    else if (event.key === "Home") set(min);
    else if (event.key === "End") set(max);
    else return;
    event.preventDefault();
  };

  return {
    set,
    min,
    max,
    step,
    progress: max === min ? 0 : (value - min) / (max - min),
    props: {
      role: "slider",
      tabIndex: 0,
      "aria-label": label,
      "aria-valuemin": min,
      "aria-valuemax": max,
      "aria-valuenow": value,
      "aria-valuetext": valueText?.(value),
      "aria-orientation": orientation,
      onKeyDown,
    },
  };
}

/** Pulling past a limit: the further it goes, the less it gives, never more than `most` */
export const resist = (over: number, most: number) =>
  Math.sign(over) * most * (1 - Math.exp(-Math.abs(over) / (most * 2)));

/**
 * Where the value is drawn, 0 to 1: it glides on spring.snappy to a clicked point or a key's step, and follows
 * at once while dragged. Nothing moves on first paint; reduced motion jumps.
 */
export function useGlide(progress: number, dragging: boolean) {
  const reduce = useReducedMotion() ?? false;
  const drawn = useMotionValue(progress);
  useEffect(() => {
    if (dragging || reduce) {
      drawn.jump(progress);
      return;
    }
    const run = animate(drawn, progress, spring.snappy);
    return () => run.stop();
  }, [progress, dragging, reduce, drawn]);
  return drawn;
}

/**
 * Press, drag and release on a track: reports the fraction along it (0 to 1, clamped) under the pointer. The
 * press itself counts as a click (it glides there); the moves after it are a drag (they follow at once).
 */
export function useTrackPointer(onFraction: (fraction: number) => void) {
  const [dragging, setDragging] = useState(false);
  const active = useRef(false);
  const fractionAt = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    return box.width > 0 ? Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) : 0;
  };
  return {
    dragging,
    handlers: {
      onPointerDown: (event: PointerEvent<HTMLElement>) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        active.current = true;
        onFraction(fractionAt(event));
      },
      onPointerMove: (event: PointerEvent<HTMLElement>) => {
        if (!active.current) return;
        setDragging(true);
        onFraction(fractionAt(event));
      },
      onPointerUp: () => {
        active.current = false;
        setDragging(false);
      },
    },
  };
}
