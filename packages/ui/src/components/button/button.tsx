import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap",
    "transition duration-(--duration-fast) ease-out",
    // Press: a quick scale on a spring curve. Plain CSS, so it works on the server and with asChild.
    "active:scale-(--scale-press) active:ease-(--ease-spring)",
    "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    "disabled:pointer-events-none disabled:opacity-(--opacity-disabled)",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--size-icon-md)",
  ],
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs outline-destructive hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
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
