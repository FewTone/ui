"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  useMergedRef,
} from "@fewtone/ui/components/dialog/dialog";
import { duration } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { XIcon } from "lucide-react";
import { useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type CSSProperties,
  createContext,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { Drawer as Vaul } from "vaul";

/*
 * Drawer: on phones, an iOS bottom sheet (owner's brief, 2026-10-26); on larger screens, our centred Dialog.
 * The sheet is Vaul (a drawer on Radix Dialog): drag it down to close, and the page behind steps back.
 * - Which one is chosen as it opens and kept while it's open, so it never swaps mid-use (a keyboard or a turn of
 *   the phone can change the screen's size). `mode` can force either.
 * - The sheet never scrolls itself. Vaul hangs an invisible filler under it, so a scrolling sheet scrolls into
 *   blank space: the sheet is a fixed shell, and its children scroll in a body inside it, one column that can't
 *   grow wider than the screen. A footer sticks to the bottom, above the home indicator.
 * - The keyboard is ours, not Vaul's: the visual viewport says how much of the screen it covers. The sheet sits
 *   on top of it and fits what's left; the focused field scrolls into view above the footer. While it's up, only
 *   the grabber drags the sheet, so scrolling while typing never closes it, and a pull down at the top of the
 *   content hides the keyboard first, as iOS does.
 * - Fields are 16px on phones inside it, so iOS doesn't zoom in when one is focused.
 * - A drawer opened from a sheet is a sheet on a sheet: the one behind steps back, also when code opens it
 *   (Vaul only does that for a press on its trigger).
 * - Opening doesn't focus the first field (that would raise the keyboard): focus goes to the sheet itself.
 * - Motion: Vaul's own (its iOS curve and drag). Reduced motion: the sheet only fades and the page doesn't step
 *   back. Clean up: a quick open and close can leave the page untouchable, black or scaled, so it's put back
 *   once no dialog is open.
 */

/** Phones: below Tailwind's md breakpoint */
const PHONE = "(max-width: 767px)";

/** Vaul's own timing and step back (vaul/src/constants.ts), so a sheet pushed back by code moves like one
 * pushed back by Vaul */
const VAUL_TRANSITION = "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)";
const VAUL_NESTED_STEP = 16;

/** How far a pull down at the top of the content goes before it hides the keyboard: a deliberate fingertip */
const PULL_TO_HIDE_KEYBOARD = 48;

type Shown = "sheet" | "dialog";

/** How much of the screen the keyboard covers: its top edge from the bottom, and the height left above it */
type Keyboard = { bottom: number; height: number };

type DrawerState = {
  shown: Shown;
  open: boolean;
  keyboard: Keyboard | null;
  /** The sheet's own node, so a sheet opened from it can push it back */
  node: RefObject<HTMLDivElement | null>;
};

const DrawerContext = createContext<DrawerState | null>(null);

function useDrawer(part: string) {
  const drawer = useContext(DrawerContext);
  if (!drawer) throw new Error(`${part} must be used inside Drawer`);
  return drawer;
}

function subscribePhone(onChange: () => void) {
  const query = window.matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Whether the screen is phone-sized; false on the server, so the first paint matches it */
function usePhone() {
  return useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );
}

const isField = (node: unknown): node is HTMLElement =>
  node instanceof HTMLElement &&
  (node.isContentEditable ||
    node.matches("input:not([type=checkbox]):not([type=radio]):not([type=range]), textarea, select"));

/** The keyboard, read from the visual viewport while a field has focus; null while it's down */
function useKeyboard(active: boolean) {
  const [keyboard, setKeyboard] = useState<Keyboard | null>(null);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!active || !viewport) {
      setKeyboard(null);
      return;
    }
    const update = () => {
      const bottom = Math.max(0, Math.round(window.innerHeight - viewport.height - viewport.offsetTop));
      const height = Math.round(viewport.height);
      const up = isField(document.activeElement) && bottom > 0;
      setKeyboard((was) =>
        !up ? null : was?.bottom === bottom && was.height === height ? was : { bottom, height },
      );
    };
    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, [active]);

  return keyboard;
}

/**
 * A quick open and close can leave Vaul's page styles behind: clicks blocked, a black background, the page
 * scaled or fixed in place. Once no dialog is open, put them back (and the scroll position with them).
 */
function unstick() {
  if (document.querySelector('[role="dialog"][data-state="open"]')) return;
  const { body } = document;
  body.style.removeProperty("pointer-events");
  body.style.removeProperty("background");
  if (body.style.position === "fixed") {
    const x = -Number.parseFloat(body.style.left || "0");
    const y = -Number.parseFloat(body.style.top || "0");
    for (const property of ["position", "top", "left", "right", "height"])
      body.style.removeProperty(property);
    window.scrollTo(x, y);
  }
  const wrapper = document.querySelector<HTMLElement>("[data-vaul-drawer-wrapper]");
  wrapper?.style.removeProperty("transform");
  wrapper?.style.removeProperty("border-radius");
}

