"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { blur, duration, ease, spring, swap } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { MinusIcon, PlusIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

/*
 * Number Input: a number field with step buttons (owner, 2026-10-16). It follows the WAI-ARIA spinbutton
 * pattern: a text input with role="spinbutton", ArrowUp/ArrowDown step, PageUp/PageDown take a big step,
 * Home/End go to min/max. Typed text is read when you leave the field or press Enter, then clamped and
 * formatted; a value in range also updates as you type.
 * - Motion (.agents/rules/motion.md): when a step changes the number, it rolls like an odometer. Each digit
 *   that changed rolls a whole line: the old one travels out of the field as the new one travels in from the
 *   other edge (up for up, down for down) on spring.snappy, sharpening through the blur over duration.slow so
 *   the roll reads smooth rather than flickering (owner, 2026-10-21: "more noticeable"). Places set off 0.05s
 *   apart from the right, so 19 → 20 turns the ones, then the tens. The field's top and bottom edges fade, so
 *   digits roll in and out of sight softly. The others stay put; typing doesn't animate. While it rolls, the
 *   input's own text is transparent and a copy is drawn over it, character by character, with tabular figures
 *   so nothing jiggles; then the input's text shows again. With reduced motion the number just changes.
 * - The step buttons are our ghost icon Buttons inside the field. They aren't in the tab order (the keys do
 *   the same) and don't take focus. Press and hold steps once, then repeats.
 * - Formatting is optional, through Intl.NumberFormat (`format`, `locale`). A form gets the plain number
 *   through a hidden input.
 * - The field looks like Input: control heights, Input's border, its focus ring around the whole field.
 */

/** Press and hold: one step at once, then after `duration.slower`, one every `duration.instant` */
const HOLD_DELAY = duration.slower * 1000;
const HOLD_REPEAT = duration.instant * 1000;
/** Places set off one after another from the right: motion.md's list stagger */
const STAGGER = 0.05;
/**
 * After this long without another step, the rolling copy hands back to the input's own text: the roll's
 * blur (duration.slow) plus room for the spring to land and a few places' stagger
 */
const ROLL_MS = duration.slow * 2 * 1000;
/** The roller's top and bottom edges fade, so digits roll in and out of sight */
const ROLL_FADE = "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)";

const numberInputVariants = cva(
  [
    "relative flex w-full min-w-0 items-center rounded-lg border border-input bg-transparent px-1 text-sm text-foreground shadow-xs",
    "transition duration-(--duration-fast) ease-out",
    // The ring goes round the whole field while its input has focus, the way Input's does
    "outline-ring has-focus-visible:border-ring has-focus-visible:outline-(length:--focus-ring-width) has-focus-visible:outline-offset-(--focus-ring-offset)",
    "data-invalid:border-destructive data-invalid:outline-destructive",
    "data-disabled:cursor-not-allowed data-disabled:opacity-(--opacity-disabled)",
  ],
  {
    variants: {
      size: {
        sm: "h-(--size-control-sm) rounded-md",
        md: "h-(--size-control-md)",
        lg: "h-(--size-control-lg)",
      },
    },
    defaultVariants: { size: "md" },
  },
);

// The buttons sit 3px inside the field's border at every size
const buttonSizes = { sm: "size-6", md: "size-7", lg: "size-8" } as const;
const iconSizes = { sm: "size-(--size-icon-sm)", md: "size-(--size-icon-md)", lg: "size-(--size-icon-md)" };

/** Decimal places in a number, so 0.1 + 0.2 steps to 0.3 */
function decimalsOf(value: number) {
  const [, fraction = "", exponent] = /^-?\d*\.?(\d*)(?:e([+-]\d+))?$/.exec(String(value)) ?? [];
  return Math.max(0, fraction.length - Number(exponent ?? 0));
}

/**
 * Reads typed text in the field's locale: group separators, currency signs and spaces are ignored. Empty
 * text is null, and text with no digits is NaN (so the field goes back to the last number).
 */
