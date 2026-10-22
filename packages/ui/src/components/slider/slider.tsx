"use client";

import { NumberTicker } from "@fewtone/ui/components/number-ticker/number-ticker";
import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import {
  type AnimationPlaybackControls,
  animate,
  type MotionValue,
  motion,
  motionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
  useVelocity,
} from "motion/react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type PointerEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/*
 * Slider: one value or a range (owner, 2026-10-16), redesigned as the value thumb the owner chose in the Lab
 * (2026-10-22), ported from it exactly: the same drawing, sizes and timings. The WAI-ARIA slider pattern, our own
 * rather than Radix's, because Radix places its thumbs itself and they didn't move like the Lab's.
 * - A thin track and a small round thumb that, the moment you reach for it (the pointer over the slider, keyboard
 *   focus, a drag), grows into a pill with the value inside. The number is the thumb, so there's no tooltip to
 *   float or follow; back at rest it shrinks to a dot. The value flows as it changes (our Number Ticker), and a
 *   quick drag counts through the values.
 * - Motion (.agents/rules/motion.md):
 *   - Press the track and the thumb glides to the point on spring.snappy; the keys and outside changes glide the
 *     same way. Dragging follows the pointer exactly.
 *   - Moving, the pill stretches along the track with its speed (up to a quarter, full at 900px/s) and settles
 *     round when it stops.
 *   - The pill grows and shrinks on spring.snappy; its number comes through the blur (duration.base in,
 *     duration.fast out).
 *   - The track thickens from 4px to 6px while a thumb is open.
 * - Behaviour: each thumb is a `role="slider"` with arrow keys (Shift for ten steps), Page Up/Down (ten steps),
 *   Home/End. A press on the track moves the nearest thumb there and focuses it; a range's thumbs can't cross.
 *   Vertical, right to left and inverted. With `name`, a hidden input per value submits it with a form.
 * - Nothing animates on first paint. With reduced motion the thumb jumps, doesn't stretch, the track keeps its
 *   thickness and the number only fades.
 */

/** The thumb at rest, and grown into a pill (at least this wide; wider for a longer value), in px */
const DOT = 14;
const PILL = { width: 46, height: 26 };
/** The room either side of the value in the pill, in px */
const PILL_PAD = 10;
/** Moving, the pill stretches along the track by up to a quarter, full at this speed in px a second */
const STRETCH = 0.25;
const FULL_SPEED = 900;
/** While a thumb is open, the track thickens from 4px to 6px */
const THICK = 1.5;
/** Shift with an arrow, and Page Up/Down, move this many steps */
const BIG_STEP = 10;

/** How the last focus came: the keyboard opens a thumb's pill on focus, a pointer doesn't */
let keyboardLast = false;
let listening = false;
function watchModality() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener("keydown", () => (keyboardLast = true), true);
  window.addEventListener("pointerdown", () => (keyboardLast = false), true);
}

export type SliderProps = Omit<ComponentProps<"div">, "defaultValue" | "dir" | "onChange"> & {
  /** The values, when you control them: one number per thumb, two for a range */
  value?: number[];
  /** The values at first */
  defaultValue?: number[];
  /** Called on every change, while dragging too */
  onValueChange?: (value: number[]) => void;
  /** Called once a drag ends or a key changes the value */
  onValueCommit?: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  /** How many steps a range's thumbs keep apart */
  minStepsBetweenThumbs?: number;
  orientation?: "horizontal" | "vertical";
  /** Right to left puts the lowest value on the right */
  dir?: "ltr" | "rtl";
  /** Puts the lowest value at the other end */
  inverted?: boolean;
  disabled?: boolean;
  /** Submits the values with a form, through a hidden input per thumb */
  name?: string;
  form?: string;
  /** Intl.NumberFormat options for the value in the thumb and for screen readers, for example { style: "currency", currency: "USD" } */
  format?: Intl.NumberFormatOptions;
  /** The locale to format in. en-US unless you pass one, so the server and the browser agree */
  locale?: string;
  /** A name for each thumb. Without it, a range's thumbs are named from aria-label: "Price, minimum". */
  thumbLabels?: string[];
};

