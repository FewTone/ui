"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { Sheet, SheetContent, SheetTitle } from "@fewtone/ui/components/sheet/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@fewtone/ui/components/tooltip/tooltip";
import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronRightIcon } from "lucide-react";
import { type AnimationPlaybackControls, animate, motion, motionValue, useReducedMotion } from "motion/react";
import { Collapsible as CollapsiblePrimitive, Slot } from "radix-ui";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type MouseEvent,
  type Ref,
  type RefObject,
  type SyntheticEvent,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/*
 * Sidebar: a collapsible app sidebar (roadmap, 2026-10-16: "A collapsible app sidebar with a gliding active
 * indicator"), with shadcn's parts and `useSidebar`.
 * - SidebarProvider keeps the open state (controlled or not). SidebarTrigger, SidebarRail and ⌘B / Ctrl+B
 *   toggle it; the shortcut leaves typing alone. Below Tailwind's md (768px) the sidebar opens as a Sheet.
 * - The panel sits in the page's flow, sticky to the top, rather than fixed, so the content beside it makes
 *   room and the whole shell also works inside a frame. Widths are variables on the provider, as in shadcn.
 * - `collapsible`: "icon" narrows it to its icons (labels become tooltips), "offcanvas" slides it away, "none"
 *   keeps it.
 * - Motion (.agents/rules/motion.md):
 *   - One highlight glides to the current page's row (spring.snappy), and one more follows the mouse and
 *     fades out where it leaves. Both are placed from layout offsets, on transform only, so they stay right
 *     while the list scrolls. When the layout moves under them (a section opening, the width gliding) they
 *     keep to their row at once; they glide only when their row changes. A change of size glides as a scale.
 *   - A current page inside a folded section (closed, or the sidebar down to its icons) shows on the
 *     section's own row: the highlight climbs to it as the section folds, and drops back as it opens.
 *   - Narrowing to icons glides the width on duration.slow + ease.out (the height pattern's tween, never a
 *     spring), while the labels leave through the blur and later come back through it.
 *   - Sections open and close with the shipped collapsible keyframes, and their chevron turns.
 *   - Nothing animates on first paint, and with reduced motion it's all instant.
 */

/** Widths, set as variables on SidebarProvider (change them through its `style`) */
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_ICON = "3rem";
/** The phone sheet is a little wider, for thumbs */
const SIDEBAR_WIDTH_MOBILE = "18rem";
/** Below Tailwind's md the sidebar is a sheet; the desktop panel is `md:block` to match before hydration */
const MOBILE_QUERY = "(max-width: 767.98px)";

function subscribeToWidth(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Phone-sized, from the media query. The server and hydration assume a wider screen. */
function useIsMobile() {
  return useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

type SidebarContextValue = {
  /** "collapsed" while the desktop sidebar is narrowed to its icons or slid away */
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  /** The phone sheet's own open state */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  /** Opens or closes the sheet on phones, the sidebar elsewhere */
  toggleSidebar: () => void;
  /** The sidebar's id, for the trigger's aria-controls */
  id: string;
  shortcut: string | false;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

/** The sidebar's state and controls, for your own trigger or anything that reacts to it */
function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar and the Sidebar parts must be used inside SidebarProvider");
  return context;
}

type Collapsible = "offcanvas" | "icon" | "none";

/** What the parts inside one Sidebar know about it */
const PanelContext = createContext<{
  side: "left" | "right";
  collapsible: Collapsible;
  /** Down to its icons: labels have left, sub-menus have folded, tooltips name the rows */
  iconMode: boolean;
} | null>(null);

/** SidebarContent's highlights: rows report hover, and changes to which one is current */
const GlideContext = createContext<{
  /** Placed: the highlights now draw what each row drew itself before (server HTML, first paint) */
  ready: boolean;
  /** A row became or stopped being current, or came or went: find the current one again */
  invalidate: () => void;
  enter: (row: HTMLElement) => void;
  leave: (row: HTMLElement) => void;
} | null>(null);

/** One SidebarMenuCollapsible: whether it's open, and whether it's showing (it folds while down to icons) */
const SectionContext = createContext<{
  open: boolean;
  shown: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function useSection(part: string) {
  const section = useContext(SectionContext);
  if (!section) throw new Error(`${part} must be used inside SidebarMenuCollapsible`);
  return section;
}

/** Hands a node to our ref and to the caller's */
function useMergedRef<T>(own: RefObject<T | null>, theirs?: Ref<T>) {
  return useCallback(
    (node: T | null) => {
      own.current = node;
      if (typeof theirs === "function") theirs(node);
      else if (theirs) theirs.current = node;
    },
    [own, theirs],
  );
}

/** The shortcut leaves typing alone: ⌘B means bold in most editors */
function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null)
  );
}

export type SidebarProviderProps = ComponentProps<"div"> & {
  /** Whether the sidebar is open, when you control it */
  open?: boolean;
  /** Whether it starts open */
  defaultOpen?: boolean;
  /** Called when it opens or closes (the phone sheet keeps its own state) */
  onOpenChange?: (open: boolean) => void;
  /** The letter that toggles it with ⌘ or Ctrl; false turns the shortcut off */
  shortcut?: string | false;
};

