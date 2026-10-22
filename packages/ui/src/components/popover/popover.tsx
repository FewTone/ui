"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { type AnimationPlaybackControls, animate, useReducedMotion } from "motion/react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { type ComponentProps, useLayoutEffect, useRef } from "react";

/*
 * Popover, built on Radix Popover: rich content anchored to a trigger, in a non-modal dialog. Focus moves
 * into it on open and back to the trigger on close; Escape and a click outside close it.
 * - The surface is Select's list: a bordered popover-coloured card with a soft shadow. It opens out of its
 *   trigger and closes back into it through the blur (the popover-in/out keyframes, scaling from Radix's
 *   transform origin), so it always grows from the side it's attached to.
 * - When what's inside changes size (more fields, a message, the next step), the popover glides to its new
 *   height instead of jumping: the height pattern in motion.md, an eased tween, clipped only while it
 *   moves. Instant with reduced motion; nothing moves on first paint.
 * - PopoverTitle names the dialog and PopoverDescription describes it (Radix links them).
 */

function Popover(props: ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger(props: ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

/** Positions the popover against another element than its trigger, for example a whole field */
function PopoverAnchor(props: ComponentProps<typeof PopoverPrimitive.Anchor>) {
  return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

function PopoverClose(props: ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close data-slot="popover-close" {...props} />;
}

/**
 * Glides the element to its new height whenever its content changes size. Only height moves, on the
 * height pattern's tween (a spring's overshoot would bounce); the content is clipped only while it moves.
 */
function useGlidingHeight(ref: { current: HTMLElement | null }) {
  const reduce = useReducedMotion() ?? false;

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || reduce) return;
    // Layout height: the opening scale is a transform, so it doesn't count
    let height = node.offsetHeight;
    let glide: AnimationPlaybackControls | undefined;
    const release = () => {
      node.style.height = "";
      node.style.overflow = "";
    };
    const observer = new ResizeObserver(() => {
      // While it glides the height is ours; a change underneath shows up once it lets go, and glides again
      if (glide) return;
      const next = node.offsetHeight;
      if (next === height) return;
      const from = height;
      height = next;
      // ResizeObserver runs after layout and before paint, so the new size is never shown before the glide
      node.style.height = `${from}px`;
      node.style.overflow = "hidden";
      glide = animate(
        node,
        { height: [from, next] },
        {
          duration: duration.slow,
          ease: ease.out,
          onComplete: () => {
            glide = undefined;
            release();
          },
        },
      );
    });
    observer.observe(node);
    return () => {
      observer.disconnect();
      glide?.stop();
      release();
    };
  }, [ref, reduce]);
}

/** The content itself. It mounts with each opening, so the height is measured fresh every time. */
function PopoverSurface({
  className,
  align = "center",
  sideOffset = 4,
  ref,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Content>) {
  const node = useRef<HTMLDivElement>(null);
  useGlidingHeight(node);

  return (
    <PopoverPrimitive.Content
      data-slot="popover-content"
      ref={(element) => {
        node.current = element;
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-(--z-popover) w-72 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-md outline-hidden",
        "origin-(--radix-popover-content-transform-origin) data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
        className,
      )}
      {...props}
    />
  );
}

function PopoverContent(props: ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverSurface {...props} />
    </PopoverPrimitive.Portal>
  );
}

function PopoverHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="popover-header" className={cn("grid gap-1", className)} {...props} />;
}

/** Names the popover for screen readers */
function PopoverTitle({ className, ...props }: ComponentProps<typeof PopoverPrimitive.Title>) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
}

function PopoverDescription({ className, ...props }: ComponentProps<typeof PopoverPrimitive.Description>) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
};
