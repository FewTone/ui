"use client";

// Client, because toastVariants comes from toast.tsx ("use client"): calling it in a server component throws,
// which broke every page whose related cards include Toast (2026-10-16)
import { toastVariants } from "@fewtone/ui/components/toast/toast";
import { cn } from "@fewtone/ui/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";

/*
 * The index card's preview: a still deck of three toasts, drawn with the toast's own surface. Real toasts
 * appear at the screen's corner and are read out, so the card doesn't show live ones. The page itself opens
 * on buttons that show them.
 */
export default function ToastCard() {
  return (
    <div className="relative w-64 pt-6">
      {/* Older toasts tuck behind the newest: each 12px higher and 5% narrower */}
      <div
        aria-hidden
        className={cn(
          toastVariants(),
          "absolute inset-x-0 top-6 bottom-0 origin-top -translate-y-6 scale-90",
        )}
      />
      <div
        aria-hidden
        className={cn(
          toastVariants(),
          "absolute inset-x-0 top-6 bottom-0 origin-top -translate-y-3 scale-95",
        )}
      />
      <div className={cn(toastVariants(), "relative flex items-center gap-3 py-3 ps-4 pe-3")}>
        <CheckIcon aria-hidden className="size-(--size-icon-md) shrink-0" />
        <span className="flex-1 text-sm font-medium">Changes saved</span>
        <XIcon aria-hidden className="size-(--size-icon-sm) text-muted-foreground" />
      </div>
    </div>
  );
}
