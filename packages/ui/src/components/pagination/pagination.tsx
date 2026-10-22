import { type ButtonProps, buttonVariants } from "@fewtone/ui/components/button/button";
import { PaginationGroup, PaginationPill } from "@fewtone/ui/components/pagination/pagination-pill";
import { cn } from "@fewtone/ui/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import { Slot } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

/*
 * Pagination (owner's roadmap, 2026-10-16: "Move through pages of results"), with shadcn's parts: Pagination,
 * PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext and PaginationEllipsis.
 * - A nav landmark ("Pagination") holding a list. The current page has aria-current="page".
 * - Links are ghost Buttons (buttonVariants), muted until hovered. A pill in Button's outline look marks the
 *   current page and slides to the new one when the page changes (pagination-pill.tsx, the one client part).
 * - PaginationLink is a link with `href`, a button without one (for pages changed in place, such as a table's),
 *   or with `asChild` your router's Link. At the first and last pages, Previous and Next are `disabled`:
 *   aria-disabled, faded and inert. A button keeps its focus (so pressing Next onto the last page doesn't drop
 *   the keyboard to the top of the page); a link loses its href.
 * - getPaginationRange works out which pages to show, with ellipses for the gaps, always the same number of
 *   items, so the links don't jump about as you move through them.
 */

/** A page number, or a gap of pages not shown */
export type PaginationRangeItem = number | "ellipsis";

/**
 * The pages to show around `page` (1-based) of `pageCount`: the first and last `boundaryCount` pages,
 * `siblingCount` pages either side of the current one, and "ellipsis" for each gap. When there are enough pages,
 * the list is always the same length (7 with the defaults), so the links keep their places.
 */
function getPaginationRange({
  page,
  pageCount,
  siblingCount = 1,
  boundaryCount = 1,
}: {
  page: number;
  pageCount: number;
  siblingCount?: number;
  boundaryCount?: number;
}): PaginationRangeItem[] {
  const range = (from: number, to: number) =>
    Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => from + index);
  if (pageCount <= boundaryCount * 2 + siblingCount * 2 + 3) return range(1, pageCount);

  const current = Math.min(Math.max(page, 1), pageCount);
  const start = range(1, boundaryCount);
  const end = range(pageCount - boundaryCount + 1, pageCount);
  // The siblings slide along between the ends, keeping the same count as they near either end
  const siblingsFrom = Math.max(
    Math.min(current - siblingCount, pageCount - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsTo = Math.min(
    Math.max(current + siblingCount, boundaryCount + siblingCount * 2 + 2),
    pageCount - boundaryCount - 1,
  );
  // A gap of one page shows that page instead of an ellipsis
  return [
    ...start,
    ...(siblingsFrom > boundaryCount + 2 ? (["ellipsis"] as const) : [boundaryCount + 1]),
    ...range(siblingsFrom, siblingsTo),
    ...(siblingsTo < pageCount - boundaryCount - 1 ? (["ellipsis"] as const) : [pageCount - boundaryCount]),
    ...end,
  ];
}

function Pagination({ className, "aria-label": label = "Pagination", ...props }: ComponentProps<"nav">) {
  return (
    <nav
      aria-label={label}
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({ className, children, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      // The list is the pill's layer: it slides behind every link
      className={cn("relative isolate flex flex-row items-center gap-1", className)}
      {...props}
    >
      <PaginationGroup>{children}</PaginationGroup>
    </ul>
  );
}

function PaginationItem({ className, ...props }: ComponentProps<"li">) {
  return <li data-slot="pagination-item" className={cn("relative", className)} {...props} />;
}

export type PaginationLinkProps = ComponentProps<"a"> &
  Pick<ButtonProps, "size"> & {
    /** The current page: it gets the pill and aria-current="page" */
    isActive?: boolean;
    /** Render the single child (your router's Link) with the link's styles */
    asChild?: boolean;
    /**
     * Can't be followed (Previous on the first page). It's marked aria-disabled and its onClick isn't called; a
     * link also loses its href. A button keeps its focus, so the keyboard isn't thrown out at the last page.
     */
    disabled?: boolean;
  };

function PaginationLink({
  className,
  isActive = false,
  size = "icon",
  asChild = false,
  disabled = false,
  href,
  onClick,
  children,
  ...props
}: PaginationLinkProps) {
  const shared = {
    "data-slot": "pagination-link",
    "data-active": isActive || undefined,
    "aria-current": isActive ? ("page" as const) : undefined,
    "aria-disabled": disabled || undefined,
    // Left out rather than wrapped, so nothing new is created here and links still render on the server
    onClick: disabled ? undefined : onClick,
    className: cn(
      buttonVariants({ variant: "ghost", size }),
      "text-muted-foreground hover:text-foreground data-active:text-foreground",
      "aria-disabled:pointer-events-none aria-disabled:opacity-(--opacity-disabled)",
      className,
    ),
  };

  let control: ReactNode;
  if (asChild) {
    // The href, if any, goes onto your Link along with the styles
    control = (
      <Slot.Root {...shared} {...(href === undefined ? null : { href })} {...props}>
        {children}
      </Slot.Root>
    );
  } else if (href === undefined) {
    // No href: the page changes in place, so it's a button
    control = (
      <button
        type="button"
        {...(shared as ComponentProps<"button">)}
        {...(props as ComponentProps<"button">)}
      >
        {children}
      </button>
    );
  } else {
    control = (
      <a {...shared} {...(disabled ? { role: "link" } : { href })} {...props}>
        {children}
      </a>
    );
  }

  return (
    <>
      {isActive ? (
        <PaginationPill className={size === "sm" || size === "icon-sm" ? "rounded-md" : undefined} />
      ) : null}
      {control}
    </>
  );
}

/** Previous and Next: a chevron, and a label from the sm breakpoint. With asChild, the label goes inside your Link. */
function edgeContent(asChild: boolean, children: ReactNode, parts: ReactNode[]) {
  return asChild ? [<Slot.Slottable key="link">{children}</Slot.Slottable>, ...parts] : parts;
}

function PaginationPrevious({ className, asChild = false, children, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="md"
      asChild={asChild}
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      {edgeContent(asChild, children, [
        <ChevronLeftIcon key="icon" aria-hidden className="rtl:rotate-180" />,
        <span key="label" className="hidden sm:block">
          Previous
        </span>,
      ])}
    </PaginationLink>
  );
}

function PaginationNext({ className, asChild = false, children, ...props }: PaginationLinkProps) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="md"
      asChild={asChild}
      className={cn("gap-1 px-2.5", className)}
      {...props}
    >
      {edgeContent(asChild, children, [
        <span key="label" className="hidden sm:block">
          Next
        </span>,
        <ChevronRightIcon key="icon" aria-hidden className="rtl:rotate-180" />,
      ])}
    </PaginationLink>
  );
}

/** Stands for pages that aren't shown. Screen readers hear "More pages". */
function PaginationEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-(--size-control-md) items-center justify-center text-muted-foreground",
        className,
      )}
      {...props}
    >
      <MoreHorizontalIcon aria-hidden className="size-(--size-icon-md)" />
      <span className="sr-only">More pages</span>
    </span>
  );
}

export {
  getPaginationRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
