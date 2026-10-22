"use client";

import { duration, ease, spring, swap } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { MinusIcon } from "lucide-react";
import { AnimatePresence, animate, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { unstable_OneTimePasswordField as OneTimePasswordField } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Input OTP: one-time code boxes on Radix One-Time Password Field (owner, 2026-10-16). Radix types each
 * character into its own input and moves on, goes back with Backspace, spreads a pasted or autofilled code
 * across the boxes, and submits the code through a hidden input.
 * - Motion (.agents/rules/motion.md):
 *   - One focus box per field glides to the next box as you type (layoutId on spring.snappy, scoped to the
 *     field with LayoutGroup id={useId()}), so the eye follows where the next character goes.
 *   - A typed character rises 6px into its box through the blur (the library's `swap`). Typed over, the old
 *     one lifts away as the new rises; deleted, it sinks back the way it came.
 *   - A pasted code comes in left to right, staggered by 0.05s like items in a list.
 *   - The empty focused box shows a soft caret that breathes rather than blinks. The native caret and text
 *     are transparent; what you see is drawn over the input.
 *   - status="error": the field shakes its head, a quick side-to-side that dies away, while every border
 *     and the focus box turn destructive (owner, 2026-10-21). It shakes each time the status becomes error.
 *   - status="success": a wave runs left to right, each box swelling 6% and settling again (duration.slow,
 *     ease.out), 0.05s apart, as its border turns solid. Neutral, like Loading Button's success.
 * - Nothing animates on first paint. With reduced motion the characters only fade, the box jumps, the
 *   caret stays still, and success and error only change colour.
 * - Boxes match Input: control heights, Input's border and focus ring, a destructive border when invalid.
 */

type Size = "sm" | "md" | "lg";
export type InputOTPStatus = "success" | "error";

/** Items in a list come in 0.05s apart (motion.md); a pasted code's characters do the same */
const STAGGER = 0.05;
/** The head shake, in px: out to one side and back, smaller each time */
const SHAKE = [0, -8, 7, -5, 3, -1, 0];
/** How much a box swells as the success wave passes */
const SWELL = 1.06;
/** Keys that move between boxes, which bring the focus box back on a full code */
const MOVES = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"]);

type FieldContextValue = {
  value: string;
  /** The box that has focus, which the focus box sits on */
  active: number | null;
  setActive: (index: number | null) => void;
  size: Size;
  password: boolean;
  invalid: boolean;
  success: boolean;
  disabled: boolean;
  reduce: boolean;
  /** Several characters arrived at once (a paste or autofill): where they start, so they come in in turn */
  batchFrom: number | null;
  /** Every box is filled and you haven't moved since: the focus box fades away */
  focusHidden: boolean;
  /** Brings the focus box back */
  reveal: () => void;
};

const FieldContext = createContext<FieldContextValue | null>(null);

const slotSizes = {
  sm: "size-(--size-control-sm) rounded-md text-sm",
  md: "size-(--size-control-md) rounded-lg text-base",
  lg: "size-(--size-control-lg) rounded-lg text-base",
} as const;
const indicatorRadius = { sm: "rounded-md", md: "rounded-lg", lg: "rounded-lg" } as const;
const caretHeights = { sm: "h-3.5", md: "h-4", lg: "h-5" } as const;
const dotSizes = { sm: "size-1.5", md: "size-2", lg: "size-2" } as const;

export type InputOTPProps = Omit<ComponentProps<typeof OneTimePasswordField.Root>, "size"> & {
  /** The boxes' size, matching Input's heights */
  size?: Size;
  /**
   * The result of checking the code: success runs a wave along the boxes, error shakes the field and marks
   * it invalid. Leave it unset while the code is being typed or checked.
   */
  status?: InputOTPStatus;
};

/**
 * A one-time code field: put InputOTPSlot boxes (in InputOTPGroups, with an InputOTPSeparator between them)
 * inside. The number of slots is the code's length. Give it a name with aria-label or aria-labelledby, and
 * set aria-invalid when the code is wrong.
 */
function InputOTP({
  className,
  children,
  size = "md",
  value,
  defaultValue,
  onValueChange,
  type,
  disabled = false,
  status,
  "aria-invalid": ariaInvalid,
  ref,
  onKeyDown,
  onPointerDown,
  ...props
}: InputOTPProps) {
  // Mirror the value, controlled or not, so each box can draw its own character
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const current = value ?? uncontrolled;
  const [active, setActive] = useState<number | null>(null);
  const reduce = useReducedMotion() ?? false;
  const groupId = useId();
  const invalid = ariaInvalid === true || ariaInvalid === "true" || status === "error";
  const root = useRef<HTMLDivElement | null>(null);

  // The head shake, each time the status becomes error (never on first paint, nor with reduced motion)
  const lastStatus = useRef(status);
  useEffect(() => {
    const before = lastStatus.current;
    lastStatus.current = status;
    const node = root.current;
    if (status !== "error" || before === "error" || reduce || !node) return;
    const shake = animate(node, { x: SHAKE }, { duration: duration.slower, ease: ease.out });
    shake.then(() => node.style.removeProperty("transform"));
    return () => {
      shake.stop();
      node.style.removeProperty("transform");
    };
  }, [status, reduce]);

  // Once every box is filled the focus box fades away: the code is done, and the boxes read as a whole. It
  // comes back the moment you move (arrow keys, Home, End, a click), arrive from outside, or change a digit,
  // so the keyboard is never left without a visible focus.
  const [slots, setSlots] = useState(0);
  const [revealed, setRevealed] = useState(false);
  useLayoutEffect(() => {
    const count = root.current?.querySelectorAll("[data-slot=input-otp-slot]").length ?? 0;
    if (count !== slots) setSlots(count);
  });
  const focusHidden = slots > 0 && current.length >= slots && !revealed;

  // Which characters just changed. More than one at once is a paste or autofill, so they come in in turn.
  const [seen, setSeen] = useState<{ value: string; batchFrom: number | null }>({
    value: current,
    batchFrom: null,
  });
  let batchFrom = seen.batchFrom;
  if (seen.value !== current) {
    const changed: number[] = [];
    for (let index = 0; index < current.length; index++) {
      if (current[index] !== seen.value[index]) changed.push(index);
    }
    batchFrom = changed.length > 1 ? (changed[0] ?? null) : null;
    setSeen({ value: current, batchFrom });
    setRevealed(false);
  }

  return (
    <FieldContext.Provider
      value={{
        value: current,
        active,
        setActive,
        size,
        password: type === "password",
        invalid,
        success: status === "success",
        disabled,
        reduce,
        batchFrom,
        focusHidden,
        reveal: () => setRevealed(true),
      }}
    >
      <OneTimePasswordField.Root
        ref={(node) => {
          root.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="input-otp"
        data-status={status}
        value={current}
        onValueChange={(next) => {
          if (value === undefined) setUncontrolled(next);
          onValueChange?.(next);
        }}
        type={type}
        disabled={disabled}
        onKeyDown={(event) => {
          if (MOVES.has(event.key)) setRevealed(true);
          onKeyDown?.(event);
        }}
        onPointerDown={(event) => {
          setRevealed(true);
          onPointerDown?.(event);
        }}
        className={cn("flex items-center gap-2", className)}
        {...props}
      >
        <LayoutGroup id={groupId}>{children}</LayoutGroup>
        <OneTimePasswordField.HiddenInput />
      </OneTimePasswordField.Root>
    </FieldContext.Provider>
  );
}

/** Boxes that sit together, such as the first three digits of a six-digit code */
function InputOTPGroup({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="input-otp-group" className={cn("flex items-center gap-2", className)} {...props} />;
}

export type InputOTPSlotProps = ComponentProps<typeof OneTimePasswordField.Input> & {
  /** The box's place in the code, from 0 */
  index: number;
};

/**
 * One box. `className` styles the box; the other props go to its input. Radix names each input
 * "Character 1 of 6" and so on; pass aria-label to change it.
 */
function InputOTPSlot({ index, className, onFocus, onBlur, ...props }: InputOTPSlotProps) {
  const field = useContext(FieldContext);
  const size = field?.size ?? "md";
  const reduce = field?.reduce ?? false;
  const char = field?.value[index] ?? "";
  const active = field?.active === index;
  const delay =
    field?.batchFrom != null && index >= field.batchFrom ? (index - field.batchFrom) * STAGGER : 0;

  return (
    <motion.div
      data-slot="input-otp-slot"
      data-active={active || undefined}
      data-filled={char ? "" : undefined}
      data-invalid={field?.invalid || undefined}
      data-success={field?.success || undefined}
      data-disabled={field?.disabled || undefined}
      // The success wave: each box swells and settles in turn. A named state, so it plays once per success.
      initial={false}
      animate={field?.success && !reduce ? "success" : "rest"}
      variants={{
        rest: { scale: 1 },
        success: {
          scale: [1, SWELL, 1],
          transition: { duration: duration.slow, ease: ease.out, delay: index * STAGGER },
        },
      }}
      className={cn(
        "relative grid shrink-0 place-items-center border border-input bg-transparent font-medium text-foreground tabular-nums shadow-xs",
        "transition-colors duration-(--duration-base) ease-out data-invalid:border-destructive data-success:border-primary",
        "data-disabled:cursor-not-allowed data-disabled:opacity-(--opacity-disabled)",
        slotSizes[size],
        className,
      )}
    >
      {/* The real input fills the box. Its text, caret and selection are transparent: the character, the caret
          and the focus box are drawn over it, so they can move */}
      <OneTimePasswordField.Input
        index={index}
        data-slot="input-otp-input"
        aria-invalid={field?.invalid || undefined}
        onFocus={(event) => {
          field?.setActive(index);
          // Arriving from outside the field (Tab), the focus box shows even on a full code
          const from = event.relatedTarget;
          const root = event.currentTarget.closest("[data-slot=input-otp]");
          if (!(from instanceof Node && root?.contains(from))) field?.reveal();
          onFocus?.(event);
        }}
        onBlur={(event) => {
          // Moving to another box keeps the focus box (it glides there); leaving the field clears it
          const next = event.relatedTarget;
          const root = event.currentTarget.closest("[data-slot=input-otp]");
          if (!(next instanceof Node && root?.contains(next))) field?.setActive(null);
          onBlur?.(event);
        }}
        className="absolute inset-0 size-full cursor-text bg-transparent text-center text-transparent caret-transparent outline-hidden selection:bg-transparent placeholder:text-muted-foreground disabled:cursor-not-allowed"
        {...props}
      />

      {/* Deleted, the character sinks back the way it came; typed over, it lifts away as the new one rises */}
      <AnimatePresence initial={false} custom={char ? "up" : "down"}>
        {char ? (
          <motion.span
            key={char}
            aria-hidden
            data-slot="input-otp-char"
            className="pointer-events-none col-start-1 row-start-1"
            initial="hidden"
            animate="shown"
            exit="gone"
            variants={{
              hidden: reduce ? { opacity: 0 } : swap.initial,
              shown: {
                ...(reduce ? { opacity: 1 } : swap.animate),
                transition: reduce
                  ? { duration: duration.fast, delay }
                  : { duration: duration.base, ease: ease.out, delay, y: { ...spring.snappy, delay } },
              },
              gone: (leave: "up" | "down") => ({
                ...(reduce ? { opacity: 0 } : leave === "down" ? swap.initial : swap.exit),
                transition: reduce
                  ? { duration: duration.fast }
                  : { duration: duration.base, ease: ease.out, y: spring.snappy },
              }),
            }}
          >
            {field?.password ? (
              <span className={cn("block rounded-full bg-current", dotSizes[size])} />
            ) : (
              char
            )}
          </motion.span>
        ) : null}
      </AnimatePresence>

      {active && !char ? (
        <motion.span
          aria-hidden
          data-slot="input-otp-caret"
          className={cn(
            "pointer-events-none col-start-1 row-start-1 w-px rounded-full bg-foreground",
            caretHeights[size],
          )}
          // A soft caret: it breathes once a second instead of blinking hard. Still with reduced motion.
          animate={reduce ? { opacity: 1 } : { opacity: [1, 0, 1] }}
          transition={
            reduce
              ? { duration: 0 }
              : { duration: duration.slower * 2, ease: ease.inOut, repeat: Number.POSITIVE_INFINITY }
          }
        />
      ) : null}

      {active ? (
        // One focus box per field: Input's focus border and ring, gliding from box to box
        <motion.span
          layoutId="input-otp-indicator"
          aria-hidden
          data-slot="input-otp-indicator"
          data-hidden={field?.focusHidden || undefined}
          className={cn(
            "pointer-events-none absolute -inset-px border border-ring outline-(length:--focus-ring-width) outline-offset-(--focus-ring-offset) outline-ring",
            field?.invalid && "border-destructive outline-destructive",
            indicatorRadius[size],
          )}
          // A ring, so it only fades as the code fills and comes back when you move
          initial={false}
          animate={{ opacity: field?.focusHidden ? 0 : 1 }}
          transition={
            reduce
              ? { duration: 0 }
              : { ...spring.snappy, opacity: { duration: duration.base, ease: ease.out } }
          }
        />
      ) : null}
    </motion.div>
  );
}

/** A dash between groups of boxes. Pass children to draw something else. */
function InputOTPSeparator({ className, children, ...props }: ComponentProps<"div">) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: it holds an icon, which an hr can't; shadcn's has the same role
    <div
      data-slot="input-otp-separator"
      role="separator"
      className={cn("flex items-center text-muted-foreground", className)}
      {...props}
    >
      {children ?? <MinusIcon aria-hidden className="size-(--size-icon-md)" />}
    </div>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
