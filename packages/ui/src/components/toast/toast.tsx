"use client";

import { buttonVariants } from "@fewtone/ui/components/button/button";
import { Spinner } from "@fewtone/ui/components/spinner/spinner";
import { blur, duration, ease, spring, swap } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva } from "class-variance-authority";
import { XIcon } from "lucide-react";
import {
  AnimatePresence,
  type AnimationPlaybackControls,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { Portal, Toast as ToastPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  isValidElement,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/*
 * Toast: short notifications at a corner of the screen that stack and leave on their own (owner's roadmap,
 * 2026-10-16). Built on Radix Toast: each toast is announced to screen readers, F8 jumps to them, Escape
 * closes the newest, and they swipe away. The close timers are this file's own (see Toast): they wait while
 * the pointer or focus is on the toasts, or the window is in the background.
 * Two ways in:
 * - `<Toaster />` placed once, then `toast("Saved")` from anywhere (`toast.success`, `.error`, `.loading`,
 *   `.promise`, `.dismiss`), like sonner. The toasts live in a tiny store read with useSyncExternalStore.
 * - The parts (ToastProvider, Toast, ToastTitle, ToastDescription, ToastAction, ToastClose, ToastViewport),
 *   shaped like shadcn's, for toasts you render yourself with `open` state.
 * Motion (.agents/rules/motion.md):
 * - A new toast slides in from the screen edge through the blur; one that closes slides back out to it.
 * - Several stack like a deck: older toasts tuck behind the newest, each a little narrower, showing a 12px
 *   edge with their content hidden. Hovering, or keyboard focus, fans them out into a list. Every shift is on
 *   spring.snappy; a tucked toast takes the front one's height, and heights glide on an eased tween (the
 *   height pattern), never a spring.
 * - A swipe follows the finger. Let go past the threshold and it flies off; short of it, it springs back.
 * - A toast whose content changes (toast.promise settling) swaps it through the blur, like Loading Button.
 * - Reduced motion: opacity only, and the toasts sit in a plain list.
 * Error toasts keep the neutral surface: the title and the cross turn the destructive colour.
 */

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/** The deck, in px: how much of each older toast shows behind the newest, and the gap once fanned out */
const PEEK = 12;
const GAP = 12;
/** Each older toast in the deck is 5% narrower than the one in front of it */
const SHRINK = 0.05;

/* ------------------------------------------------------------------------------------------------------ */
/* The stack: which toasts are open, how tall each is, and whether the deck is fanned out                  */

type StackSettings = { position: ToastPosition; expand: boolean; visibleToasts: number };

type Stack = StackSettings & {
  /** Open toasts, oldest first */
  ids: string[];
  /** Each open toast's full height, measured from its content */
  heights: Record<string, number>;
  /** Fanned out into a list: hovered, focused from the keyboard, `expand`, or reduced motion */
  expanded: boolean;
  /** The timers wait: the pointer is on the toasts, focus is in them, or the window is in the background */
  paused: boolean;
  /** How long a toast stays open, unless it sets its own duration */
  duration: number;
  reduce: boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  measure: (id: string, height: number) => void;
  configure: (settings: StackSettings) => void;
  setHovered: (hovered: boolean) => void;
  /** Where focus is: outside the toasts, in them from a click, or in them from the keyboard */
  setFocus: (focus: Focus) => void;
};

type Focus = "none" | "pointer" | "keyboard";

const defaultSettings: StackSettings = { position: "bottom-right", expand: false, visibleToasts: 3 };
const noop = () => {};
// Outside a ToastProvider, a toast still shows; it just doesn't stack
const looseStack: Stack = {
  ...defaultSettings,
  ids: [],
  heights: {},
  expanded: true,
  paused: false,
  duration: 5000,
  reduce: false,
  add: noop,
  remove: noop,
  measure: noop,
  configure: noop,
  setHovered: noop,
  setFocus: noop,
};

const StackContext = createContext<Stack>(looseStack);

/** Hands a node to our ref (a state setter, so effects rerun when it mounts) and to the caller's */
function useMergedRef<T>(own: (node: T | null) => void, theirs?: Ref<T>) {
  return useCallback(
    (node: T | null) => {
      own(node);
      if (typeof theirs === "function") theirs(node);
      else if (theirs) theirs.current = node;
    },
    [own, theirs],
  );
}

export type ToastProviderProps = Omit<ComponentProps<typeof ToastPrimitive.Provider>, "swipeDirection">;

/**
 * Wraps the toasts and their viewport: Radix Toast's provider (the `label` screen readers say before each
 * toast, the swipe threshold), plus the stack the deck is drawn from and the default `duration`. Toasts
 * swipe towards the nearer side of the screen: left for left positions, right otherwise.
 */
function ToastProvider({ children, duration = 5000, ...props }: ToastProviderProps) {
  const reduce = useReducedMotion() ?? false;
  const [settings, setSettings] = useState(defaultSettings);
  const [ids, setIds] = useState<string[]>([]);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [hovered, setHovered] = useState(false);
  const [focus, setFocus] = useState<Focus>("none");
  const [away, setAway] = useState(false);
  const empty = ids.length === 0;

  // With nothing left, the deck folds again and the timers are free: the pointer or focus may still be
  // where the last toast was
  useEffect(() => {
    if (!empty) return;
    setHovered(false);
    setFocus("none");
  }, [empty]);

  // The timers wait while the window is in the background, as Radix's do
  useEffect(() => {
    const leave = () => setAway(true);
    const back = () => setAway(false);
    window.addEventListener("blur", leave);
    window.addEventListener("focus", back);
    return () => {
      window.removeEventListener("blur", leave);
      window.removeEventListener("focus", back);
    };
  }, []);

  const add = useCallback(
    (id: string) => setIds((current) => (current.includes(id) ? current : [...current, id])),
    [],
  );
  const remove = useCallback((id: string) => {
    setIds((current) => current.filter((other) => other !== id));
    setHeights(({ [id]: _, ...rest }) => rest);
  }, []);
  const measure = useCallback(
    (id: string, height: number) =>
      setHeights((current) => (current[id] === height ? current : { ...current, [id]: height })),
    [],
  );
  const configure = useCallback(
    (next: StackSettings) =>
      setSettings((current) =>
        current.position === next.position &&
        current.expand === next.expand &&
        current.visibleToasts === next.visibleToasts
          ? current
          : next,
      ),
    [],
  );

  const expanded = settings.expand || reduce || hovered || focus === "keyboard";
  const paused = hovered || focus !== "none" || away;
  const stack = useMemo<Stack>(
    () => ({
      ...settings,
      ids,
      heights,
      expanded,
      paused,
      duration,
      reduce,
      add,
      remove,
      measure,
      configure,
      setHovered,
      setFocus,
    }),
    [settings, ids, heights, expanded, paused, duration, reduce, add, remove, measure, configure],
  );

  return (
    <ToastPrimitive.Provider
      swipeDirection={settings.position.endsWith("left") ? "left" : "right"}
      {...props}
    >
      <StackContext.Provider value={stack}>{children}</StackContext.Provider>
    </ToastPrimitive.Provider>
  );
}

/* ------------------------------------------------------------------------------------------------------ */
/* Viewport                                                                                                */

// 16px in from the screen's edges; full width on phones, 24rem from the sm breakpoint
const toastViewportVariants = cva(
  [
    "fixed inset-x-4 z-(--z-toast) sm:w-sm",
    "rounded-lg outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
  ],
  {
    variants: {
      position: {
        "top-left": "top-4 sm:right-auto",
        "top-center": "top-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2",
        "top-right": "top-4 sm:left-auto",
        "bottom-left": "bottom-4 sm:right-auto",
        "bottom-center": "bottom-4 sm:right-auto sm:left-1/2 sm:-translate-x-1/2",
        "bottom-right": "bottom-4 sm:left-auto",
      },
    },
    defaultVariants: { position: "bottom-right" },
  },
);

/** Keyboard focus fans the deck out; a click doesn't (the pointer already has, by hovering) */
function isFocusVisible(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  try {
    return target.matches(":focus-visible");
  } catch {
    return true;
  }
}

export type ToastViewportProps = ComponentProps<typeof ToastPrimitive.Viewport> & {
  /** The corner, or the middle of the top or bottom edge, where toasts appear */
  position?: ToastPosition;
  /** Always show the toasts as a list, instead of a deck that fans out on hover */
  expand?: boolean;
  /** How many toasts show at once; older ones wait out of sight until newer ones go */
  visibleToasts?: number;
};

/**
 * Where the toasts appear: a list fixed to a corner of the screen, portalled to the end of the body so no
 * transformed or clipped parent can trap it. Place it once, inside ToastProvider.
 */
function ToastViewport({
  className,
  position = "bottom-right",
  expand = false,
  visibleToasts = 3,
  style,
  ref,
  ...props
}: ToastViewportProps) {
  const stack = useContext(StackContext);
  const { configure, setHovered, setFocus } = stack;
  const [list, setList] = useState<HTMLOListElement | null>(null);
  const setRef = useMergedRef(setList, ref);
  const visible = Math.max(1, Math.floor(visibleToasts));

  useLayoutEffect(
    () => configure({ position, expand, visibleToasts: visible }),
    [configure, position, expand, visible],
  );

  // Native listeners: Radix portals the toasts into this list, so they're its children in the DOM but not
  // in React's tree, and React's own pointer events wouldn't see the pointer reach them
  useEffect(() => {
    if (!list) return;
    const enter = () => setHovered(true);
    const leave = () => setHovered(false);
    const focusIn = (event: FocusEvent) => setFocus(isFocusVisible(event.target) ? "keyboard" : "pointer");
    const focusOut = (event: FocusEvent) => {
      if (!(event.relatedTarget instanceof Node && list.contains(event.relatedTarget))) setFocus("none");
    };
    list.addEventListener("pointerenter", enter);
    list.addEventListener("pointerleave", leave);
    list.addEventListener("focusin", focusIn);
    list.addEventListener("focusout", focusOut);
    return () => {
      list.removeEventListener("pointerenter", enter);
      list.removeEventListener("pointerleave", leave);
      list.removeEventListener("focusin", focusIn);
      list.removeEventListener("focusout", focusOut);
    };
  }, [list, setHovered, setFocus]);

  // The list is as tall as the deck or the fanned-out toasts, so the gaps between them count as hovering
  const shown = stack.ids.slice(-visible);
  const front = shown[shown.length - 1];
  const sizes = shown.map((id) => stack.heights[id] ?? 0);
  const height = !front
    ? 0
    : stack.expanded
      ? sizes.reduce((total, size) => total + size, 0) + GAP * (sizes.length - 1)
      : (stack.heights[front] ?? 0) + PEEK * (sizes.length - 1);

  return (
    <Portal.Root>
      <ToastPrimitive.Viewport
        ref={setRef}
        data-slot="toast-viewport"
        data-position={position}
        data-expanded={stack.expanded || undefined}
        className={cn(toastViewportVariants({ position }), className)}
        style={{ height, ...style }}
        {...props}
      />
    </Portal.Root>
  );
}

/* ------------------------------------------------------------------------------------------------------ */
/* Toast                                                                                                   */

/** A toast's surface, exported for anything that should look like one */
const toastVariants = cva("rounded-lg border border-border bg-popover text-popover-foreground shadow-lg");

/** What a leaving toast needs to know: swiped away, which edge it goes back to, and reduced motion */
type Leave = { swiped: boolean; toward: number; reduce: boolean };

const leaveVariants = {
  exit: ({ swiped, toward, reduce }: Leave) =>
    reduce
      ? { opacity: 0, transition: { duration: duration.fast } }
      : swiped
        ? // It's already flying off sideways (onSwipeEnd); it only fades as it goes
          { opacity: 0, filter: blur.hidden, transition: { duration: duration.base, ease: ease.out } }
        : // Back out to the edge it came in from, on a timed curve so it's quickly gone
          {
            opacity: 0,
            filter: blur.hidden,
            y: `${-toward * 100}%`,
            transition: { duration: duration.base, ease: ease.in },
          },
} satisfies Variants;

const settle = { duration: duration.base, ease: ease.out };

export type ToastProps = Omit<ComponentProps<typeof ToastPrimitive.Root>, "asChild" | "forceMount"> & {
  /** Destructive turns the title (and the icon, in toasts from `toast.error`) the destructive colour */
  variant?: "default" | "destructive";
  /** Called once the toast has finished leaving, for example to drop it from your own list */
  onExitComplete?: () => void;
};

/**
 * One notification, built on Radix Toast's root. It stays open for the provider's `duration` (or its own),
 * paused while hovered or focused. Use `open` and `onOpenChange` to show it, or leave them out and it opens
 * as it mounts. Escape, a swipe, ToastClose and ToastAction close it.
 */
function Toast({
  className,
  variant = "default",
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  onExitComplete,
  onSwipeStart,
  onSwipeMove,
  onSwipeCancel,
  onSwipeEnd,
  duration: durationProp,
  style,
  children,
  ...props
}: ToastProps) {
  // The open state lives here, controlled or not, so the toast can play its exit before Radix unmounts it
  const [own, setOwn] = useState(defaultOpen);
  const open = openProp ?? own;
  const stack = useContext(StackContext);
  const { add, remove, measure, reduce } = stack;
  const id = useId();
  const [box, setBox] = useState<HTMLLIElement | null>(null);
  const [content, setContent] = useState<HTMLDivElement | null>(null);
  // The swipe moves the toast sideways through `x`, separate from its place in the deck (`y`, `scale`)
  const swipeX = useMotionValue(0);
  const [swiped, setSwiped] = useState(false);
  const flight = useRef<AnimationPlaybackControls | null>(null);
  const stay = durationProp ?? stack.duration;
  const remaining = useRef(stay);

  // Open toasts join the stack. One that closes leaves it at once, so the rest move up while it slides out.
  useLayoutEffect(() => {
    if (!open) return;
    add(id);
    setSwiped(false);
    swipeX.jump(0);
    return () => remove(id);
  }, [open, id, add, remove, swipeX]);

  // Its full height, measured from the content: a tucked toast's own box is the front one's height
  useLayoutEffect(() => {
    if (!open || !box || !content) return;
    const update = () => measure(id, content.offsetHeight + box.offsetHeight - box.clientHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(content);
    return () => observer.disconnect();
  }, [open, box, content, id, measure]);

  // Unmounting mid-swipe stops the swipe's spring or flight
  useEffect(() => () => flight.current?.stop(), []);

  const setOpen = (next: boolean) => {
    if (openProp === undefined) setOwn(next);
    onOpenChange?.(next);
  };
  // The timer calls the latest close, without restarting whenever the parent renders
  const close = useRef(() => {});
  useLayoutEffect(() => {
    close.current = () => setOpen(false);
  });

  // The close timer runs here rather than in Radix. Radix keeps its paused flag in a ref that only its own
  // listeners reset, and they detach with the last toast, so closing one with the mouse could leave the
  // next one paused for good. This one waits on the deck's own hover and focus, and on the window.
  // A new duration (toast.promise settling) or reopening starts the time again.
  // biome-ignore lint/correctness/useExhaustiveDependencies: reopening starts the time again too
  useEffect(() => {
    remaining.current = stay;
  }, [stay, open]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new duration starts the timer again
  useEffect(() => {
    if (!open || stack.paused || !Number.isFinite(remaining.current)) return;
    const started = Date.now();
    const timer = setTimeout(() => close.current(), Math.max(0, remaining.current));
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - started;
    };
  }, [open, stack.paused, stay]);

  // Its place: 0 is the newest, in front. Older toasts sit behind it (collapsed) or after it (fanned out).
  const edge = stack.position.startsWith("top") ? "top" : "bottom";
  const toward = edge === "bottom" ? -1 : 1; // older toasts go up from the bottom, down from the top
  const order = stack.ids.indexOf(id);
  const index = order < 0 ? 0 : stack.ids.length - 1 - order;
  const front = stack.ids[stack.ids.length - 1];
  const place = Math.min(index, stack.visibleToasts - 1); // past the limit, it waits behind the last one shown
  const hidden = index >= stack.visibleToasts;
  const tucked = !stack.expanded && index > 0;
  const ahead = order < 0 ? [] : stack.ids.slice(order + 1);
  const before = ahead.reduce((total, other) => total + (stack.heights[other] ?? 0), 0);
  const y = toward * (stack.expanded ? before + index * GAP : place * PEEK);
  const scale = stack.expanded ? 1 : 1 - place * SHRINK;
  const height = tucked && front ? stack.heights[front] : stack.heights[id];
  const leave: Leave = { swiped, toward, reduce };

  return (
    <AnimatePresence custom={leave} onExitComplete={onExitComplete}>
      {open ? (
        <ToastPrimitive.Root
          key="toast"
          asChild
          open
          // The timer above closes it; Radix's never starts
          duration={Number.POSITIVE_INFINITY}
          onOpenChange={(next) => {
            if (!next) setOpen(false);
          }}
          onSwipeStart={(event) => {
            onSwipeStart?.(event);
            flight.current?.stop();
          }}
          onSwipeMove={(event) => {
            onSwipeMove?.(event);
            // It follows the finger exactly: jump() sets the value without counting it as speed
            if (!event.defaultPrevented) swipeX.jump(event.detail.delta.x);
          }}
          onSwipeCancel={(event) => {
            onSwipeCancel?.(event);
            if (!event.defaultPrevented)
              flight.current = animate(swipeX, 0, reduce ? { duration: 0 } : spring.snappy);
          }}
          onSwipeEnd={(event) => {
            onSwipeEnd?.(event);
            if (event.defaultPrevented) return;
            setSwiped(true);
            // Past the threshold it carries on the way it was going, off the side of the screen
            if (!reduce)
              flight.current = animate(swipeX, Math.sign(event.detail.delta.x) * (box?.offsetWidth ?? 0), {
                duration: duration.base,
                ease: ease.out,
              });
          }}
          {...props}
        >
          <motion.li
            ref={setBox}
            data-slot="toast"
            data-variant={variant}
            data-edge={edge}
            data-front={index === 0 || undefined}
            data-tucked={tucked || undefined}
            data-hidden={hidden || undefined}
            inert={hidden || undefined}
            className={cn(
              toastVariants(),
              "group/toast absolute inset-x-0 overflow-hidden",
              "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
              // It sits at the screen's edge of the list, and scales from the side that shows behind the newest
              "data-[edge=bottom]:bottom-0 data-[edge=bottom]:origin-top data-[edge=top]:top-0 data-[edge=top]:origin-bottom",
              "data-hidden:pointer-events-none",
              className,
            )}
            style={{ x: swipeX, zIndex: stack.ids.length - index, ...style }}
            custom={leave}
            variants={leaveVariants}
            initial={reduce ? { opacity: 0 } : { opacity: 0, filter: blur.hidden, y: `${-toward * 100}%` }}
            animate={{
              opacity: hidden ? 0 : 1,
              filter: blur.shown,
              y,
              scale,
              ...(height === undefined ? {} : { height }),
            }}
            exit="exit"
            transition={
              reduce
                ? { duration: 0, opacity: { duration: duration.fast } }
                : {
                    y: spring.snappy,
                    scale: spring.snappy,
                    opacity: settle,
                    filter: settle,
                    height: { duration: duration.slow, ease: ease.out },
                  }
            }
          >
            {/* Tucked behind the newest, a toast's content goes; it comes back through the blur as the deck fans out */}
            <motion.div
              ref={setContent}
              data-slot="toast-content"
              className="flex items-center gap-3 py-3 ps-4 pe-3"
              initial={false}
              animate={tucked ? { opacity: 0, filter: blur.hidden } : { opacity: 1, filter: blur.shown }}
              transition={settle}
            >
              {children}
            </motion.div>
          </motion.li>
        </ToastPrimitive.Root>
      ) : null}
    </AnimatePresence>
  );
}

function ToastTitle({ className, ...props }: ComponentProps<typeof ToastPrimitive.Title>) {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-medium group-data-[variant=destructive]/toast:text-destructive", className)}
      {...props}
    />
  );
}

function ToastDescription({ className, ...props }: ComponentProps<typeof ToastPrimitive.Description>) {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/**
 * A button that acts on the toast ("Undo"), then closes it. `altText` says how to do the same without the
 * toast, for screen readers, which may hear the toast after it's gone.
 */
function ToastAction({ className, ...props }: ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action
      data-slot="toast-action"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }), "bg-transparent", className)}
      {...props}
    />
  );
}