function parseNumber(text: string, locale: string | undefined, format: Intl.NumberFormatOptions | undefined) {
  const trimmed = text.trim();
  if (!trimmed) return null;
  // Without a format the field shows plain numbers (1234.5), so it reads them the same way
  const parts = new Intl.NumberFormat(format ? locale : "en-US").formatToParts(-12345.6);
  const group = parts.find((part) => part.type === "group")?.value ?? ",";
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? ".";
  // A minus sign anywhere (-$5, $-5, 5-, the typographic −) or accounting brackets, (5.00), is negative
  const negative = /[-−]/.test(trimmed) || /^\(.*\)$/.test(trimmed);
  const digits = trimmed
    .split(group)
    .join("")
    .split(decimal)
    .join(".")
    .replace(/[^\d.]/g, "");
  if (!/\d/.test(digits)) return Number.NaN;
  let number = Number(digits);
  if (!Number.isFinite(number)) return Number.NaN;
  if (negative) number = -number;
  // A percent field shows 25% for 0.25
  if (format?.style === "percent") number /= 100;
  return number;
}

type Roll = { direction: 1 | -1; animate: boolean };

/** A digit at rest, and one a whole line above or below it, blurred */
const rest = { y: "0%", opacity: 1, filter: blur.shown };
const away = (side: 1 | -1) => ({ y: `${side * 100}%`, opacity: 0, filter: blur.hidden });

/** Going up, the new digit comes from below and the old one leaves upwards; going down, the other way */
const rollVariants = {
  enter: ({ direction, animate }: Roll) => (animate ? away(direction) : swap.animate),
  center: rest,
  exit: ({ direction, animate }: Roll) =>
    animate
      ? // The element's own transition: the old digit leaves with the same stagger the new one arrives on
        away(direction === 1 ? -1 : 1)
      : { opacity: 0, transition: { duration: 0 } },
};
/** The roll for a place: the travel on spring.snappy, the blur and fade on a smooth duration.slow, staggered */
const rollTransition = (place: number) => {
  const delay = Math.max(0, place) * STAGGER;
  return { duration: duration.slow, ease: ease.out, delay, y: { ...spring.snappy, delay } };
};

/**
 * The rolling copy of the field's text. Places are counted from the right, so 19 → 20 rolls both digits
 * and 20 → 21 only the last. Each place stacks the old and new character in one cell while they swap.
 */
function Roller({ text, roll }: { text: string; roll: Roll | null }) {
  const custom = roll ?? { direction: 1, animate: false };
  const chars = Array.from(text);
  return (
    <span
      aria-hidden
      data-slot="number-input-roll"
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden px-2 tabular-nums",
        !roll && "invisible",
      )}
      style={{ maskImage: ROLL_FADE, WebkitMaskImage: ROLL_FADE }}
    >
      {/* A place that goes (21 → 9) pops out of the row so the rest settle at once */}
      <AnimatePresence initial={false} mode="popLayout" custom={custom}>
        {chars.map((char, index) => {
          const place = chars.length - 1 - index;
          return (
            <motion.span
              key={place}
              custom={custom}
              variants={rollVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={rollTransition(place)}
              className="inline-grid"
            >
              <AnimatePresence initial={false} custom={custom}>
                <motion.span
                  key={char}
                  custom={custom}
                  variants={rollVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={rollTransition(place)}
                  className="col-start-1 row-start-1 whitespace-pre"
                >
                  {char}
                </motion.span>
              </AnimatePresence>
            </motion.span>
          );
        })}
      </AnimatePresence>
    </span>
  );
}

export type NumberInputProps = Omit<
  ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "type" | "size" | "min" | "max" | "step"
> &
  VariantProps<typeof numberInputVariants> & {
    /** The number, when you control it; null when the field is empty */
    value?: number | null;
    /** The number at first */
    defaultValue?: number | null;
    /** Called with the new number, or null when the field is emptied */
    onValueChange?: (value: number | null) => void;
    /** The lowest number; Home goes here */
    min?: number;
    /** The highest number; End goes here */
    max?: number;
    /** How much ArrowUp, ArrowDown and the buttons change it */
    step?: number;
    /** How much PageUp and PageDown change it; ten steps if left out */
    largeStep?: number;
    /** Intl.NumberFormat options, for example { style: "currency", currency: "USD" } */
    format?: Intl.NumberFormatOptions;
    /** The locale to format and read numbers in; the browser's if left out */
    locale?: string;
    /** The increment button's accessible name */
    incrementLabel?: string;
    /** The decrement button's accessible name */
    decrementLabel?: string;
  };

