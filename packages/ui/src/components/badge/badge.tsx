import { BadgeShine } from "@fewtone/ui/components/badge/badge-shine";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

/*
 * A small status label (owner's roadmap, 2026-10-16: "Small status labels, including one with a shining edge").
 * - shadcn's API: `variant` (default, secondary, destructive, outline) and `asChild`, plus `shine`.
 * - Shine is the outline badge with two lights travelling round its edge, the neutral twin of the site's Beta
 *   badge (which is Navy, and site-only). The lights are the label's own colour, a 1px line with no blur, so it
 *   never reads as a glow; the inside stays clear, so it sits on any surface. They live in BadgeShine, a small
 *   client part, so Badge itself stays server-safe. With reduced motion they rest on the left and right.
 * - Flat: no shadows. Rendered as a link (asChild), the background shifts on hover.
 */

const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
    "transition-colors duration-(--duration-fast) ease-out",
    "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    "[&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground outline-destructive [a&]:hover:bg-destructive/90",
        outline: "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        // The lights are drawn by BadgeShine, positioned over this edge
        shine:
          "relative border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    /** Render the single child instead of a span, for example a link, keeping the badge styles */
    asChild?: boolean;
  };

/**
 * A small label for a status, a count or a category. It renders a `span`, or with `asChild` its single child
 * (a link, for example). `variant="shine"` adds two lights travelling round the edge.
 */
function Badge({ className, variant, asChild = false, children, ...props }: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span";
  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? "default"}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {/* With asChild, Slottable marks the child that takes the styles, and the shine goes inside it */}
      <Slot.Slottable>{children}</Slot.Slottable>
      {variant === "shine" ? <BadgeShine /> : null}
    </Comp>
  );
}

export { Badge, badgeVariants };
