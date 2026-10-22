"use client";

import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { type AnimationPlaybackControls, animate, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Tabs as TabsPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type Ref,
  type RefObject,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Tabs, built on Radix Tabs (roadmap, 2026-10-16: "Panels switched by an underline that slides between tabs").
 * - The indicator slides to the active tab (layoutId on spring.snappy, .agents/rules/motion.md), scoped to each
 *   list, so two tab sets never trade it. Two looks: `underline` (the default), a 2px line riding the list's
 *   hairline, and `pill`, Switcher's filled pill on a muted track.
 * - The panel that appears comes through the blur and slides 12px in from the side of the tab you moved to
 *   (from the right when you move right), while its height glides from the old panel's to its own:
 *   duration.slow on ease.out, never a spring, clipped only while it moves. The filter and height are cleared
 *   afterwards. The old panel goes at once, so the two never overlap.
 * - Nothing animates on first paint. With reduced motion the indicator jumps and the panel only fades.
 * - A tablist of tabs, each controlling a tabpanel. Arrow keys move between tabs and show their panel; Home
 *   and End jump to the ends.
 */

type Variant = "underline" | "pill";

/** How far the new panel slides in, in px */
const SLIDE = 12;
/** The inline styles an entrance leaves on a panel, cleared when it's hidden again */
const LEFTOVERS = ["opacity", "transform", "filter", "height", "overflow"];

type TabsContextValue = {
  value: string;
  reduce: boolean;
  root: RefObject<HTMLDivElement | null>;
  /** The tab shown before the latest change. The root updates it after the panels' effects have read it. */
  previous: RefObject<string>;
  /** The shown panel's height, kept current, so the next panel glides from it */
  height: RefObject<number>;
};

const TabsContext = createContext<TabsContextValue | null>(null);
const ListContext = createContext<{ variant: Variant }>({ variant: "underline" });

/** Hands a node to our ref and to the caller's */
function useMergedRef<T>(own: { current: T | null }, theirs?: Ref<T>) {
  return (node: T | null) => {
    own.current = node;
    if (typeof theirs === "function") theirs(node);
    else if (theirs) (theirs as { current: T | null }).current = node;
  };
}

/** A tab of this set (not of a set nested inside one of its panels) */
function triggerOf(root: HTMLElement, value: string) {
  return Array.from(root.querySelectorAll<HTMLElement>("[data-slot=tabs-trigger]")).find(
    (trigger) => trigger.dataset.value === value && trigger.closest("[data-slot=tabs]") === root,
  );
}

/**
 * Panels of related content, one shown at a time, built on Radix Tabs. Holds the value (controlled or not)
 * so the indicator and the panels know which tab is shown.
 */
function Tabs({
  value,
  defaultValue,
  onValueChange,
  className,
  ref,
  ...props
}: ComponentProps<typeof TabsPrimitive.Root>) {
  const reduce = useReducedMotion() ?? false;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value ?? internal;
  const root = useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(root, ref);
  const previous = useRef(current);
  const height = useRef(0);

  // Parents' layout effects run after their children's, so the panel that just appeared has already read the
  // tab it replaced
  useLayoutEffect(() => {
    previous.current = current;
  }, [current]);

  return (
    <TabsContext.Provider value={{ value: current, reduce, root, previous, height }}>
      <TabsPrimitive.Root
        ref={setRef}
        data-slot="tabs"
        value={current}
        onValueChange={(next) => {
          setInternal(next);
          onValueChange?.(next);
        }}
        className={cn("flex flex-col gap-4", className)}
        {...props}
      />
    </TabsContext.Provider>
  );
}

const tabsListVariants = cva("relative isolate flex items-center", {
  variants: {
    variant: {
      // The hairline is the track the underline rides on, and divides the tabs from the panel
      underline: "gap-4 border-b border-border",
      // The tabs sit 2px inside the track, so the track is a control height (36px)
      pill: "w-fit gap-0.5 rounded-lg bg-muted p-0.5",
    },
  },
  defaultVariants: { variant: "underline" },
});

const tabsTriggerVariants = cva(
  [
    "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md text-sm font-medium whitespace-nowrap",
    // The label's colour changes over the indicator's time, so the two arrive together
    "text-muted-foreground transition-colors duration-(--duration-base) ease-out hover:text-foreground data-[state=active]:text-foreground",
    "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    "disabled:pointer-events-none disabled:opacity-(--opacity-disabled)",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--size-icon-md)",
  ],
  {
    variants: {
      variant: {
        underline: "h-(--size-control-md) px-1",
        pill: "h-8 px-3",
      },
    },
    defaultVariants: { variant: "underline" },
  },
);

export type TabsListProps = ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>;

/** The row of tabs. Give it a name with aria-label when the page has more than one set. */
function TabsList({ className, variant, children, ...props }: TabsListProps) {
  const groupId = useId();
  return (
    <ListContext.Provider value={{ variant: variant ?? "underline" }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant ?? "underline"}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      >
        <LayoutGroup id={groupId}>{children}</LayoutGroup>
      </TabsPrimitive.List>
    </ListContext.Provider>
  );
}

function TabsTrigger({
  className,
  value,
  children,
  ref,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const tabs = useContext(TabsContext);
  const { variant } = useContext(ListContext);
  const node = useRef<HTMLButtonElement>(null);
  const setRef = useMergedRef(node, ref);
  const [radius, setRadius] = useState<number>();

  // A numeric radius lets motion keep the pill's corners true while it changes width between tabs. Until it's
  // read (server HTML), the class gives the same corners.
  useLayoutEffect(() => {
    if (variant === "pill" && node.current)
      setRadius(Number.parseFloat(getComputedStyle(node.current).borderTopLeftRadius) || undefined);
  }, [variant]);

  return (
    <TabsPrimitive.Trigger
      ref={setRef}
      data-slot="tabs-trigger"
      data-value={value}
      value={value}
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    >
      {tabs?.value === value ? (
        // Tabs aren't stacking contexts: the indicator joins the list's layer (it's `isolate`), so the pill
        // passes behind every label as it slides
        <motion.span
          layoutId="tabs-indicator"
          aria-hidden
          data-slot="tabs-indicator"
          className={
            variant === "pill"
              ? "pointer-events-none absolute inset-0 -z-10 rounded-md bg-background"
              : // On the list's hairline: its lower pixel covers it
                "pointer-events-none absolute inset-x-0 -bottom-px h-0.5 bg-foreground"
          }
          style={radius ? { borderRadius: radius } : undefined}
          transition={tabs.reduce ? { duration: 0 } : spring.snappy}
        />
      ) : null}
      {children}
    </TabsPrimitive.Trigger>
  );
}

export type TabsContentProps = ComponentProps<typeof TabsPrimitive.Content>;

/**
 * One tab's panel. Hidden panels render nothing, unless `forceMount` keeps their content (and its state)
 * mounted while hidden.
 */
function TabsContent({ className, value, forceMount, children, ref, ...props }: TabsContentProps) {
  const tabs = useContext(TabsContext);
  const node = useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(node, ref);
  const active = tabs?.value === value;

  // The panel is shown or hidden in the same commit as the tab changes (Radix's Presence would show it one
  // render later), so its entrance can measure it and start before the first paint, never flashing in place
  // biome-ignore lint/correctness/useExhaustiveDependencies: only the panel being shown or hidden starts or stops its entrance
  useLayoutEffect(() => {
    const panel = node.current;
    if (!tabs || !active || !panel) return;
    const { root, previous, height, reduce } = tabs;

    // The shown panel's height, mid-glide too, so the next panel glides from wherever this one is
    const observer = new ResizeObserver(() => {
      height.current = panel.offsetHeight;
    });
    observer.observe(panel);

    const running: AnimationPlaybackControls[] = [];
    const from = previous.current;
    // On first paint the panel is simply there
    if (from !== value) {
      const box = root.current;
      const before = box ? triggerOf(box, from) : undefined;
      const after = box ? triggerOf(box, value) : undefined;
      // From the right when the new tab is to the right of the old one. Offsets, so right-to-left pages and
      // zoomed previews work too.
      const side = before && after && after.offsetLeft < before.offsetLeft ? -1 : 1;
      const start = height.current;
      const end = panel.offsetHeight;

      if (reduce) {
        running.push(animate(panel, { opacity: [0, 1] }, { duration: duration.base, ease: ease.out }));
      } else {
        const entrance = animate(
          panel,
          { opacity: [0, 1], x: [side * SLIDE, 0], filter: [blur.hidden, blur.shown] },
          { duration: duration.base, ease: ease.out },
        );
        // A filter left behind would make a stacking context and a containing block round the content
        entrance.then(() => panel.style.removeProperty("filter"));
        running.push(entrance);

        if (start > 0 && end > 0 && start !== end) {
          panel.style.overflow = "hidden";
          const glide = animate(panel, { height: [start, end] }, { duration: duration.slow, ease: ease.out });
          glide.then(() => {
            panel.style.removeProperty("height");
            panel.style.removeProperty("overflow");
          });
          running.push(glide);
        }
      }
    }

    // Hidden again, mid-entrance or not: stop, and leave nothing behind for the next time it's shown
    return () => {
      observer.disconnect();
      for (const animation of running) animation.stop();
      for (const property of LEFTOVERS) panel.style.removeProperty(property);
    };
  }, [active]);

  return (
    <TabsPrimitive.Content
      ref={setRef}
      data-slot="tabs-content"
      value={value}
      // We decide what's shown and mounted, so the panel changes in the same render as its tab
      forceMount
      hidden={!active}
      // No flex-1 (unlike shadcn): a flex-basis would override the height the glide sets. Add it to fill a
      // fixed-height Tabs.
      className={cn(
        "rounded-md outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        className,
      )}
      {...props}
    >
      {active || forceMount ? children : null}
    </TabsPrimitive.Content>
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger, tabsListVariants, tabsTriggerVariants };
