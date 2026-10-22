"use client";

import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import {
  type AnimationPlaybackControls,
  animate,
  LayoutGroup,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { NavigationMenu as NavigationMenuPrimitive, Slot } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

/*
 * Navigation Menu, built on Radix Navigation Menu (roadmap, 2026-10-16: "A top bar with rich dropdown panels").
 * A nav landmark of links and disclosure buttons, each button opening a panel of links. Hover opens after a
 * short delay; click, Enter and Space toggle; ArrowDown opens and moves into the panel; Escape closes and hands
 * focus back to the trigger; Tab runs through the open panel's links.
 * - One highlight glides between the top-level items (layoutId on spring.snappy, scoped to each menu). It
 *   follows the mouse, rests on the open trigger otherwise, and fades out where it was when neither applies.
 * - The panels share one viewport, a floating surface under the list. Moving between triggers, its width and
 *   height glide to the next panel's size (a CSS transition on the size Radix measures, duration-base on
 *   ease-out), while the new panel slides 12px in from the side you moved towards through the blur and the
 *   old one slides out the other way.
 * - The viewport comes through the blur from the list (popover-in, from its top edge) and leaves quickly
 *   (popover-out). An optional caret on its top edge points at the open trigger and slides along with it.
 * - Each trigger's chevron turns over while its panel is open (spring.snappy).
 * - Inside a panel, one highlight glides between the links too (the same layoutId pill, one per panel), on
 *   hover and on keyboard focus, and fades out where it was when you leave. Opening the menu, the links rise
 *   into place through the blur, 0.05s apart; switching panels they slide in with the panel instead.
 * - Nothing animates on first paint. With reduced motion everything appears and moves at once.
 */

/** How far a panel slides in from (and out towards) the side you moved, in px: Tabs' distance */
const SLIDE = 12;

type Highlight = {
  /** The item the highlight sits in, or null when there's none */
  item: string | null;
  /** False while it fades out in the item it was last in */
  shown: boolean;
  /**
   * Counts appearances from nothing. Each has its own layoutId, so the highlight fades in where it appears
   * rather than flying over from where it last faded out.
   */
  appearance: number;
  /** The first item of an appearance fades the highlight in; the items after it glide it */
  fresh: boolean;
};

type MenuContextValue = {
  /** The open item, or "" when the menu is closed */
  value: string;
  setValue: (value: string) => void;
  viewport: boolean;
  horizontal: boolean;
  reduce: boolean;
  highlight: Highlight;
  /** The mouse is over an item, or has left it */
  hover: (item: string) => void;
  unhover: (item: string) => void;
  /** The highlight's fade-out has finished: remove it */
  settle: () => void;
  /** The trigger's corner radius as a number, so motion keeps the highlight's corners true as it changes width */
  radius: number | undefined;
  setRadius: (radius: number) => void;
  root: RefObject<HTMLElement | null>;
  /** Each trigger by its item, for the caret */
  triggers: RefObject<Map<string, HTMLButtonElement>>;
  /** Where the caret renders: after the viewport, so it paints over the viewport's top border */
  slot: HTMLElement | null;
  setSlot: (node: HTMLElement | null) => void;
};

const MenuContext = createContext<MenuContextValue | null>(null);
/** The item a trigger or panel belongs to */
const ItemContext = createContext<string | null>(null);
type PanelContextValue = {
  highlight: Highlight;
  settle: () => void;
  reduce: boolean;
  /** The mouse is over a link, or has left it */
  point: (link: string) => void;
  unpoint: (link: string) => void;
  /** A link has keyboard focus, or has lost it */
  focus: (link: string) => void;
  blur: (link: string) => void;
};

/** Inside a panel, links are rows that share one gliding highlight; in the list, they look like triggers */
const PanelContext = createContext<PanelContextValue | null>(null);

/** How far the links rise into place as the menu opens, in px (the library's swap) */
const RISE = 6;
/** Links come in 0.05s apart, like items in a list (motion.md) */
const STAGGER = 0.05;

/**
 * Hands a node to our ref and to the caller's. Stable: a new callback each render would make React detach the
 * ref (null) and attach it again after the children's layout effects, so the caret, measuring in its own
 * layout effect, found no root and stayed at the menu's left edge (2026-10-21).
 */
function useMergedRef<T>(own: { current: T | null }, theirs?: Ref<T>) {
  return useCallback(
    (node: T | null) => {
      own.current = node;
      if (typeof theirs === "function") theirs(node);
      else if (theirs) (theirs as { current: T | null }).current = node;
    },
    [own, theirs],
  );
}

/** A node's left offset inside an ancestor, in layout pixels (zoom and transforms don't count) */
function offsetWithin(node: HTMLElement, ancestor: HTMLElement) {
  let left = 0;
  let current: HTMLElement | null = node;
  while (current && current !== ancestor) {
    left += current.offsetLeft;
    current = current.offsetParent as HTMLElement | null;
  }
  return left;
}

/**
 * Where the highlight is. `target` is the hovered item, or else the open one. A new target glides the
 * highlight there; none fades it out in place; back on an item while it's still fading, it glides on from there.
 */
function useHighlight(target: string | null, reduce: boolean) {
  const [highlight, setHighlight] = useState<Highlight>({
    item: target,
    shown: target !== null,
    appearance: 0,
    fresh: false,
  });
  const [last, setLast] = useState(target);
  // Follows the target in the same render, so the highlight never trails a frame behind the open trigger
  if (target !== last) {
    setLast(target);
    setHighlight((current) => {
      // With reduced motion there's no fade to wait for
      if (target === null)
        return reduce ? { ...current, item: null, shown: false } : { ...current, shown: false };
      if (current.item === null)
        return { item: target, shown: true, appearance: current.appearance + 1, fresh: true };
      return { ...current, item: target, shown: true, fresh: false };
    });
  }
  const settle = useCallback(() => {
    setHighlight((current) => (current.shown ? current : { ...current, item: null }));
  }, []);
  return { highlight, settle };
}

export type NavigationMenuProps = ComponentProps<typeof NavigationMenuPrimitive.Root> & {
  /**
   * Panels open in one shared viewport under the list, which glides between their sizes. Turn it off to open
   * each panel under its own trigger instead.
   */
  viewport?: boolean;
};

/**
 * A site's navigation: a nav landmark (Radix names it "Main"; pass aria-label for another name). Holds the open
 * item, controlled or not, so the highlight, the panels and the caret know which one is open.
 */
function NavigationMenu({
  value,
  defaultValue,
  onValueChange,
  viewport = true,
  orientation = "horizontal",
  className,
  children,
  ref,
  ...props
}: NavigationMenuProps) {
  const reduce = useReducedMotion() ?? false;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const current = value ?? internal;
  const root = useRef<HTMLElement>(null);
  const setRef = useMergedRef(root, ref);
  const triggers = useRef(new Map<string, HTMLButtonElement>());
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  const [radius, setRadius] = useState<number>();
  const [hovered, setHovered] = useState<string | null>(null);
  const { highlight, settle } = useHighlight(hovered ?? (current || null), reduce);

  const setValue = useCallback(
    (next: string) => {
      setInternal(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );
  const hover = useCallback((item: string) => setHovered(item), []);
  const unhover = useCallback(
    (item: string) => setHovered((currentItem) => (currentItem === item ? null : currentItem)),
    [],
  );

  const menu = useMemo<MenuContextValue>(
    () => ({
      value: current,
      setValue,
      viewport,
      horizontal: orientation === "horizontal",
      reduce,
      highlight,
      hover,
      unhover,
      settle,
      radius,
      setRadius,
      root,
      triggers,
      slot,
      setSlot,
    }),
    [current, setValue, viewport, orientation, reduce, highlight, hover, unhover, settle, radius, slot],
  );

  return (
    <MenuContext.Provider value={menu}>
      <NavigationMenuPrimitive.Root
        ref={setRef}
        data-slot="navigation-menu"
        data-viewport={viewport}
        value={current}
        onValueChange={setValue}
        orientation={orientation}
        className={cn(
          // h-max: never stretched by a flex row, since the viewport hangs from its bottom edge
          "group/navigation-menu relative flex h-max max-w-max flex-1 items-center justify-center",
          className,
        )}
        {...props}
      >
        {children}
        {viewport ? <NavigationMenuViewport /> : null}
      </NavigationMenuPrimitive.Root>
    </MenuContext.Provider>
  );
}

/**
 * The row of items. Its own layer, so the highlight passes behind every label as it glides. Without the
 * viewport the panels open inside that layer, so it rises to the popover level while one is there.
 */
function NavigationMenuList({
  className,
  children,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.List>) {
  const groupId = useId();
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "relative isolate flex flex-1 list-none items-center justify-center gap-1 has-data-[slot=navigation-menu-content]:z-(--z-popover)",
        className,
      )}
      {...props}
    >
      <LayoutGroup id={groupId}>{children}</LayoutGroup>
    </NavigationMenuPrimitive.List>
  );
}

/**
 * The highlight, inside the item that has it. Items aren't stacking contexts: it joins the list's layer (the
 * list is `isolate`), so it passes behind every label whichever way it glides. A fill, so it only fades.
 */
function ItemHighlight({ item }: { item: string }) {
  const menu = useContext(MenuContext);
  const node = useRef<HTMLSpanElement>(null);
  const here = menu?.highlight.item === item;
  const radius = menu?.radius;
  const setRadius = menu?.setRadius;

  // Read once from the class, then motion keeps the corners true while the highlight changes width
  useLayoutEffect(() => {
    if (here && radius === undefined && node.current && setRadius)
      setRadius(Number.parseFloat(getComputedStyle(node.current).borderTopLeftRadius) || 0);
  }, [here, radius, setRadius]);

  if (!menu || !here) return null;
  const { highlight, reduce, settle } = menu;
  return (
    <motion.span
      ref={node}
      layoutId={`navigation-menu-highlight-${highlight.appearance}`}
      aria-hidden
      data-slot="navigation-menu-highlight"
      className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-accent"
      style={radius ? { borderRadius: radius } : undefined}
      initial={highlight.fresh ? { opacity: 0 } : false}
      animate={{ opacity: highlight.shown ? 1 : 0 }}
      transition={
        reduce ? { duration: 0 } : { ...spring.snappy, opacity: { duration: duration.fast, ease: ease.out } }
      }
      onAnimationComplete={() => {
        if (!highlight.shown) settle();
      }}
    />
  );
}

/** One item of the list: a trigger with its panel, or a link */
function NavigationMenuItem({
  className,
  value,
  children,
  onPointerEnter,
  onPointerLeave,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Item>) {
  const menu = useContext(MenuContext);
  const auto = useId();
  // Radix makes its own when there's none; ours is the same idea, so we know which item is open
  const item = value || auto;

  return (
    <ItemContext.Provider value={item}>
      <NavigationMenuPrimitive.Item
        data-slot="navigation-menu-item"
        value={item}
        className={cn("relative", className)}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          // Mouse only: on touch the highlight just marks the open trigger. Never on a disabled trigger.
          if (event.pointerType !== "mouse" || event.currentTarget.querySelector(":scope > [data-disabled]"))
            return;
          menu?.hover(item);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (event.pointerType === "mouse") menu?.unhover(item);
        }}
        {...props}
      >
        <ItemHighlight item={item} />
        {children}
      </NavigationMenuPrimitive.Item>
    </ItemContext.Provider>
  );
}

