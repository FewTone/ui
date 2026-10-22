"use client";

import { cn } from "@fewtone/ui/lib/utils";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { type ComponentProps, createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

/*
 * Tooltip, built on Radix Tooltip: a short hint that shows on hover and on keyboard focus, and names nothing
 * itself (an icon button still needs its own aria-label; the tooltip describes it). Escape closes it.
 * - The first tooltip waits a moment, then opens out of its trigger through the blur (the popover-in
 *   keyframes, scaling from Radix's transform origin).
 * - Moving along a row of triggers (a toolbar), the next tooltips appear at once and take the last one's
 *   place: no delay and no animation, and the one before goes in the same frame instead of fading out
 *   under the new one. Keyboard focus works the same way. Leaving the row, the last tooltip closes back
 *   into its trigger; after `skipDelayDuration` the next one waits and animates again.
 * - The provider stays "warm" while a tooltip shows and for the skip window after, and its tooltips skip the
 *   delay meanwhile. Radix's own skip window starts when the previous tooltip hands over, so resting on a
 *   tooltip for longer than the window would bring the delay back for the next one.
 * - Nothing animates on first paint.
 * - A Tooltip outside a TooltipProvider gets its own, so one on its own just works. Wrap a toolbar (or the
 *   app) in one TooltipProvider so its tooltips share the delay and the hand-over.
 */

/** The tooltips under one provider hand over to each other through this */
type Group = {
  /** A tooltip opens: whether it takes the place of one that's showing or closed a moment ago */
  open: (tooltip: object) => boolean;
  /** A tooltip closes; `hide` makes it vanish at once if the next one takes its place */
  close: (tooltip: object, hide: () => void) => void;
};

const GroupContext = createContext<Group | null>(null);

/** A tooltip is showing, or closed less than the skip window ago: the next one opens without the delay */
const WarmContext = createContext(false);

/** One tooltip's way of coming and going, read by its content */
const TooltipContext = createContext<{ following: boolean; hidden: boolean } | null>(null);

function TooltipProvider({
  delayDuration = 300,
  skipDelayDuration = 300,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) {
  const [warm, setWarm] = useState(false);
  const record = useRef({
    showing: null as object | null,
    closedAt: Number.NEGATIVE_INFINITY,
    hideLast: null as (() => void) | null,
    cooling: 0,
  });

  useEffect(() => () => window.clearTimeout(record.current.cooling), []);

  const group = useMemo<Group>(
    () => ({
      open: (tooltip) => {
        const last = record.current;
        const follows = last.showing !== null || performance.now() - last.closedAt < skipDelayDuration;
        // Radix closes the one before just ahead of this one opening; it goes in this frame
        if (follows) last.hideLast?.();
        last.showing = tooltip;
        window.clearTimeout(last.cooling);
        setWarm(true);
        return follows;
      },
      close: (tooltip, hide) => {
        const last = record.current;
        if (last.showing !== tooltip) return;
        last.showing = null;
        last.closedAt = performance.now();
        last.hideLast = hide;
        last.cooling = window.setTimeout(() => setWarm(false), skipDelayDuration);
      },
    }),
    [skipDelayDuration],
  );

  return (
    <GroupContext.Provider value={group}>
      <WarmContext.Provider value={warm}>
        <TooltipPrimitive.Provider
          data-slot="tooltip-provider"
          delayDuration={delayDuration}
          skipDelayDuration={skipDelayDuration}
          {...props}
        />
      </WarmContext.Provider>
    </GroupContext.Provider>
  );
}

type TooltipProps = ComponentProps<typeof TooltipPrimitive.Root>;

function TooltipRoot({
  group,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  delayDuration,
  ...props
}: TooltipProps & { group: Group }) {
  const warm = useContext(WarmContext);
  // This tooltip's identity in the group
  const self = useRef({});
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  // Open from the start counts as following: it's simply there, with nothing animating on first paint
  const [following, setFollowing] = useState(defaultOpen);
  const [hidden, setHidden] = useState(false);
  const open = openProp ?? uncontrolled;

  // A tooltip that unmounts while showing counts as closed, so the group doesn't stay warm
  useEffect(() => {
    const tooltip = self.current;
    return () => group.close(tooltip, () => {});
  }, [group]);

  return (
    <TooltipContext.Provider value={{ following, hidden }}>
      <TooltipPrimitive.Root
        data-slot="tooltip"
        open={open}
        onOpenChange={(next) => {
          // Radix's timers can report a state it's already in
          if (next === open) return;
          if (next) {
            setFollowing(group.open(self.current));
            setHidden(false);
          } else {
            group.close(self.current, () => setHidden(true));
          }
          if (openProp === undefined) setUncontrolled(next);
          onOpenChange?.(next);
        }}
        delayDuration={warm ? 0 : delayDuration}
        {...props}
      />
    </TooltipContext.Provider>
  );
}

function Tooltip(props: TooltipProps) {
  const group = useContext(GroupContext);
  if (group) return <TooltipRoot group={group} {...props} />;
  return (
    <TooltipProvider>
      <Tooltip {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger(props: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Content>) {
  const tooltip = useContext(TooltipContext);

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        data-following={tooltip?.following ? "" : undefined}
        sideOffset={sideOffset}
        className={cn(
          "z-(--z-tooltip) w-fit max-w-xs rounded-md bg-primary px-2 py-1 text-xs text-balance text-primary-foreground",
          "origin-(--radix-tooltip-content-transform-origin) data-[state=closed]:animate-popover-out",
          // Radix's open states are delayed-open and instant-open; one that follows another doesn't animate
          !tooltip?.following &&
            "data-[state=delayed-open]:animate-popover-in data-[state=instant-open]:animate-popover-in",
          // Handed over to the next tooltip: gone at once, while Radix waits out the closing keyframes
          tooltip?.hidden && "invisible",
          className,
        )}
        {...props}
      >
        {children}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
