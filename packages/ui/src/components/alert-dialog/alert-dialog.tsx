"use client";

import { buttonVariants } from "@fewtone/ui/components/button/button";
import {
  type DialogState,
  dialogOverlayMotion,
  dialogStyles,
  keepMovedFocus,
  useDialogState,
  useDialogWindow,
  useMergedRef,
} from "@fewtone/ui/components/dialog/dialog";
import { cn } from "@fewtone/ui/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { AnimatePresence, motion } from "motion/react";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import { type ComponentProps, createContext, useContext } from "react";

/*
 * Alert Dialog, built on Radix Alert Dialog: a modal that asks people to confirm something, usually an action
 * they can't undo. It's announced as an alert dialog, focus starts on Cancel (the safe choice), Escape
 * cancels, and clicking the backdrop does nothing, so it's never dismissed by accident. Focus goes back to
 * the trigger.
 * - The same window, motion and open state as Dialog, shared from its file: it grows out of its trigger
 *   through the blur on spring.snappy, leaves on a timed duration.base + ease.in, and the backdrop only
 *   fades. Controlled (`open`) or not (`defaultOpen`). While it leaves, clicks go through to the page.
 * - Narrower than Dialog (max-w-md): it holds a question and two answers.
 * - Action and Cancel are buttons (buttonVariants). Use `variant="destructive"` on Action for deleting.
 */

const AlertDialogContext = createContext<DialogState | null>(null);

function useAlertDialog(part: string) {
  const dialog = useContext(AlertDialogContext);
  if (!dialog) throw new Error(`${part} must be used inside AlertDialog`);
  return dialog;
}

function AlertDialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Root>) {
  const { state, setOpen } = useDialogState({ open, defaultOpen, onOpenChange });
  return (
    <AlertDialogContext.Provider value={state}>
      <AlertDialogPrimitive.Root
        data-slot="alert-dialog"
        open={state.open}
        onOpenChange={setOpen}
        {...props}
      />
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({ ref, ...props }: ComponentProps<typeof AlertDialogPrimitive.Trigger>) {
  const dialog = useAlertDialog("AlertDialogTrigger");
  const setRef = useMergedRef(dialog.trigger, ref);
  return <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" ref={setRef} {...props} />;
}

/** Stays mounted while the dialog is open and while its exit plays */
function AlertDialogPortal({
  children,
  ...props
}: Omit<ComponentProps<typeof AlertDialogPrimitive.Portal>, "forceMount">) {
  const { open } = useAlertDialog("AlertDialogPortal");
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} forceMount>
          {children}
        </AlertDialogPrimitive.Portal>
      ) : null}
    </AnimatePresence>
  );
}

function AlertDialogOverlay({
  className,
  style,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Overlay>) {
  const { open } = useAlertDialog("AlertDialogOverlay");
  return (
    <AlertDialogPrimitive.Overlay
      data-slot="alert-dialog-overlay"
      className={cn(dialogStyles.overlay, className)}
      // While it fades out, clicks go through to the page
      style={{ pointerEvents: open ? "auto" : "none", ...style }}
      {...props}
      asChild
      forceMount
    >
      <motion.div {...dialogOverlayMotion} />
    </AlertDialogPrimitive.Overlay>
  );
}

function AlertDialogContent({
  className,
  children,
  onCloseAutoFocus,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Content>) {
  const dialog = useAlertDialog("AlertDialogContent");
  const windowMotion = useDialogWindow(dialog.trigger);
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div data-slot="alert-dialog-positioner" className={dialogStyles.positioner}>
        <AlertDialogPrimitive.Content
          data-slot="alert-dialog-content"
          className={cn(dialogStyles.window, "max-w-md", className)}
          onCloseAutoFocus={(event) => {
            onCloseAutoFocus?.(event);
            keepMovedFocus(event);
          }}
          {...props}
          asChild
          forceMount
        >
          <motion.div {...windowMotion}>{children}</motion.div>
        </AlertDialogPrimitive.Content>
      </div>
    </AlertDialogPortal>
  );
}

function AlertDialogHeader({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-dialog-header" className={cn(dialogStyles.header, className)} {...props} />;
}

/** Cancel, then the action: stacked on phones with the action on top, in a row at the end from sm */
function AlertDialogFooter({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="alert-dialog-footer" className={cn(dialogStyles.footer, className)} {...props} />;
}

function AlertDialogTitle({ className, ...props }: ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(dialogStyles.title, className)}
      {...props}
    />
  );
}

function AlertDialogDescription({
  className,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(dialogStyles.description, className)}
      {...props}
    />
  );
}

type ButtonStyle = VariantProps<typeof buttonVariants>;

/** Confirms and closes. A Button in every way: `variant="destructive"` for deleting */
function AlertDialogAction({
  className,
  variant,
  size,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Action> & ButtonStyle) {
  return (
    <AlertDialogPrimitive.Action
      data-slot="alert-dialog-action"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

/** Closes without doing anything; it has focus when the dialog opens */
function AlertDialogCancel({
  className,
  variant = "outline",
  size,
  ...props
}: ComponentProps<typeof AlertDialogPrimitive.Cancel> & ButtonStyle) {
  return (
    <AlertDialogPrimitive.Cancel
      data-slot="alert-dialog-cancel"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
};