function SidebarProvider({
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  shortcut = "b",
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const isMobile = useIsMobile();
  const id = useId();
  const [own, setOwn] = useState(defaultOpen);
  const open = openProp ?? own;
  const [openMobile, setOpenMobile] = useState(false);
  // Growing past phone size closes the sheet, so it doesn't spring open again on the way back
  if (!isMobile && openMobile) setOpenMobile(false);

  const setOpen = useCallback(
    (next: boolean) => {
      setOwn(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile((current) => !current);
    else setOpen(!open);
  }, [isMobile, open, setOpen]);

  useEffect(() => {
    if (!shortcut) return;
    const key = shortcut.toLowerCase();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key?.toLowerCase() !== key || !(event.metaKey || event.ctrlKey)) return;
      if (event.altKey || event.shiftKey || event.repeat || event.defaultPrevented || isTyping(event.target))
        return;
      event.preventDefault();
      toggleSidebar();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shortcut, toggleSidebar]);

  const value = useMemo<SidebarContextValue>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      openMobile,
      setOpenMobile,
      isMobile,
      toggleSidebar,
      id,
      shortcut,
    }),
    [open, setOpen, openMobile, isMobile, toggleSidebar, id, shortcut],
  );

  return (
    <SidebarContext.Provider value={value}>
      {/* The rows' tooltips hand over to each other down the icon column */}
      <TooltipProvider>
        <div
          data-slot="sidebar-wrapper"
          style={
            {
              "--sidebar-width": SIDEBAR_WIDTH,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as CSSProperties
          }
          // overflow-x-clip: a sidebar slid away stays off the page without making it scroll sideways, and
          // (unlike hidden) it keeps the sticky panel stuck to the viewport
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full overflow-x-clip bg-background text-foreground",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

/** Everything that leaves when the sidebar narrows to its icons: each row's label (all but its icon), group labels and badges */
const LABELS =
  "[data-slot=sidebar-menu-button] > :not(:first-child), [data-slot=sidebar-group-label], [data-slot=sidebar-menu-badge]";

function clearStyles(labels: HTMLElement[]) {
  for (const label of labels) {
    label.style.removeProperty("opacity");
    label.style.removeProperty("filter");
  }
}

/**
 * Narrowing to icons, the labels leave through the blur; widening, they come back through it. The classes
 * hold each end state, so this only plays the change and then clears what it wrote (ADR 0011).
 */
function useLabelsBlur(nav: RefObject<HTMLElement | null>, iconMode: boolean, reduce: boolean) {
  const last = useRef(iconMode);
  const run = useRef<{ controls: AnimationPlaybackControls; labels: HTMLElement[] } | null>(null);

  useLayoutEffect(() => {
    // Nothing on first paint, nor when nothing changed
    if (last.current === iconMode) return;
    last.current = iconMode;

    // Turned back mid-way, the labels carry on from where they are
    let from: { opacity: number; filter: string } = iconMode
      ? { opacity: 1, filter: blur.shown }
      : { opacity: 0, filter: blur.hidden };
    const previous = run.current;
    if (previous?.labels[0]) {
      const style = getComputedStyle(previous.labels[0]);
      from = {
        opacity: style.opacity === "" ? from.opacity : Number(style.opacity),
        filter: style.filter && style.filter !== "none" ? style.filter : blur.shown,
      };
    }
    previous?.controls.stop();
    if (previous) clearStyles(previous.labels);
    run.current = null;

    const labels = Array.from(nav.current?.querySelectorAll<HTMLElement>(LABELS) ?? []);
    if (reduce || labels.length === 0) return;
    const controls = animate(
      labels,
      {
        opacity: [from.opacity, iconMode ? 0 : 1],
        filter: [from.filter, iconMode ? blur.hidden : blur.shown],
      },
      // Leaving is quick, so the text has gone before the width closes on it; coming back keeps pace
      iconMode ? { duration: duration.fast, ease: ease.in } : { duration: duration.slow, ease: ease.out },
    );
    const current = { controls, labels };
    run.current = current;
    controls.then(() => {
      if (run.current !== current) return;
      run.current = null;
      clearStyles(labels);
    });
  }, [iconMode, reduce, nav]);

  useEffect(() => () => run.current?.controls.stop(), []);
}

export type SidebarProps = ComponentProps<"nav"> & {
  /** The edge it's on. Put a right sidebar after SidebarInset. */
  side?: "left" | "right";
  /** What collapsing does: narrow it to its icons, slide it away, or nothing */
  collapsible?: Collapsible;
};

/** The sidebar: a navigation landmark (named "Sidebar" unless you give it an aria-label) */
function Sidebar({
  side = "left",
  collapsible = "offcanvas",
  className,
  children,
  ref,
  "aria-label": label = "Sidebar",
  ...props
}: SidebarProps) {
  const sidebar = useSidebar();
  const reduce = useReducedMotion() ?? false;
  const node = useRef<HTMLElement>(null);
  const setRef = useMergedRef(node, ref);
  const collapsed = sidebar.state === "collapsed";
  const iconMode = !sidebar.isMobile && collapsible === "icon" && collapsed;
  const panel = useMemo(() => ({ side, collapsible, iconMode }), [side, collapsible, iconMode]);
  useLabelsBlur(node, iconMode, reduce);

  if (collapsible === "none") {
    return (
      <PanelContext.Provider value={panel}>
        <nav
          ref={setRef}
          id={sidebar.id}
          data-slot="sidebar"
          data-side={side}
          aria-label={label}
          className={cn(
            "flex h-full w-(--sidebar-width) flex-col bg-muted/50 text-foreground", // check-tokens-ignore: the sidebar's own width, set on SidebarProvider
            className,
          )}
          {...props}
        >
          {children}
        </nav>
      </PanelContext.Provider>
    );
  }

  if (sidebar.isMobile) {
    return (
      <PanelContext.Provider value={panel}>
        <Sheet open={sidebar.openMobile} onOpenChange={sidebar.setOpenMobile}>
          <SheetContent
            side={side}
            showCloseButton={false}
            aria-describedby={undefined}
            style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as CSSProperties}
            className="w-(--sidebar-width) max-w-5/6 gap-0 overflow-hidden p-0" // check-tokens-ignore: the sidebar's own width, set just here
          >
            <SheetTitle className="sr-only">{label}</SheetTitle>
            <nav
              ref={setRef}
              id={sidebar.id}
              data-slot="sidebar"
              data-mobile="true"
              data-side={side}
              aria-label={label}
              className={cn("flex h-full w-full flex-col text-foreground", className)}
              {...props}
            >
              {children}
            </nav>
          </SheetContent>
        </Sheet>
      </PanelContext.Provider>
    );
  }

  return (
    <PanelContext.Provider value={panel}>
      <nav
        ref={setRef}
        id={sidebar.id}
        data-slot="sidebar"
        data-state={sidebar.state}
        data-collapsible={collapsed ? collapsible : ""}
        data-side={side}
        aria-label={label}
        // Slid away, nothing in it can be reached
        inert={collapsible === "offcanvas" && collapsed ? true : undefined}
        className={cn(
          // In the flow and sticky, so the content beside it makes room; phones get the sheet instead
          "group peer sticky top-0 hidden h-svh max-h-full shrink-0 text-foreground md:block",
          // The width glides on an eased tween that starts and lands softly: never a spring, which would bounce
          // the page beside it (owner, 2026-10-22: "we can do much much better")
          "w-(--sidebar-width) data-[collapsible=icon]:w-(--sidebar-width-icon) data-[collapsible=offcanvas]:w-0", // check-tokens-ignore: the sidebar's own widths, set on SidebarProvider
          "transition-all duration-(--duration-slow) ease-in-out",
          className,
        )}
        {...props}
      >
        <div
          data-slot="sidebar-inner"
          className={cn(
            "relative flex h-full flex-col bg-muted/50",
            // Narrowing, the panel follows the width; sliding away, it keeps its width and moves out with the edge
            collapsible === "offcanvas"
              ? "w-(--sidebar-width) transition-transform duration-(--duration-slow) ease-in-out" // check-tokens-ignore: the sidebar's own width
              : "w-full",
            collapsible === "offcanvas" &&
              (side === "left"
                ? "group-data-[collapsible=offcanvas]:-translate-x-full"
                : "group-data-[collapsible=offcanvas]:translate-x-full"),
          )}
        >
          {children}
        </div>
      </nav>
    </PanelContext.Provider>
  );
}

/** Opens and closes the sidebar (the sheet, on phones). Also accepts every Button prop. */
function SidebarTrigger({ className, onClick, children, ...props }: ComponentProps<typeof Button>) {
  const sidebar = useSidebar();
  const expanded = sidebar.isMobile ? sidebar.openMobile : sidebar.open;
  const key = sidebar.shortcut ? sidebar.shortcut.toUpperCase() : null;
  return (
    <Button
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle sidebar"
      aria-expanded={expanded}
      // The sheet's sidebar exists only while it's open
      aria-controls={sidebar.isMobile && !sidebar.openMobile ? undefined : sidebar.id}
      aria-keyshortcuts={key ? `Meta+${key} Control+${key}` : undefined}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) sidebar.toggleSidebar();
      }}
      {...props}
    >
      {children ?? <PanelIcon open={expanded} />}
    </Button>
  );
}

