"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

/*
 * Dialog, built on Radix Dialog: focus moves into the window and stays there, Escape and the backdrop close
 * it, focus goes back to the trigger, and the page behind is hidden from screen readers and doesn't scroll.
 * - The root keeps the open state, controlled (`open`) or not (`defaultOpen`), so the window can play its
 *   exit: the portal stays mounted (forceMount) inside AnimatePresence until the exit ends.
 * - Motion (.agents/rules/motion.md): the window comes through the blur, scaling up from 96% on
 *   spring.snappy, and leaves on a timed duration.base + ease.in. The backdrop only fades. With reduced
 *   motion, both only fade.
 * - It grows out of what opened it: the scale's origin is the trigger's centre, so the window seems to come
 *   from that button and shrinks back into it as it closes.
 * - While it leaves, clicks go through to the page, so the page is usable again at once. Focus then goes
 *   back to the trigger, unless the person has already focused something else there.
 * - Alert Dialog shares the window, its motion and the open state from this file (bottom).
 */

/** What every part needs: the open state, and the trigger the window grows from */
export type DialogState = { open: boolean; trigger: RefObject<HTMLElement | null> };

const DialogContext = createContext<DialogState | null>(null);

function useDialog(part: string) {
  const dialog = useContext(DialogContext);
  if (!dialog) throw new Error(`${part} must be used inside Dialog`);
  return dialog;
}