export type DrawerProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** A sheet on phones and a dialog on larger screens (auto), or always one of them */
  mode?: "auto" | "sheet" | "dialog";
  children?: ReactNode;
};

function Drawer({ open, defaultOpen, onOpenChange, mode = "auto", children }: DrawerProps) {
  const parent = useContext(DrawerContext);
  const reduce = useReducedMotion() ?? false;
  const phone = usePhone();
  const node = useRef<HTMLDivElement | null>(null);

  const [own, setOwn] = useState(defaultOpen ?? false);
  const current = open ?? own;
  const setOpen = useCallback(
    (next: boolean) => {
      setOwn(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  // Chosen while closed and kept while open, so it never swaps mid-use
  const wanted: Shown = mode === "auto" ? (phone ? "sheet" : "dialog") : mode;
  const [shown, setShown] = useState<Shown>(wanted);
  if (!current && shown !== wanted) setShown(wanted);

  const sheet = shown === "sheet";
  const nested = sheet && parent?.shown === "sheet";
  const keyboard = useKeyboard(sheet && current);

  // A sheet on a sheet: the one behind steps back while this one is open
  useEffect(() => {
    const behind = parent?.node.current;
    if (!nested || !current || !behind) return;
    const width = behind.offsetWidth;
    behind.style.transition = VAUL_TRANSITION;
    behind.style.transform = `scale(${(width - VAUL_NESTED_STEP) / width}) translate3d(0, -${VAUL_NESTED_STEP}px, 0)`;
    return () => {
      behind.style.transform = "translate3d(0, 0, 0)";
    };
  }, [nested, current, parent]);

  // Leaving the page with a sheet open (or mid-exit) must not leave its styles behind
  useEffect(
    () => () => {
      requestAnimationFrame(unstick);
    },
    [],
  );

  const state = useMemo<DrawerState>(
    () => ({ shown, open: current, keyboard, node }),
    [shown, current, keyboard],
  );

  if (!sheet) {
    return (
      <DrawerContext.Provider value={state}>
        <Dialog open={current} onOpenChange={setOpen}>
          {children}
        </Dialog>
      </DrawerContext.Provider>
    );
  }

  const Root = nested ? Vaul.NestedRoot : Vaul.Root;
  return (
    <DrawerContext.Provider value={state}>
      <Root
        open={current}
        onOpenChange={setOpen}
        // The page steps back (it needs a wrapper with data-vaul-drawer-wrapper); a nested sheet pushes the
        // sheet behind instead
        shouldScaleBackground={!nested && !reduce}
        setBackgroundColorOnScale
        repositionInputs={false}
        handleOnly={keyboard !== null}
        onAnimationEnd={(isOpen) => {
          if (!isOpen) unstick();
        }}
      >
        {children}
      </Root>
    </DrawerContext.Provider>
  );
}

function DrawerTrigger(props: ComponentProps<typeof Vaul.Trigger>) {
  const { shown } = useDrawer("DrawerTrigger");
  if (shown === "dialog") return <DialogTrigger {...props} />;
  return <Vaul.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerClose(props: ComponentProps<typeof Vaul.Close>) {
  const { shown } = useDrawer("DrawerClose");
  if (shown === "dialog") return <DialogClose {...props} />;
  return <Vaul.Close data-slot="drawer-close" {...props} />;
}

export type DrawerContentProps = ComponentProps<typeof Vaul.Content> & {
  /** Show a close button in the top corner */
  showCloseButton?: boolean;
};

function DrawerContent({ showCloseButton = true, ...props }: DrawerContentProps) {
  const { shown } = useDrawer("DrawerContent");
  // The dialog's parts keep Dialog's own slots, which its styles rely on
  if (shown === "dialog") return <DialogContent showCloseButton={showCloseButton} {...props} />;
  return <SheetContent showCloseButton={showCloseButton} {...props} />;
}

function SheetContent({
  className,
  children,
  style,
  ref,
  showCloseButton,
  onOpenAutoFocus,
  ...props
}: DrawerContentProps) {
  const { open, keyboard, node } = useDrawer("DrawerContent");
  const reduce = useReducedMotion() ?? false;
  const setRef = useMergedRef(node, ref);
  const body = useRef<HTMLDivElement | null>(null);
  const touch = useRef<{ y: number; top: boolean } | null>(null);

  // As the keyboard comes up (or changes size), the focused field scrolls into view above the footer
  const bottom = keyboard?.bottom;
  const height = keyboard?.height;
  useEffect(() => {
    const scroller = body.current;
    if (bottom === undefined || height === undefined || !scroller) return;
    const footer = scroller.querySelector<HTMLElement>("[data-slot=drawer-footer]");
    scroller.style.scrollPaddingBottom = footer ? `${footer.offsetHeight}px` : "";
    const frame = requestAnimationFrame(() => {
      const field = document.activeElement;
      if (field instanceof HTMLElement && scroller.contains(field)) {
        field.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [bottom, height, reduce]);

  // On the keyboard: lifted by its height and no taller than the screen left above it
  const lift: CSSProperties | undefined = keyboard
    ? { bottom: keyboard.bottom, maxHeight: `calc(${keyboard.height}px - var(--size-sheet-top-gap))` }
    : undefined;
  // Reduced motion: Vaul's slide becomes its fade (its own keyframes)
  const calm: CSSProperties | undefined = reduce
    ? { animationName: open ? "fadeIn" : "fadeOut", animationDuration: `${duration.base}s` }
    : undefined;

  return (
    <Vaul.Portal>
      <Vaul.Overlay data-slot="drawer-overlay" className="fixed inset-0 z-(--z-overlay) bg-overlay" />
      <Vaul.Content
        data-slot="drawer-content"
        ref={setRef}
        className={cn(
          // A fixed shell that never scrolls; on a large screen (mode="sheet") it keeps a phone's width
          "fixed inset-x-0 bottom-0 z-(--z-modal) mx-auto flex max-h-(--size-sheet-max) w-full max-w-lg flex-col rounded-t-2xl bg-background text-foreground shadow-lg outline-hidden",
          // Fields at 16px on phones, so iOS doesn't zoom in on focus
          "max-md:[&_:is(input,select,textarea)]:text-base",
          // The header stops short of the close button, so a long title never runs under it
          showCloseButton && "**:data-[slot=drawer-header]:pe-10",
          className,
        )}
        style={{ ...lift, ...calm, ...style }}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (event.defaultPrevented) return;
          // Into the sheet, but not into its first field: that would raise the keyboard
          event.preventDefault();
          node.current?.focus({ preventScroll: true });
        }}
        {...props}
      >
        {/* The grabber: Vaul's handle, which stays draggable while the keyboard is up. Its own styles are
            unlayered, so ours need !important. */}
        <Vaul.Handle
          data-slot="drawer-handle"
          className="absolute! inset-x-0! top-2! mx-auto! h-1.25! w-9! rounded-full! bg-foreground/20! opacity-100!"
        />
        <div
          ref={body}
          data-slot="drawer-body"
          className={cn(
            // One column that can't grow wider than the screen; the room under the last row clears the home
            // indicator, unless a footer already does
            "grid min-h-0 flex-1 auto-rows-max grid-cols-1 gap-4 overflow-x-hidden overflow-y-auto overscroll-contain px-6 pt-6 pb-(--size-sheet-inset-bottom)",
            "has-data-[slot=drawer-footer]:pb-0",
          )}
          onTouchStart={(event) => {
            touch.current = { y: event.touches[0]?.clientY ?? 0, top: event.currentTarget.scrollTop <= 0 };
          }}
          onTouchMove={(event) => {
            // With the keyboard up, a pull down at the top hides it first, as iOS does
            const start = touch.current;
            if (!keyboard || !start?.top) return;
            if ((event.touches[0]?.clientY ?? 0) - start.y > PULL_TO_HIDE_KEYBOARD) {
              if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
              touch.current = null;
            }
          }}
        >
          {children}
        </div>
        {showCloseButton ? (
          <Vaul.Close asChild>
            {/* iOS's close: an ✕ in a grey circle, centred on the title's line */}
            <Button
              data-slot="drawer-close"
              variant="secondary"
              size="icon-sm"
              aria-label="Close"
              className="absolute end-4 top-5 rounded-full text-muted-foreground hover:text-foreground"
            >
              <XIcon />
            </Button>
          </Vaul.Close>
        ) : null}
      </Vaul.Content>
    </Vaul.Portal>
  );
}

function DrawerHeader({ className, ...props }: ComponentProps<"div">) {
  const { shown } = useDrawer("DrawerHeader");
  if (shown === "dialog") return <DialogHeader className={className} {...props} />;
  return <div data-slot="drawer-header" className={cn("grid gap-1.5", className)} {...props} />;
}

/**
 * Actions. In the sheet they're pinned to its bottom, full width with the main one on top, above the home
 * indicator; in the dialog, a row at the end. Put the main action last, as in Dialog.
 */
function DrawerFooter({ className, ...props }: ComponentProps<"div">) {
  const { shown } = useDrawer("DrawerFooter");
  if (shown === "dialog") return <DialogFooter className={className} {...props} />;
  return (
    <div
      data-slot="drawer-footer"
      className={cn(
        "sticky bottom-0 -mx-6 flex flex-col-reverse gap-2 bg-background px-6 pt-3 pb-(--size-sheet-inset-bottom)",
        className,
      )}
      {...props}
    />
  );
}

function DrawerTitle({ className, ...props }: ComponentProps<typeof Vaul.Title>) {
  const { shown } = useDrawer("DrawerTitle");
  if (shown === "dialog") return <DialogTitle className={className} {...props} />;
  return (
    <Vaul.Title data-slot="drawer-title" className={cn("text-base font-semibold", className)} {...props} />
  );
}

function DrawerDescription({ className, ...props }: ComponentProps<typeof Vaul.Description>) {
  const { shown } = useDrawer("DrawerDescription");
  if (shown === "dialog") {
    return <DialogDescription className={className} {...props} />;
  }
  return (
    <Vaul.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
};