/**
 * The trigger's panel icon, which shows the sidebar's state: its divider slides in as the sidebar narrows and
 * back out as it opens (an icon that represents a state, on spring.snappy). Nothing moves on first paint.
 */
function PanelIcon({ open }: { open: boolean }) {
  const reduce = useReducedMotion() ?? false;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <motion.path
        d="M9 3v18"
        initial={false}
        animate={{ x: open ? 0 : -2.5 }}
        transition={reduce ? { duration: 0 } : spring.snappy}
      />
    </svg>
  );
}

/**
 * A strip along the sidebar's edge that toggles it on click, for the mouse. The trigger is the way for the
 * keyboard and screen readers, so the rail is hidden from both.
 */
function SidebarRail({ className, onClick, ...props }: ComponentProps<"button">) {
  const sidebar = useSidebar();
  const panel = useContext(PanelContext);
  if (sidebar.isMobile || !panel || panel.collapsible === "none") return null;
  return (
    <button
      type="button"
      data-slot="sidebar-rail"
      aria-hidden
      tabIndex={-1}
      title="Toggle sidebar"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) sidebar.toggleSidebar();
      }}
      className={cn(
        "absolute inset-y-0 z-20 w-4 outline-hidden",
        panel.side === "left"
          ? "-right-2 cursor-w-resize group-data-[state=collapsed]:cursor-e-resize"
          : "-left-2 cursor-e-resize group-data-[state=collapsed]:cursor-w-resize",
        // The edge's line shows while the pointer is on it
        "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-border after:opacity-0 after:transition-opacity after:duration-(--duration-fast) after:ease-out hover:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

/** The main content beside the sidebar: a `main` landmark (asChild renders your own element instead) */
function SidebarInset({
  asChild = false,
  className,
  ...props
}: ComponentProps<"main"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "main";
  return (
    <Comp
      data-slot="sidebar-inset"
      className={cn("relative flex w-full min-w-0 flex-1 flex-col bg-background", className)}
      {...props}
    />
  );
}

function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sidebar-header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
}

function SidebarFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sidebar-footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />;
}

