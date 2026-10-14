"use client";

import { duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type Ref,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Toggle Group: buttons you switch on and off independently, like Bold / Italic / Underline (owner,
 * 2026-10-14: split from Switcher, which is for one choice; Lab only until it's approved, so no meta yet).
 * - Each pressed option fades its own pill in (opacity, plus a small scale on spring.snappy) and out quickly.
 * - A toolbar of aria-pressed buttons (Radix Toggle Group, multiple). Arrow keys move between options; Home
 *   and End jump to the ends.
 * - Flat. The pill takes the page's own colour, dark in dark mode and light in light mode (owner,
 *   2026-10-14). Default: a muted track. Outline: a bordered track, and the pill gets a hairline too, so it
 *   shows on any surface. No shadows and no
 *   scale on the buttons. Inactive options are muted and brighten on hover.
 * - The pill's corners follow the option's own radius (read from it).
 */

const toggleGroupVariants = cva("relative isolate inline-flex w-fit items-center gap-0.5 rounded-lg p-0.5", {
  variants: {
    variant: {
      default: "bg-muted",
      outline: "border border-input",
    },
  },
  defaultVariants: { variant: "default" },
});

// The options sit 2px inside the track, so the track is a control height (32, 36 or 40px)
const toggleGroupItemVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap",
    "text-muted-foreground transition-colors duration-(--duration-base) ease-out data-[state=off]:hover:text-foreground data-[state=on]:text-foreground",
    "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    "disabled:pointer-events-none disabled:opacity-(--opacity-disabled)",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--size-icon-md)",
  ],
  {
    variants: {
      size: {
        sm: "h-7 px-2.5",
        md: "h-8 px-3",
        lg: "h-9 px-4",
      },
    },
    defaultVariants: { size: "md" },
  },
);

const GroupContext = createContext<{
  value: string[];
  variant: "default" | "outline";
  size: "sm" | "md" | "lg";
  reduce: boolean;
} | null>(null);

type RootProps = Omit<
  Extract<ComponentProps<typeof ToggleGroupPrimitive.Root>, { type: "multiple" }>,
  "type" | "value" | "defaultValue" | "onValueChange"
>;

export type ToggleGroupProps = RootProps &
  VariantProps<typeof toggleGroupVariants> &
  VariantProps<typeof toggleGroupItemVariants> & {
    /** The options switched on, when you control them */
    value?: string[];
    /** The options switched on at first */
    defaultValue?: string[];
    /** Called with every option that's on, after each change */
    onValueChange?: (value: string[]) => void;
  };

function ToggleGroup({
  value,
  defaultValue,
  onValueChange,
  variant,
  size,
  className,
  ...props
}: ToggleGroupProps) {
  const reduce = useReducedMotion() ?? false;
  // Mirror the value, controlled or not, so options know whether they're on
  const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
  const current = value ?? internal;

  return (
    <GroupContext.Provider
      value={{ value: current, variant: variant ?? "default", size: size ?? "md", reduce }}
    >
      <ToggleGroupPrimitive.Root
        data-slot="toggle-group"
        data-variant={variant ?? "default"}
        type="multiple"
        value={current}
        onValueChange={(next) => {
          setInternal(next);
          onValueChange?.(next);
        }}
        className={cn(toggleGroupVariants({ variant }), className)}
        {...props}
      />
    </GroupContext.Provider>
  );
}

/** Hands the option's node to our ref and to the caller's */
function useMergedRef<T>(own: { current: T | null }, theirs?: Ref<T>) {
  return (node: T | null) => {
    own.current = node;
    if (typeof theirs === "function") theirs(node);
    else if (theirs) (theirs as { current: T | null }).current = node;
  };
}

function ToggleGroupItem({
  className,
  children,
  value,
  ref,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const group = useContext(GroupContext);
  const node = useRef<HTMLButtonElement>(null);
  const setRef = useMergedRef(node, ref);
  const [radius, setRadius] = useState(0);

  // The pill takes the option's corner radius, whatever the user's --radius is
  useLayoutEffect(() => {
    if (node.current) setRadius(Number.parseFloat(getComputedStyle(node.current).borderTopLeftRadius) || 0);
  }, []);

  const on = group?.value.includes(value) ?? false;
  const reduce = group?.reduce ?? false;

  return (
    <ToggleGroupPrimitive.Item
      ref={setRef}
      data-slot="toggle-group-item"
      value={value}
      className={cn(toggleGroupItemVariants({ size: group?.size }), className)}
      {...props}
    >
      <AnimatePresence initial={false}>
        {on ? (
          <motion.span
            key="pill"
            aria-hidden
            className={cn(
              "absolute inset-0 -z-10",
              group?.variant === "outline" ? "border border-input bg-background" : "bg-background",
            )}
            style={{ borderRadius: radius }}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.92, transition: { duration: duration.fast, ease: ease.in } }
            }
            transition={reduce ? { duration: duration.fast } : spring.snappy}
          />
        ) : null}
      </AnimatePresence>
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem, toggleGroupItemVariants, toggleGroupVariants };