/**
 * The look of a top-level item: a trigger, or a link in the list. Flat: the hover and open fill is the
 * gliding highlight, not a background of its own. Muted labels turn foreground on hover, open or current.
 */
const navigationMenuTriggerStyle = cva([
  "relative inline-flex h-(--size-control-md) w-max cursor-pointer items-center justify-center gap-1 rounded-md px-3 text-sm font-medium whitespace-nowrap",
  "text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground data-active:text-foreground data-[state=open]:text-foreground",
  "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
  "disabled:pointer-events-none disabled:opacity-(--opacity-disabled)",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--size-icon-md)",
]);

/** The button that opens an item's panel. Its chevron turns over while the panel is open. */
function NavigationMenuTrigger({
  className,
  children,
  onKeyDown,
  ref,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
  const menu = useContext(MenuContext);
  const item = useContext(ItemContext);
  const open = menu !== null && item !== null && menu.value === item;
  const node = useRef<HTMLButtonElement>(null);
  const setRef = useMergedRef(node, ref);
  const entering = useRef(false);
  const triggers = menu?.triggers;

  // Known to the caret, which slides to the open trigger
  useLayoutEffect(() => {
    const trigger = node.current;
    const map = triggers?.current;
    if (!trigger || !map || item === null) return;
    map.set(item, trigger);
    return () => {
      if (map.get(item) === trigger) map.delete(item);
    };
  }, [triggers, item]);

  // Opened with ArrowDown: once the panel is in, move into it the way Radix does for ArrowDown on an open
  // trigger (its own handler also gives the links back their tab order)
  useEffect(() => {
    if (!open || !entering.current) return;
    entering.current = false;
    const frame = requestAnimationFrame(() =>
      node.current?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true })),
    );
    return () => cancelAnimationFrame(frame);
  }, [open]);

  return (
    <NavigationMenuPrimitive.Trigger
      ref={setRef}
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || !menu || item === null) return;
        // On a closed trigger, Radix would move to the next one; opening is what ArrowDown means here
        if (event.key === "ArrowDown" && menu.horizontal && !open) {
          event.preventDefault();
          entering.current = true;
          menu.setValue(item);
        }
      }}
      {...props}
    >
      {children}
      <motion.span
        aria-hidden
        className="inline-flex"
        initial={false}
        animate={{ rotate: open ? 180 : 0 }}
        transition={menu?.reduce ? { duration: 0 } : spring.snappy}
      >
        <ChevronDownIcon className="size-(--size-icon-sm)" />
      </motion.span>
    </NavigationMenuPrimitive.Trigger>
  );
}