/** A quiet line between groups. Decorative, so screen readers skip it (the groups have their own labels). */
function SidebarSeparator({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden
      data-slot="sidebar-separator"
      className={cn("mx-2 h-px w-auto shrink-0 bg-border", className)}
      {...props}
    />
  );
}

type Box = { x: number; y: number; width: number; height: number };

/** Where a row sits in the content, from layout offsets: they ignore transforms (the sheet sliding in), zoom and scrolling */
function boxOf(row: HTMLElement, content: HTMLElement): Box {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = row;
  while (node && node !== content) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  if (node !== content) {
    // The content isn't one of the row's positioned ancestors: fall back to screen positions
    const a = row.getBoundingClientRect();
    const b = content.getBoundingClientRect();
    x = a.left - b.left + content.scrollLeft;
    y = a.top - b.top + content.scrollTop;
  }
  return { x, y, width: row.offsetWidth, height: row.offsetHeight };
}

/**
 * One highlight behind the rows: its place and size as motion values, so moving it never re-renders anything.
 * It writes its own style the moment a value changes, rather than through a motion component, which paints
 * on the next frame: a ResizeObserver runs after this frame's animation callbacks, so while the width glides
 * the highlight would trail its row by a frame.
 */
function createHighlight() {
  const x = motionValue(0);
  const y = motionValue(0);
  const width = motionValue(0);
  const height = motionValue(0);
  const scaleX = motionValue(1);
  const scaleY = motionValue(1);
  const opacity = motionValue(0);
  const values = [x, y, width, height, scaleX, scaleY, opacity];
  let row: HTMLElement | null = null;
  let fade: AnimationPlaybackControls | null = null;

  // jump(), not set(): set() would count the move as speed for the next glide's spring (motion.md)
  function jumpTo(box: Box) {
    x.jump(box.x);
    y.jump(box.y);
    width.jump(box.width);
    height.jump(box.height);
    scaleX.jump(1);
    scaleY.jump(1);
  }

  // A change of size glides as a scale: the new size at once, scaled to look like the old, then back to 1
  function glideTo(box: Box) {
    if (box.width > 0 && box.height > 0 && (box.width !== width.get() || box.height !== height.get())) {
      const shown = { width: width.get() * scaleX.get(), height: height.get() * scaleY.get() };
      width.jump(box.width);
      height.jump(box.height);
      scaleX.jump(shown.width / box.width);
      scaleY.jump(shown.height / box.height);
    }
    animate(x, box.x, spring.snappy);
    animate(y, box.y, spring.snappy);
    animate(scaleX, 1, spring.snappy);
    animate(scaleY, 1, spring.snappy);
  }

  function fadeTo(value: number, instant: boolean) {
    fade?.stop();
    fade = null;
    if (instant) opacity.jump(value);
    else fade = animate(opacity, value, { duration: duration.fast, ease: value ? ease.out : ease.in });
  }

  return {
    /** Draws onto the element from now on; returns the way to stop */
    attach(element: HTMLElement) {
      const paint = () => {
        element.style.transform = `translate(${x.get()}px, ${y.get()}px) scale(${scaleX.get()}, ${scaleY.get()})`;
        element.style.width = `${width.get()}px`;
        element.style.height = `${height.get()}px`;
        element.style.opacity = String(opacity.get());
      };
      paint();
      const unsubscribe = values.map((value) => value.on("change", paint));
      return () => {
        for (const stop of unsubscribe) stop();
      };
    },
    row: () => row,
    /**
     * Onto a row, or away (null). Animated, it glides there while it's showing (even half faded), or fades in
     * there if it isn't; it fades out where it was.
     */
    moveTo(next: HTMLElement | null, content: HTMLElement, animated: boolean) {
      row = next;
      if (!next) {
        fadeTo(0, !animated);
        return;
      }
      const box = boxOf(next, content);
      if (animated && opacity.get() > 0) glideTo(box);
      else jumpTo(box);
      fadeTo(1, !animated);
    },
    /** The layout moved under it: keep to its row at once, or carry a glide on to the row's new place */
    follow(content: HTMLElement) {
      if (!row?.isConnected) return;
      const box = boxOf(row, content);
      if (x.isAnimating() || y.isAnimating() || scaleX.isAnimating() || scaleY.isAnimating()) glideTo(box);
      else jumpTo(box);
    },
    stop() {
      for (const value of values) value.stop();
    },
  };
}

