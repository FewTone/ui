import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

/*
 * A surface for grouped content (owner's roadmap, 2026-10-16), with shadcn's parts: Card, CardHeader, CardTitle,
 * CardDescription, CardAction, CardContent and CardFooter.
 * - Depth comes from a soft shadow and a hairline, not a border (design.md: few borders), the recipe of the site's
 *   own cards. The hairline is a ring, outside the box, so it never changes the layout.
 * - As a link (`asChild` with an `a`), the surface lifts a step on hover, to `muted`: colour only, nothing moves.
 *   The whole card is the link, with the focus ring round it, as Badge and Button do as links.
 * - `size="sm"` tightens the padding and gaps from 24 to 16px, for dense grids such as stats and settings.
 * - The header is a grid. CardAction takes a second column beside the title and description; that column is
 *   implicit, so it sizes itself to the action without an arbitrary grid template.
 * - No motion and no "use client": it's a server component.
 */

const cardVariants = cva(
  [
    "group/card flex flex-col rounded-lg bg-card text-card-foreground shadow-sm ring-1 ring-border",
    "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    // A link card lifts a step on hover: the background only
    "[a&]:transition-colors [a&]:duration-(--duration-fast) [a&]:ease-out [a&]:hover:bg-muted",
  ],
  {
    variants: {
      size: {
        sm: "gap-4 py-4",
        md: "gap-6 py-6",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type CardProps = ComponentProps<"div"> &
  VariantProps<typeof cardVariants> & {
    /** Render the single child instead of a div, for example a link, keeping the card styles */
    asChild?: boolean;
  };

/**
 * A surface for grouped content. It renders a `div`, or with `asChild` its single child, so a link can be a whole
 * card. Keep a link card short: everything inside it is read as the link's name.
 */
function Card({ className, size, asChild = false, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card"
      data-size={size ?? "md"}
      className={cn(cardVariants({ size }), className)}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-cols-1 items-start gap-x-4 gap-y-1.5 px-6 group-data-[size=sm]/card:px-4",
        // With a rule under it (className="border-b"), the header keeps the card's padding below the rule
        "[.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4",
        className,
      )}
      {...props}
    />
  );
}

/** The card's title. A `div` by default; with `asChild`, a heading at the level the page needs (`<h3>`). */
function CardTitle({ className, asChild = false, ...props }: ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return <Comp data-slot="card-title" className={cn("leading-none font-semibold", className)} {...props} />;
}

function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div data-slot="card-description" className={cn("text-sm text-muted-foreground", className)} {...props} />
  );
}

/** Sits at the end of the header, beside the title and description: a button, a badge, a menu */
function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6 group-data-[size=sm]/card:px-4", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center gap-2 px-6 group-data-[size=sm]/card:px-4",
        "[.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4",
        className,
      )}
      {...props}
    />
  );
}

export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, cardVariants };