type PanelProps = ComponentProps<"div"> & {
  viewport: boolean;
  leaving: boolean;
  onLeft: () => void;
  /** Set by Radix: the side the panel enters from or leaves towards (from-start, to-end...) */
  "data-motion"?: string | null;
};

/**
 * The panel's own element: Radix renders the content through it (asChild), handing over its attributes. In the
 * viewport it plays the slide; without one it's a floating surface of its own, under its trigger.
 */
function NavigationMenuPanel({ viewport, leaving, onLeft, className, children, ref, ...props }: PanelProps) {
  const menu = useContext(MenuContext);
  const reduce = menu?.reduce ?? false;
  const node = useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(node, ref);
  const fresh = useRef(true);
  const side = props["data-motion"];

  // One highlight for the panel's links: the one under the mouse, else the one with keyboard focus
  const groupId = useId();
  const [pointed, setPointed] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const { highlight, settle } = useHighlight(pointed ?? focused, reduce);
  const panel = useMemo<PanelContextValue>(
    () => ({
      highlight,
      settle,
      reduce,
      point: (link) => setPointed(link),
      unpoint: (link) => setPointed((current) => (current === link ? null : current)),
      focus: (link) => setFocused(link),
      blur: (link) => setFocused((current) => (current === link ? null : current)),
    }),
    [highlight, settle, reduce],
  );

  // Before the first paint, so a panel never flashes in place before it slides
  // biome-ignore lint/correctness/useExhaustiveDependencies: only arriving or leaving starts a slide
  useLayoutEffect(() => {
    const panel = node.current;
    const first = fresh.current;
    fresh.current = false;
    if (!panel || !viewport || reduce) return;
    // Radix's start and end are the left and right of the screen (it flips them for right-to-left pages)
    const towards = side?.endsWith("start") ? -1 : 1;
    let live = true;
    let running: AnimationPlaybackControls | undefined;

    if (leaving) {
      // Slides out the other way through the blur, quicker than the new panel comes in, so the two barely overlap
      const exit = animate(
        panel,
        { opacity: 0, x: towards * SLIDE, filter: blur.hidden },
        { duration: duration.fast, ease: ease.out },
      );
      exit.then(() => {
        if (live) onLeft();
      });
      running = exit;
    } else if (first && !side) {
      // Opening the menu (not switching panels): the links rise into place through the blur, in turn
      const links = Array.from(panel.querySelectorAll<HTMLElement>("[data-slot=navigation-menu-link]"));
      const rises = links.map((link, index) =>
        animate(
          link,
          { opacity: [0, 1], y: [RISE, 0], filter: [blur.hidden, blur.shown] },
          { duration: duration.slow, ease: ease.out, delay: index * STAGGER },
        ),
      );
      const clear = () => {
        for (const link of links)
          for (const property of ["opacity", "transform", "filter"]) link.style.removeProperty(property);
      };
      Promise.all(rises).then(() => {
        if (live) clear();
      });
      return () => {
        live = false;
        for (const rise of rises) rise.stop();
        clear();
      };
    } else if (side === "from-start" || side === "from-end") {
      // A panel that was sliding away and is wanted back turns round from where it is
      const entrance = animate(
        panel,
        first
          ? { opacity: [0, 1], x: [towards * SLIDE, 0], filter: [blur.hidden, blur.shown] }
          : { opacity: 1, x: 0, filter: blur.shown },
        { duration: duration.base, ease: ease.out },
      );
      // A filter left behind would make a stacking context and a containing block round the links
      entrance.then(() => {
        if (live) panel.style.removeProperty("filter");
      });
      running = entrance;
    }
    return () => {
      live = false;
      running?.stop();
    };
  }, [leaving, side]);

  return (
    <div
      {...props}
      ref={setRef}
      data-slot="navigation-menu-content"
      // On its way out: out of reach for the pointer, the keyboard and screen readers
      inert={leaving || undefined}
      className={cn(
        viewport
          ? // Centred, so a panel of another size stays put while the viewport glides round it. w-max: the panel
            // is as wide as its content, never squeezed by the viewport it's about to resize. Its own layer, so
            // the links' highlight passes behind every row whichever way it glides.
            "absolute top-0 left-1/2 isolate w-max -translate-x-1/2 p-2"
          : "absolute start-0 top-full isolate z-(--z-popover) mt-2 w-max origin-top-left rounded-lg border border-border bg-popover p-2 text-popover-foreground shadow-md data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out rtl:origin-top-right",
        leaving && "pointer-events-none",
        className,
      )}
    >
      <PanelContext.Provider value={panel}>
        <LayoutGroup id={groupId}>{children}</LayoutGroup>
      </PanelContext.Provider>
    </div>
  );
}

