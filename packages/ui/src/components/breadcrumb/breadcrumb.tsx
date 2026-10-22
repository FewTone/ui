"use client";

import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { ChevronRightIcon, MoreHorizontalIcon } from "lucide-react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  LayoutGroup,
  motion,
  PresenceContext,
  useReducedMotion,
} from "motion/react";
import { Slot } from "radix-ui";
import { Children, type ComponentProps, type ReactNode, useMemo } from "react";

/*
 * Breadcrumb (owner's roadmap, 2026-10-16: "Where you are in the site, as a trail of links"), with shadcn's parts:
 * Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator and
 * BreadcrumbEllipsis. The WAI-ARIA breadcrumb: a nav named "Breadcrumb" holding an ordered list, with the
 * current page marked aria-current="page".
 * - The trail follows you (owner, 2026-10-19: "see if we can do anything with motion", then "coming from left,
 *   more smoother"): when it changes (your app moves to another page and keeps the breadcrumb), a new level grows
 *   out of the one before it, sliding 8px out from the left through the blur on duration.slow, the separator
 *   first and the name a beat later. A level you leave slides back into the one before it. The rest glide to
 *   their new places (layout="position" on spring.snappy), and the level you were on dims to a link as smoothly
 *   as the new one arrives. Give each level a key when you map over a path; static trails are keyed by position
 *   and never move. Nothing animates on first paint (AnimatePresence initial={false}), and with reduced motion
 *   every change is instant.
 * - Links are muted and brighten on hover while their underline fades in (Button's link: the line's colour
 *   moves from transparent, so nothing shifts). A gliding highlight was tried instead and the owner kept the
 *   underline (2026-10-19). The current page is plain foreground text, its colour set on its level.
 * - Separators are hidden from screen readers (the list already says how many levels there are), and the
 *   chevron flips in right-to-left pages.
 * - BreadcrumbEllipsis stands in for levels that are collapsed; put it in a Dropdown Menu's trigger to list them
 *   (as the collapsed trail in the demo does).
 */

function Breadcrumb({ "aria-label": label = "Breadcrumb", ...props }: ComponentProps<"nav">) {
  return <nav aria-label={label} data-slot="breadcrumb" {...props} />;
}

/** The ordered list of levels */
function BreadcrumbList({ className, children, ...props }: ComponentProps<"ol">) {
  // Keyed, so AnimatePresence can tell the levels apart: by your keys when you map over a path, by position
  // otherwise (a static trail never changes, so nothing moves)
  const levels = useMemo(() => Children.toArray(children), [children]);

  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "flex flex-wrap items-center gap-1.5 text-sm break-words text-muted-foreground sm:gap-2",
        className,
      )}
      {...props}
    >
      {/* The group re-renders the levels once a leaving one has gone, so the rest glide to their places */}
      <LayoutGroup>
        <AnimatePresence initial={false}>{levels}</AnimatePresence>
      </LayoutGroup>
    </ol>
  );
}

/**
 * How a level comes, goes and moves. A new level grows out of the one before it: it slides 8px out from the left
 * through the blur, and a level you leave slides back in. `follows` holds a level's name back a beat
 * (duration.instant) behind the separator that leads to it, so the trail draws itself left to right. The rest
 * glide to their places when others change.
 */
function useLevelMotion(follows: boolean) {
  const reduce = useReducedMotion() ?? false;
  const tucked = { opacity: 0, filter: reduce ? blur.shown : blur.hidden, x: reduce ? 0 : -8 };
  return {
    initial: tucked,
    animate: { opacity: 1, filter: blur.shown, x: 0, transitionEnd: { filter: "none" } },
    exit: { ...tucked, transition: reduce ? { duration: 0 } : { duration: duration.fast, ease: ease.in } },
    transition: reduce
      ? { duration: 0 }
      : {
          duration: duration.slow,
          ease: ease.out,
          delay: follows ? duration.instant : 0,
          layout: spring.snappy,
        },
    layout: "position" as const,
  };
}

export type BreadcrumbItemProps = Omit<HTMLMotionProps<"li">, "children"> & { children?: ReactNode };

function BreadcrumbItem({ className, children, ...props }: BreadcrumbItemProps) {
  const level = useLevelMotion(true);
  return (
    <motion.li
      data-slot="breadcrumb-item"
      className={cn(
        "inline-flex items-center gap-1.5",
        // The current page's colour lives here, so when the page you were on becomes a link it dims as smoothly
        // as the next level arrives (and brightens the same way going back)
        "transition-colors duration-(--duration-slow) ease-out has-data-[slot=breadcrumb-page]:text-foreground",
        className,
      )}
      {...level}
      {...props}
    >
      {/*
       * The level answers to the trail's AnimatePresence; what's inside it doesn't. Otherwise a level that was
       * there at first would stop anything in it from ever animating in (a menu's highlight, for example).
       */}
      <PresenceContext.Provider value={null}>{children}</PresenceContext.Provider>
    </motion.li>
  );
}

export type BreadcrumbLinkProps = ComponentProps<"a"> & {
  /** Render the single child (your router's Link) with the link's styles */
  asChild?: boolean;
};

function BreadcrumbLink({ asChild = false, className, ...props }: BreadcrumbLinkProps) {
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="breadcrumb-link"
      className={cn(
        "rounded-md underline decoration-transparent underline-offset-4",
        "transition-colors duration-(--duration-fast) ease-out hover:text-foreground hover:decoration-current",
        "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        className,
      )}
      {...props}
    />
  );
}

/**
 * The page you're on: the last item, as text rather than a link to itself. aria-current tells screen readers
 * it's the current page (shadcn's fake role="link" is left out: it can't be focused or followed). It takes the
 * foreground colour from its BreadcrumbItem, which fades it in and out.
 */
function BreadcrumbPage({ className, ...props }: ComponentProps<"span">) {
  return <span data-slot="breadcrumb-page" aria-current="page" className={className} {...props} />;
}

export type BreadcrumbSeparatorProps = Omit<HTMLMotionProps<"li">, "children"> & { children?: ReactNode };

/** The mark between two items; a chevron unless you pass your own (a slash, for example) */
function BreadcrumbSeparator({ children, className, ...props }: BreadcrumbSeparatorProps) {
  const level = useLevelMotion(false);
  return (
    <motion.li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-(--size-icon-sm) [&>svg]:rtl:rotate-180", className)}
      {...level}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </motion.li>
  );
}

/** Collapsed levels. Inside a Dropdown Menu's trigger, name the trigger ("Show hidden levels"). */
function BreadcrumbEllipsis({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      className={cn("flex size-6 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon aria-hidden className="size-(--size-icon-md)" />
      <span className="sr-only">More</span>
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
