import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

const buttonVariants = cva(
  [
    "relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg text-sm font-medium whitespace-nowrap",
    "transition duration-(--duration-base) ease-out",
    // Hover and press, for every variant (owner, 2026-10-14: simple, no glow, shadow or scale): one tint layer
    // in the text's own colour, behind the label. It fades in while rising 4px from the bottom, and deepens
    // while pressed. The button itself never moves.
    "before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:translate-y-1 before:bg-current before:opacity-0 before:transition before:duration-(--duration-base) before:ease-out",
    "hover:before:translate-y-0 hover:before:opacity-10 active:before:opacity-15 active:before:duration-(--duration-instant)",
    "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    "disabled:pointer-events-none disabled:opacity-(--opacity-disabled)",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--size-icon-md)",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        outline: "border border-input bg-background",
        ghost: "",
        destructive: "bg-destructive text-destructive-foreground outline-destructive",
        // No tint box for a link: its underline fades in instead
        link: "text-primary underline decoration-transparent underline-offset-4 before:hidden hover:decoration-current",
      },
      size: {
        sm: "h-(--size-control-sm) gap-1.5 rounded-md px-3",
        md: "h-(--size-control-md) px-4",
        lg: "h-(--size-control-lg) px-5",
        icon: "size-(--size-control-md)",
        "icon-sm": "size-(--size-control-sm) rounded-md",
        "icon-lg": "size-(--size-control-lg)",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the single child instead of a button, for example a link, keeping the button styles */
    asChild?: boolean;
  };

/**
 * A button for actions. It renders a native `button` (type "button" unless you set one), or with
 * `asChild` its single child, so a link can look like a button without nesting interactive elements.
 */
function Button({ className, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? "default"}
      data-size={size ?? "md"}
      type={asChild ? undefined : (type ?? "button")}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
