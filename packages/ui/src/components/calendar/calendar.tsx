"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { blur, duration, ease, spring, swap } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import {
  AnimatePresence,
  type AnimationPlaybackControls,
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type ComponentProps,
  type KeyboardEvent,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/*
 * Calendar (roadmap, 2026-10-16: "A month view to pick dates from"). Plain Date and Intl, no date library.
 * - A grid of day buttons, the WAI-ARIA date grid: arrow keys move by day, Up and Down by week, PageUp and
 *   PageDown by month (Shift: by year), Home and End to the week's ends. One day is in the tab order
 *   (roving tabindex), and moving past the month's edge turns the page. The month's name is a polite live
 *   region, today is aria-current="date", and picked days are aria-selected.
 * - Props follow react-day-picker's main ones (mode, selected, onSelect, month, onMonthChange,
 *   numberOfMonths, disabled, weekStartsOn, showOutsideDays, fixedWeeks), so shadcn code moves over.
 * - Motion (.agents/rules/motion.md):
 *   - Turning the page, the new days come through the blur and slide 12px in from the side you're going to,
 *     like a tab panel, and the month's name swaps through `swap`. The filter is cleared afterwards.
 *   - single: the filled circle travels from the old day to the new one (Radio Group's shared mark). At rest
 *     each day draws its own circle; on a change one shared circle moves between their centres (offsets,
 *     so zoom doesn't double the trip) on spring.snappy, then hands back in the same frame.
 *   - range: picking the end, the band grows from the day picked first to the one picked last, row after
 *     row, on one eased tween (transform and opacity only). At rest each day draws its own piece. While the end
 *     is being chosen, a fainter band shows the range it would make, following the pointer and the keyboard.
 *   - Nothing animates on first paint. With reduced motion the page only fades and the rest is instant.
 * - Today is only known in the browser: a server render (or a cached page) has its own today. So the server
 *   and the first render mark no day as today, and a calendar with no month and no selection stays
 *   invisible until the browser says which month it is. Pass `today` or `defaultMonth` to avoid both.
 */

export type DateRange = { from: Date | undefined; to?: Date | undefined };

/** Days to disable, as in react-day-picker: a day, days, a range, before or after a day, weekdays, or a test */
export type Matcher =
  | boolean
  | Date
  | DateRange
  | { before: Date }
  | { after: Date }
  | { before: Date; after: Date }
  | { dayOfWeek: number | number[] }
  | ((date: Date) => boolean);

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Words the calendar says. The dates themselves come from Intl, in `locale`. */
export type CalendarLabels = { previousMonth: string; nextMonth: string; selected: string };

const defaultLabels: CalendarLabels = {
  previousMonth: "Previous month",
  nextMonth: "Next month",
  selected: "selected",
};

/** How far the new month's days slide in, in px (the same as a tab panel) */
const SLIDE = 12;
/** The most weeks a month can touch */
const WEEKS = 6;
/** How many days the keyboard looks past disabled ones for one it can land on: a year */
const SEARCH = 366;
/** A month drawn, invisibly, while the browser hasn't said which month it is */
const PLACEHOLDER = new Date(2000, 0, 1);
/** The inline styles turning the page leaves on a grid, cleared when it's done */
const LEFTOVERS = ["opacity", "transform", "filter"];