/**
 * Pick a value, or a range with two values, by dragging, pressing the track or with the keys. `value` and
 * `defaultValue` are arrays: one number for one thumb, two for a range. Name it with aria-label or
 * aria-labelledby; the name moves to the thumbs, which are the sliders screen readers see.
 */
function Slider({
  className,
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs = 0,
  orientation = "horizontal",
  dir = "ltr",
  inverted = false,
  disabled = false,
  name,
  form,
  format,
  locale = "en-US",
  thumbLabels,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  onPointerEnter,
  onPointerLeave,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  ref,
  ...props
}: SliderProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? [min]);
  const values = value ?? uncontrolled;
  const count = values.length;
  const reduce = useReducedMotion() ?? false;
  const vertical = orientation === "vertical";
  // Drawn from the far end: vertical sliders grow upwards, right-to-left or inverted ones the other way
  const flip = vertical ? !inverted : (dir === "rtl") !== inverted;
  const thumbId = useId();
  const formatKey = JSON.stringify(format ?? {});
  // biome-ignore lint/correctness/useExhaustiveDependencies: format is compared through formatKey
  const formatter = useMemo(() => new Intl.NumberFormat(locale, format), [locale, formatKey]);

  const root = useRef<HTMLDivElement>(null);
  const thumbs = useRef<(HTMLSpanElement | null)[]>([]);
  // The track's length along its axis, as a motion value so the drawing always uses the latest measure
  const size = useMotionValue(256);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState<{ index: number; keyboard: boolean } | null>(null);
  // The thumb being moved by the pointer, and whether the pointer has moved since pressing (a drag)
  const [active, setActive] = useState<{ index: number; dragging: boolean } | null>(null);

  useEffect(watchModality, []);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const measure = () => size.set(vertical ? node.offsetHeight : node.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [size, vertical]);

  const progressOf = (number: number) =>
    max === min ? 0 : Math.min(1, Math.max(0, (number - min) / (max - min)));
  const places = String(step).split(".")[1]?.length ?? 0;
  const snap = (number: number) => Number((Math.round((number - min) / step) * step + min).toFixed(places));

  /** Sets one thumb's value, inside the range and clear of its neighbours */
  const setThumb = (index: number, wanted: number, commit = false) => {
    const gap = minStepsBetweenThumbs * step;
    const lower = index > 0 ? (values[index - 1] ?? min) + gap : min;
    const upper = index < count - 1 ? (values[index + 1] ?? max) - gap : max;
    const next = Math.min(upper, Math.max(lower, snap(Math.min(max, Math.max(min, wanted)))));
    if (next === values[index]) {
      if (commit) onValueCommit?.(values);
      return;
    }
    const all = values.map((current, at) => (at === index ? next : current));
    if (value === undefined) setUncontrolled(all);
    onValueChange?.(all);
    if (commit) onValueCommit?.(all);
  };

  // Where each thumb is drawn, 0 to 1 along the axis: it glides to a pressed point or a key's step on
  // spring.snappy, and follows at once while dragged. Nothing moves on first paint.
  // biome-ignore lint/correctness/useExhaustiveDependencies: one motion value per thumb, made when the count changes
  const drawn = useMemo(() => values.map((current) => motionValue(progressOf(current))), [count]);
  const glides = useRef(new Map<number, AnimationPlaybackControls>());
  const progresses = values.map(progressOf);
  const progressKey = progresses.join(",");
  // biome-ignore lint/correctness/useExhaustiveDependencies: only a change of the values or the drag moves them
  useEffect(() => {
    progresses.forEach((target, index) => {
      const mark = drawn[index];
      if (!mark || mark.get() === target) return;
      glides.current.get(index)?.stop();
      if (reduce || (active?.index === index && active.dragging)) {
        mark.jump(target);
        return;
      }
      glides.current.set(index, animate(mark, target, spring.snappy));
    });
  }, [progressKey, active?.dragging, reduce, drawn]);
  useEffect(() => {
    const running = glides.current;
    return () => {
      for (const glide of running.values()) glide.stop();
    };
  }, []);

  /** Where along the track (0 to 1, from the lowest value's end) the pointer is */
  const fractionAt = (event: PointerEvent<HTMLElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const length = vertical ? box.height : box.width;
    if (length <= 0) return 0;
    const along = vertical ? (event.clientY - box.top) / length : (event.clientX - box.left) / length;
    const clamped = Math.min(1, Math.max(0, along));
    return flip ? 1 - clamped : clamped;
  };
  const valueAt = (fraction: number) => min + fraction * (max - min);

  const onKeyDown = (index: number) => (event: KeyboardEvent) => {
    if (disabled) return;
    const current = values[index] ?? min;
    const big = step * BIG_STEP;
    // Left and right follow the page's direction (and inverted); up and down always mean more and less
    const forwards = (dir === "rtl") !== inverted ? -1 : 1;
    const by = (amount: number) => (event.shiftKey ? big : step) * amount;
    const moves: Record<string, number> = {
      ArrowRight: by(vertical ? 1 : forwards),
      ArrowLeft: by(vertical ? -1 : -forwards),
      ArrowUp: by(1),
      ArrowDown: by(-1),
      PageUp: big,
      PageDown: -big,
    };
    if (event.key in moves) setThumb(index, current + (moves[event.key] ?? 0), true);
    else if (event.key === "Home") setThumb(index, min, true);
    else if (event.key === "End") setThumb(index, max, true);
    else return;
    event.preventDefault();
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

  const isOpen = (index: number) =>
    !disabled &&
    (hovered ||
      (focused?.index === index && focused.keyboard) ||
      (active?.index === index && active.dragging));
  const anyOpen = values.some((_, index) => isOpen(index));

  // The range: the whole track's fill, moved to the lower thumb and scaled to reach the upper one
  const low = count > 1 ? drawn[0] : undefined;
  const high = drawn[count - 1];
  const zero = useMotionValue(0);
  // In percent of the fill's own (full) length, so the server's HTML already draws it in place
  const fillStart = useTransform(low ?? zero, (p) => `${(flip ? -1 : 1) * p * 100}%`);
  const fillLength = useTransform([low ?? zero, high ?? zero], ([from = 0, to = 0]: number[]) =>
    Math.max(0, to - from),
  );

  return (
    <div
      ref={(node) => {
        root.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="slider"
      data-orientation={orientation}
      data-disabled={disabled || undefined}
      className={cn(
        "relative touch-none select-none",
        vertical ? "h-full min-h-44 w-11" : "h-11 w-full",
        disabled ? "cursor-not-allowed opacity-(--opacity-disabled)" : "cursor-pointer",
        className,
      )}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        setHovered(false);
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || disabled || event.button !== 0) return;
        event.currentTarget.setPointerCapture?.(event.pointerId);
        const wanted = valueAt(fractionAt(event));
        // The nearest thumb moves; between two equally near, the one on the side pressed
        let index = 0;
        values.forEach((current, at) => {
          const best = Math.abs((values[index] ?? 0) - wanted);
          const here = Math.abs(current - wanted);
          if (here < best || (here === best && wanted > current)) index = at;
        });
        setActive({ index, dragging: false });
        setThumb(index, wanted);
        thumbs.current[index]?.focus({ preventScroll: true });
        event.preventDefault();
      }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!active) return;
        if (!active.dragging) setActive({ index: active.index, dragging: true });
        setThumb(active.index, valueAt(fractionAt(event)));
      }}
      onPointerUp={(event) => {
        onPointerUp?.(event);
        if (active) onValueCommit?.(values);
        setActive(null);
      }}
      onPointerCancel={(event) => {
        onPointerCancel?.(event);
        setActive(null);
      }}
      {...props}
    >
      <motion.span
        aria-hidden
        data-slot="slider-track"
        className={cn(
          "absolute overflow-hidden rounded-full bg-muted",
          vertical ? "inset-y-0 left-1/2 w-1 -translate-x-1/2" : "inset-x-0 top-1/2 h-1 -translate-y-1/2",
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
          className={cn(
            "absolute inset-0 bg-primary",
            vertical ? (flip ? "origin-bottom" : "origin-top") : flip ? "origin-right" : "origin-left",
          )}
          style={vertical ? { y: fillStart, scaleY: fillLength } : { x: fillStart, scaleX: fillLength }}
        />
      </motion.span>
      {values.map((thumbValue, index) => (
        <Thumb
          // biome-ignore lint/suspicious/noArrayIndexKey: a thumb is its place in the sorted values
          key={index}
          ref={(node) => {
            thumbs.current[index] = node;
          }}
          value={thumbValue}
          drawn={drawn[index] ?? zero}
          size={size}
          vertical={vertical}
          flip={flip}
          open={isOpen(index)}
          disabled={disabled}
          min={min}
          max={max}
          names={nameOf(index)}
          valueText={format ? formatter.format(thumbValue) : undefined}
          format={format}
          locale={locale}
          reduce={reduce}
          onKeyDown={onKeyDown(index)}
          onFocus={() => setFocused({ index, keyboard: keyboardLast })}
          onBlur={() => setFocused((current) => (current?.index === index ? null : current))}
        />
      ))}
      {name
        ? values.map((current, index) => (
            <input
              // biome-ignore lint/suspicious/noArrayIndexKey: one input per thumb, in order
              key={index}
              type="hidden"
              name={count > 1 ? `${name}[]` : name}
              form={form}
              value={current}
              disabled={disabled}
            />
          ))
        : null}
    </div>
  );
}

