"use client";

import {
  Calendar,
  type CalendarLabels,
  type DateRange,
  type Matcher,
  type Weekday,
} from "@fewtone/ui/components/calendar/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@fewtone/ui/components/popover/popover";
import { duration, ease, spring, swap } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { CalendarIcon } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { type ComponentProps, type ReactNode, useEffect, useId, useRef, useState } from "react";

/*
 * Date Picker and Date Range Picker (roadmap, 2026-10-16: "A calendar in a popover, for dates and ranges").
 * - Our Calendar in our Popover, opened from a trigger drawn like Select's: a calendar icon, then the date or
 *   a placeholder. The trigger is a combobox that pops up a dialog (the WAI-ARIA date picker pattern), so a
 *   <label htmlFor> names it and screen readers read the date as its value.
 * - Opening moves the focus to the picked day (or today), ready for the arrow keys. Escape, a click outside
 *   or the trigger closes it, and the focus goes back to the trigger.
 * - Motion (.agents/rules/motion.md): the popover opens from the trigger through the blur (Popover), and the
 *   trigger's text swaps through `swap` when the date changes. DatePicker closes a beat after a pick
 *   (duration.base), once the circle has landed on the new day. DateRangePicker stays open, so the band can
 *   be seen growing and the range picked again.
 * - Presets ("Today", "Next 7 days") are a small list beside the calendar, with one highlight gliding between
 *   them (Select's pill). Their values can be functions, worked out when picked, so nothing reads the clock
 *   while rendering (no hydration mismatch).
 * - Dates are formatted by Intl: dateStyle "medium" by default, and formatRange for ranges ("Oct 12 – 18, 2026").
 */

export type DatePreset<T> = {
  label: string;
  /** The date (or range) it picks, or a function that works it out when it's picked */
  value: T | (() => T);
};

export type DatePickerLabels = CalendarLabels & {
  /** Names the popup, a dialog */
  dialog: string;
  /** Names the list of presets */
  presets: string;
};

const triggerSizes = {
  sm: "h-(--size-control-sm) rounded-md px-2.5",
  md: "h-(--size-control-md) px-3",
} as const;

type PickerProps = Omit<
  ComponentProps<"button">,
  "value" | "defaultValue" | "onChange" | "children" | "name"
> & {
  /** Shown in the trigger while nothing is picked */
  placeholder?: string;
  size?: keyof typeof triggerSizes;
  /** Whether it's open, when you control it */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A BCP 47 language tag for the trigger's date and the calendar */
  locale?: string;
  /** How the trigger writes the date, as Intl.DateTimeFormat options */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** The earliest day that can be picked */
  min?: Date;
  /** The latest day that can be picked */
  max?: Date;
  /** Days that can't be picked: Calendar's `disabled` */
  disabledDates?: Matcher | Matcher[];
  weekStartsOn?: Weekday;
  numberOfMonths?: number;
  /** The day marked as today. Defaults to the browser's today. */
  today?: Date;
  /** How the popover lines up with the trigger */
  align?: "start" | "center" | "end";
  labels?: Partial<DatePickerLabels>;
};

export type DatePickerProps = PickerProps & {
  /** The picked day, when you control it */
  value?: Date | undefined;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
  presets?: DatePreset<Date>[];
  /** Submits the day with a form, as YYYY-MM-DD */
  name?: string;
};

export type DateRangePickerProps = PickerProps & {
  /** The picked range, when you control it */
  value?: DateRange | undefined;
  defaultValue?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  presets?: DatePreset<DateRange>[];
};

const monthOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();
const pad = (value: number, length = 2) => String(value).padStart(length, "0");
const keyOf = (date: Date) =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const resolve = <T,>(value: T | (() => T)) => (typeof value === "function" ? (value as () => T)() : value);

/**
 * What both pickers share: whether they're open, the month the calendar shows, and closing a beat after a
 * pick. Each opening starts on the picked month, or on today's (which Calendar knows).
 */