/** Closes the toast. An X named "Close" unless you give it children or another aria-label. */
function ToastClose({
  className,
  children,
  "aria-label": label = "Close",
  ...props
}: ComponentProps<typeof ToastPrimitive.Close>) {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      aria-label={label}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        "size-6 rounded-md text-muted-foreground hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children ?? <XIcon aria-hidden className="size-(--size-icon-sm)" />}
    </ToastPrimitive.Close>
  );
}

/* ------------------------------------------------------------------------------------------------------ */
/* toast(): a tiny store, read by <Toaster /> with useSyncExternalStore                                     */

type Kind = "default" | "success" | "error" | "loading";

export type ToastOptions = {
  /** Updates the toast with this id, if it's showing, instead of adding another */
  id?: string;
  /** A second line under the title */
  description?: ReactNode;
  /** A button on the toast, such as Undo. It closes the toast after onClick, unless onClick prevents it. */
  action?: { label: string; onClick?: (event: MouseEvent<HTMLButtonElement>) => void; altText?: string };
  /** Milliseconds before it closes; Infinity to keep it until it's dismissed */
  duration?: number;
};

type ToastRecord = ToastOptions & {
  id: string;
  kind: Kind;
  title: ReactNode;
  open: boolean;
  /** Counts updates, so changed content swaps in */
  version: number;
};