type Highlight = ReturnType<typeof createHighlight>;

const CURRENT_ROWS =
  "[data-slot=sidebar-menu-button][data-active=true], [data-slot=sidebar-menu-sub-button][data-active=true]";

/**
 * The row the current-page highlight belongs on: the last row marked active (a sub-page comes after its
 * section). Inside a sub-menu that isn't showing (its section is closed, or the sidebar is down to icons),
 * the row it hangs from stands in.
 */
function currentRow(content: HTMLElement, iconMode: boolean) {
  const marked = content.querySelectorAll<HTMLElement>(CURRENT_ROWS);
  let row: HTMLElement | null = marked[marked.length - 1] ?? null;
  while (row) {
    // Typed by hand: `row` changes inside the loop, which makes their inferred types circular
    const sub: HTMLElement | null = row.closest<HTMLElement>("[data-slot=sidebar-menu-sub]");
    if (!sub || !content.contains(sub)) break;
    const section = sub.closest<HTMLElement>("[data-slot=sidebar-menu-collapsible-content]");
    if (!iconMode && section?.dataset.state !== "closed") break;
    const item: HTMLLIElement | null | undefined = sub.parentElement?.closest("li");
    row = item?.querySelector<HTMLElement>(":scope > [data-slot=sidebar-menu-button]") ?? null;
  }
  return row;
}

function HighlightLayer({ highlight, className }: { highlight: Highlight; className: string }) {
  const node = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => (node.current ? highlight.attach(node.current) : undefined), [highlight]);
  return (
    // Hidden until it's placed (in the server HTML, each row draws its own background meanwhile)
    <span
      ref={node}
      aria-hidden
      data-slot="sidebar-highlight"
      className={cn(
        "pointer-events-none absolute top-0 left-0 -z-10 origin-top-left rounded-md opacity-0",
        className,
      )}
    />
  );
}

/** The scrolling middle, holding the groups. The highlights behind its rows live here. */
function SidebarContent({ className, style, children, ref, ...props }: ComponentProps<"div">) {
  const panel = useContext(PanelContext);
  const iconMode = panel?.iconMode ?? false;
  const reduce = useReducedMotion() ?? false;
  const node = useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(node, ref);
  const [version, invalidate] = useReducer((count: number) => count + 1, 0);
  const [ready, setReady] = useState(false);
  const [current] = useState(createHighlight);
  const [hover] = useState(createHighlight);
  const placed = useRef(false);

  // The current page's row. The first time, the highlight is simply there; after that it glides.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `version` counts the changes rows report
  useLayoutEffect(() => {
    const content = node.current;
    if (!content) return;
    current.moveTo(currentRow(content, iconMode), content, placed.current && !reduce);
    placed.current = true;
    setReady(true);
  }, [version, iconMode, reduce, current]);

  // Rows move when a section opens or the width glides: the highlights keep to theirs, frame by frame
  // biome-ignore lint/correctness/useExhaustiveDependencies: rows may have come or gone (`version`)
  useLayoutEffect(() => {
    const content = node.current;
    if (!content) return;
    const follow = () => {
      current.follow(content);
      hover.follow(content);
    };
    const observer = new ResizeObserver(follow);
    observer.observe(content);
    for (const child of Array.from(content.children)) {
      if (child.getAttribute("data-slot") !== "sidebar-highlight") observer.observe(child);
    }
    return () => observer.disconnect();
  }, [version, current, hover]);

  useEffect(
    () => () => {
      current.stop();
      hover.stop();
    },
    [current, hover],
  );

  const glide = useMemo(
    () => ({
      ready,
      invalidate,
      enter: (row: HTMLElement) => {
        if (node.current) hover.moveTo(row, node.current, !reduce);
      },
      leave: (row: HTMLElement) => {
        if (node.current && hover.row() === row) hover.moveTo(null, node.current, !reduce);
      },
    }),
    [ready, reduce, hover],
  );

  return (
    <GlideContext.Provider value={glide}>
      <div
        ref={setRef}
        data-slot="sidebar-content"
        className={cn(
          // `isolate`: the highlights pass behind every row's text (rows aren't stacking contexts)
          "relative isolate flex min-h-0 flex-1 flex-col gap-2 overflow-x-hidden overflow-y-auto group-data-[collapsible=icon]:overflow-y-hidden",
          className,
        )}
        // A long list still scrolls (wheel, trackpad, touch, keyboard), without a scrollbar in the panel (owner,
        // 2026-10-22)
        style={{ scrollbarWidth: "none", ...style }}
        {...props}
      >
        {/* The hover highlight under the current one, so the current row keeps its colour while hovered */}
        <HighlightLayer highlight={hover} className="bg-accent/60" />
        <HighlightLayer highlight={current} className="bg-accent" />
        {children}
      </div>
    </GlideContext.Provider>
  );
}