function usePicker(
  openProp: boolean | undefined,
  defaultOpen: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
  anchor: Date | undefined,
  count: number,
  today: Date | undefined,
) {
  const reduce = useReducedMotion() ?? false;
  const [ownOpen, setOwnOpen] = useState(defaultOpen ?? false);
  const open = openProp ?? ownOpen;
  const [month, setMonth] = useState<Date | undefined>(() => (anchor ? monthOf(anchor) : undefined));
  const closing = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(closing.current), []);

  const setOpen = (next: boolean) => {
    clearTimeout(closing.current);
    if (next) setMonth(anchor ? monthOf(anchor) : undefined);
    if (openProp === undefined) setOwnOpen(next);
    onOpenChange?.(next);
  };

  return {
    open,
    setOpen,
    month,
    setMonth,
    /** Closes once the circle has landed on the picked day */
    closeSoon: () => {
      clearTimeout(closing.current);
      closing.current = setTimeout(() => setOpen(false), reduce ? 0 : duration.base * 1000);
    },
    /** Pages the calendar to a picked day it isn't showing (a preset's) */
    reveal: (date: Date) => {
      // With no month set, the calendar is on today's (yours, or the clock's: this runs on a click, not a render)
      const shown = month ?? monthOf(today ?? new Date());
      const offset = monthIndex(date) - monthIndex(shown);
      if (offset < 0 || offset >= count) setMonth(monthOf(date));
    },
  };
}

/** The list of presets, with one highlight gliding to the row under the mouse or with the focus */
function PresetList<T>({
  presets,
  label,
  onPick,
}: {
  presets: DatePreset<T>[];
  label: string;
  onPick: (value: T) => void;
}) {
  const groupId = useId();
  const reduce = useReducedMotion() ?? false;
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const active = hovered ?? focused;

  return (
    <ul
      data-slot="date-picker-presets"
      aria-label={label}
      className="relative isolate flex shrink-0 flex-col gap-0.5 py-3 ps-3"
      onPointerLeave={() => setHovered(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null);
      }}
    >
      <LayoutGroup id={groupId}>
        {presets.map((preset) => (
          <li key={preset.label}>
            <button
              type="button"
              data-slot="date-picker-preset"
              onPointerEnter={(event) => {
                // Hover highlights follow the mouse only
                if (event.pointerType === "mouse") setHovered(preset.label);
              }}
              onFocus={() => setFocused(preset.label)}
              onClick={() => onPick(resolve(preset.value))}
              className={cn(
                "relative flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-start text-sm whitespace-nowrap",
                "transition-colors duration-(--duration-fast) ease-out",
                "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
                active === preset.label && "text-accent-foreground",
              )}
            >
              {/* The rows aren't stacking contexts: the pill joins the list's layer (it's `isolate`), behind every label */}
              {active === preset.label ? (
                <motion.span
                  layoutId="date-picker-preset-highlight"
                  aria-hidden
                  className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-accent"
                  transition={reduce ? { duration: 0 } : spring.snappy}
                />
              ) : null}
              {preset.label}
            </button>
          </li>
        ))}
      </LayoutGroup>
    </ul>
  );
}

/** The trigger, drawn like Select's, and the popover round whatever the picker puts in it */
function PickerFrame({
  open,
  onOpenChange,
  text,
  empty,
  size = "md",
  align,
  dialogLabel,
  className,
  children,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  text: string;
  empty: boolean;
  size?: keyof typeof triggerSizes;
  align: "start" | "center" | "end";
  dialogLabel: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion() ?? false;
  const content = useRef<HTMLDivElement>(null);

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          // A combobox that pops up a dialog (Radix adds aria-haspopup="dialog" and aria-controls)
          role="combobox"
          aria-expanded={open}
          data-slot="date-picker-trigger"
          data-size={size}
          data-placeholder={empty ? "" : undefined}
          className={cn(
            "group flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-lg border border-input bg-transparent text-start text-sm whitespace-nowrap shadow-xs",
            "transition duration-(--duration-fast) ease-out",
            "outline-ring focus-visible:border-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
            "aria-invalid:border-destructive aria-invalid:outline-destructive",
            "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
            triggerSizes[size],
            className,
          )}
          {...props}
        >
          <CalendarIcon aria-hidden className="size-(--size-icon-md) shrink-0 text-muted-foreground" />
          {/* Screen readers read this as the combobox's value; what's drawn swaps through the blur */}
          <span data-slot="date-picker-value" className="sr-only">
            {text}
          </span>
          <span aria-hidden className="grid min-w-0 flex-1">
            <AnimatePresence initial={false}>
              <motion.span
                key={text}
                {...(reduce
                  ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
                  : swap)}
                transition={
                  reduce
                    ? { duration: duration.fast }
                    : { duration: duration.base, ease: ease.out, y: spring.snappy }
                }
                // Each text keeps its own colour as it leaves, so the placeholder goes out muted
                className={cn("col-start-1 row-start-1 truncate", empty && "text-muted-foreground")}
              >
                {text}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        ref={content}
        align={align}
        aria-label={dialogLabel}
        // Focus goes to the picked day (or today), not to the first button, as in the WAI-ARIA date picker
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          content.current?.querySelector<HTMLElement>("[data-slot=calendar-day][tabindex='0']")?.focus();
        }}
        // Where two months or the presets don't fit, the calendar wraps under them
        className="flex w-auto max-w-(--radix-popover-content-available-width) flex-wrap p-0"
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}

