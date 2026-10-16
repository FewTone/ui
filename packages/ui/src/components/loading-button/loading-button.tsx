"use client";

import { Button, type ButtonProps } from "@fewtone/ui/components/button/button";
import { duration, ease, spring, swap } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react";

/*
 * A Button that shows the work it starts: idle, loading, success, error (owner, 2026-10-14; Lab only
 * until it's approved, so there's no meta file yet).
 *
 * - State: control it with `state`, or leave it out and return a promise from `onClick`. Loading lasts
 *   until the promise settles, then success or error shows, and the button returns to idle after
 *   `resetAfter`.
 * - Motion (.agents/rules/motion.md): the content swaps through a blur with a small rise (owner,
 *   2026-10-14): the old blurs and lifts away as the new rises in from blurred. The spinner turns; the
 *   check and cross draw themselves in. With reduced motion the content only fades and the spinner pulses.
 * - Width never jumps: every state is laid out invisibly in the same cell, so the button is as wide as its
 *   widest state.
 * - Error is solid red (owner, 2026-10-14), just the text on ghost and link. Success stays neutral, with
 *   the check carrying the meaning.
 * - Busy, it stays focusable (aria-disabled, not disabled) and ignores clicks, and a polite live region
 *   says what happened.
 */

export type LoadingButtonState = "idle" | "loading" | "success" | "error";

export type LoadingButtonProps = Omit<ButtonProps, "onClick" | "asChild"> & {
  /** Control the state yourself. Leave it out and a click that returns a promise drives it. */
  state?: LoadingButtonState;
  /** Return a promise to show loading until it settles, then success or error */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => unknown;
  /** Shown while loading, next to the spinner; the label stays if left out */
  loadingText?: ReactNode;
  /** Shown on success, next to the check */
  successText?: ReactNode;
  /** Shown on error, next to the cross */
  errorText?: ReactNode;
  /** After success or error, milliseconds until it's idle again; `false` to stay. Ignored when controlled. */
  resetAfter?: number | false;
};

const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const CROSS = "M7 7l10 10M17 7L7 17";

/** A ring with a turning arc; with reduced motion it pulses instead */
function Spinner({ reduce }: { reduce: boolean }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      animate={reduce ? { opacity: [1, 0.4, 1] } : { rotate: 360 }}
      transition={
        reduce
          ? { duration: duration.slower * 3, repeat: Number.POSITIVE_INFINITY, ease: ease.inOut }
          : // One turn a second, at a constant speed
            { duration: duration.slower * 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
      }
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </motion.svg>
  );
}

/** A stroke that draws itself in (the check or the cross); a 16px icon, so drawing it costs nothing */
function Mark({ d, reduce }: { d: string; reduce: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
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

const isPromise = (value: unknown): value is PromiseLike<unknown> =>
  typeof (value as PromiseLike<unknown> | null)?.then === "function";

/** What a state shows. Sizers get a blank square for the icon, so nothing animates out of sight. */
function contentOf(
  state: LoadingButtonState,
  {
    children,
    loadingText,
    successText,
    errorText,
  }: Pick<LoadingButtonProps, "children" | "loadingText" | "successText" | "errorText">,
  icons: { reduce: boolean } | null,
) {
  const icon = (live: ReactNode) => (icons ? live : <span className="size-(--size-icon-md) shrink-0" />);
  switch (state) {
    case "loading":
      return (
        <>
          {icon(<Spinner reduce={icons?.reduce ?? false} />)}
          {loadingText ?? children}
        </>
      );
    case "success":
      return (
        <>
          {icon(<Mark d={CHECK} reduce={icons?.reduce ?? false} />)}
          {successText ?? children}
        </>
      );
    case "error":
      return (
        <>
          {icon(<Mark d={CROSS} reduce={icons?.reduce ?? false} />)}
          {errorText ?? children}
        </>
      );
    default:
      return children;
  }
}

const STATES: LoadingButtonState[] = ["idle", "loading", "success", "error"];
const ANNOUNCEMENTS: Record<LoadingButtonState, string> = {
  idle: "",
  loading: "Loading",
  success: "Done",
  error: "Something went wrong",
};

function LoadingButton({
  state,
  onClick,
  children,
  loadingText,
  successText,
  errorText,
  resetAfter = 2000,
  variant,
  className,
  ...props
}: LoadingButtonProps) {
  const [internal, setInternal] = useState<LoadingButtonState>("idle");
  const current = state ?? internal;
  const reduce = useReducedMotion() ?? false;
  const mounted = useRef(true);
  const texts = { children, loadingText, successText, errorText };

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Uncontrolled, success and error give way to idle after a moment
  useEffect(() => {
    if (state !== undefined || resetAfter === false) return;
    if (internal !== "success" && internal !== "error") return;
    const timer = setTimeout(() => setInternal("idle"), resetAfter);
    return () => clearTimeout(timer);
  }, [internal, state, resetAfter]);

  const busy = current === "loading";
  // Error is solid red (owner, 2026-10-14). Ghost and link keep their surface, so they turn only their text red.
  const errorClass =
    variant === "ghost" || variant === "link"
      ? "text-destructive"
      : "border-transparent bg-destructive text-destructive-foreground";
  // With reduced motion: a plain fade, no blur or movement
  const motionProps = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : swap;

  return (
    <>
      <Button
        data-slot="loading-button"
        data-state={current}
        variant={variant}
        aria-busy={busy || undefined}
        aria-disabled={busy || undefined}
        className={cn(current === "error" && errorClass, busy && "cursor-progress", className)}
        onClick={(event) => {
          if (busy) {
            event.preventDefault();
            return;
          }
          const result = onClick?.(event);
          if (state !== undefined || !isPromise(result)) return;
          setInternal("loading");
          result.then(
            () => mounted.current && setInternal("success"),
            () => mounted.current && setInternal("error"),
          );
        }}
        {...props}
      >
        <span className="grid">
          {/* Every state, invisible, in one cell: the button is as wide as the widest */}
          {STATES.map((name) => (
            <span
              key={name}
              aria-hidden
              className="invisible col-start-1 row-start-1 flex items-center justify-center gap-2"
            >
              {contentOf(name, texts, null)}
            </span>
          ))}
          <AnimatePresence initial={false}>
            <motion.span
              key={current}
              {...motionProps}
              transition={
                reduce
                  ? { duration: duration.fast }
                  : { duration: duration.base, ease: ease.out, y: spring.snappy }
              }
              className="col-start-1 row-start-1 flex items-center justify-center gap-2"
            >
              {contentOf(current, texts, { reduce })}
            </motion.span>
          </AnimatePresence>
        </span>
      </Button>
      <span aria-live="polite" className="sr-only">
        {ANNOUNCEMENTS[current]}
      </span>
    </>
  );
}

export { LoadingButton };
