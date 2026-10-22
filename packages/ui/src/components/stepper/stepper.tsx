"use client";

import { blur, duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { Slot } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type MouseEvent,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/*
 * Stepper: progress through the steps of a task (owner's roadmap, 2026-10-16), such as a checkout or a setup.
 * shadcn has none, so the parts are ours, named the shadcn way: Stepper (an ordered list), StepperItem,
 * StepperTrigger, StepperIndicator, StepperTitle, StepperDescription and StepperSeparator.
 * - State: `value` is the current step, from 1; the steps before it are completed, and a value past the last
 *   step marks them all done. Controlled or not (value / defaultValue / onValueChange), horizontal or vertical.
 * - Motion (the crafted part, .agents/rules/motion.md): progress travels along the line. Moving on, the step you
 *   leave swaps its number for a check that draws itself in (Checkbox's check), the line to the next step fills
 *   (scaleX, or scaleY when vertical, on an eased tween: duration.slow, ease-in-out, never a spring), and the next
 *   step takes the ring as the fill arrives. Jumping several steps fills each line in turn. Going back plays it
 *   backwards: the ring leaves, the lines empty towards the step you picked, and as the emptying reaches it, its
 *   check erases and its number comes back through the blur.
 * - Fills and colours only fade; the number comes and goes through the blur; the ring grows into place as it
 *   fades in. Nothing moves on first paint, and with reduced motion it all changes at once.
 * - Keyboard and screen readers: each step is a button (or, with asChild, a link) in the tab order, named by its
 *   title; the current one has aria-current="step". It's an `ol`, so it's read as a list of so many steps.
 */

type StepState = "completed" | "active" | "inactive";
type Orientation = "horizontal" | "vertical";

/** One line's fill. Each step along the way waits for the line before it. */
const LEG = duration.slow;

type StepperContextValue = {
  value: number;
  /** The step the last change came from, while its progress is still travelling; then the same as value */
  from: number;
  orientation: Orientation;
  reduce: boolean;
  setValue: (step: number) => void;
};
const StepperContext = createContext<StepperContextValue | null>(null);

function useStepper(part: string) {
  const context = useContext(StepperContext);
  if (!context) throw new Error(`${part} must be used inside Stepper`);
  return context;
}

type StepperItemContextValue = {
  step: number;
  state: StepState;
  disabled: boolean;
  /** Seconds until this step's indicator changes: when the travelling progress reaches it */
  delay: number;
  /** Seconds until the line after this step starts filling or emptying */
  lineDelay: number;
};
const StepperItemContext = createContext<StepperItemContextValue | null>(null);

function useStepperItem(part: string) {
  const context = useContext(StepperItemContext);
  if (!context) throw new Error(`${part} must be used inside StepperItem`);
  return context;
}

/** A number of legs, in seconds (to the millisecond, so 3 × 0.35 is 1.05) */
const legs = (count: number) => Math.round(count * LEG * 1000) / 1000;

/** When a step changes and when the line after it moves, as progress travels from `from` to `to` */
function timingOf(step: number, from: number, to: number) {
  if (to > from) {
    return {
      delay: step >= from && step <= to ? legs(step - from) : 0,
      lineDelay: step >= from && step < to ? legs(step - from) : 0,
    };
  }
  if (to < from) {
    return {
      delay: step >= to && step <= from ? legs(from - step) : 0,
      lineDelay: step >= to && step < from ? legs(from - 1 - step) : 0,
    };
  }
  return { delay: 0, lineDelay: 0 };
}

export type StepperProps = Omit<ComponentProps<"ol">, "defaultValue" | "onChange"> & {
  /** The current step, from 1, when you control it. Past the last step, every step is done */
  value?: number;
  /** The current step at first */
  defaultValue?: number;
  /** Called with the step a trigger was pressed for */
  onValueChange?: (value: number) => void;
  orientation?: Orientation;
};

/** The steps of a task, in order. Give it a name with aria-label ("Checkout") */
function Stepper({
  value,
  defaultValue = 1,
  onValueChange,
  orientation = "horizontal",
  className,
  ...props
}: StepperProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const current = value ?? uncontrolled;
  const reduce = useReducedMotion() ?? false;
  // Where the last change came from, so progress can travel from there. Once it has arrived, `from` catches up
  // and every delay is 0 again, so hovering a step never waits.
  const [shown, setShown] = useState(current);
  const [from, setFrom] = useState(current);
  if (current !== shown) {
    setShown(current);
    setFrom(shown);
  }
  useEffect(() => {
    if (from === current) return;
    const timer = setTimeout(() => setFrom(current), (Math.abs(current - from) + 1) * LEG * 1000);
    return () => clearTimeout(timer);
  }, [from, current]);

  const setValue = useCallback(
    (step: number) => {
      if (value === undefined) setUncontrolled(step);
      onValueChange?.(step);
    },
    [value, onValueChange],
  );
  const context = useMemo(
    () => ({ value: current, from: reduce ? current : from, orientation, reduce, setValue }),
    [current, from, orientation, reduce, setValue],
  );

  return (
    <StepperContext.Provider value={context}>
      <ol
        data-slot="stepper"
        data-orientation={orientation}
        className={cn(
          "flex",
          orientation === "horizontal" ? "w-full items-start gap-3" : "flex-col",
          className,
        )}
        {...props}
      />
    </StepperContext.Provider>
  );
}

export type StepperItemProps = ComponentProps<"li"> & {
  /** Its place in the task, from 1 */
  step: number;
  /** Done (true) or not (false), whatever the current step. Left out, the steps before the current one are done */
  completed?: boolean;
  /** Its trigger can't be pressed, for example a step that isn't reachable yet */
  disabled?: boolean;
};

/** One step. Holds its trigger and the separator to the next step */
function StepperItem({ step, completed, disabled = false, className, ...props }: StepperItemProps) {
  const { value, from, orientation } = useStepper("StepperItem");
  const state: StepState = (completed ?? step < value) ? "completed" : step === value ? "active" : "inactive";
  const { delay, lineDelay } = timingOf(step, from, value);
  const item = useMemo(
    () => ({ step, state, disabled, delay, lineDelay }),
    [step, state, disabled, delay, lineDelay],
  );

  return (
    <StepperItemContext.Provider value={item}>
      <li
        data-slot="stepper-item"
        data-state={state}
        data-disabled={disabled || undefined}
        className={cn(
          "group/step",
          // Horizontal: the trigger, then the line, which takes the room up to the next step
          orientation === "horizontal" ? "flex items-start gap-3 not-last:flex-1" : "relative not-last:pb-6",
          className,
        )}
        {...props}
      />
    </StepperItemContext.Provider>
  );
}

export type StepperTriggerProps = ComponentProps<"button"> & {
  /** Render the single child instead of a button, for example a link to the step's page */
  asChild?: boolean;
};

/**
 * Goes to its step. Holds the indicator, the title and the description, laid out in two columns. The current
 * step's trigger has aria-current="step".
 */
function StepperTrigger({ className, asChild = false, onClick, style, ...props }: StepperTriggerProps) {
  const { setValue, reduce } = useStepper("StepperTrigger");
  const { step, state, disabled, delay } = useStepperItem("StepperTrigger");
  const Comp = asChild ? Slot.Root : "button";

  return (
    <Comp
      data-slot="stepper-trigger"
      data-state={state}
      type={asChild ? undefined : "button"}
      aria-current={state === "active" ? "step" : undefined}
      disabled={asChild ? undefined : disabled}
      aria-disabled={asChild && disabled ? true : undefined}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (disabled) {
          // A disabled link mustn't navigate either
          event.preventDefault();
          return;
        }
        setValue(step);
      }}
      className={cn(
        // Two columns: the indicator, spanning both rows, then the title over the description
        "group/trigger grid cursor-pointer items-start justify-items-start gap-x-2 rounded-md text-start",
        "transition-opacity duration-(--duration-base) ease-out",
        "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        "disabled:pointer-events-none disabled:opacity-(--opacity-disabled) aria-disabled:pointer-events-none aria-disabled:opacity-(--opacity-disabled)",
        className,
      )}
      // A step that becomes reachable brightens as the progress arrives
      style={{ transitionDelay: `${reduce ? 0 : delay}s`, ...style }}
      {...props}
    />
  );
}