function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn(
        "relative flex w-full min-w-0 flex-col p-2",
        // Down to icons, a short line where the group's label was, so the groups still read as groups. A
        // line, so it only fades, a little after the label has gone.
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-4 before:mx-auto before:h-px before:w-4 before:bg-border before:opacity-0",
        "before:transition-opacity before:duration-(--duration-fast) before:ease-out",
        "group-data-[collapsible=icon]:has-data-[slot=sidebar-group-label]:before:opacity-100 group-data-[collapsible=icon]:before:delay-(--duration-fast)",
        className,
      )}
      {...props}
    />
  );
}

/**
 * A group's heading. Down to icons it leaves through the blur as it shrinks to half its height, alongside the
 * width, so the icons close up into one column instead of leaving a gap where each label was (owner,
 * 2026-10-22); the group draws a short line there instead.
 */
function SidebarGroupLabel({
  asChild = false,
  className,
  ...props
}: ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="sidebar-group-label"
      className={cn(
        "flex h-8 shrink-0 items-center gap-2 overflow-hidden rounded-md px-2 text-xs font-medium whitespace-nowrap text-muted-foreground",
        "transition-all duration-(--duration-slow) ease-in-out group-data-[collapsible=icon]:h-4",
        "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        "[&>svg]:size-(--size-icon-md) [&>svg]:shrink-0 group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sidebar-group-content" className={cn("w-full text-sm", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul data-slot="sidebar-menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props} />
  );
}

function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li data-slot="sidebar-menu-item" className={cn("group/menu-item relative", className)} {...props} />
  );
}

/** A row tells the highlight when it becomes or stops being current, and when it comes or goes while current */
function useCurrentRow(isActive: boolean, invalidate: (() => void) | undefined) {
  useLayoutEffect(() => {
    if (!isActive || !invalidate) return;
    invalidate();
    return invalidate;
  }, [isActive, invalidate]);
}

/** On phones, following a link in the sheet closes it (a plain click, not one that opens a new tab) */
function closeOnNavigate(event: MouseEvent<HTMLElement>, sidebar: SidebarContextValue) {
  if (!sidebar.isMobile || !(event.currentTarget instanceof HTMLAnchorElement)) return;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  sidebar.setOpenMobile(false);
}

const rowFocus =
  "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)";
const rowDisabled =
  "disabled:pointer-events-none disabled:opacity-(--opacity-disabled) aria-disabled:pointer-events-none aria-disabled:opacity-(--opacity-disabled)";

/** Hover and current-page backgrounds a row draws itself, where no gliding highlight does (header, footer, first paint) */
const ownHighlight = "hover:bg-accent/60 data-[active=true]:bg-accent";

const sidebarMenuButtonVariants = cva(
  [
    "peer/menu-button relative flex w-full cursor-pointer items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm whitespace-nowrap text-muted-foreground",
    "transition-colors duration-(--duration-fast) ease-out hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground",
    rowFocus,
    rowDisabled,
    "[&>span:last-child]:truncate [&>svg]:size-(--size-icon-md) [&>svg]:shrink-0",
    // Down to icons, all but the icon has left through the blur (Sidebar plays it). It stays clipped and
    // invisible, and still names the row for screen readers.
    "group-data-[collapsible=icon]:[&>:not(:first-child)]:opacity-0",
    // A badge beside the row keeps the label clear of it
    "group-has-data-[slot=sidebar-menu-badge]/menu-item:pe-8",
  ],
  {
    variants: {
      size: {
        sm: "h-7 text-xs",
        md: "h-8",
        // The picture never shrinks to fit (a squeezed logo turned into a pill, owner 2026-10-22). Down to icons,
        // the 32px picture moves 8px towards the edge to sit centred and scales to 24px, so the
        // rail's pictures weigh what its icons do (owner, 2026-10-22): transforms, alongside the width
        lg: "h-12 [&>:first-child]:shrink-0 [&>:first-child]:transition-transform [&>:first-child]:duration-(--duration-slow) [&>:first-child]:ease-in-out group-data-[collapsible=icon]:[&>:first-child]:-translate-x-2 group-data-[collapsible=icon]:[&>:first-child]:scale-75",
      },
    },
    defaultVariants: { size: "md" },
  },
);

export type SidebarMenuButtonProps = ComponentProps<"button"> &
  VariantProps<typeof sidebarMenuButtonVariants> & {
    /** Render the single child (for example a link) as the row */
    asChild?: boolean;
    /** The current page: the highlight sits behind it, and it gets aria-current="page" */
    isActive?: boolean;
    /** Shown beside the row while the sidebar is down to its icons: the label, or TooltipContent props */
    tooltip?: string | ComponentProps<typeof TooltipContent>;
  };

