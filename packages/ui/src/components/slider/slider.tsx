"use client";

import { NumberTicker } from "@fewtone/ui/components/number-ticker/number-ticker";
import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import {
  type AnimationPlaybackControls,
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useVelocity,
} from "motion/react";
import { Direction, Slider as SliderPrimitive } from "radix-ui";
import {
  type ComponentProps,
  type FocusEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
 * Slider: one value or a range, on Radix Slider (owner, 2026-10-16; the value thumb, chosen in the Lab on
 * 2026-10-22). Radix does the behaviour: dragging, arrow keys, Page Up/Down, Home/End, a hidden input per thumb
 * in forms.
 * - The value thumb: a thin track and a small round thumb that, the moment you reach for it (the pointer over
 *   the slider, keyboard focus, a press), grows into a pill with the value inside. The number is the thumb, so
 *   there's no tooltip to float or follow; back at rest it shrinks to a dot. The value flows as it changes (our
 *   Number Ticker), and a quick drag counts through the values.
 * - Motion (.agents/rules/motion.md):
 *   - The pill grows from the dot and shrinks back on spring.snappy; its number comes through the blur.
 *   - Click the track and the thumb glides there on spring.snappy instead of jumping; keyboard steps and outside
 *     changes glide the same way. Dragging follows the pointer exactly.
 *   - Moving, the pill stretches along the track with its speed (up to a quarter, like Switch's thumb) and
 *     settles round when it stops.
 *   - The track thickens from 4px to 6px while a thumb is open.
 *   - The range (the filled part) follows the thumbs' drawn positions, so it never runs ahead of a gliding thumb.
 * - How: Radix places each thumb at its value at once. The gliding is drawn on top as an offset: a motion value
 *   per end of the range holds where the thumb is drawn, in percent, and the thumb is moved by the difference
 *   (layout pixels from offsetWidth, so a zoomed preview doesn't double it). The range is a full-size bar
 *   translated and scaled from its start.
 * - Nothing animates on first paint. With reduced motion the thumb jumps, doesn't stretch, the track keeps its
 *   thickness and the number only fades.
 * - Flat and neutral: a muted track, a primary range, a primary thumb.
 */

/** The thumb at rest, and grown into a pill (its height; its width fits the value), in px */
const DOT = 16;
const PILL_HEIGHT = 28;
/** Moving, the pill stretches along the track by up to a quarter, full at this speed in px a second */
const STRETCH = 0.25;
const FULL_STRETCH_SPEED = 900;
/** While a thumb is open, the track thickens from 4px to 6px */
const THICK = 1.5;

type Press = "thumb" | "track" | null;

export type SliderProps = ComponentProps<typeof SliderPrimitive.Root> & {
  /** Intl.NumberFormat options for the value in the thumb and for screen readers, for example { style: "currency", currency: "USD" } */
  format?: Intl.NumberFormatOptions;
  /** The locale to format in. en-US unless you pass one, so the server and the browser agree */
  locale?: string;
  /** A name for each thumb. Without it, a range's thumbs are named from aria-label: "Price, minimum". */
  thumbLabels?: string[];
};

/**
 * Pick a value, or a range with two values, by dragging, clicking the track or with the keys. `value` and
 * `defaultValue` are arrays: one number for one thumb, two for a range. Name it with aria-label or
 * aria-labelledby; the name moves to the thumbs, which are the sliders screen readers see.
 */
function Slider({
  className,
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  orientation = "horizontal",
  dir,
  inverted = false,
  disabled = false,
  format,
  locale = "en-US",
  thumbLabels,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  onPointerDown,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onPointerEnter,
  onPointerLeave,
  onKeyDown,
  ref,
  ...props
}: SliderProps) {
  // Mirror the values, controlled or not, so the drawn thumbs know when and how they changed
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? [min]);
  const values = value ?? uncontrolled;
  const count = values.length;
  const reduce = useReducedMotion() ?? false;
  const direction = Direction.useDirection(dir);
  const vertical = orientation === "vertical";
  // Higher values lie to the right (or left, right to left or inverted), or up (down when inverted)
  const forwards = vertical ? !inverted : (direction === "rtl") === inverted;
  // The on-screen direction of "higher", along x or y
  const sign = vertical ? (forwards ? -1 : 1) : forwards ? 1 : -1;
  const thumbId = useId();
  const formatKey = JSON.stringify(format ?? {});
  // biome-ignore lint/correctness/useExhaustiveDependencies: format is compared through formatKey
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, formatKey]);

  const percentOf = (number: number) =>
    max === min ? 0 : Math.min(100, Math.max(0, ((number - min) / (max - min)) * 100));
  // The range runs from the first thumb to the last; with one thumb, from the start
  const lo = count > 1 ? percentOf(values[0] ?? min) : 0;
  const hi = count > 0 ? percentOf(values[count - 1] ?? min) : 0;

  // Where each end is drawn (it glides) and where Radix has placed its thumb (it jumps), in percent, and how
  // far a thumb's centre travels from 0 to 100% in layout pixels
  const start = useMotionValue(lo);
  const end = useMotionValue(hi);
  const startAt = useMotionValue(lo);
  const endAt = useMotionValue(hi);
  const travel = useMotionValue(0);

  const root = useRef<HTMLSpanElement>(null);
  const press = useRef<Press>(null);
  // The first change after pressing the track is the click itself, which glides
  const clicked = useRef(false);
  const glides = useRef(new Map<MotionValue<number>, AnimationPlaybackControls>());
  const placed = useRef({ lo, hi });
  const [pressed, setPressed] = useState(false);
  const [focused, setFocused] = useState<number | null>(null);
  const [keyboard, setKeyboard] = useState(false);
  const [hovered, setHovered] = useState(false);

  // The travel is the slider's length less a thumb at rest: Radix keeps the thumbs inside the ends
  useLayoutEffect(() => {
    const node = root.current;
    if (!node) return;
    const measure = () => {
      const thumb = node.querySelector<HTMLElement>("[data-slot=slider-thumb]");
      const length = vertical ? node.offsetHeight : node.offsetWidth;
      const size = thumb ? (vertical ? thumb.offsetHeight : thumb.offsetWidth) : 0;
      travel.set(Math.max(0, length - size));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [vertical, travel]);

  // A new value: glide to it (a track click, the keys, a change from outside) or follow at once (a drag)
  // biome-ignore lint/correctness/useExhaustiveDependencies: only a change of the ends moves the thumbs
  useLayoutEffect(() => {
    const was = placed.current;
    if (was.lo === lo && was.hi === hi) return;
    placed.current = { lo, hi };
    startAt.jump(lo);
    endAt.jump(hi);
    const firstClick = press.current === "track" && clicked.current;
    clicked.current = false;

    for (const [drawn, from, to] of [
      [start, was.lo, lo],
      [end, was.hi, hi],
    ] as const) {
      if (from === to) continue;
      const gliding = glides.current.has(drawn);
      const glide =
        !reduce && (press.current === null || (press.current === "track" && (firstClick || gliding)));
      if (!glide) {
        // jump() also stops a glide and resets the speed
        glides.current.delete(drawn);
        drawn.jump(to);
        continue;
      }
      // A glide already on its way turns towards the new value, keeping its speed
      const animation = animate(drawn, to, spring.snappy);
      glides.current.set(drawn, animation);
      animation.then(() => {
        if (glides.current.get(drawn) === animation) glides.current.delete(drawn);
      });
    }
  }, [lo, hi]);

  useEffect(() => {
    const running = glides.current;
    return () => {
      for (const animation of running.values()) animation.stop();
    };
  }, []);

  // The range: a full-size bar, moved to the first thumb and scaled to reach the last
  const rangeAt = useTransform(start, (position) => `${sign * position}%`);
  const rangeLength = useTransform(
    [start, end],
    ([from = 0, to = 0]: number[]) => Math.max(0, to - from) / 100,
  );

  /** A thumb is open, showing its value, while it's reached for */
  const isOpen = (index: number) => !disabled && (hovered || (focused === index && (pressed || keyboard)));
  const anyOpen = values.some((_, index) => isOpen(index));

  const release = () => {
    press.current = null;
    setPressed(false);
  };

  /** Each thumb's accessible name, from thumbLabels or the slider's own name */
  const nameOf = (index: number) => {
    const own = thumbLabels?.[index];
    if (own) return { "aria-label": own };
    if (count === 1) return { "aria-label": ariaLabel, "aria-labelledby": ariaLabelledby };
    const part = count === 2 ? (index === 0 ? "minimum" : "maximum") : `value ${index + 1} of ${count}`;
    const id = `${thumbId}-${index}`;
    // "Price minimum": the label's text, then the thumb's own part
    if (ariaLabelledby) return { id, "aria-label": part, "aria-labelledby": `${ariaLabelledby} ${id}` };
    if (ariaLabel) return { "aria-label": `${ariaLabel}, ${part}` };
    return {};
  };

  return (
    <SliderPrimitive.Root
      ref={(node) => {
        root.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="slider"
      value={values}
      onValueChange={(next) => {
        if (value === undefined) setUncontrolled(next);
        onValueChange?.(next);
      }}
      min={min}
      max={max}
      step={step}
      orientation={orientation}
      dir={dir}
      inverted={inverted}
      disabled={disabled}
      // Ours run before Radix's: what was pressed is known before the value changes
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || disabled) return;
        const onThumb = event.target instanceof Element && event.target.closest("[data-slot=slider-thumb]");
        press.current = onThumb ? "thumb" : "track";
        clicked.current = true;
        setPressed(true);
        setKeyboard(false);
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        release();
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        release();
      }}
      onLostPointerCapture={(event) => {
        onLostPointerCapture?.(event);
        release();
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovered(false);
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        press.current = null;
        setKeyboard(true);
      }}
      className={cn(
        "relative flex w-full touch-none items-center select-none",
        "data-[orientation=horizontal]:h-8",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-8 data-[orientation=vertical]:flex-col",
        "data-disabled:cursor-not-allowed data-disabled:opacity-(--opacity-disabled)",
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track asChild>
        <motion.span
          data-slot="slider-track"
          className={cn(
            "relative grow overflow-hidden rounded-full bg-muted",
            "data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full",
            "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1",
          )}
          initial={false}
          // Thicker while a thumb is open: the slider wakes under the hand
          animate={
            vertical ? { scaleX: anyOpen && !reduce ? THICK : 1 } : { scaleY: anyOpen && !reduce ? THICK : 1 }
          }
          transition={reduce ? { duration: 0 } : spring.snappy}
        >
          <motion.span
            data-slot="slider-range"
            className="absolute inset-0 bg-primary"
            style={
              vertical
                ? { y: rangeAt, scaleY: rangeLength, originY: forwards ? 1 : 0 }
                : { x: rangeAt, scaleX: rangeLength, originX: forwards ? 0 : 1 }
            }
          />
        </motion.span>
      </SliderPrimitive.Track>
      {values.map((thumbValue, index) => (
        <Thumb
          // biome-ignore lint/suspicious/noArrayIndexKey: a thumb is its place in the sorted values
          key={index}
          value={thumbValue}
          names={nameOf(index)}
          drawn={index === count - 1 ? end : index === 0 ? start : null}
          placedAt={index === count - 1 ? endAt : index === 0 ? startAt : null}
          travel={travel}
          sign={sign}
          vertical={vertical}
          open={isOpen(index)}
          formatter={formatter}
          format={format}
          locale={locale}
          reduce={reduce}
          onFocus={() => setFocused(index)}
          onBlur={(event) => {
            setFocused((current) => (current === index ? null : current));
            // Moving between a range's thumbs with Tab keeps the keyboard's open pill
            const next = event.relatedTarget;
            if (!(next instanceof Element && root.current?.contains(next))) setKeyboard(false);
          }}
        />
      ))}
    </SliderPrimitive.Root>
  );
}

type ThumbProps = {
  value: number;
  names: { id?: string; "aria-label"?: string; "aria-labelledby"?: string };
  /** Where this thumb is drawn, in percent; null for a middle thumb of three or more, which doesn't glide */
  drawn: MotionValue<number> | null;
  /** Where Radix has placed it, in percent */
  placedAt: MotionValue<number> | null;
  travel: MotionValue<number>;
  sign: number;
  vertical: boolean;
  open: boolean;
  formatter: Intl.NumberFormat;
  format?: Intl.NumberFormatOptions;
  locale: string;
  reduce: boolean;
  onFocus: () => void;
  onBlur: (event: FocusEvent<HTMLSpanElement>) => void;
};

function Thumb({
  value,
  names,
  drawn,
  placedAt,
  travel,
  sign,
  vertical,
  open,
  formatter,
  format,
  locale,
  reduce,
  onFocus,
  onBlur,
}: ThumbProps) {
  const still = useMotionValue(0);
  const position = drawn ?? still;
  const placed = placedAt ?? still;
  // Drawn where it glides to, not where Radix put it: the difference as an offset along the track
  const offset = useTransform(
    [position, placed, travel],
    ([at = 0, radix = 0, length = 0]: number[]) => (sign * (at - radix) * length) / 100,
  );
  // The faster it moves, the longer the pill; at rest, round again
  const speed = useVelocity(offset);
  const along = useTransform(speed, (velocity) =>
    reduce ? 1 : 1 + STRETCH * Math.min(1, Math.abs(velocity) / FULL_STRETCH_SPEED),
  );

  return (
    <SliderPrimitive.Thumb
      asChild
      {...names}
      aria-valuetext={format ? formatter.format(value) : undefined}
      onFocus={onFocus}
      onBlur={onBlur}
    >
      <motion.span
        data-slot="slider-thumb"
        data-open={open || undefined}
        style={vertical ? { y: offset } : { x: offset }}
        className="group/thumb relative block size-4 shrink-0 cursor-grab rounded-full outline-hidden active:cursor-grabbing data-disabled:cursor-not-allowed"
      >
        {/* The visible thumb: a dot at rest, a pill with the value while it's reached for. It's centred on the
            thumb, so growing never moves where the thumb sits on the track. */}
        <motion.span
          aria-hidden
          data-slot="slider-knob"
          className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-medium whitespace-nowrap text-primary-foreground tabular-nums outline-ring group-focus-visible/thumb:outline-(length:--focus-ring-width) group-focus-visible/thumb:outline-offset-(--focus-ring-offset)"
          style={vertical ? { scaleY: along } : { scaleX: along }}
          initial={false}
          animate={
            open
              ? { width: "auto", height: PILL_HEIGHT, paddingInline: 8, minWidth: PILL_HEIGHT * 1.5 }
              : { width: DOT, height: DOT, paddingInline: 0, minWidth: DOT }
          }
          transition={reduce ? { duration: 0 } : spring.snappy}
        >
          <motion.span
            initial={false}
            animate={
              open
                ? { opacity: 1, filter: blur.shown, scale: 1 }
                : { opacity: 0, filter: reduce ? blur.shown : blur.hidden, scale: reduce ? 1 : 0.6 }
            }
            transition={
              reduce
                ? { duration: 0 }
                : { duration: open ? duration.base : duration.fast, ease: open ? ease.out : ease.in }
            }
          >
            {/* The value flows as it changes; nothing rolls when the pill first opens */}
            <NumberTicker value={value} from={value} startOnView={false} format={format} locale={locale} />
          </motion.span>
        </motion.span>
      </motion.span>
    </SliderPrimitive.Thumb>
  );
}

export { Slider };
