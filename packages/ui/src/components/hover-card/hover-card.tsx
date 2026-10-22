"use client";

import { blur, duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { type AnimationPlaybackControls, animate, useReducedMotion } from "motion/react";
import { HoverCard as HoverCardPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Hover Card, built on Radix Hover Card: a preview of what a link points to (a profile, a page) for sighted
 * users. It opens when the pointer rests on the link or the link takes keyboard focus, stays open while the
 * pointer moves onto it, and closes on Escape. Screen readers don't get the card, so the link has to make
 * sense on its own.
 * - The surface and motion are Popover's: it opens out of the link through the blur, from Radix's
 *   transform origin, and closes back into it.
 * - It waits 300ms before opening, as Tooltip does (Radix waits 700ms, which made the first card feel slow).
 * - From one link to the next (names in a comment, people in a list): once a card has been open, the next
 *   opens at once and takes its place, with no delay. The two read as one card that moves: the new one
 *   starts where the last one was, at its size, and glides to its own place and size (Navigation Menu's
 *   panel: transform for the place, width and height for the size, duration.base + ease.out), while its
 *   content slides 12px in from the side it moved towards, through the blur. The last one goes in the same
 *   frame. With reduced motion it simply appears in its place.
 * - Nothing animates on first paint.
 */

/** How far the content slides in as the card moves to the next link, in px (Navigation Menu's) */
const SLIDE = 12;
/** The inline styles the glide leaves on a card and its content, cleared when it's done */
const LEFTOVERS = ["width", "height", "overflow", "transform"];
const CONTENT_LEFTOVERS = ["opacity", "transform", "filter"];

type Shown = { hide: () => void; measure: () => DOMRect | null };

/** Page-wide: the card on show (open, or the last one that closed), whether it's open, and when it closed */
const shown: { card: Shown | null; open: boolean; closedAt: number } = {
  card: null,
  open: false,
  closedAt: Number.NEGATIVE_INFINITY,
};

/** One card's way of coming and going, read by its trigger and content */
const CardContext = createContext<{
  following: boolean;
  hidden: boolean;
  openAtOnce: () => void;
  /** The card's surface on the page, so the next card can start from where it is */
  surface: RefObject<HTMLDivElement | null>;
  /** Where the card this one replaced was, taken by the content as it mounts */
  from: RefObject<DOMRect | null>;
} | null>(null);

export type HoverCardProps = ComponentProps<typeof HoverCardPrimitive.Root> & {
  /** Milliseconds after a card closes during which the next one opens at once, without the delay */
  skipDelayDuration?: number;
};

function HoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openDelay = 300,
  closeDelay = 300,
  skipDelayDuration = 300,
  ...props
}: HoverCardProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  // Open from the start counts as following: it's simply there, with nothing animating on first paint
  const [following, setFollowing] = useState(defaultOpen);
  const [hidden, setHidden] = useState(false);
  const open = openProp ?? uncontrolled;
  // This card in the page-wide record. Its methods are refreshed after every render, so they see the latest state.
  const card = useRef<Shown>({ hide: () => {}, measure: () => null });
  const surface = useRef<HTMLDivElement | null>(null);
  const from = useRef<DOMRect | null>(null);

  const setOpen = (next: boolean, follows = false) => {
    // Radix's timers can report a state it's already in, for example after the card opened at once
    if (next === open) return;
    if (next) {
      // One card at a time: the one on show gives way in the same frame, and this one starts from where it was
      from.current = null;
      if (shown.card && shown.card !== card.current) {
        if (follows && shown.open) from.current = shown.card.measure();
        shown.card.hide();
      }
      shown.card = card.current;
      shown.open = true;
      setFollowing(follows);
      setHidden(false);
    } else if (shown.card === card.current) {
      shown.open = false;
      shown.closedAt = performance.now();
    }
    if (openProp === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };

  useLayoutEffect(() => {
    card.current.hide = () => {
      setHidden(true);
      setOpen(false);
    };
    card.current.measure = () =>
      surface.current?.isConnected ? surface.current.getBoundingClientRect() : null;
  });

  useEffect(() => {
    const self = card.current;
    return () => {
      if (shown.card !== self) return;
      shown.card = null;
      shown.open = false;
    };
  }, []);

  /** Called as the pointer or focus reaches the link: skip the delay if another card was just on show */
  const openAtOnce = () => {
    if (open) return;
    if (shown.open || performance.now() - shown.closedAt < skipDelayDuration) setOpen(true, true);
  };

  return (
    <CardContext.Provider value={{ following, hidden, openAtOnce, surface, from }}>
      <HoverCardPrimitive.Root
        data-slot="hover-card"
        open={open}
        onOpenChange={(next) => setOpen(next)}
        openDelay={openDelay}
        closeDelay={closeDelay}
        {...props}
      />
    </CardContext.Provider>
  );
}

function HoverCardTrigger({
  onPointerEnter,
  onFocus,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Trigger>) {
  const card = useContext(CardContext);

  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      // These run before Radix's own, which still start its delay; opening at once makes that a no-op
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (!event.defaultPrevented && event.pointerType !== "touch") card?.openAtOnce();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) card?.openAtOnce();
      }}
      {...props}
    />
  );
}