function SidebarMenuButton({
  asChild = false,
  isActive = false,
  size = "md",
  tooltip,
  className,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...props
}: SidebarMenuButtonProps) {
  const sidebar = useSidebar();
  const panel = useContext(PanelContext);
  const glide = useContext(GlideContext);
  useCurrentRow(isActive, glide?.invalidate);
  const Comp = asChild ? Slot.Root : "button";

  const button = (
    <Comp
      type={asChild ? undefined : "button"}
      data-slot="sidebar-menu-button"
      data-size={size}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        sidebarMenuButtonVariants({ size }),
        // In SidebarContent the gliding highlights take over once they're placed
        !glide?.ready && ownHighlight,
        // Down to icons, a tall row's picture is the target on its own
        !glide?.ready &&
          size === "lg" &&
          "group-data-[collapsible=icon]:hover:bg-transparent group-data-[collapsible=icon]:data-[active=true]:bg-transparent",
        className,
      )}
      onClick={(event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        closeOnNavigate(event, sidebar);
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") glide?.enter(event.currentTarget);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        glide?.leave(event.currentTarget);
      }}
      {...props}
    />
  );

  if (!tooltip) return button;
  const content = typeof tooltip === "string" ? { children: tooltip } : tooltip;
  const named = panel?.iconMode ?? false;
  // A label only goes missing once the sidebar is down to its icons; until then the tooltip never opens
  const hold = (event: SyntheticEvent) => {
    if (!named) event.preventDefault();
  };
  return (
    <Tooltip>
      <TooltipTrigger asChild onPointerMove={hold} onFocus={hold}>
        {button}
      </TooltipTrigger>
      {named ? <TooltipContent side={panel?.side === "right" ? "left" : "right"} {...content} /> : null}
    </Tooltip>
  );
}

/**
 * A count or status beside a row, at its end. Down to icons it leaves with the labels and a dot takes its
 * place on the icon's corner, so the rail still says something's waiting there.
 */
function SidebarMenuBadge({ className, ...props }: ComponentProps<"div">) {
  return (
    <>
      <div
        data-slot="sidebar-menu-badge"
        className={cn(
          "pointer-events-none absolute end-1 top-1.5 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium text-muted-foreground tabular-nums select-none",
          "transition-colors duration-(--duration-fast) ease-out peer-hover/menu-button:text-foreground peer-data-[active=true]/menu-button:text-foreground",
          "peer-data-[size=sm]/menu-button:top-1 peer-data-[size=lg]/menu-button:top-3.5",
          "group-data-[collapsible=icon]:opacity-0",
          className,
        )}
        {...props}
      />
      {/* The dot grows in once the badge has gone, and goes first on the way back (a fill, so no blur) */}
      <span
        aria-hidden
        data-slot="sidebar-menu-badge-dot"
        className={cn(
          // Touching the icon's top-right corner from outside, in the rows' quiet colour, so it reads as a note
          // rather than a hole in the icon (owner, 2026-10-22)
          "pointer-events-none absolute start-6 top-1 size-1.5 scale-50 rounded-full bg-muted-foreground opacity-0",
          "transition duration-(--duration-base) ease-out",
          "peer-data-[size=sm]/menu-button:top-0.5",
          "group-data-[collapsible=icon]:scale-100 group-data-[collapsible=icon]:opacity-100 group-data-[collapsible=icon]:delay-(--duration-fast)",
        )}
      />
    </>
  );
}

export type SidebarMenuCollapsibleProps = ComponentProps<"li"> & {
  /** Whether the section is open, when you control it */
  open?: boolean;
  /** Whether it starts open */
  defaultOpen?: boolean;
  /** Called when it opens or closes */
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
};

/**
 * A menu item whose row opens a sub-menu, built on Radix Collapsible. Down to icons it folds away and
 * remembers whether it was open.
 */