/** The same check as Checkbox, Copy Button and Loading Button */
const CHECK = "M5 12.5l4.5 4.5L19 7.5";

export type StepperIndicatorProps = ComponentProps<"span">;

/**
 * The step's circle: its number, a check once it's done, and a ring round the current one. Pass children (an
 * icon) to show them instead of the number and the check. Hidden from screen readers: the title names the step.
 */
function StepperIndicator({ className, children, style, ...props }: StepperIndicatorProps) {
  const { reduce } = useStepper("StepperIndicator");
  const { step, state, delay } = useStepperItem("StepperIndicator");
  const done = state === "completed";
  const active = state === "active";
  const wait = reduce ? 0 : delay;

  return (
    <span
      aria-hidden
      data-slot="stepper-indicator"
      data-state={state}
      className={cn(
        "relative row-span-2 inline-grid size-6 shrink-0 place-items-center rounded-full text-xs font-medium tabular-nums",
        // The fill only fades (motion.md), when the progress reaches the step
        "bg-muted text-muted-foreground transition-colors duration-(--duration-base) ease-out",
        "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
        "data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground",
        "group-hover/trigger:data-[state=inactive]:text-foreground",
        "[&_svg]:pointer-events-none [&>svg]:size-3.5",
        className,
      )}
      style={{ transitionDelay: `${wait}s`, ...style }}
      {...props}
    >
      {/* The ring round the current step grows into place as it fades in */}
      <motion.span
        data-slot="stepper-ring"
        className="pointer-events-none absolute -inset-1 rounded-full border border-primary/30"
        initial={false}
        animate={active ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={
          reduce
            ? { duration: 0 }
            : { duration: duration.base, ease: active ? ease.out : ease.in, delay: wait }
        }
      />
      {children ?? (
        <>
          {/* The number lifts away through the blur as the check draws in, and comes back the same way */}
          <motion.span
            className="col-start-1 row-start-1"
            initial={false}
            // The same hidden state with reduced motion (it's instant then, so the blur never shows), so the
            // server's HTML always hydrates
            animate={done ? { opacity: 0, filter: blur.hidden } : { opacity: 1, filter: blur.shown }}
            transition={
              reduce
                ? { duration: 0 }
                : {
                    duration: duration.fast,
                    ease: done ? ease.in : ease.out,
                    delay: done ? wait : wait + duration.fast,
                  }
            }
          >
            {step}
          </motion.span>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden className="col-start-1 row-start-1">
            {/* Opacity goes with the length, so a round cap never leaves a dot behind */}
            <motion.path
              d={CHECK}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={false}
              animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : done
                    ? {
                        pathLength: {
                          duration: duration.base,
                          ease: ease.out,
                          delay: wait + duration.instant,
                        },
                        opacity: { duration: 0, delay: wait + duration.instant },
                      }
                    : { duration: duration.fast, ease: ease.in, delay: wait }
              }
            />
          </svg>
        </>
      )}
    </span>
  );
}