export type NavigationMenuContentProps = Omit<
  ComponentProps<typeof NavigationMenuPrimitive.Content>,
  "forceMount" | "asChild"
>;

/**
 * A trigger's panel. Give what's inside a width (`w-md`, a grid), so the viewport knows the size to glide to.
 */
function NavigationMenuContent({ className, children, ref, ...props }: NavigationMenuContentProps) {
  const menu = useContext(MenuContext);
  const item = useContext(ItemContext);
  const viewport = menu?.viewport ?? true;
  const active = menu !== null && item !== null && menu.value === item;
  // Moving to another panel in the viewport, this one stays mounted while it slides away. When the menu closes
  // it goes with the viewport instead.
  const switching = viewport && !(menu?.reduce ?? false) && (menu?.value ?? "") !== "";
  const [was, setWas] = useState(active);
  const [leaving, setLeaving] = useState(false);
  if (was !== active) {
    setWas(active);
    setLeaving(!active && switching);
  } else if (leaving && !switching) setLeaving(false);
  const left = useCallback(() => setLeaving(false), []);

  return (
    <NavigationMenuPrimitive.Content
      // In the viewport the shown panel and the one sliding away stay mounted: they play their own motion
      forceMount={viewport && (active || leaving) ? true : undefined}
      {...props}
      asChild
    >
      <NavigationMenuPanel
        ref={ref}
        viewport={viewport}
        leaving={leaving}
        onLeft={left}
        className={className}
      >
        {children}
      </NavigationMenuPanel>
    </NavigationMenuPrimitive.Content>
  );
}

