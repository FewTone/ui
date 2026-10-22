"use client";

import { cn } from "@fewtone/ui/lib/utils";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";
import { type ComponentProps, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/*
 * Scroll Area (owner's roadmap, 2026-10-16: "Scrolling with soft fades at the edges"), on Radix Scroll Area, with
 * shadcn's parts: ScrollArea and ScrollBar.
 * - Native scrolling (wheel, touch, keyboard), with a slim scrollbar laid over the content in place of the
 *   browser's. It fades in while the pointer is over the area and out after (Radix's "hover" type).
 * - The thumb is a thin line that thickens when you point at the bar or drag it, so it's easy to grab. It grows
 *   from the area's edge with a scale (a transform), never a width change.
 * - Soft fades at the edges that can scroll, as in Select's list: one per side, shown only while there's more
 *   that way. They're overlays outside the scroller (inside, they'd scroll with the content and add to its size)
 *   and take the area's own background, so on a card or a popover give it that colour (`bg-card`,
 *   `bg-popover`). Scroll-edge fades are a plain fade (ADR 0011), and the first paint shows them without fading.
 * - Named with aria-label or aria-labelledby, the scroller becomes a focusable region, so keyboard users can reach
 *   it and scroll even when nothing inside can take focus.
 */

type Edges = { top: boolean; bottom: boolean; left: boolean; right: boolean };

/** Which sides have more to scroll to. In right-to-left, scrollLeft runs from 0 (the right end) to negative. */
function edgesOf(node: HTMLElement): Edges {
  const { scrollTop, scrollLeft, scrollHeight, scrollWidth, clientHeight, clientWidth } = node;
  const wide = scrollWidth - clientWidth;
  const fromLeft = node.closest("[dir]")?.getAttribute("dir") === "rtl" ? wide + scrollLeft : scrollLeft;
  return {
    top: scrollTop > 1,
    bottom: scrollTop < scrollHeight - clientHeight - 1,
    left: fromLeft > 1,
    right: fromLeft < wide - 1,
  };
}

const sameEdges = (a: Edges, b: Edges) =>
  a.top === b.top && a.bottom === b.bottom && a.left === b.left && a.right === b.right;

/** Each fade: where it lies, and which way it thins out (a static mask over the area's own colour) */
const fades = {
  top: "inset-x-0 top-0 h-8 mask-b-from-0%",
  bottom: "inset-x-0 bottom-0 h-8 mask-t-from-0%",
  left: "inset-y-0 left-0 w-8 mask-r-from-0%",
  right: "inset-y-0 right-0 w-8 mask-l-from-0%",
} as const;

export type ScrollAreaProps = ComponentProps<typeof ScrollAreaPrimitive.Root>;

/**
 * A scrolling box with a slim scrollbar and soft fades at the edges that can scroll. Give it a height (or a width
 * for sideways scrolling, with a horizontal ScrollBar inside) and a name with aria-label.
 */
function ScrollArea({
  className,
  children,
  "aria-label": label,
  "aria-labelledby": labelledBy,
  ...props
}: ScrollAreaProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState<Edges>({ top: false, bottom: false, left: false, right: false });
  // The fades fade only once the first measure has shown them, so nothing animates on first paint
  const [settled, setSettled] = useState(false);
  const named = label !== undefined || labelledBy !== undefined;

  const update = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const next = edgesOf(node);
    setEdges((current) => (sameEdges(current, next) ? current : next));
  }, []);

  // Measure before the first paint, and again whenever the area or its content changes size
  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    if (node.firstElementChild) observer.observe(node.firstElementChild);
    return () => observer.disconnect();
  }, [update]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setSettled(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative isolate overflow-hidden bg-background", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewport}
        data-slot="scroll-area-viewport"
        onScroll={update}
        {...(named
          ? { role: "region", "aria-label": label, "aria-labelledby": labelledBy, tabIndex: 0 }
          : {})}
        // The focus ring sits inside the edge, where the area's rounded corners don't clip it
        className="size-full outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:-outline-offset-(--focus-ring-width)"
        style={{ borderRadius: "inherit" }}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      {(Object.keys(fades) as (keyof Edges)[]).map((side) => (
        <div
          key={side}
          aria-hidden
          data-slot="scroll-area-fade"
          data-side={side}
          data-state={edges[side] ? "visible" : "hidden"}
          className={cn(
            "pointer-events-none absolute bg-inherit data-[state=hidden]:opacity-0",
            settled && "transition-opacity duration-(--duration-fast) ease-out",
            fades[side],
          )}
        />
      ))}
      <ScrollBar />
      <ScrollAreaPrimitive.Corner data-slot="scroll-area-corner" />
    </ScrollAreaPrimitive.Root>
  );
}

/**
 * The scrollbar. ScrollArea has a vertical one; add `<ScrollBar orientation="horizontal" />` inside it to scroll
 * sideways. It stays mounted, so it can fade in and out.
 */
function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  const vertical = orientation === "vertical";
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      forceMount
      className={cn(
        // Above the fades, so its ends never fade with the content
        "group/scrollbar z-10 flex touch-none p-px select-none",
        "transition-opacity duration-(--duration-base) ease-out data-[state=hidden]:pointer-events-none data-[state=hidden]:opacity-0",
        vertical ? "h-full w-2.5" : "h-2.5 flex-col",
        className,
      )}
      {...props}
    >
      {/* Radix moves the thumb with a transform, so the line we see is its ::before, which scales on its own:
          half its width at rest, at the area's edge, and the full 8px while you point at the bar or drag it */}
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className={cn(
          "relative flex-1 rounded-full",
          "before:absolute before:inset-0 before:rounded-full before:bg-border before:transition before:duration-(--duration-fast) before:ease-out",
          "group-hover/scrollbar:before:bg-muted-foreground/50 group-active/scrollbar:before:bg-muted-foreground/50",
          vertical
            ? "before:origin-right before:scale-x-50 group-hover/scrollbar:before:scale-x-100 group-active/scrollbar:before:scale-x-100 rtl:before:origin-left"
            : "before:origin-bottom before:scale-y-50 group-hover/scrollbar:before:scale-y-100 group-active/scrollbar:before:scale-y-100",
        )}
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
