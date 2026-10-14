"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { AnimatePresence, animate, motion, stagger, useReducedMotion } from "motion/react";
import { type ReactNode, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AutoHeight } from "@/components/motion/auto-height";

/**
 * A long section shown at a fixed height (--size-collapsed), fading into the page, with a button to show
 * the rest (owner, 2026-10-13; used for Installation). Everything stays in the HTML for search engines,
 * AI tools and screen readers.
 *
 * - Short content gets no fade and no button.
 * - It glides open and shut (AutoHeight), and the fade dissolves in and out. Opening, the items that were
 *   hidden (the list's direct children, such as install steps) fade in and rise 12px, one after another.
 * - Tabbing into a hidden part opens it, so nothing is out of keyboard reach. A click in the visible part
 *   (say, on a copy button) doesn't, since the page knows the last input was a pointer (data-modality).
 * - Open, "View less" floats at the bottom of the screen while you read (sticky, so it's one button), lifted
 *   by a shadow, and lands at the end of the section when you get there (owner, 2026-10-14). Pressing it
 *   folds the section while the page glides back to its heading (if that's scrolled away), so the next
 *   section is right there. Focus returns to "View all steps".
 */
export function Expandable({
  children,
  more,
  less = "Show less",
}: {
  children: ReactNode;
  more: string;
  less?: string;
}) {
  const id = useId();
  const box = useRef<HTMLDivElement>(null);
  const moreButton = useRef<HTMLButtonElement>(null);
  const lessRow = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(true);
  const [floating, setFloating] = useState(false);
  const returnFocus = useRef(false);

  // Does the content run past the collapsed height? Re-check when it changes size (fonts, code blocks).
  useLayoutEffect(() => {
    const node = box.current;
    if (!node || open) return;
    const measure = () => setOverflows(node.scrollHeight > node.clientHeight + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    for (const child of node.children) observer.observe(child);
    return () => observer.disconnect();
  }, [open]);

  const collapsed = !open && overflows;

  // Keyboard focus moving into the hidden part opens it (a listener, not a handler: the box isn't a control)
  useEffect(() => {
    const node = box.current;
    if (!node || open) return;
    const onFocusIn = () => {
      if (document.documentElement.dataset.modality !== "pointer") setOpen(true);
    };
    node.addEventListener("focusin", onFocusIn);
    return () => node.removeEventListener("focusin", onFocusIn);
  }, [open]);

  // "View less" floats while the end of the section is below the screen. A marker just after it tells: once
  // the marker is within the button's bottom offset of the screen's edge, the button has landed.
  useEffect(() => {
    const marker = end.current;
    const row = lessRow.current;
    if (!open || !marker || !row) return;
    const offset = Number.parseFloat(getComputedStyle(row).bottom) || 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setFloating(!entry.isIntersecting && entry.boundingClientRect.top > 0);
      },
      { rootMargin: `0px 0px -${offset}px 0px` },
    );
    observer.observe(marker);
    return () => observer.disconnect();
  }, [open]);

  // After folding, focus goes back to "View all steps" rather than being lost with the button that went
  useEffect(() => {
    if (open || !returnFocus.current) return;
    returnFocus.current = false;
    moreButton.current?.focus({ preventScroll: true });
  }, [open]);

  // Opening: the items below the fold fade and rise in, staggered (only opacity with reduced motion)
  const reduce = useReducedMotion();
  const fold = useRef(0);
  useLayoutEffect(() => {
    const node = box.current;
    if (!open || !node || fold.current === 0) return;
    const list = node.firstElementChild;
    const hidden = list
      ? Array.from(list.children).filter((child) => (child as HTMLElement).offsetTop >= fold.current)
      : [];
    fold.current = 0;
    if (hidden.length === 0) return;
    animate(hidden, reduce ? { opacity: [0, 1] } : { opacity: [0, 1], y: [12, 0] }, {
      duration: duration.slow,
      ease: ease.out,
      delay: stagger(0.05),
    });
  }, [open, reduce]);

  return (
    <div className="relative">
      <AutoHeight transition={{ duration: duration.slower, ease: ease.out }}>
        <div
          id={id}
          ref={box}
          className={cn("scroll-mt-24", !open && "max-h-(--size-collapsed) overflow-hidden")}
        >
          {children}
        </div>
      </AutoHeight>

      <AnimatePresence initial={false}>
        {collapsed ? (
          <motion.div
            key="fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base, ease: ease.out }}
            className="pointer-events-none absolute inset-x-0 bottom-0 flex h-(--size-collapsed-fade) items-end justify-center bg-linear-to-t from-background to-transparent"
          >
            <Button
              ref={moreButton}
              variant="secondary"
              size="sm"
              aria-expanded={false}
              aria-controls={id}
              onClick={() => {
                fold.current = box.current?.clientHeight ?? 0;
                setOpen(true);
              }}
              className="pointer-events-auto"
            >
              {more}
              <ChevronDownIcon aria-hidden className="size-(--size-icon-sm)" />
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {open && overflows ? (
          <motion.div
            key="less"
            ref={lessRow}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16, transition: { duration: duration.fast, ease: ease.in } }}
            transition={reduce ? { duration: 0 } : spring.snappy}
            className="pointer-events-none sticky bottom-(--space-gutter) z-(--z-sticky) mt-(--space-stack) flex justify-center"
          >
            <Button
              variant="outline"
              size="sm"
              aria-expanded
              aria-controls={id}
              onClick={() => {
                // Back to the section's heading if it's scrolled away; the fold happens on the way up
                const anchor = box.current?.closest("section") ?? box.current;
                if (anchor) {
                  const margin = Number.parseFloat(getComputedStyle(anchor).scrollMarginTop) || 0;
                  if (anchor.getBoundingClientRect().top < margin) {
                    anchor.scrollIntoView({ block: "start", behavior: reduce ? "auto" : "smooth" });
                  }
                }
                returnFocus.current = true;
                setFloating(false);
                setOpen(false);
              }}
              className={cn(
                "pointer-events-auto rounded-full transition-shadow duration-(--duration-base) ease-out",
                floating ? "shadow-lg" : "shadow-none",
              )}
            >
              {less}
              <ChevronUpIcon aria-hidden className="size-(--size-icon-sm)" />
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>
      {open && overflows ? <div ref={end} aria-hidden /> : null}
    </div>
  );
}