function SidebarMenuCollapsible({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled,
  className,
  ...props
}: SidebarMenuCollapsibleProps) {
  const panel = useContext(PanelContext);
  const glide = useContext(GlideContext);
  const [own, setOwn] = useState(defaultOpen);
  const open = openProp ?? own;
  const setOpen = useCallback(
    (next: boolean) => {
      setOwn(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  // There's no room for a sub-menu beside the icons: it folds, and opens again with the sidebar
  const shown = open && !panel?.iconMode;
  const invalidate = glide?.invalidate;
  // The current page may be inside: the highlight moves between the sub-page and this row
  // biome-ignore lint/correctness/useExhaustiveDependencies: folding or unfolding is what's reported
  useLayoutEffect(() => {
    invalidate?.();
  }, [shown, invalidate]);

  return (
    <SectionContext.Provider value={{ open, shown, setOpen }}>
      <CollapsiblePrimitive.Root asChild open={shown} onOpenChange={setOpen} disabled={disabled}>
        <li
          data-slot="sidebar-menu-collapsible"
          className={cn("group/menu-item relative", className)}
          {...props}
        />
      </CollapsiblePrimitive.Root>
    </SectionContext.Provider>
  );
}

/** The section's row, with a chevron that turns as it opens. Also accepts every SidebarMenuButton prop. */
function SidebarMenuCollapsibleTrigger({ children, className, onClick, ...props }: SidebarMenuButtonProps) {
  const sidebar = useSidebar();
  const panel = useContext(PanelContext);
  const section = useSection("SidebarMenuCollapsibleTrigger");
  return (
    <CollapsiblePrimitive.Trigger
      asChild
      onClick={(event) => {
        onClick?.(event);
        // Down to icons, the row opens the sidebar with its section showing, rather than a section no one can see
        if (!event.defaultPrevented && panel?.iconMode) {
          event.preventDefault();
          section.setOpen(true);
          sidebar.setOpen(true);
        }
      }}
    >
      <SidebarMenuButton className={cn("[&>span:nth-last-child(2)]:truncate", className)} {...props}>
        {children}
        {/* CSS turns it, so it doesn't move on first paint and is instant with reduced motion */}
        <span
          aria-hidden
          data-slot="sidebar-menu-chevron"
          className={cn(
            "ms-auto flex shrink-0 transition-transform duration-(--duration-base) ease-out",
            section.shown && "rotate-90",
          )}
        >
          <ChevronRightIcon className="size-(--size-icon-md)" />
        </span>
      </SidebarMenuButton>
    </CollapsiblePrimitive.Trigger>
  );
}

/**
 * The section's sub-menu, opening and closing on the shipped collapsible keyframes (Accordion's height
 * pattern). It stays in the HTML while closed (hidden), so the highlight can tell a current page inside it.
 */
function SidebarMenuCollapsibleContent({
  className,
  children,
  onAnimationEnd,
  ref,
  ...props
}: ComponentProps<typeof CollapsiblePrimitive.Content>) {
  const section = useSection("SidebarMenuCollapsibleContent");
  const node = useRef<HTMLDivElement>(null);
  const setRef = useMergedRef(node, ref);
  // At rest once its keyframes end: hidden when closed, unclipped when open (focus rings inside aren't cut).
  // Reset in the same render as it opens or closes, so it's clipped from the first frame.
  const [settled, setSettled] = useState(true);
  const [was, setWas] = useState(section.shown);
  if (section.shown !== was) {
    setWas(section.shown);
    setSettled(false);
  }

  // Radix starts the keyframes after measuring; they glide to and from the content's own height. Radix's
  // --radix-collapsible-content-height lags a render behind while the content stays mounted, so set ours.
  // biome-ignore lint/correctness/useExhaustiveDependencies: measured each time it opens or closes
  useLayoutEffect(() => {
    const element = node.current;
    if (!element) return;
    element.style.setProperty("--collapsible-height", `${element.scrollHeight}px`);
    // Without the keyframes (the tokens aren't installed) no animationend comes: settle at once, as Radix does
    if (getComputedStyle(element).animationName === "none") setSettled(true);
  }, [section.shown]);

  return (
    <CollapsiblePrimitive.Content
      ref={setRef}
      forceMount
      data-slot="sidebar-menu-collapsible-content"
      hidden={!section.shown && settled}
      className={cn(
        "data-[state=open]:animate-collapsible-open data-[state=closed]:animate-collapsible-close",
        !(section.shown && settled) && "overflow-hidden",
        className,
      )}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) setSettled(true);
        onAnimationEnd?.(event);
      }}
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Content>
  );
}

/** Rows under a row, along a quiet line. Down to icons it's hidden (in a SidebarMenuCollapsible it folds instead). */
function SidebarMenuSub({ className, ...props }: ComponentProps<"ul">) {
  const section = useContext(SectionContext);
  return (
    <ul
      data-slot="sidebar-menu-sub"
      className={cn(
        "ms-4 flex min-w-0 flex-col gap-1 border-s border-border px-2.5 py-0.5",
        !section && "group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
}

function SidebarMenuSubItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuSubButtonVariants = cva(
  [
    "relative flex h-7 min-w-0 cursor-pointer items-center gap-2 overflow-hidden rounded-md px-2 whitespace-nowrap text-muted-foreground",
    "transition-colors duration-(--duration-fast) ease-out hover:text-foreground data-[active=true]:font-medium data-[active=true]:text-foreground",
    rowFocus,
    rowDisabled,
    "[&>span:last-child]:truncate [&>svg]:size-(--size-icon-md) [&>svg]:shrink-0",
  ],
  {
    variants: { size: { sm: "text-xs", md: "text-sm" } },
    defaultVariants: { size: "md" },
  },
);

export type SidebarMenuSubButtonProps = ComponentProps<"a"> &
  VariantProps<typeof sidebarMenuSubButtonVariants> & {
    /** Render the single child (for example a Next.js Link or a button) as the row */
    asChild?: boolean;
    /** The current page */
    isActive?: boolean;
  };

/** A sub-menu row: a link by default, as in shadcn */
function SidebarMenuSubButton({
  asChild = false,
  isActive = false,
  size = "md",
  className,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...props
}: SidebarMenuSubButtonProps) {
  const sidebar = useSidebar();
  const glide = useContext(GlideContext);
  useCurrentRow(isActive, glide?.invalidate);
  const Comp = asChild ? Slot.Root : "a";
  return (
    <Comp
      data-slot="sidebar-menu-sub-button"
      data-size={size}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className={cn(sidebarMenuSubButtonVariants({ size }), !glide?.ready && ownHighlight, className)}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        closeOnNavigate(event, sidebar);
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") glide?.enter(event.currentTarget);
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        glide?.leave(event.currentTarget);
      }}
      {...props}
    />
  );
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuCollapsible,
  SidebarMenuCollapsibleContent,
  SidebarMenuCollapsibleTrigger,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
};