/** The open state, controlled (`open`) or not (`defaultOpen`), and a ref for the trigger */
function useDialogState({
  open,
  defaultOpen,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [own, setOwn] = useState(defaultOpen ?? false);
  const trigger = useRef<HTMLElement | null>(null);
  const current = open ?? own;
  const setOpen = useCallback(
    (next: boolean) => {
      setOwn(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  const state = useMemo<DialogState>(() => ({ open: current, trigger }), [current]);
  return { state, setOpen };
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

/** Leaving is timed rather than a spring, so it's over quickly */
const leave = { duration: duration.base, ease: ease.in };

/** The backdrop only fades: a full-screen blur would cost too much (ADR 0011) */
const dialogOverlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, transition: leave },
};

/** The look shared with Alert Dialog */
const dialogStyles = {
  overlay: "fixed inset-0 z-(--z-overlay) bg-overlay",
  // Centres the window and keeps it 16px inside the screen; clicks pass through it to the backdrop
  positioner: "pointer-events-none fixed inset-0 z-(--z-modal) flex items-center justify-center p-4",
  window: [
    "pointer-events-auto relative grid max-h-full w-full max-w-lg gap-4 overflow-y-auto rounded-lg border border-border bg-background p-6 text-foreground shadow-lg outline-hidden",
    // Leaving, it no longer catches clicks
    "data-[state=closed]:pointer-events-none",
  ],
  header: "grid gap-1.5",
  footer: "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
  title: "text-base font-semibold",
  description: "text-sm text-muted-foreground",
};

/**
 * For Radix's onCloseAutoFocus, which runs once the window is gone: focus goes back to the trigger, unless
 * the person has already moved on. Clicks reach the page while the window leaves, so they may have focused
 * something there; otherwise the focused element went with the window and focus is on the body.
 */
function keepMovedFocus(event: Event) {
  if (document.activeElement !== document.body) event.preventDefault();
}

/**
 * The window's motion, as props for a motion.div (shared with Alert Dialog). It comes through the blur,
 * scaling up from 96% on spring.snappy, and leaves on a timed duration.base + ease.in, growing from the
 * centre of what opened it.
 */
function useDialogWindow(trigger: RefObject<HTMLElement | null>) {
  const reduce = useReducedMotion() ?? false;
  const hidden = { opacity: 0, filter: reduce ? blur.shown : blur.hidden, scale: reduce ? 1 : 0.96 };

  // Measured once, as the window mounts and before Radix moves focus into it. What opened it is the focused
  // element (a key press, or a click in most browsers), else the trigger (Safari doesn't focus buttons on
  // click). Opened from code with nothing focused, it grows from its own centre.
  const ref = useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;
      const focused = document.activeElement;
      const from =
        focused instanceof HTMLElement && focused !== document.body && !node.contains(focused)
          ? focused
          : trigger.current;
      const frame = node.offsetParent?.getBoundingClientRect();
      const box = from?.getBoundingClientRect();
      if (!frame || !box || (box.width === 0 && box.height === 0)) return;
      // The origin is in the window's own box before any transform: its offset in the positioner, not its
      // scaled on-screen rect
      const x = box.left + box.width / 2 - frame.left - node.offsetLeft;
      const y = box.top + box.height / 2 - frame.top - node.offsetTop;
      node.style.transformOrigin = `${x}px ${y}px`;
    },
    [trigger],
  );

  return {
    ref,
    initial: hidden,
    animate: { opacity: 1, filter: blur.shown, scale: 1 },
    exit: { ...hidden, transition: leave },
    // The fade and the blur are eased; the scale springs
    transition: { duration: duration.base, ease: ease.out, scale: spring.snappy },
  };
}

function Dialog({ open, defaultOpen, onOpenChange, ...props }: ComponentProps<typeof DialogPrimitive.Root>) {
  const { state, setOpen } = useDialogState({ open, defaultOpen, onOpenChange });
  return (
    <DialogContext.Provider value={state}>
      <DialogPrimitive.Root data-slot="dialog" open={state.open} onOpenChange={setOpen} {...props} />
    </DialogContext.Provider>
  );
}

function DialogTrigger({ ref, ...props }: ComponentProps<typeof DialogPrimitive.Trigger>) {
  const dialog = useDialog("DialogTrigger");
  const setRef = useMergedRef(dialog.trigger, ref);
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" ref={setRef} {...props} />;
}

/** Stays mounted while the dialog is open and while its exit plays */
function DialogPortal({
  children,
  ...props
}: Omit<ComponentProps<typeof DialogPrimitive.Portal>, "forceMount">) {
  const { open } = useDialog("DialogPortal");
  return (
    // initial={false}: a dialog that starts open is simply there, with no entrance
    <AnimatePresence initial={false}>
      {open ? (
        <DialogPrimitive.Portal data-slot="dialog-portal" {...props} forceMount>
          {children}
        </DialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}

function DialogOverlay({ className, style, ...props }: ComponentProps<typeof DialogPrimitive.Overlay>) {
  const { open } = useDialog("DialogOverlay");
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(dialogStyles.overlay, className)}
      // Radix keeps the backdrop clickable; while it fades out, clicks go through to the page
      style={{ pointerEvents: open ? "auto" : "none", ...style }}
      {...props}
      asChild
      forceMount
    >
      <motion.div {...dialogOverlayMotion} />
    </DialogPrimitive.Overlay>
  );
}

export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  /** Show a close button in the top corner */
  showCloseButton?: boolean;
};

function DialogContent({
  className,
  children,
  showCloseButton = true,
  onCloseAutoFocus,
  ...props
}: DialogContentProps) {
  const dialog = useDialog("DialogContent");
  const windowMotion = useDialogWindow(dialog.trigger);
  return (
    <DialogPortal>
      <DialogOverlay />
      <div data-slot="dialog-positioner" className={dialogStyles.positioner}>
        <DialogPrimitive.Content
          data-slot="dialog-content"
          className={cn(
            dialogStyles.window,
            // The header stops short of the close button, so a long title never runs under it
            showCloseButton && "**:data-[slot=dialog-header]:pe-8",
            className,
          )}
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            keepMovedFocus(event);
          }}
          {...props}
          asChild
          forceMount
        >
          <motion.div {...windowMotion}>
            {children}
            {showCloseButton ? (
              <DialogPrimitive.Close asChild>
                {/* Centred on the title's line, its icon lined up with the window's padding */}
                <Button
                  data-slot="dialog-close"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Close"
                  className="absolute end-4 top-5 text-muted-foreground hover:text-foreground"
                >
                  <XIcon />
                </Button>
              </DialogPrimitive.Close>
            ) : null}
          </motion.div>
        </DialogPrimitive.Content>
      </div>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="dialog-header" className={cn(dialogStyles.header, className)} {...props} />;
}

/** Actions, stacked on phones with the main one on top, in a row at the end from the sm breakpoint */
function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="dialog-footer" className={cn(dialogStyles.footer, className)} {...props} />;
}

function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(dialogStyles.title, className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(dialogStyles.description, className)}
      {...props}
    />
  );
}

function DialogClose(props: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  // Shared with Alert Dialog, so the two look and move the same
  dialogOverlayMotion,
  dialogStyles,
  keepMovedFocus,
  useDialogState,
  useDialogWindow,
  useMergedRef,
};