let records: ToastRecord[] = [];
let count = 0;
const listeners = new Set<() => void>();
const noRecords: ToastRecord[] = [];

function commit(next: ToastRecord[]) {
  records = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getRecords = () => records;
const getNoRecords = () => noRecords;

function show(kind: Kind, title: ReactNode, options: ToastOptions = {}) {
  const id = options.id ?? `toast-${++count}`;
  const current = records.find((record) => record.id === id);
  commit(
    current
      ? records.map((record) =>
          record === current
            ? { ...record, ...options, id, kind, title, open: true, version: record.version + 1 }
            : record,
        )
      : [...records, { ...options, id, kind, title, open: true, version: 0 }],
  );
  return id;
}

/** Closes one toast, or every toast without an id. It leaves the store once its exit has played. */
function dismiss(id?: string) {
  if (!records.some((record) => record.open && (id === undefined || record.id === id))) return;
  commit(
    records.map((record) =>
      record.open && (id === undefined || record.id === id) ? { ...record, open: false } : record,
    ),
  );
}

function drop(id: string) {
  commit(records.filter((record) => record.id !== id));
}

type Message<T> = ReactNode | ((value: T) => ReactNode);

function promise<T>(
  work: Promise<T> | (() => Promise<T>),
  messages: { loading: ReactNode; success: Message<T>; error: Message<unknown> },
  options?: Omit<ToastOptions, "id">,
) {
  const id = show("loading", messages.loading, options);
  const running = typeof work === "function" ? work() : work;
  running.then(
    (value) =>
      show("success", typeof messages.success === "function" ? messages.success(value) : messages.success, {
        ...options,
        id,
      }),
    (error: unknown) =>
      show("error", typeof messages.error === "function" ? messages.error(error) : messages.error, {
        ...options,
        id,
      }),
  );
  return id;
}

/**
 * Shows a toast in the Toaster and returns its id. `toast.success`, `toast.error` and `toast.loading` add an
 * icon (loading stays until it's updated or dismissed); `toast.promise` shows loading, then the result, in
 * the same toast; `toast.dismiss(id?)` closes one toast, or all of them.
 */
const toast = Object.assign((title: ReactNode, options?: ToastOptions) => show("default", title, options), {
  success: (title: ReactNode, options?: ToastOptions) => show("success", title, options),
  error: (title: ReactNode, options?: ToastOptions) => show("error", title, options),
  loading: (title: ReactNode, options?: ToastOptions) => show("loading", title, options),
  promise,
  dismiss,
});

/** The plain text of a toast's content, for the announcement when it changes */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

/** The same check and cross as Loading Button, drawing themselves in (pathLength, a 16px stroke) */
const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const CROSS = "M7 7l10 10M17 7L7 17";

function Mark({ d, reduce }: { d: string; reduce: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-(--size-icon-md)">
      <motion.path
        d={d}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: duration.slow, ease: ease.out, delay: reduce ? 0 : duration.instant }}
      />
    </svg>
  );
}

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