/** A panel row: a title over a muted description. The hover fill is the panel's gliding highlight. */
const panelLinkClasses = [
  "relative flex flex-col gap-1 rounded-md p-3 text-sm outline-ring transition-colors duration-(--duration-fast) ease-out",
  "hover:text-accent-foreground data-active:bg-accent/50 data-active:text-accent-foreground",
  "focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--size-icon-md) [&_svg:not([class*='text-'])]:text-muted-foreground",
];

/**
 * A link. In the list it looks like a trigger; inside a panel it's a row. Selecting it closes the menu. Use
 * asChild with your router's link, and `active` for the current page.
 */
function NavigationMenuLink({
  className,
  children,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Link>) {
  const panel = useContext(PanelContext);
  const link = useId();
  if (!panel)
    return (
      <NavigationMenuPrimitive.Link
        data-slot="navigation-menu-link"
        className={cn(navigationMenuTriggerStyle(), className)}
        onPointerEnter={onPointerEnter}
        onPointerLeave={onPointerLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      >
        {children}
      </NavigationMenuPrimitive.Link>
    );
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(panelLinkClasses, className)}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        // Mouse only: a tap goes straight to the page
        if (event.pointerType === "mouse") panel.point(link);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        if (event.pointerType === "mouse") panel.unpoint(link);
      }}
      onFocus={(event) => {
        onFocus?.(event);
        panel.focus(link);
      }}
      onBlur={(event) => {
        onBlur?.(event);
        panel.blur(link);
      }}
      {...props}
    >
      <PanelHighlight link={link} />
      {/* With asChild the child (your router's link) becomes the row, and the highlight goes inside it */}
      <Slot.Slottable>{children}</Slot.Slottable>
    </NavigationMenuPrimitive.Link>
  );
}