/** The step's name, beside the indicator. Muted until the progress reaches it */
function StepperTitle({ className, style, ...props }: ComponentProps<"span">) {
  const { reduce } = useStepper("StepperTitle");
  const { state, delay } = useStepperItem("StepperTitle");
  return (
    <span
      data-slot="stepper-title"
      data-state={state}
      className={cn(
        // As tall as the indicator, so the two are centred on one line
        "col-start-2 row-start-1 text-sm leading-6 font-medium text-muted-foreground",
        "transition-colors duration-(--duration-base) ease-out group-hover/trigger:text-foreground",
        "data-[state=active]:text-foreground data-[state=completed]:text-foreground",
        className,
      )}
      style={{ transitionDelay: `${reduce ? 0 : delay}s`, ...style }}
      {...props}
    />
  );
}

/** A line under the title */
function StepperDescription({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="stepper-description"
      className={cn("col-start-2 row-start-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * The line to the next step. It fills when this step is done, and empties the way it came. Hidden in the last
 * step, so it can be written in every item.
 */
function StepperSeparator({ className, ...props }: ComponentProps<"div">) {
  const { orientation, reduce } = useStepper("StepperSeparator");
  const { state, lineDelay } = useStepperItem("StepperSeparator");
  const filled = state === "completed";
  const horizontal = orientation === "horizontal";

  return (
    <div
      aria-hidden
      data-slot="stepper-separator"
      data-state={filled ? "filled" : "empty"}
      className={cn(
        "overflow-hidden rounded-full bg-border group-last/step:hidden",
        horizontal
          ? // Centred on the indicators' middle line
            "relative mt-3 h-0.5 min-w-4 flex-1 -translate-y-1/2"
          : // Down the indicators' middle, with a 4px gap at each end
            "absolute start-3 top-7 bottom-1 w-0.5 -translate-x-1/2 rtl:translate-x-1/2",
        className,
      )}
      {...props}
    >
      <div
        data-slot="stepper-separator-fill"
        className={cn(
          "absolute inset-0 rounded-full bg-primary transition-transform duration-(--duration-slow) ease-in-out",
          horizontal ? "origin-left rtl:origin-right" : "origin-top",
          !filled && (horizontal ? "scale-x-0" : "scale-y-0"),
        )}
        style={{ transitionDelay: `${reduce ? 0 : lineDelay}s` }}
      />
    </div>
  );
}

export {
  Stepper,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
};