function ToasterToast({ record, onUpdate }: { record: ToastRecord; onUpdate: (text: string) => void }) {
  const reduce = useReducedMotion() ?? false;
  const { kind, version } = record;

  // Radix reads a toast out once, as it opens. An update (toast.promise settling) is read out here instead.
  // biome-ignore lint/correctness/useExhaustiveDependencies: only an update is read out
  useEffect(() => {
    if (version > 0) onUpdate([textOf(record.title), textOf(record.description)].filter(Boolean).join(". "));
  }, [version]);

  const icon =
    kind === "loading" ? (
      <Spinner aria-hidden />
    ) : kind === "success" ? (
      <Mark d={CHECK} reduce={reduce} />
    ) : kind === "error" ? (
      <span className="flex text-destructive">
        <Mark d={CROSS} reduce={reduce} />
      </span>
    ) : null;
  const motionProps = reduce ? fade : swap;

  return (
    <Toast
      open={record.open}
      onOpenChange={(open) => {
        if (!open) dismiss(record.id);
      }}
      onExitComplete={() => drop(record.id)}
      variant={kind === "error" ? "destructive" : "default"}
      duration={kind === "loading" ? Number.POSITIVE_INFINITY : record.duration}
      data-type={kind}
    >
      {/* Updated content swaps in the same cell: the old lifts away blurring as the new rises in */}
      <div className="grid min-w-0 flex-1">
        <AnimatePresence>
          <motion.div
            key={version}
            initial={version === 0 ? false : motionProps.initial}
            animate={motionProps.animate}
            exit={motionProps.exit}
            transition={
              reduce
                ? { duration: duration.fast }
                : { duration: duration.base, ease: ease.out, y: spring.snappy }
            }
            className="col-start-1 row-start-1 flex items-start gap-3"
          >
            {/* The icon sits on the title's first line */}
            {icon ? <span className="flex h-5 shrink-0 items-center">{icon}</span> : null}
            <div className="grid min-w-0 gap-0.5">
              <ToastTitle>{record.title}</ToastTitle>
              {record.description ? <ToastDescription>{record.description}</ToastDescription> : null}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {record.action ? (
        <ToastAction altText={record.action.altText ?? record.action.label} onClick={record.action.onClick}>
          {record.action.label}
        </ToastAction>
      ) : null}
      <ToastClose />
    </Toast>
  );
}