/**
 * A date field: a trigger showing the picked day (or a placeholder) that opens a Calendar in a Popover.
 * Picking a day closes it. Give it a visible label (`<label htmlFor>`) or an aria-label.
 */
function DatePicker(props: DatePickerProps) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    presets,
    name,
    placeholder = "Pick a date",
    locale = "en-US",
    formatOptions = { dateStyle: "medium" },
    min,
    max,
    disabledDates,
    weekStartsOn,
    numberOfMonths = 1,
    today,
    labels,
    open: openProp,
    defaultOpen,
    onOpenChange,
    align = "start",
    ...trigger
  } = props;
  const controlled = "value" in props;
  const [own, setOwn] = useState(defaultValue);
  const value = controlled ? valueProp : own;
  const picker = usePicker(openProp, defaultOpen, onOpenChange, value, numberOfMonths, today);

  const commit = (next: Date | undefined) => {
    if (!controlled) setOwn(next);
    onChange?.(next);
  };

  return (
    <>
      <PickerFrame
        open={picker.open}
        onOpenChange={picker.setOpen}
        text={value ? new Intl.DateTimeFormat(locale, formatOptions).format(value) : placeholder}
        empty={!value}
        align={align}
        dialogLabel={labels?.dialog ?? "Choose date"}
        {...trigger}
      >
        {presets?.length ? (
          <PresetList
            presets={presets}
            label={labels?.presets ?? "Presets"}
            onPick={(date) => {
              commit(date);
              picker.reveal(date);
              picker.closeSoon();
            }}
          />
        ) : null}
        <Calendar
          mode="single"
          // Picking the same day again keeps it and closes, rather than clearing the field
          required
          selected={value}
          onSelect={(date) => {
            commit(date);
            picker.closeSoon();
          }}
          month={picker.month}
          onMonthChange={picker.setMonth}
          numberOfMonths={numberOfMonths}
          min={min}
          max={max}
          disabled={disabledDates}
          weekStartsOn={weekStartsOn}
          locale={locale}
          today={today}
          labels={labels}
        />
      </PickerFrame>
      {name ? <input type="hidden" name={name} value={value ? keyOf(value) : ""} /> : null}
    </>
  );
}

/**
 * A date range field: a trigger showing the picked range (or a placeholder) that opens a Calendar in range
 * mode, two months side by side by default. It stays open while you pick. Give it a visible label or an
 * aria-label.
 */
function DateRangePicker(props: DateRangePickerProps) {
  const {
    value: valueProp,
    defaultValue,
    onChange,
    presets,
    placeholder = "Pick a date range",
    locale = "en-US",
    formatOptions = { dateStyle: "medium" },
    min,
    max,
    disabledDates,
    weekStartsOn,
    numberOfMonths = 2,
    today,
    labels,
    open: openProp,
    defaultOpen,
    onOpenChange,
    align = "start",
    ...trigger
  } = props;
  const controlled = "value" in props;
  const [own, setOwn] = useState(defaultValue);
  const value = controlled ? valueProp : own;
  const picker = usePicker(openProp, defaultOpen, onOpenChange, value?.from, numberOfMonths, today);
  const from = value?.from;
  const to = value?.to;
  const format = new Intl.DateTimeFormat(locale, formatOptions);

  const commit = (next: DateRange | undefined) => {
    if (!controlled) setOwn(next);
    onChange?.(next);
  };

  return (
    <PickerFrame
      open={picker.open}
      onOpenChange={picker.setOpen}
      // Intl writes a range the short way: "Oct 12 – 18, 2026"
      text={from && to ? format.formatRange(from, to) : from ? `${format.format(from)} – …` : placeholder}
      empty={!from}
      align={align}
      dialogLabel={labels?.dialog ?? "Choose dates"}
      {...trigger}
    >
      {presets?.length ? (
        <PresetList
          presets={presets}
          label={labels?.presets ?? "Presets"}
          onPick={(range) => {
            commit(range);
            if (range.from) picker.reveal(range.from);
          }}
        />
      ) : null}
      <Calendar
        mode="range"
        selected={value}
        onSelect={commit}
        month={picker.month}
        onMonthChange={picker.setMonth}
        numberOfMonths={numberOfMonths}
        min={min}
        max={max}
        disabled={disabledDates}
        weekStartsOn={weekStartsOn}
        locale={locale}
        today={today}
        labels={labels}
      />
    </PickerFrame>
  );
}

export { DatePicker, DateRangePicker };
