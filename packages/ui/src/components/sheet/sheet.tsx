"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva } from "class-variance-authority";
import { XIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { type ComponentProps, createContext, useCallback, useContext, useState } from "react";

/*
 * Sheet: a panel that slides in from an edge of the screen, for forms, filters, navigation or details beside
 * the page. Built on Radix Dialog, so it's a modal: focus moves in and stays there, Escape and the backdrop
 * close it, and focus goes back to the trigger.
 * - The root keeps the open state, controlled (`open`) or not (`defaultOpen`), so the panel can slide out:
 *   the portal stays mounted (forceMount) inside AnimatePresence until the exit ends.
 * - Motion (.agents/rules/motion.md): a drawer slides. The panel comes in from its edge on spring.snappy and
 *   leaves on a timed duration.base + ease.in. No blur: it's a surface moving, not content appearing. The
 *   backdrop only fades. With reduced motion, both only fade.
 * - An 8px band in the panel's own colour lies just past the screen edge, so the spring's slight overshoot
 *   never opens a gap between the panel and the edge.
 * - While it leaves, clicks go through to the page, so the page is usable again at once. Focus then goes
 *   back to the trigger, unless the person has already focused something else there.
 */

type Side = "top" | "right" | "bottom" | "left";

const SheetContext = createContext<boolean | null>(null);

function useSheetOpen(part: string) {
  const open = useContext(SheetContext);
  if (open === null) throw new Error(`${part} must be used inside Sheet`);
  return open;
}

/** Leaving is timed rather than a spring, so it's over quickly */
const leave = { duration: duration.base, ease: ease.in };

/** Where the panel waits off-screen, beyond its edge */
const offscreen = {
  top: { y: "-100%" },
  right: { x: "100%" },
  bottom: { y: "100%" },
  left: { x: "-100%" },
} as const satisfies Record<Side, object>;

const sheetVariants = cva(
  [
    "fixed z-(--z-modal) flex flex-col gap-4 overflow-y-auto bg-background p-6 text-foreground shadow-lg outline-hidden",
    // Leaving, it no longer catches clicks
    "data-[state=closed]:pointer-events-none",
  ],
  {
    variants: {
      // Each side sits 8px past its edge with an 8px border in the panel's colour there (the overshoot band),
      // and a hairline on the side facing the page
      side: {
        top: "inset-x-0 -top-2 max-h-full border-t-8 border-b border-t-background border-b-border",
        right:
          "inset-y-0 -right-2 h-full w-3/4 border-r-8 border-l border-r-background border-l-border sm:max-w-sm",
        bottom: "inset-x-0 -bottom-2 max-h-full border-t border-b-8 border-t-border border-b-background",
        left: "inset-y-0 -left-2 h-full w-3/4 border-r border-l-8 border-r-border border-l-background sm:max-w-sm",
      },
    },
    defaultVariants: { side: "right" },
  },
);

function Sheet({ open, defaultOpen, onOpenChange, ...props }: ComponentProps<typeof SheetPrimitive.Root>) {
  const [own, setOwn] = useState(defaultOpen ?? false);
  const current = open ?? own;
  const setOpen = useCallback(
    (next: boolean) => {
      setOwn(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  return (
    <SheetContext.Provider value={current}>
      <SheetPrimitive.Root data-slot="sheet" open={current} onOpenChange={setOpen} {...props} />
    </SheetContext.Provider>
  );
}

function SheetTrigger(props: ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

/** Stays mounted while the sheet is open and while its exit plays */
function SheetPortal({
  children,
  ...props
}: Omit<ComponentProps<typeof SheetPrimitive.Portal>, "forceMount">) {
  const open = useSheetOpen("SheetPortal");
  return (
    // initial={false}: a sheet that starts open is simply there, with no entrance
    <AnimatePresence initial={false}>
      {open ? (
        <SheetPrimitive.Portal data-slot="sheet-portal" {...props} forceMount>
          {children}
        </SheetPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}

function SheetOverlay({ className, style, ...props }: ComponentProps<typeof SheetPrimitive.Overlay>) {
  const open = useSheetOpen("SheetOverlay");
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn("fixed inset-0 z-(--z-overlay) bg-overlay", className)}
      // Radix keeps the backdrop clickable; while it fades out, clicks go through to the page
      style={{ pointerEvents: open ? "auto" : "none", ...style }}
      {...props}
      asChild
      forceMount
    >
      {/* The backdrop only fades: a full-screen blur would cost too much (ADR 0011) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
        exit={{ opacity: 0, transition: leave }}
      />
    </SheetPrimitive.Overlay>
  );
}

export type SheetContentProps = ComponentProps<typeof SheetPrimitive.Content> & {
  /** The edge it slides in from */
  side?: Side;
  /** Show a close button in the top corner */
  showCloseButton?: boolean;
};

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  onCloseAutoFocus,
  ...props
}: SheetContentProps) {
  const reduce = useReducedMotion() ?? false;
  const hidden = reduce ? { opacity: 0 } : offscreen[side];
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          sheetVariants({ side }),
          // The header stops short of the close button, so a long title never runs under it
          showCloseButton && "**:data-[slot=sheet-header]:pe-8",
          className,
        )}
        onCloseAutoFocus={(event) => {
          onCloseAutoFocus?.(event);
          // Once the panel is gone, focus goes back to the trigger, unless the person has already focused
          // something on the page (clicks reach it while the panel leaves)
          if (document.activeElement !== document.body) event.preventDefault();
        }}
        {...props}
        asChild
        forceMount
      >
        <motion.div
          initial={hidden}
          animate={
            reduce
              ? { opacity: 1, transition: { duration: duration.base, ease: ease.out } }
              : { x: 0, y: 0, transition: spring.snappy }
          }
          exit={{ ...hidden, transition: leave }}
        >
          {children}
          {showCloseButton ? (
            <SheetPrimitive.Close asChild>
              {/* Centred on the title's line, its icon lined up with the panel's padding */}
              <Button
                data-slot="sheet-close"
                variant="ghost"
                size="icon-sm"
                aria-label="Close"
                className="absolute end-4 top-5 text-muted-foreground hover:text-foreground"
              >
                <XIcon />
              </Button>
            </SheetPrimitive.Close>
          ) : null}
        </motion.div>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="sheet-header" className={cn("grid gap-1.5", className)} {...props} />;
}

/** Actions at the panel's foot: stacked on phones with the main one on top, in a row at the end from sm */
function SheetFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

function SheetTitle({ className, ...props }: ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-base font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({ className, ...props }: ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  sheetVariants,
};