type ThumbProps = {
  ref: (node: HTMLSpanElement | null) => void;
  value: number;
  drawn: MotionValue<number>;
  size: MotionValue<number>;
  vertical: boolean;
  flip: boolean;
  open: boolean;
  disabled: boolean;
  min: number;
  max: number;
  names: { id?: string; "aria-label"?: string; "aria-labelledby"?: string };
  valueText?: string;
  format?: Intl.NumberFormatOptions;
  locale: string;
  reduce: boolean;
  onKeyDown: (event: KeyboardEvent) => void;
  onFocus: () => void;
  onBlur: () => void;
};

/** One thumb: a dot at rest, a pill with the value while it's reached for. It's the slider screen readers see. */
function Thumb({
  ref,
  value,
  drawn,
  size,
  vertical,
  flip,
  open,
  disabled,
  min,
  max,
  names,
  valueText,
  format,
  locale,
  reduce,
  onKeyDown,
  onFocus,
  onBlur,
}: ThumbProps) {
  // Its centre sits at its value's point on the track, so it travels the whole length. Placed in percent of
  // the slider, so it's in place from the server's HTML on, before anything is measured (a measured length
  // drew it at a guess until the page woke up, owner 2026-10-22).
  const at = useTransform(drawn, (p) => `${(flip ? 1 - p : p) * 100}%`);
  // The faster it moves, the longer the pill (its speed in px a second, from the measured length); at rest,
  // round again
  const speed = useVelocity(drawn);
  const stretch = useTransform([speed, size], ([velocity = 0, length = 0]: number[]) =>
    reduce ? 1 : 1 + STRETCH * Math.min(1, Math.abs(velocity * length) / FULL_SPEED),
  );
  // The pill fits its value: as wide as the text plus its room, never narrower than the Lab's 46px, so a long
  // value ("51 hours") never spills out (owner, 2026-10-22); a change of width glides on the same spring
  const content = useRef<HTMLSpanElement>(null);
  const [fit, setFit] = useState(0);
  useLayoutEffect(() => {
    const node = content.current;
    if (!node) return;
    const measure = () => setFit(node.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const pill = { width: Math.max(PILL.width, fit + PILL_PAD * 2), height: PILL.height };

  return (
    <motion.span
      ref={ref}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      {...names}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-valuetext={valueText}
      aria-orientation={vertical ? "vertical" : "horizontal"}
      aria-disabled={disabled || undefined}
      data-slot="slider-thumb"
      data-open={open || undefined}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      className={cn(
        "absolute flex items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-medium whitespace-nowrap text-primary-foreground tabular-nums",
        "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        vertical ? "left-1/2 -translate-x-1/2 -translate-y-1/2" : "top-1/2 -translate-x-1/2 -translate-y-1/2",
      )}
      style={vertical ? { top: at, scaleY: stretch } : { left: at, scaleX: stretch }}
      initial={false}
      animate={open ? pill : { width: DOT, height: DOT }}
      transition={reduce ? { duration: 0 } : spring.snappy}
    >
      <motion.span
        ref={content}
        aria-hidden
        className="shrink-0"
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
  );
}

export { Slider };