type Edge = "start" | "end" | "center";

/** A point along one axis of a box: its start, its end or its centre */
const along = (start: number, size: number, edge: Edge) =>
  edge === "start" ? start : edge === "end" ? start + size : start + size / 2;

/** The edge Radix holds still on an axis while the card's size changes: the one by the link, or the aligned one */
function edgeOf(side: string | undefined, align: string | undefined, axis: "x" | "y"): Edge {
  const [before, after] = axis === "x" ? ["left", "right"] : ["top", "bottom"];
  if (side === before) return "end";
  if (side === after) return "start";
  return align === "start" ? "start" : align === "end" ? "end" : "center";
}

/**
 * Glides a card that took another's place from where that one was: its place (transform) and its size (width
 * and height), while its content comes in through the blur from the side it moved towards. Returns a stop.
 */
function glideFrom(node: HTMLDivElement, from: DOMRect) {
  const to = node.getBoundingClientRect();
  if (to.width === 0 || to.height === 0) return () => {};
  const { side, align } = node.dataset;
  const xEdge = edgeOf(side, align, "x");
  const yEdge = edgeOf(side, align, "y");
  const dx = along(from.left, from.width, xEdge) - along(to.left, to.width, xEdge);
  const dy = along(from.top, from.height, yEdge) - along(to.top, to.height, yEdge);
  const timing = { duration: duration.base, ease: ease.out };
  const content = node.firstElementChild instanceof HTMLElement ? node.firstElementChild : null;

  // Clipped only while the size moves
  node.style.overflow = "hidden";
  const runs: AnimationPlaybackControls[] = [
    animate(
      node,
      { x: [dx, 0], y: [dy, 0], width: [from.width, to.width], height: [from.height, to.height] },
      timing,
    ),
  ];
  if (content) {
    const horizontal = Math.abs(dx) >= Math.abs(dy);
    // Moving right, the content comes in from the right (as Navigation Menu's)
    const towards = Math.sign(horizontal ? -dx : -dy);
    const slide = horizontal ? { x: [towards * SLIDE, 0] } : { y: [towards * SLIDE, 0] };
    runs.push(animate(content, { opacity: [0, 1], filter: [blur.hidden, blur.shown], ...slide }, timing));
  }

  // A filter or size left behind would break the next glide and its closing keyframes
  const clear = () => {
    for (const property of LEFTOVERS) node.style.removeProperty(property);
    if (content) for (const property of CONTENT_LEFTOVERS) content.style.removeProperty(property);
  };
  Promise.all(runs).then(clear);
  return () => {
    for (const run of runs) run.stop();
    clear();
  };
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  children,
  ref,
  ...props
}: ComponentProps<typeof HoverCardPrimitive.Content>) {
  const card = useContext(CardContext);
  const reduce = useReducedMotion() ?? false;
  const surface = card?.surface;
  const start = card?.from;

  // Stable, so a re-render while it glides doesn't detach and re-attach it (which would stop the glide)
  const attach = useCallback(
    (node: HTMLDivElement | null) => {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
      if (!surface || !start || !node) return;
      surface.current = node;
      // Read, not taken: React attaches a ref twice in development (Strict Mode), and taking it on the
      // first attach left the real one with nothing to glide from. Each opening sets it afresh.
      const from = start.current;
      let stop: (() => void) | undefined;
      let observer: MutationObserver | undefined;
      if (from && from.width > 0 && !reduce) {
        // Radix places the card just after it mounts; until then its wrapper is parked off-screen. That
        // change lands before the browser paints, so the glide starts on the first frame shown.
        const wrapper = node.parentElement;
        const placed = () => !wrapper?.style.transform.includes("-200%");
        if (placed()) stop = glideFrom(node, from);
        else if (wrapper) {
          observer = new MutationObserver(() => {
            if (!placed()) return;
            observer?.disconnect();
            stop = glideFrom(node, from);
          });
          observer.observe(wrapper, { attributes: true, attributeFilter: ["style"] });
        }
      }
      return () => {
        observer?.disconnect();
        stop?.();
        if (surface.current === node) surface.current = null;
      };
    },
    [ref, surface, start, reduce],
  );

  return (
    <HoverCardPrimitive.Portal>
      <HoverCardPrimitive.Content
        ref={attach}
        data-slot="hover-card-content"
        data-following={card?.following ? "" : undefined}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-(--z-popover) w-64 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-hidden",
          "origin-(--radix-hover-card-content-transform-origin) data-[state=closed]:animate-popover-out",
          // A card that takes another's place glides from it instead
          !card?.following && "data-[state=open]:animate-popover-in",
          // Handed over to the next card: gone at once, while Radix waits out the closing keyframes
          card?.hidden && "invisible",
          className,
        )}
        {...props}
      >
        {/* One element round the content, so it can come in through the blur while the card glides */}
        <div data-slot="hover-card-body">{children}</div>
      </HoverCardPrimitive.Content>
    </HoverCardPrimitive.Portal>
  );
}

export { HoverCard, HoverCardContent, HoverCardTrigger };