/**
 * A number field with step buttons. `className` styles the field; other props, including `id` and `ref`,
 * go to its input. Give it a visible label (`<label htmlFor>`).
 */
function NumberInput({
  className,
  size,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step = 1,
  largeStep,
  format,
  locale,
  incrementLabel = "Increase",
  decrementLabel = "Decrease",
  id,
  name,
  form,
  disabled = false,
  readOnly = false,
  "aria-invalid": ariaInvalid,
  onKeyDown,
  onBlur,
  ...props
}: NumberInputProps) {
  const fallbackId = useId();
  const inputId = id ?? fallbackId;
  // Mirror the value, controlled or not, so stepping and the buttons always start from the latest number
  const [uncontrolled, setUncontrolled] = useState<number | null>(defaultValue ?? null);
  const current = value === undefined ? uncontrolled : value;
  // The text while the user types; null shows the formatted number
  const [draft, setDraft] = useState<string | null>(null);
  const [roll, setRoll] = useState<{ direction: 1 | -1; count: number } | null>(null);
  const reduce = useReducedMotion() ?? false;
  const latest = useRef(current);
  latest.current = current;

  const formatter = format ? new Intl.NumberFormat(locale, format) : null;
  const display = (number: number | null) =>
    number === null ? "" : formatter ? formatter.format(number) : String(number);
  const text = draft ?? display(current);
  const clamp = (number: number) =>
    Math.min(max ?? Number.POSITIVE_INFINITY, Math.max(min ?? Number.NEGATIVE_INFINITY, number));
  const invalid = ariaInvalid === true || ariaInvalid === "true";

  function change(next: number | null) {
    if (Object.is(next, latest.current)) return;
    latest.current = next;
    if (value === undefined) setUncontrolled(next);
    onValueChange?.(next);
  }

  /** A change made by stepping, which rolls the number. Returns false when nothing changed (at a bound). */
  function stepTo(next: number, direction: 1 | -1) {
    setDraft(null);
    if (next === latest.current) return false;
    if (!reduce) setRoll((last) => ({ direction, count: (last?.count ?? 0) + 1 }));
    change(next);
    return true;
  }

  function stepBy(direction: 1 | -1, amount = step) {
    if (disabled || readOnly) return false;
    const typed = draft === null ? null : parseNumber(draft, locale, format);
    const base = typed === null || Number.isNaN(typed) ? latest.current : typed;
    // From empty, the first step shows 0 (or the nearest bound)
    if (base === null) return stepTo(clamp(0), direction);
    const places = Math.max(decimalsOf(base), decimalsOf(amount));
    return stepTo(clamp(Number((base + direction * amount).toFixed(places))), direction);
  }

  function goTo(target: number) {
    if (disabled || readOnly) return;
    const from = latest.current ?? target;
    stepTo(target, target >= from ? 1 : -1);
  }

  /** Reads what was typed: clamped and formatted, or back to the last number when it isn't one */
  function commit() {
    if (draft === null) return;
    const typed = parseNumber(draft, locale, format);
    setDraft(null);
    if (typed === null) change(null);
    else if (!Number.isNaN(typed)) change(clamp(typed));
  }

  // The rolling copy hands back to the input's own text once the steps stop
  useEffect(() => {
    if (!roll) return;
    const timer = setTimeout(() => setRoll(null), ROLL_MS);
    return () => clearTimeout(timer);
  }, [roll]);

  // Press and hold. The timers call the latest stepBy, so each repeat starts from the latest number.
  const stepRef = useRef(stepBy);
  stepRef.current = stepBy;
  const hold = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pointerStep = useRef(false);
  const stopHold = () => clearTimeout(hold.current);
  useEffect(() => () => clearTimeout(hold.current), []);

  function startHold(direction: 1 | -1) {
    stopHold();
    if (!stepRef.current(direction)) return;
    const repeat = (wait: number) => {
      hold.current = setTimeout(() => {
        if (stepRef.current(direction)) repeat(HOLD_REPEAT);
      }, wait);
    };
    repeat(HOLD_DELAY);
  }

  const atMin = current !== null && min !== undefined && current <= min;
  const atMax = current !== null && max !== undefined && current >= max;

  const stepButton = (direction: 1 | -1) => ({
    variant: "ghost" as const,
    size: "icon-sm" as const,
    // The keys do the same, so the buttons stay out of the tab order (WAI-ARIA spinbutton)
    tabIndex: -1,
    "aria-label": direction > 0 ? incrementLabel : decrementLabel,
    "aria-controls": inputId,
    disabled: disabled || readOnly || (direction > 0 ? atMax : atMin),
    className: cn("text-muted-foreground hover:text-foreground", buttonSizes[size ?? "md"]),
    // Pressing doesn't take focus from the input
    onMouseDown: (event: MouseEvent<HTMLButtonElement>) => event.preventDefault(),
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (event.button !== 0) return;
      event.preventDefault();
      pointerStep.current = true;
      startHold(direction);
    },
    onPointerUp: stopHold,
    onPointerLeave: stopHold,
    onPointerCancel: stopHold,
    onClick: (event: MouseEvent<HTMLButtonElement>) => {
      // A pointer already stepped on press; a click from the keyboard or a screen reader steps here
      if (event.detail === 0 || !pointerStep.current) stepRef.current(direction);
      pointerStep.current = false;
    },
  });

  return (
    <div
      data-slot="number-input"
      data-size={size ?? "md"}
      data-invalid={invalid || undefined}
      data-disabled={disabled || undefined}
      className={cn(numberInputVariants({ size }), className)}
    >
      <Button {...stepButton(-1)}>
        <MinusIcon aria-hidden className={iconSizes[size ?? "md"]} />
      </Button>
      <div className="relative h-full min-w-0 flex-1">
        <input
          id={inputId}
          type="text"
          role="spinbutton"
          inputMode="decimal"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-valuenow={current ?? undefined}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuetext={formatter && current !== null ? formatter.format(current) : undefined}
          aria-invalid={ariaInvalid}
          disabled={disabled}
          readOnly={readOnly}
          data-slot="number-input-input"
          value={text}
          onChange={(event) => {
            const next = event.target.value;
            setDraft(next);
            setRoll(null);
            // A number in range updates as you type; anything else waits until you leave the field
            const typed = parseNumber(next, locale, format);
            if (typed === null) change(null);
            else if (!Number.isNaN(typed) && typed === clamp(typed)) change(typed);
          }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || disabled || readOnly) return;
            const big = largeStep ?? step * 10;
            switch (event.key) {
              case "ArrowUp":
                stepBy(1);
                break;
              case "ArrowDown":
                stepBy(-1);
                break;
              case "PageUp":
                stepBy(1, big);
                break;
              case "PageDown":
                stepBy(-1, big);
                break;
              case "Home":
                if (min === undefined) return;
                goTo(min);
                break;
              case "End":
                if (max === undefined) return;
                goTo(max);
                break;
              case "Enter":
                // Read the typed number before the form submits
                commit();
                return;
              default:
                return;
            }
            event.preventDefault();
          }}
          onBlur={(event) => {
            commit();
            onBlur?.(event);
          }}
          className={cn(
            "size-full min-w-0 bg-transparent px-2 text-center tabular-nums outline-hidden placeholder:text-muted-foreground disabled:cursor-not-allowed",
            roll && !reduce && "text-transparent",
          )}
          {...props}
        />
        <Roller text={text} roll={roll && !reduce ? { direction: roll.direction, animate: true } : null} />
      </div>
      <Button {...stepButton(1)}>
        <PlusIcon aria-hidden className={iconSizes[size ?? "md"]} />
      </Button>
      {name ? (
        <input type="hidden" name={name} form={form} value={current ?? ""} disabled={disabled} />
      ) : null}
    </div>
  );
}

export { NumberInput, numberInputVariants };
