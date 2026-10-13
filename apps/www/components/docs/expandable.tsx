"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { duration, ease } from "@fewtone/ui/lib/motion";
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
 * - "Show less" first returns to the section's top, then folds it, so you watch it close.
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
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(true);

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

      {open && overflows ? (
        <div className="mt-(--space-stack) flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            aria-expanded
            aria-controls={id}
            onClick={() => {
              box.current?.scrollIntoView({ block: "start" });
              setOpen(false);
            }}
          >
            {less}
            <ChevronUpIcon aria-hidden className="size-(--size-icon-sm)" />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
