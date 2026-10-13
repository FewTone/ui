"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "motion/react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { type ComponentProps, useState } from "react";

const switchVariants = cva(
  [
    "inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 shadow-xs",
    // The thumb sits at the start or the end; motion's layout animation glides it between the two
    "justify-start bg-input data-[state=checked]:justify-end data-[state=checked]:bg-primary",
    "transition-colors duration-(--duration-fast) ease-out",
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

const thumbSizes = {
  sm: { rest: "size-3", pressed: "h-3 w-4" },
  md: { rest: "size-4", pressed: "h-4 w-5" },
} as const;

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
  onCheckedChange,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  ...props
}: SwitchProps) {
  // Mirror the state so the thumb animation knows when it changed, controlled or not
  const [uncontrolled, setUncontrolled] = useState(defaultChecked ?? false);
  const on = checked ?? uncontrolled;
  const [pressed, setPressed] = useState(false);
  const reduceMotion = useReducedMotion();
  const thumb = thumbSizes[size ?? "md"];

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      checked={checked}
      defaultChecked={defaultChecked}
      onCheckedChange={(value) => {
        setUncontrolled(value);
        onCheckedChange?.(value);
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
        onPointerLeave?.(event);
      }}
      className={cn(switchVariants({ size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb asChild>
        <motion.span
          data-slot="switch-thumb"
          layout
          layoutDependency={`${on}-${pressed}`}
          transition={reduceMotion ? { duration: 0 } : spring.snappy}
          // A numeric radius lets motion keep the thumb round while it stretches
          style={{ borderRadius: 9999 }}
          className={cn(
            "pointer-events-none block bg-background shadow-sm data-[state=checked]:bg-primary-foreground",
            pressed ? thumb.pressed : thumb.rest,
          )}
        />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch, switchVariants };