/**
 * The panel's highlight, inside the link that has it. Links aren't stacking contexts: it joins the panel's
 * layer (the panel is `isolate`), so it passes behind every row's text. A fill, so it only fades.
 */
function PanelHighlight({ link }: { link: string }) {
  const panel = useContext(PanelContext);
  if (!panel || panel.highlight.item !== link) return null;
  const { highlight, reduce, settle } = panel;
  return (
    <motion.span
      layoutId={`navigation-menu-panel-highlight-${highlight.appearance}`}
      aria-hidden
      data-slot="navigation-menu-panel-highlight"
      className="pointer-events-none absolute inset-0 -z-10 rounded-md bg-accent"
      initial={highlight.fresh ? { opacity: 0 } : false}
      animate={{ opacity: highlight.shown ? 1 : 0 }}
      transition={
        reduce ? { duration: 0 } : { ...spring.snappy, opacity: { duration: duration.fast, ease: ease.out } }
      }
      onAnimationComplete={() => {
        if (!highlight.shown) settle();
      }}
    />
  );
}

/**
 * The floating surface the panels open in, under the list. NavigationMenu renders it unless `viewport` is
 * false. Its width and height are Radix's measure of the open panel; changing panels, they glide there.
 */
function NavigationMenuViewport({
  className,
  ...props
}: ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
  const menu = useContext(MenuContext);
  return (
    // Spans the menu and centres the viewport under it. Only the viewport takes the pointer.
    <div className="pointer-events-none absolute inset-x-0 top-full z-(--z-popover) flex justify-center">
      <NavigationMenuPrimitive.Viewport
        data-slot="navigation-menu-viewport"
        className={cn(
          // box-content: the measured size is the panel's, and the border sits outside it
          "pointer-events-auto relative mt-2 box-content h-(--radix-navigation-menu-viewport-height) w-(--radix-navigation-menu-viewport-width) shrink-0 origin-top overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md",
          // The size glides between panels (no transition on the first measure: there's nothing to glide from).
          // Height and width move here, a documented exception: decisions.md. Instant with reduced motion.
          "[transition-property:width,height] duration-(--duration-base) ease-out",
          "data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
          className,
        )}
        {...props}
      />
      {/* After the viewport, so the caret paints over its top border */}
      <span ref={menu?.setSlot} className="pointer-events-none absolute inset-x-0 top-0 h-2" />
    </div>
  );
}

