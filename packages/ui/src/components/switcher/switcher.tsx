"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type Ref,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Switcher: one choice from a few, like Day / Week / Month (a segmented control). Owner, 2026-10-14: split
 * from Toggle Group, which switches several options on and off; Lab only until it's approved, so no meta
 * yet.
 * - A pill slides to the active option (layoutId on spring.snappy, .agents/rules/motion.md), scoped to each
 *   Switcher, so two never trade a pill.
 * - There's always a choice: clicking the active option keeps it.
 * - A radiogroup of radio items (Radix Toggle Group, single). Arrow keys move between options; Home and End
 *   jump to the ends.
 * - Flat. The pill takes the page's own colour, dark in dark mode and light in light mode (owner,
 *   2026-10-14). Default: a muted track. Outline: a bordered track, and the pill gets a hairline too, so it
 *   shows on any surface. No shadows and no
 *   scale. Inactive options are muted and brighten on hover.
 * - The pill's corners follow the option's own radius (read from it), so they stay true while it changes
 *   width between options of different sizes.
 */

const switcherVariants = cva("relative isolate inline-flex w-fit items-center gap-0.5 rounded-lg p-0.5", {
  variants: {
    variant: {
      default: "bg-muted",
      outline: "border border-input",
    },
  },
  defaultVariants: { variant: "default" },
});

// The options sit 2px inside the track, so the track is a control height (32, 36 or 40px)
const switcherItemVariants = cva(
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

const SwitcherContext = createContext<{
  value: string;
  variant: "default" | "outline";
  size: "sm" | "md" | "lg";
  reduce: boolean;
} | null>(null);

type RootProps = Omit<
  Extract<ComponentProps<typeof ToggleGroupPrimitive.Root>, { type: "single" }>,
  "type" | "value" | "defaultValue" | "onValueChange"
>;

export type SwitcherProps = RootProps &
  VariantProps<typeof switcherVariants> &
  VariantProps<typeof switcherItemVariants> & {
    /** The chosen option, when you control it */
    value?: string;
    /** The option chosen at first */
    defaultValue?: string;
    /** Called with the new option when the choice changes */
    onValueChange?: (value: string) => void;
  };

function Switcher({
  value,
  defaultValue,
  onValueChange,
  variant,
  size,
  className,
  children,
  ...props
}: SwitcherProps) {
  const groupId = useId();
  const reduce = useReducedMotion() ?? false;
  // Mirror the value, controlled or not, so options know whether they're on
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value ?? internal;

  return (
    <SwitcherContext.Provider
      value={{ value: current, variant: variant ?? "default", size: size ?? "md", reduce }}
    >
      <ToggleGroupPrimitive.Root
        data-slot="switcher"
        data-variant={variant ?? "default"}
        type="single"
        value={current}
        onValueChange={(next) => {
          // There's always a choice: Radix sends "" when the active option is clicked again
          if (!next) return;
          setInternal(next);
          onValueChange?.(next);
        }}
        className={cn(switcherVariants({ variant }), className)}
        {...props}
      >
        <LayoutGroup id={groupId}>{children}</LayoutGroup>
      </ToggleGroupPrimitive.Root>
    </SwitcherContext.Provider>
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

function SwitcherItem({
  className,
  children,
  value,
  ref,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  const switcher = useContext(SwitcherContext);
  const node = useRef<HTMLButtonElement>(null);
  const setRef = useMergedRef(node, ref);
  const [radius, setRadius] = useState(0);

  // A numeric radius lets motion keep the pill's corners true while it changes width
  useLayoutEffect(() => {
    if (node.current) setRadius(Number.parseFloat(getComputedStyle(node.current).borderTopLeftRadius) || 0);
  }, []);

  return (
    <ToggleGroupPrimitive.Item
      ref={setRef}
      data-slot="switcher-item"
      value={value}
      className={cn(switcherItemVariants({ size: switcher?.size }), className)}
      {...props}
    >
      {switcher?.value === value ? (
        // Options aren't stacking contexts: the pill joins the Switcher's layer (it's `isolate`), so it passes
        // behind every option's label as it slides
        <motion.span
          layoutId="switcher-pill"
          aria-hidden
          className={cn(
            "absolute inset-0 -z-10",
            switcher.variant === "outline" ? "border border-input bg-background" : "bg-background",
          )}
          style={{ borderRadius: radius }}
          transition={switcher.reduce ? { duration: 0 } : spring.snappy}
        />
      ) : null}
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { Switcher, SwitcherItem, switcherItemVariants, switcherVariants };
