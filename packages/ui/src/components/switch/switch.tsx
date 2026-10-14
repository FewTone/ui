"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { type ComponentProps, useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * The thumb's motion, start to finish (owner, 2026-10-14):
 * - Hover: the thumb stays at its end and stretches 2px towards the other side, as if it wants to go there.
 * - Press: it stretches further.
 * - Change: it travels still stretched, then settles round at the new end, so it moves like something
 *   soft rather than sliding. A keyboard change stretches the same way.
 * - The "on" colour is a pill under the thumb, driven only by the thumb's position, so going off is going
 *   on played backwards (owner, 2026-10-14):
 *   - It always ends at the thumb's far edge. Going on it sweeps across with the thumb; going off the grey
 *     follows in behind the thumb the same way.
 *   - Its opacity follows the thumb's progress. Going on, it fades in over the start of the trip. Going
 *     off, it stays solid most of the way, then reaches zero exactly as the thumb arrives, so no ring of
 *     it is left around the thumb.
 * - No shadows.
 *
 * The thumb is placed with numbers rather than measured: `x` from the track's inner width, and its own
 * width (a small absolutely positioned pill, so nothing else reflows), both motion values on
 * spring.snappy, with the colour derived from them. Measuring would break inside anything scaled or
 * zoomed, such as a zoomed preview or a dialog scaling in. The numbers are in rem and match the size
 * classes. With reduced motion the thumb jumps and doesn't stretch.
 */

const switchVariants = cva(
  [
    "relative isolate inline-flex shrink-0 cursor-pointer overflow-hidden rounded-full bg-input",
    "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-7",
        md: "h-5 w-9",
      },
    },
    defaultVariants: { size: "md" },
  },
);

/**
 * The thumb, in rem, matching the track classes above: the track's width less its 0.125rem padding on
 * each side (`inner`), and the thumb's width at rest and stretched. Its height is the class.
 */
const thumbs = {
  sm: { height: "h-3", inner: 1.5, rest: 0.75, stretched: 1 },
  md: { height: "h-4", inner: 2, rest: 1, stretched: 1.25 },
} as const;

/** How far the thumb stretches on hover (2px) */
const HOVER_STRETCH = 0.125;
/** How long the thumb stays stretched after a change, while it travels */
const TRAVEL_MS = 140;
/**
 * The colour's opacity from the thumb's progress (0 off, 1 on): 1.6√p, fitted to the original on fade. The
 * last 3% of the trip (half a pixel) counts as home, so the spring's slow settle leaves no faint ring.
 */
const fillOpacityAt = (progress: number) =>
  Math.min(1, 1.6 * Math.sqrt(Math.max(0, (progress - 0.03) / 0.97)));

export type SwitchProps = ComponentProps<typeof SwitchPrimitive.Root> & VariantProps<typeof switchVariants>;

/**
 * An on/off switch for settings that apply right away, built on Radix Switch (role="switch").
 * Give it a visible label (`<label htmlFor>`).
 */
function Switch({
  className,
  size,
  checked,
  defaultChecked,
  disabled,
  onCheckedChange,
  onPointerDown,
  onPointerUp,
  onPointerEnter,
  onPointerLeave,
  ...props
}: SwitchProps) {
  // Mirror the state so the thumb knows when it changed, controlled or not
  const [uncontrolled, setUncontrolled] = useState(defaultChecked ?? false);
  const on = checked ?? uncontrolled;
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [travelling, setTravelling] = useState(false);
  const root = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const thumb = thumbs[size ?? "md"];

  // After a change the thumb stays stretched for the trip, then settles round at the new end
  const previous = useRef(on);
  useEffect(() => {
    if (previous.current === on) return;
    previous.current = on;
    if (reduceMotion) return;
    setTravelling(true);
    const timer = setTimeout(() => setTravelling(false), TRAVEL_MS);
    return () => clearTimeout(timer);
  }, [on, reduceMotion]);

  // Pressed or travelling: fully stretched. Hovered: a little. Never with reduced motion or when disabled.
  const width = reduceMotion
    ? thumb.rest
    : pressed || travelling
      ? thumb.stretched
      : hovered && !disabled
        ? thumb.rest + HOVER_STRETCH
        : thumb.rest;
  // Off: at the start. On: at the end, its far edge fixed, so stretching always reaches towards the other side.
  const offset = on ? thumb.inner - width : 0;
  const move = reduceMotion ? { duration: 0 } : spring.snappy;

  // The thumb's position and width (rem) and the page direction (1, or -1 right to left), as motion values,
  // so the colour can follow the thumb frame by frame
  const x = useMotionValue(offset);
  const w = useMotionValue(width);
  const sign = useMotionValue(1);

  useLayoutEffect(() => {
    if (root.current) sign.set(getComputedStyle(root.current).direction === "rtl" ? -1 : 1);
  }, [sign]);
  useEffect(() => {
    const animation = animate(x, offset, move);
    return () => animation.stop();
  }, [x, offset, move]);
  useEffect(() => {
    const animation = animate(w, width, move);
    return () => animation.stop();
  }, [w, width, move]);

  const thumbX = useTransform(
    [sign, x],
    ([direction = 1, position = 0]: number[]) => `${direction * position}rem`,
  );
  const thumbWidth = useTransform(w, (value) => `${value}rem`);
  // The colour ends at the thumb's far edge (full across when on) and fades with the thumb's progress, both
  // ways, so going off is going on played backwards
  const fillX = useTransform(
    [sign, x, w],
    ([direction = 1, position = 0, size = 0]: number[]) =>
      `${direction * (position + size - thumb.inner)}rem`,
  );
  const fillOpacity = useTransform(x, (position) => fillOpacityAt(position / (thumb.inner - thumb.rest)));

  return (
    <SwitchPrimitive.Root
      ref={root}
      data-slot="switch"
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={(value) => {
        setUncontrolled(value);
        // No hover stretch straight after a change, or the thumb would seem to want to go back; it
        // returns once the pointer leaves and comes back
        setHovered(false);
        onCheckedChange?.(value);
      }}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerDown={(event) => {
        setPressed(true);
        onPointerDown?.(event);
      }}
      onPointerUp={(event) => {
        setPressed(false);
        onPointerUp?.(event);
      }}
      onPointerLeave={(event) => {
        setPressed(false);
        setHovered(false);
        onPointerLeave?.(event);
      }}
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <motion.span
        aria-hidden
        data-slot="switch-fill"
        style={{ x: fillX, opacity: fillOpacity }}
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary"
      />
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          data-slot="switch-thumb"
          style={{ x: thumbX, width: thumbWidth }}
          className={cn(
            "pointer-events-none absolute start-0.5 top-0.5 block rounded-full bg-background transition-colors duration-(--duration-base) ease-out data-[state=checked]:bg-primary-foreground",
            thumb.height,
          )}
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch, switchVariants };
