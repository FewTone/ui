"use client";

import { Button, type ButtonProps } from "@fewtone/ui/components/button/button";
import { duration, ease, spring, swap } from "@fewtone/ui/lib/motion";
import { CopyIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react";

/*
 * A Button that copies text to the clipboard (owner, 2026-10-14).
 * - Motion (.agents/rules/motion.md): the same swap as Loading Button, a blur with a 6px rise. The copy
 *   icon lifts away as a check rises in and draws itself. With reduced motion it only fades.
 * - Width never jumps: both states are laid out invisibly in one cell, so a label can change
 *   ("Copy link" → "Copied") without the button resizing.
 * - Icon only by default (ghost, icon size), named "Copy"; pass children for a label, and `icon={false}`
 *   for text only (the label still swaps through the blur).
 * - A polite live region says "Copied". Back to the copy icon after `resetAfter`.
 * - Uses the Clipboard API, falling back to a hidden textarea where it's unavailable (older browsers,
 *   pages not served over https).
 */

export type CopyButtonProps = Omit<ButtonProps, "value" | "asChild"> & {
  /** The text to copy */
  value: string;
  /** Shown instead of the label once copied, for example "Copied" */
  copiedText?: ReactNode;
  /** Called with the text after it's copied */
  onCopy?: (value: string) => void;
  /** Milliseconds the check shows before the copy icon returns */
  resetAfter?: number;
  /** Show the copy icon and the check. Set false for a text-only button; it then needs a label. */
  icon?: boolean;
};

const CHECK = "M5 12.5l4.5 4.5L19 7.5";

/** The check draws itself in; a 16px icon stroke, so drawing it costs nothing */
function Check({ reduce }: { reduce: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <motion.path
        d={CHECK}
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

/** The Clipboard API, or a hidden textarea where it's unavailable */
async function writeText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const copied = document.execCommand("copy");
  area.remove();
  if (!copied) throw new Error("Copy failed");
}

function CopyButton({
  value,
  copiedText,
  onCopy,
  resetAfter = 2000,
  icon = true,
  onClick,
  children,
  variant = "ghost",
  size,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  // Counts copies, so copying again while the check shows starts its time over
  const [copies, setCopies] = useState(0);
  const reduce = useReducedMotion() ?? false;
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // The check gives way to the copy icon after a moment, counted from the latest copy
  // biome-ignore lint/correctness/useExhaustiveDependencies: each copy restarts the timer
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), resetAfter);
    return () => clearTimeout(timer);
  }, [copied, copies, resetAfter]);

  const content = (state: "idle" | "copied", live: boolean) => {
    const glyph = !icon ? null : live ? (
      state === "copied" ? (
        <Check reduce={reduce} />
      ) : (
        <CopyIcon aria-hidden />
      )
    ) : (
      <span className="size-(--size-icon-md) shrink-0" />
    );
    const label = state === "copied" ? (copiedText ?? children) : children;
    return (
      <>
        {glyph}
        {label}
      </>
    );
  };

  return (
    <>
      <Button
        data-slot="copy-button"
        data-state={copied ? "copied" : "idle"}
        variant={variant}
        size={size ?? (children ? "md" : "icon")}
        aria-label={children ? undefined : "Copy"}
        onClick={async (event: MouseEvent<HTMLButtonElement>) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          try {
            await writeText(value);
            if (!mounted.current) return;
            setCopied(true);
            setCopies((count) => count + 1);
            onCopy?.(value);
          } catch {
            // The clipboard can be blocked; the text is still on the page to select
          }
        }}
        {...props}
      >
        <span className="grid">
          {/* Both states, invisible, in one cell: the button is as wide as the wider */}
          {(["idle", "copied"] as const).map((state) => (
            <span
              key={state}
              aria-hidden
              className="invisible col-start-1 row-start-1 flex items-center justify-center gap-2"
            >
              {content(state, false)}
            </span>
          ))}
          <AnimatePresence initial={false}>
            <motion.span
              key={copied ? "copied" : "idle"}
              {...(reduce
                ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
                : swap)}
              transition={
                reduce
                  ? { duration: duration.fast }
                  : { duration: duration.base, ease: ease.out, y: spring.snappy }
              }
              className="col-start-1 row-start-1 flex items-center justify-center gap-2"
            >
              {content(copied ? "copied" : "idle", true)}
            </motion.span>
          </AnimatePresence>
        </span>
      </Button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
    </>
  );
}

export { CopyButton };