/** The caret itself, on the viewport's top edge */
function Caret({ menu, className }: { menu: MenuContextValue; className?: string }) {
  const { value, reduce, root, triggers, slot } = menu;
  const open = value !== "";
  const x = useMotionValue(0);
  // It has a place in this opening: from here on it slides; the first place of an opening it jumps to
  const placed = useRef(false);

  useLayoutEffect(() => {
    if (!open) {
      placed.current = false;
      return;
    }
    let last: number | undefined;
    const place = (glide: boolean) => {
      const trigger = triggers.current.get(value);
      const box = root.current;
      if (!trigger || !box || !slot) return;
      // Offsets, not on-screen boxes, so a zoomed or scaled page doesn't double the trip
      const centre = offsetWithin(trigger, box) + trigger.offsetWidth / 2 - offsetWithin(slot, box);
      if (centre === last) return;
      last = centre;
      // jump() resets the speed, so a later slide never starts with the jump counted as velocity
      if (glide && placed.current && !reduce) animate(x, centre, spring.snappy);
      else x.jump(centre);
      placed.current = true;
    };
    place(true);
    // Fonts loading or the page resizing move the triggers: follow without sliding
    const observer = new ResizeObserver(() => place(false));
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, [open, value, reduce, root, triggers, slot, x]);

  useEffect(() => () => x.stop(), [x]);

  return (
    <motion.span
      aria-hidden
      data-slot="navigation-menu-indicator"
      data-state={open ? "visible" : "hidden"}
      // Its base covers the viewport's top border, so the caret and the surface read as one shape
      className={cn("absolute bottom-0 left-0 flex h-1.5 w-3 -translate-x-1/2 translate-y-px", className)}
      style={{ x }}
      initial={false}
      // With the viewport's own timing: in on popover-in's, out on popover-out's. A fill, so it only fades.
      animate={{ opacity: open ? 1 : 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : open
            ? { duration: duration.fast, ease: ease.out }
            : { duration: duration.instant, ease: ease.in }
      }
    >
      <svg viewBox="0 0 12 6" fill="none" aria-hidden className="size-full overflow-visible">
        <path d="M0 6 6 0l6 6" className="fill-popover stroke-border" />
      </svg>
    </motion.span>
  );
}

/**
 * A caret on the viewport's top edge, pointing at the open trigger; it slides along when another opens. Place
 * it in NavigationMenuList, as on shadcn. It needs the viewport, so it renders nothing with `viewport={false}`.
 */
function NavigationMenuIndicator({ className }: { className?: string }) {
  const menu = useContext(MenuContext);
  if (!menu?.slot) return null;
  return createPortal(<Caret menu={menu} className={className} />, menu.slot);
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
};