/** Mounted Toasters, in mount order. Only the first shows toasts, so placing two never doubles them. */
const toasters: ((live: boolean) => void)[] = [];

function syncToasters() {
  toasters.forEach((setLive, index) => {
    setLive(index === 0);
  });
}

export type ToasterProps = ToastViewportProps & {
  /** Milliseconds each toast stays open, unless it sets its own duration */
  duration?: number;
};

/**
 * Shows the toasts from `toast()`. Place it once, for example in your root layout; it takes the
 * viewport's props (position, expand, visibleToasts).
 */
function Toaster({ duration: stay, ...props }: ToasterProps) {
  const items = useSyncExternalStore(subscribe, getRecords, getNoRecords);
  const [live, setLive] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    toasters.push(setLive);
    syncToasters();
    return () => {
      toasters.splice(toasters.indexOf(setLive), 1);
      syncToasters();
    };
  }, []);

  // Toasts that closed while no Toaster could play their exit are gone already
  useEffect(() => {
    if (live && records.some((record) => !record.open)) commit(records.filter((record) => record.open));
  }, [live]);

  if (!live) return null;
  return (
    <ToastProvider duration={stay}>
      {items.map((record) => (
        <ToasterToast key={record.id} record={record} onUpdate={setAnnouncement} />
      ))}
      <ToastViewport {...props} />
      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </ToastProvider>
  );
}

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  Toaster,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toast,
  toastVariants,
  toastViewportVariants,
};
