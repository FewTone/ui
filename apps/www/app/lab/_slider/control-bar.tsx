"use client";

import { duration, ease, spring, swap } from "@fewtone/ui/lib/motion";
import { Volume1Icon, Volume2Icon, VolumeIcon, VolumeXIcon } from "lucide-react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { resist, useSliderValue } from "./use-slider";

/*
 * Concept 1, the control bar (iOS Control Center): no thumb, the fill is the control. Dragging moves the value
 * by how far you drag, not to where you press, so a tap never jumps it. The label and value invert where the
 * fill covers them (a second copy, clipped to the fill). The icon changes with the level. Past either end the
 * bar stretches like elastic and snaps back on release. A small handle at the fill's edge shows what moves and
 * grows while pressed; the bar brightens under the pointer.
 */

const MOST = 10;

export function ControlBar() {
  const [value, setValue] = useState(64);
  const slider = useSliderValue({ value, onChange: setValue, label: "Volume", valueText: (v) => `${v}%` });
  const reduce = useReducedMotion() ?? false;
  const box = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; value: number } | null>(null);
  const fill = useMotionValue(slider.progress);
  const pull = useMotionValue(0);
  const [dragging, setDragging] = useState(false);

  // The fill follows the value: on the spring for keys, at once while dragging
  useEffect(() => {
    if (dragging || reduce) fill.jump(slider.progress);
    else {
      const run = animate(fill, slider.progress, spring.snappy);
      return () => run.stop();
    }
  }, [slider.progress, dragging, reduce, fill]);

  const width = useTransform(fill, (p) => `${p * 100}%`);
  const clip = useTransform(fill, (p) => `inset(0 ${100 - p * 100}% 0 0)`);
  const stretch = useTransform(pull, (by) => 1 + Math.abs(by) / 256);
  const squash = useTransform(pull, (by) => 1 - Math.abs(by) / 400);
  const origin = useTransform(pull, (by) => (by >= 0 ? 0 : 1));

  const Icon = value === 0 ? VolumeXIcon : value < 34 ? VolumeIcon : value < 67 ? Volume1Icon : Volume2Icon;
  const level = value === 0 ? "off" : value < 34 ? "low" : value < 67 ? "mid" : "high";

  const content = (inverted: boolean) => (
    <span
      className={`absolute inset-0 flex items-center justify-between px-4 text-label font-medium ${
        inverted ? "text-primary-foreground" : "text-foreground"
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="grid size-4">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={level}
              className="col-start-1 row-start-1"
              initial={reduce ? { opacity: 0 } : swap.initial}
              animate={reduce ? { opacity: 1 } : swap.animate}
              exit={reduce ? { opacity: 0 } : swap.exit}
              transition={{ duration: duration.base, ease: ease.out }}
            >
              <Icon aria-hidden className="size-4" />
            </motion.span>
          </AnimatePresence>
        </span>
        Volume
      </span>
      <span className="tabular-nums">{value}%</span>
    </span>
  );

  return (
    <motion.div
      ref={box}
      {...slider.props}
      // Hovered, the bar brightens a step, so it reads as something to grab
      className="focus-ring relative h-11 w-64 cursor-grab touch-none overflow-hidden rounded-xl bg-muted transition-colors duration-(--duration-fast) ease-out select-none hover:bg-accent active:cursor-grabbing"
      style={{ scaleX: stretch, scaleY: squash, originX: origin }}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { x: event.clientX, value };
        setDragging(true);
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        const node = box.current;
        if (!start || !node) return;
        const range = slider.max - slider.min;
        const wanted = start.value + ((event.clientX - start.x) / node.offsetWidth) * range;
        slider.set(wanted);
        // Past an end, the bar gives
        const over =
          wanted > slider.max ? wanted - slider.max : wanted < slider.min ? wanted - slider.min : 0;
        if (!reduce) pull.set(resist((over / range) * node.offsetWidth, MOST));
      }}
      onPointerUp={() => {
        drag.current = null;
        setDragging(false);
        animate(pull, 0, reduce ? { duration: 0 } : spring.bouncy);
      }}
    >
      {content(false)}
      <motion.span aria-hidden className="absolute inset-y-0 start-0 bg-primary" style={{ width }}>
        {/* A handle at the fill's edge, so it's clear what moves; pressed, it grows to meet the hand */}
        <motion.span
          className="absolute inset-y-0 end-1.5 my-auto h-4 w-1 rounded-full bg-primary-foreground/50"
          animate={{ scaleY: dragging && !reduce ? 1.5 : 1, opacity: value === 0 ? 0 : 1 }}
          transition={reduce ? { duration: 0 } : spring.snappy}
        />
      </motion.span>
      {/* The same content again, in the fill's colours, shown only where the fill is */}
      <motion.span aria-hidden className="absolute inset-0" style={{ clipPath: clip }}>
        {content(true)}
      </motion.span>
    </motion.div>
  );
}