// Days are local days. Every helper builds a new Date from its parts, so time zones and daylight saving
// never shift a day.
const dayOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const monthOf = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);
const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
/** The same day in another month, kept inside it (31 January + 1 month is the end of February) */
function addMonths(date: Date, months: number) {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), last));
}
/** Months counted from year 0, to compare and count months */
const monthIndex = (date: Date) => date.getFullYear() * 12 + date.getMonth();
const pad = (value: number, length = 2) => String(value).padStart(length, "0");
/** A day as YYYY-MM-DD: it sorts like the days themselves */
const keyOf = (date: Date) =>
  `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
function dateOf(key: string) {
  const [year = 0, month = 1, day = 1] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/** The weeks a month's grid shows: whole weeks from weekStartsOn, six of them with fixedWeeks */
function weeksOf(month: Date, weekStartsOn: Weekday, fixedWeeks: boolean) {
  const offset = (month.getDay() - weekStartsOn + 7) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const count = fixedWeeks ? WEEKS : Math.ceil((offset + days) / 7);
  return Array.from({ length: count }, (_, week) =>
    Array.from({ length: 7 }, (_, day) => addDays(month, week * 7 + day - offset)),
  );
}

function matches(date: Date, matcher: Matcher | Matcher[] | undefined): boolean {
  if (matcher === undefined) return false;
  if (Array.isArray(matcher)) return matcher.some((each) => matches(date, each));
  if (typeof matcher === "boolean") return matcher;
  if (typeof matcher === "function") return matcher(date);
  const key = keyOf(date);
  if (matcher instanceof Date) return key === keyOf(matcher);
  if ("dayOfWeek" in matcher) {
    const days = Array.isArray(matcher.dayOfWeek) ? matcher.dayOfWeek : [matcher.dayOfWeek];
    return days.includes(date.getDay());
  }
  if ("from" in matcher) {
    if (!matcher.from) return false;
    const [start, end] = [keyOf(matcher.from), keyOf(matcher.to ?? matcher.from)].sort();
    return key >= (start ?? key) && key <= (end ?? key);
  }
  const before = "before" in matcher ? keyOf(matcher.before) : null;
  const after = "after" in matcher ? keyOf(matcher.after) : null;
  // Both: the days between them, or, the wrong way round, the days outside them (react-day-picker's rule)
  if (before !== null && after !== null)
    return after < before ? key > after && key < before : key < before || key > after;
  return (before !== null && key < before) || (after !== null && key > after);
}

/** Calls back at the next local midnight, so the marked day moves on with the clock */
function subscribeToMidnight(onChange: () => void) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    const now = new Date();
    timer = setTimeout(
      () => {
        onChange();
        schedule();
      },
      addDays(dayOf(now), 1).getTime() - now.getTime(),
    );
  };
  schedule();
  return () => clearTimeout(timer);
}
const todayKey = () => keyOf(new Date());
/** The server (and hydration) know no today, so their HTML always matches */
const noToday = () => null;

/** A day's centre in the calendar, in layout pixels (offsets, so transforms and zoom don't count) */
function centreOf(node: HTMLElement, root: HTMLElement) {
  let x = node.offsetWidth / 2;
  let y = node.offsetHeight / 2;
  let element: HTMLElement | null = node;
  while (element && element !== root) {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent as HTMLElement | null;
  }
  return element === root ? { x, y } : null;
}

const dayButton = (root: HTMLElement, key: string) =>
  root.querySelector<HTMLElement>(`[data-slot=calendar-day][data-day="${key}"]`);

type Point = { x: number; y: number };
/** One row's stretch of the growing band: from its first day's centre to its last's */
type Segment = { start: Point; end: Point; offset: number; length: number };
type Band = { segments: Segment[]; total: number; size: number };
/** What's picked, either mode: single keeps its day in `from` */
type Picked = { from?: Date; to?: Date };

const pickedOf = (value: Date | DateRange | undefined): Picked =>
  value instanceof Date ? { from: value } : value?.from ? { from: value.from, to: value.to } : {};

type CalendarBaseProps = Omit<ComponentProps<"div">, "onSelect" | "defaultValue" | "children"> & {
  /** The first month shown, when you control it */
  month?: Date;
  /** The first month shown at first. Defaults to the picked day's month, else today's. */
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  /** Months shown side by side */
  numberOfMonths?: number;
  /** Days that can't be picked */
  disabled?: Matcher | Matcher[];
  /** The earliest day that can be picked; the calendar doesn't page before its month */
  min?: Date;
  /** The latest day that can be picked; the calendar doesn't page past its month */
  max?: Date;
  /** 0 is Sunday */
  weekStartsOn?: Weekday;
  /** A BCP 47 language tag for the month and day names */
  locale?: string;
  /** Shows the days of the months around, muted */
  showOutsideDays?: boolean;
  /** Always six weeks, so the calendar keeps its height from month to month */
  fixedWeeks?: boolean;
  /** The day marked as today. Defaults to the browser's today, known after hydration. */
  today?: Date;
  /** single: clicking the picked day again keeps it instead of letting it go */
  required?: boolean;
  labels?: Partial<CalendarLabels>;
};

export type CalendarSingleProps = CalendarBaseProps & {
  mode?: "single";
  /** The picked day, when you control it */
  selected?: Date | undefined;
  defaultSelected?: Date;
  onSelect?: (date: Date | undefined, day: Date) => void;
};

export type CalendarRangeProps = CalendarBaseProps & {
  mode: "range";
  /** The picked range, when you control it */
  selected?: DateRange | undefined;
  defaultSelected?: DateRange;
  onSelect?: (range: DateRange | undefined, day: Date) => void;
};

export type CalendarProps = CalendarSingleProps | CalendarRangeProps;

/**
 * One row's stretch of the band while it grows: a cap where it starts, a body that stretches from there and
 * a cap riding its front. Rows fill one after another as `progress` goes from 0 to 1.
 */
function BandSegment({
  segment,
  total,
  size,
  progress,
}: {
  segment: Segment;
  /** Steps along the whole band, rows end to end */
  total: number;
  size: number;
  progress: MotionValue<number>;
}) {
  const { start, end, offset, length } = segment;
  const reach = useTransform(progress, (value) => {
    const front = value * total;
    return length > 0 ? Math.min(1, Math.max(0, (front - offset) / length)) : front >= offset ? 1 : 0;
  });
  const shown = useTransform(progress, (value) => (value * total >= offset ? 1 : 0));
  const distance = end.x - start.x;
  const ride = useTransform(reach, (value) => value * distance);
  const cap = { left: start.x - size / 2, top: start.y - size / 2, width: size, height: size };

  return (
    <>
      <motion.span className="absolute rounded-full bg-primary" style={{ ...cap, opacity: shown }} />
      {length > 0 ? (
        <>
          <motion.span
            className="absolute bg-primary"
            style={{
              left: Math.min(start.x, end.x),
              top: cap.top,
              width: Math.abs(distance),
              height: size,
              scaleX: reach,
              originX: distance >= 0 ? 0 : 1,
              opacity: shown,
            }}
          />
          <motion.span
            className="absolute rounded-full bg-primary"
            style={{ ...cap, x: ride, opacity: shown }}
          />
        </>
      ) : null}
    </>
  );
}

/**
 * The band's tint: the primary colour, thinned, so it reads on any surface (the page, a card, a popover) and
 * clearly marks the range. The growing band tints its layer instead (BAND_LAYER), which comes out the same.
 */
const BAND = "bg-primary/10 dark:bg-primary/15";
const BAND_LAYER = "opacity-10 dark:opacity-15";
/** The range you'd get, while you choose its end: the band's tint, fainter */
const PREVIEW = "bg-primary/5 dark:bg-primary/8";
/** Today: a filled circle that stands clear of any surface, deepening under the pointer */
const TODAY = "bg-primary/15 hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/25";

const dayVariants = [
  "absolute inset-0.5 flex cursor-pointer items-center justify-center rounded-full text-sm tabular-nums",
  "transition-colors duration-(--duration-fast) ease-out",
  "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
  "disabled:pointer-events-none disabled:opacity-(--opacity-disabled)",
];

/**
 * A month view to pick a day (`mode="single"`, the default) or a range (`mode="range"`) from. Each month's
 * grid is named by its month; label the calendar from the page around it when it needs more.
 */
function Calendar(props: CalendarProps) {
  const {
    mode = "single",
    selected,
    defaultSelected,
    onSelect,
    required = false,
    month: monthProp,
    defaultMonth,
    onMonthChange,
    numberOfMonths = 1,
    disabled,
    min,
    max,
    weekStartsOn = 0,
    locale = "en-US",
    showOutsideDays = true,
    fixedWeeks = true,
    today: todayProp,
    labels: labelsProp,
    className,
    ref,
    ...rest
  } = props;
  const id = useId();
  const reduce = useReducedMotion() ?? false;
  const labels = { ...defaultLabels, ...labelsProp };
  const range = mode === "range";
  const count = Math.max(1, Math.floor(numberOfMonths));
  const root = useRef<HTMLDivElement>(null);
  const monthsBox = useRef<HTMLDivElement>(null);

  // What's picked, controlled or not
  const controlled = "selected" in props;
  const [own, setOwn] = useState<Picked>(() => pickedOf(defaultSelected));
  const picked = controlled ? pickedOf(selected) : own;
  const fromKey = picked.from ? keyOf(picked.from) : null;
  const toKey = range && picked.to ? keyOf(picked.to) : null;
  // The day the pointer (or the keyboard) is on, so a range being chosen can show where it would end
  const [hoverKey, setHoverKey] = useState<string | null>(null);
  const preview =
    range && fromKey !== null && toKey === null && hoverKey !== null && hoverKey !== fromKey
      ? hoverKey < fromKey
        ? { lo: hoverKey, hi: fromKey }
        : { lo: fromKey, hi: hoverKey }
      : null;

  // The month: yours, else the one paged to, else the picked day's, else today's
  const browserToday = useSyncExternalStore(subscribeToMidnight, todayKey, noToday);
  const today = todayProp ? dayOf(todayProp) : browserToday ? dateOf(browserToday) : undefined;
  const todayDay = today ? keyOf(today) : null;
  const [ownMonth, setOwnMonth] = useState<Date | undefined>(() => {
    const start = defaultMonth ?? picked.from;
    return start ? monthOf(start) : undefined;
  });
  const month = monthProp ? monthOf(monthProp) : (ownMonth ?? (today ? monthOf(today) : undefined));
  const pending = month === undefined;
  const first = month ?? PLACEHOLDER;
  const firstIndex = monthIndex(first);
  const lastIndex = firstIndex + count - 1;
  // Each slot keeps its element from month to month, so its name can swap and its days slide in
  const months = Array.from({ length: count }, (_, slot) => ({
    slot,
    date: new Date(first.getFullYear(), first.getMonth() + slot, 1),
  }));
  const inView = (date: Date) => monthIndex(date) >= firstIndex && monthIndex(date) <= lastIndex;

  const minKey = min ? keyOf(min) : null;
  const maxKey = max ? keyOf(max) : null;
  const outOfBounds = (key: string) => (minKey !== null && key < minKey) || (maxKey !== null && key > maxKey);
  const isDisabled = (date: Date) => outOfBounds(keyOf(date)) || matches(date, disabled);
  const canGoBack = !pending && (!min || monthIndex(min) < firstIndex);
  const canGoForward = !pending && (!max || monthIndex(max) > lastIndex);

  const format = useMemo(
    () => ({
      caption: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
      day: new Intl.DateTimeFormat(locale, { day: "numeric" }),
      label: new Intl.DateTimeFormat(locale, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      weekday: new Intl.DateTimeFormat(locale, { weekday: "short" }),
    }),
    [locale],
  );
  // 7 January 2024 was a Sunday, so the week from it names each weekday
  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const weekday = (weekStartsOn + index) % 7;
        return { weekday, name: format.weekday.format(new Date(2024, 0, 7 + weekday)) };
      }),
    [format, weekStartsOn],
  );

  function goToMonth(next: Date) {
    let target = monthOf(next);
    // The months shown stay inside the limits
    if (max && monthIndex(target) + count - 1 > monthIndex(max))
      target = new Date(max.getFullYear(), max.getMonth() - count + 1, 1);
    if (min && monthIndex(target) < monthIndex(min)) target = monthOf(min);
    if (!pending && monthIndex(target) === firstIndex) return;
    if (!monthProp) setOwnMonth(target);
    onMonthChange?.(target);
  }

  // Roving focus: the day the keyboard is on, else the picked day, today, or the first day that can be picked
  const [focused, setFocused] = useState<Date>();
  const focusPending = useRef(false);
  const tabbable = (() => {
    for (const date of [focused, picked.from, today]) {
      if (date && inView(date) && !isDisabled(date)) return keyOf(date);
    }
    for (const { date: shown } of months) {
      for (let day = shown; day.getMonth() === shown.getMonth(); day = addDays(day, 1)) {
        if (!isDisabled(day)) return keyOf(day);
      }
    }
    return null;
  })();

  function pick(day: Date) {
    if (isDisabled(day)) return;
    setFocused(day);
    const key = keyOf(day);
    let next: Picked;
    if (range) {
      // The first click starts a range, the second ends it (either way round), and a third starts again
      const { from, to } = picked;
      if (!from || to) next = { from: day };
      else if (key < keyOf(from)) next = { from: day, to: from };
      else next = { from, to: day };
    } else {
      next = fromKey === key && !required ? {} : { from: day };
    }
    if (!controlled) setOwn(next);
    if (range)
      (onSelect as CalendarRangeProps["onSelect"])?.(
        next.from ? { from: next.from, to: next.to } : undefined,
        day,
      );
    else (onSelect as CalendarSingleProps["onSelect"])?.(next.from, day);
  }

  function move(from: Date, event: KeyboardEvent<HTMLButtonElement>) {
    // Left and right follow the page's direction
    const forward = getComputedStyle(event.currentTarget).direction === "rtl" ? -1 : 1;
    const weekday = (from.getDay() - weekStartsOn + 7) % 7;
    let target: Date;
    // Which way to look past a disabled day
    let step: number;
    switch (event.key) {
      case "ArrowLeft":
        step = -forward;
        target = addDays(from, step);
        break;
      case "ArrowRight":
        step = forward;
        target = addDays(from, step);
        break;
      case "ArrowUp":
        step = -1;
        target = addDays(from, -7);
        break;
      case "ArrowDown":
        step = 1;
        target = addDays(from, 7);
        break;
      case "PageUp":
        step = -1;
        target = addMonths(from, event.shiftKey ? -12 : -1);
        break;
      case "PageDown":
        step = 1;
        target = addMonths(from, event.shiftKey ? 12 : 1);
        break;
      case "Home":
        step = 1;
        target = addDays(from, -weekday);
        break;
      case "End":
        step = -1;
        target = addDays(from, 6 - weekday);
        break;
      default:
        return;
    }
    event.preventDefault();
    // Inside the limits, then on past disabled days, a day at a time
    if (min && keyOf(target) < keyOf(min)) {
      target = dayOf(min);
      step = 1;
    }
    if (max && keyOf(target) > keyOf(max)) {
      target = dayOf(max);
      step = -1;
    }
    for (let tries = 0; isDisabled(target); tries++) {
      target = addDays(target, step);
      if (tries > SEARCH || outOfBounds(keyOf(target))) return;
    }
    if (keyOf(target) === keyOf(from)) return;
    setFocused(target);
    focusPending.current = true;
    if (!inView(target))
      goToMonth(monthIndex(target) < firstIndex ? target : addMonths(monthOf(target), 1 - count));
  }

  // After a key moves the focus (and maybe the page), the day it landed on takes it
  useLayoutEffect(() => {
    if (!focusPending.current) return;
    focusPending.current = false;
    const key = focused ? keyOf(focused) : null;
    if (key)
      root.current
        ?.querySelector<HTMLElement>(`[data-slot=calendar-day][data-day="${key}"]:not([data-outside])`)
        ?.focus();
  });

  // The shared circle (single) and the growing band (range)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const progress = useMotionValue(0);
  /** The travelling circle's diameter while it travels */
  const [trip, setTrip] = useState<number | null>(null);
  /** The day the circle is on its way to; its own circle waits until it lands */
  const [arriving, setArriving] = useState<string | null>(null);
  /** Whether the circle covers that day yet, so its number can turn light */
  const [covered, setCovered] = useState(false);
  const [band, setBand] = useState<Band | null>(null);
  const running = useRef<AnimationPlaybackControls[]>([]);
  const runId = useRef(0);
  const last = useRef({ from: fromKey, to: toKey, page: pending ? null : firstIndex });

  // Unmounting mid-trip stops the animations
  useEffect(
    () => () => {
      for (const animation of running.current) animation.stop();
    },
    [],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: only a new pick starts a trip or a growth
  useLayoutEffect(() => {
    const before = last.current;
    const page = pending ? null : firstIndex;
    last.current = { from: fromKey, to: toKey, page };
    if (before.from === fromKey && before.to === toKey) return;
    for (const animation of running.current) animation.stop();
    running.current = [];
    const id = ++runId.current;
    const box = root.current;
    const settle = () => {
      setTrip(null);
      setArriving(null);
      setCovered(false);
      setBand(null);
    };
    // A pick that arrives with a new page (or the first page) simply shows
    if (reduce || !box || page === null || before.page !== page) {
      settle();
      return;
    }

    if (range) {
      setTrip(null);
      setArriving(null);
      if (!fromKey || !toKey || fromKey === toKey) {
        setBand(null);
        return;
      }
      // The band grows from the day picked first: the end, when the end was picked before the start
      const backward = before.to === null && before.from === toKey;
      const days = Array.from(box.querySelectorAll<HTMLElement>("[data-slot=calendar-day]")).filter((day) => {
        const key = day.dataset.day ?? "";
        return key >= fromKey && key <= toKey;
      });
      if (backward) days.reverse();
      // One segment per row, measured centre to centre; `total` counts the steps along every row
      const segments: Segment[] = [];
      let total = 0;
      let row: Element | null = null;
      for (const day of days) {
        const centre = centreOf(day, box);
        if (!centre) continue;
        const current = segments.at(-1);
        const parent = day.closest("[role=row]");
        if (current && parent === row) {
          current.end = centre;
          current.length += 1;
          total += 1;
        } else {
          segments.push({ start: centre, end: centre, offset: total, length: 0 });
        }
        row = parent;
      }
      if (total === 0) {
        setBand(null);
        return;
      }
      setBand({ segments, total, size: days[0]?.offsetWidth ?? 0 });
      progress.jump(0);
      const growth = animate(progress, 1, { duration: duration.slow, ease: ease.out });
      running.current = [growth];
      growth.then(() => {
        if (id === runId.current) setBand(null);
      });
      return;
    }

    setBand(null);
    const start = before.from ? dayButton(box, before.from) : null;
    const end = fromKey ? dayButton(box, fromKey) : null;
    const a = start ? centreOf(start, box) : null;
    const b = end ? centreOf(end, box) : null;
    if (!end || !a || !b) {
      settle();
      return;
    }
    const size = end.offsetWidth;
    // Placed with jump(), which resets the speed (set() would count the jump as speed and overshoot). Mid-trip
    // it carries on from where it is with its speed, so it curves to the new day.
    if (trip === null) {
      x.jump(a.x);
      y.jump(a.y);
    }
    setTrip(size);
    setArriving(fromKey);
    setCovered(false);
    // The day's number turns light once the circle covers it
    const cover = () => {
      if (Math.hypot(x.get() - b.x, y.get() - b.y) <= size / 2) setCovered(true);
    };
    const trips = [
      animate(x, b.x, { ...spring.snappy, onUpdate: cover }),
      animate(y, b.y, { ...spring.snappy, onUpdate: cover }),
    ];
    running.current = trips;
    Promise.all(trips).then(() => {
      if (id !== runId.current) return;
      running.current = [];
      settle();
    });
  }, [fromKey, toKey, firstIndex, pending]);

  // The months' height, kept current, so a new month of another height can glide from it
  const height = useRef(0);
  useLayoutEffect(() => {
    const box = monthsBox.current;
    if (!box) return;
    height.current = box.offsetHeight;
    const observer = new ResizeObserver(() => {
      height.current = box.offsetHeight;
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // Turning the page: the new days come through the blur from the side you're going to
  const lastPage = useRef<number | null>(pending ? null : firstIndex);
  // biome-ignore lint/correctness/useExhaustiveDependencies: only turning the page slides the days in
  useLayoutEffect(() => {
    const before = lastPage.current;
    const page = pending ? null : firstIndex;
    lastPage.current = page;
    const box = root.current;
    const wrap = monthsBox.current;
    if (!box || !wrap || before === null || page === null || before === page) return;
    // From the right going forward, or from the left on a right-to-left page
    const side = (page > before ? 1 : -1) * (getComputedStyle(box).direction === "rtl" ? -1 : 1);
    const grids = Array.from(box.querySelectorAll<HTMLElement>("[data-slot=calendar-grid]"));
    const runs = grids.map((grid) => {
      const entrance = animate(
        grid,
        reduce
          ? { opacity: [0, 1] }
          : { opacity: [0, 1], x: [side * SLIDE, 0], filter: [blur.hidden, blur.shown] },
        { duration: duration.base, ease: ease.out },
      );
      // A filter left behind would leave a stacking context round the days
      entrance.then(() => grid.style.removeProperty("filter"));
      return entrance;
    });
    // Without fixedWeeks a month can be a row taller or shorter, and the calendar glides to its new height.
    // Inside a popover it doesn't: the popover glides itself (Popover), and two glides would go in two steps.
    const start = height.current;
    const end = wrap.offsetHeight;
    if (!reduce && start > 0 && end > 0 && start !== end && !box.closest("[data-slot=popover-content]")) {
      wrap.style.overflow = "hidden";
      const glide = animate(wrap, { height: [start, end] }, { duration: duration.slow, ease: ease.out });
      glide.then(() => {
        wrap.style.removeProperty("height");
        wrap.style.removeProperty("overflow");
      });
      runs.push(glide);
    }
    // Paged again mid-entrance: stop, and leave nothing behind for the next one
    return () => {
      for (const run of runs) run.stop();
      for (const grid of grids) for (const property of LEFTOVERS) grid.style.removeProperty(property);
      wrap.style.removeProperty("height");
      wrap.style.removeProperty("overflow");
    };
  }, [firstIndex, pending]);

  const caption = (date: Date, slot: number) => {
    const name = format.caption.format(date);
    return (
      <div
        data-slot="calendar-caption"
        className="relative flex h-(--size-control-md) items-center justify-center"
      >
        {slot === 0 ? (
          <Button
            variant="ghost"
            size="icon-sm"
            data-slot="calendar-previous"
            aria-label={labels.previousMonth}
            // Still focusable at the limit, so the focus isn't lost when it can go no further
            aria-disabled={!canGoBack || undefined}
            onClick={() => {
              if (canGoBack) goToMonth(new Date(first.getFullYear(), first.getMonth() - 1, 1));
            }}
            className="absolute start-0 aria-disabled:pointer-events-none aria-disabled:opacity-(--opacity-disabled)"
          >
            <ChevronLeftIcon aria-hidden className="rtl:rotate-180" />
          </Button>
        ) : null}
        {/* The name is read out when the page turns; what's drawn swaps through the blur */}
        <div aria-live="polite" className="text-sm font-medium">
          <span id={`${id}-${slot}`} className="sr-only">
            {name}
          </span>
          <span aria-hidden className="grid">
            {pending ? null : (
              <AnimatePresence initial={false}>
                <motion.span
                  key={name}
                  {...(reduce
                    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
                    : swap)}
                  transition={
                    reduce
                      ? { duration: duration.fast }
                      : { duration: duration.base, ease: ease.out, y: spring.snappy }
                  }
                  className="col-start-1 row-start-1 text-center whitespace-nowrap"
                >
                  {name}
                </motion.span>
              </AnimatePresence>
            )}
          </span>
        </div>
        {slot === count - 1 ? (
          <Button
            variant="ghost"
            size="icon-sm"
            data-slot="calendar-next"
            aria-label={labels.nextMonth}
            aria-disabled={!canGoForward || undefined}
            onClick={() => {
              if (canGoForward) goToMonth(new Date(first.getFullYear(), first.getMonth() + 1, 1));
            }}
            className="absolute end-0 aria-disabled:pointer-events-none aria-disabled:opacity-(--opacity-disabled)"
          >
            <ChevronRightIcon aria-hidden className="rtl:rotate-180" />
          </Button>
        ) : null}
      </div>
    );
  };

  /** One day: its cell, its piece of the band (or of the preview), and its button with its circle */
  const cell = (day: Date, shown: Date, visible: boolean, joinsBefore: boolean, joinsAfter: boolean) => {
    const key = keyOf(day);
    // An empty cell holds the place of a day that isn't shown (outside days, or another shown month's)
    if (!visible)
      return (
        // biome-ignore lint/a11y/useSemanticElements: a cell of the WAI-ARIA date grid; the grid is built from divs so its rows can lay out and slide freely
        // biome-ignore lint/a11y/useFocusableInteractive: an empty cell, with nothing to focus
        <div key={key} role="gridcell" className="size-(--size-control-md)" />
      );
    const outside = day.getMonth() !== shown.getMonth();
    const endpoint = key === fromKey || key === toKey;
    const middle = fromKey !== null && toKey !== null && key > fromKey && key < toKey;
    const isPicked = endpoint || middle;
    const waiting = arriving === key && !covered;
    const off = isDisabled(day);
    const isToday = key === todayDay;
    const previewed = preview !== null && key >= preview.lo && key <= preview.hi;
    // The day you're on while choosing a range's end already looks like the end it would be
    const previewEnd = preview !== null && key === hoverKey;
    const label = format.label.format(day);

    return (
      // biome-ignore lint/a11y/useSemanticElements: a cell of the WAI-ARIA date grid, built from divs like its rows
      // biome-ignore lint/a11y/useFocusableInteractive: focus lives on the day's button inside the cell, with a roving tabindex
      <div
        key={key}
        role="gridcell"
        aria-selected={isPicked || undefined}
        className="relative size-(--size-control-md)"
      >
        {/* The band at rest: each day in the range draws its piece, from its centre at the ends, rounded where the row breaks */}
        {fromKey !== null && toKey !== null && fromKey !== toKey && isPicked && band === null ? (
          <span
            aria-hidden
            data-slot="calendar-range"
            className={cn(
              "pointer-events-none absolute inset-y-0.5 -z-20",
              BAND,
              key === fromKey ? "start-1/2" : "start-0",
              key === toKey ? "end-1/2" : "end-0",
              key !== fromKey && !joinsBefore && "rounded-s-full",
              key !== toKey && !joinsAfter && "rounded-e-full",
            )}
          />
        ) : null}
        {/* The range it would make, while you choose its end: fainter, ending under the day you're on */}
        {previewed && preview ? (
          <span
            aria-hidden
            data-slot="calendar-preview"
            className={cn(
              "pointer-events-none absolute inset-y-0.5 -z-20",
              PREVIEW,
              key === preview.lo ? "start-1/2" : "start-0",
              key === preview.hi ? "end-1/2" : "end-0",
              key !== preview.lo && !joinsBefore && "rounded-s-full",
              key !== preview.hi && !joinsAfter && "rounded-e-full",
            )}
          />
        ) : null}
        <button
          type="button"
          data-slot="calendar-day"
          data-day={key}
          data-outside={outside ? "" : undefined}
          data-today={isToday ? "" : undefined}
          data-selected={isPicked ? "" : undefined}
          data-range-start={range && key === fromKey ? "" : undefined}
          data-range-end={key === toKey ? "" : undefined}
          data-range-middle={middle ? "" : undefined}
          disabled={off}
          tabIndex={key === tabbable && !outside ? 0 : -1}
          aria-label={isPicked ? `${label}, ${labels.selected}` : label}
          aria-current={isToday ? "date" : undefined}
          onClick={() => pick(day)}
          onPointerEnter={() => setHoverKey(key)}
          onFocus={() => {
            setFocused(day);
            setHoverKey(key);
          }}
          onKeyDown={(event) => move(day, event)}
          className={cn(
            dayVariants,
            (endpoint && !waiting) || previewEnd
              ? "text-primary-foreground"
              : middle || previewed
                ? "text-foreground"
                : outside || off
                  ? "text-muted-foreground"
                  : "text-foreground",
            // Today is a filled circle in heavier type; picked or in a range, it takes that look instead
            isToday && "font-semibold",
            isToday && !isPicked && !previewed && TODAY,
            !isPicked && !previewEnd && !isToday && "hover:bg-accent hover:text-accent-foreground",
            // Inside the band a day you point at deepens it, rather than covering it in grey
            middle && "hover:bg-primary/10",
          )}
        >
          {/* Shows and goes at once, handing over to and from the travelling circle */}
          {(endpoint && arriving !== key) || previewEnd ? (
            <span
              aria-hidden
              data-slot={previewEnd ? "calendar-preview-end" : undefined}
              className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-primary"
            />
          ) : null}
          {format.day.format(day)}
        </button>
      </div>
    );
  };

  return (
    <div
      ref={(node) => {
        root.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="calendar"
      data-mode={mode}
      // Until the browser says which month it is, the calendar holds its place without showing a wrong month
      aria-hidden={pending || undefined}
      className={cn("relative isolate w-fit p-4", pending && "invisible", className)}
      {...rest}
    >
      {band ? (
        // The band while it grows, under every day (the cells aren't stacking contexts; the calendar is `isolate`)
        <span
          aria-hidden
          data-slot="calendar-band"
          // Its pieces are solid and the layer is tinted as one, so where the caps overlap the body it never darkens
          className={cn("pointer-events-none absolute inset-0 -z-20", BAND_LAYER)}
        >
          {band.segments.map((segment) => (
            <BandSegment
              key={`${segment.start.x},${segment.start.y}`}
              segment={segment}
              total={band.total}
              size={band.size}
              progress={progress}
            />
          ))}
        </span>
      ) : null}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: only clears the drawn preview; the days are the controls */}
      <div
        ref={monthsBox}
        data-slot="calendar-months"
        // The preview follows the pointer and the keyboard, and goes when both have left
        onPointerLeave={() => setHoverKey(null)}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setHoverKey(null);
        }}
        className="flex flex-wrap justify-center gap-x-8 gap-y-6"
      >
        {months.map(({ slot, date: shown }) => {
          const weeks = weeksOf(shown, weekStartsOn, fixedWeeks);
          // Outside days show unless another shown month already has them
          const visible = (day: Date) =>
            day.getMonth() === shown.getMonth() || (showOutsideDays && !inView(day));
          return (
            <div key={slot} data-slot="calendar-month" className="flex flex-col gap-4">
              {caption(shown, slot)}
              <div className="flex flex-col gap-1">
                {/* Each day's button says its weekday, so the names above the columns are only drawn */}
                <div aria-hidden className="flex">
                  {weekdays.map(({ weekday, name }) => (
                    <span
                      key={weekday}
                      className="flex h-8 w-(--size-control-md) items-center justify-center text-xs font-medium text-muted-foreground"
                    >
                      {name}
                    </span>
                  ))}
                </div>
                {/* biome-ignore lint/a11y/useSemanticElements: the WAI-ARIA date grid, built from divs so its weeks can lay out as rows of circles and slide in as one */}
                <div
                  role="grid"
                  aria-labelledby={`${id}-${slot}`}
                  aria-multiselectable={range || undefined}
                  data-slot="calendar-grid"
                  className="flex flex-col"
                >
                  {weeks.map((week) => {
                    const shownDays = week.map(visible);
                    return (
                      // biome-ignore lint/a11y/useSemanticElements: a row of the WAI-ARIA date grid, built from divs like the grid
                      // biome-ignore lint/a11y/useFocusableInteractive: focus lives on the day buttons inside the row
                      <div key={keyOf(week[0] ?? shown)} role="row" className="flex">
                        {week.map((day, column) =>
                          cell(
                            day,
                            shown,
                            shownDays[column] ?? false,
                            shownDays[column - 1] ?? false,
                            shownDays[column + 1] ?? false,
                          ),
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {trip !== null ? (
        // The travelling circle: a point at its centre, with the circle drawn round it, under the days' numbers
        <motion.span
          aria-hidden
          data-slot="calendar-travelling-day"
          className="pointer-events-none absolute top-0 left-0 -z-10 size-0"
          style={{ x, y }}
        >
          <span
            className="absolute rounded-full bg-primary"
            style={{ left: -trip / 2, top: -trip / 2, width: trip, height: trip }}
          />
        </motion.span>
      ) : null}
    </div>
  );
}

export { Calendar };
