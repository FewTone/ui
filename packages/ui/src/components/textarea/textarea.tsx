"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { type AnimationPlaybackControls, animate, useReducedMotion } from "motion/react";
import { type ComponentProps, useCallback, useEffect, useLayoutEffect, useRef } from "react";

/*
 * A multi-line text field that grows with its content (roadmap: "grows smoothly with its content").
 * - Look: the same as Input (border, rounded-lg, text-sm, and the focus, invalid and disabled states).
 * - Growth (.agents/rules/motion.md, the height pattern): as lines come and go, the height glides to fit on
 *   an eased tween (duration.base, ease.out), never a spring, whose overshoot would bounce the page below.
 *   `minRows` and `maxRows` bound it; past maxRows it scrolls. With reduced motion it resizes at once.
 * - First paint: CSS `field-sizing: content` sizes it to its text before any JavaScript runs, so a value
 *   rendered on the server doesn't jump on hydration. (Browsers without it start at minRows and fit on
 *   hydration.) Once hydrated, JavaScript takes over: it measures scrollHeight and animates the height in
 *   pixels, because CSS can't transition a height that comes from field-sizing.
 * - Layout pixels throughout (scrollHeight, offsetHeight), not on-screen boxes, so a zoomed or scaled
 *   preview doesn't double the glide.
 * - While it grows, the text stays put: the browser scrolls a new line into view inside the shorter box,
 *   so the text would jump up and slide back down as the box opened. The scroll is held at the top instead,
 *   and the box opens onto the new line.
 * - Nothing animates on first paint, on a resize or when webfonts load: those fit at once.
 */

/**
 * The height of a number of lines: the lines (`lh` is the field's own line height), plus the vertical padding
 * (py-2, 1rem in all) and the border (1px each side) from the classes below. CSS, so it holds on first paint.
 */
const linesTall = (lines: number) => `calc(${lines}lh + 1rem + 2px)`;

/**
 * The height that fits the text, held between the min and max heights, and whether the text runs past
 * the max (then it scrolls).
 */
function measure(node: HTMLTextAreaElement) {
  const { height, overflowY } = node.style;
  const { scrollTop } = node;
  // At 0 the min height holds it at minRows, and scrollHeight is the text plus the padding. Hidden overflow,
  // so a scrollbar doesn't narrow the text while it's measured.
  node.style.overflowY = "hidden";
  node.style.height = "0px";
  const text = node.scrollHeight;
  node.style.height = height;
  node.style.overflowY = overflowY;
  node.scrollTop = scrollTop;

  const style = getComputedStyle(node);
  const border =
    (Number.parseFloat(style.borderTopWidth) || 0) + (Number.parseFloat(style.borderBottomWidth) || 0);
  // NaN when there's no max, and nothing is ever more than NaN
  const max = Number.parseFloat(style.maxHeight);
  const fits = text + border;
  return fits > max ? { height: max, overflows: true } : { height: fits, overflows: false };
}

export type TextareaProps = Omit<ComponentProps<"textarea">, "rows"> & {
  /** The lines it shows when it's empty. It never gets shorter. */
  minRows?: number;
  /** The lines it grows to before it scrolls. Unlimited when left out. */
  maxRows?: number;
};

/**
 * A multi-line text field that grows as you type, from `minRows` up to `maxRows`. Pair it with a visible
 * label (`<label htmlFor>`), and set `aria-invalid` when the value is wrong.
 */
function Textarea({ className, style, minRows = 3, maxRows, value, onChange, ref, ...props }: TextareaProps) {
  const local = useRef<HTMLTextAreaElement | null>(null);
  const running = useRef<AnimationPlaybackControls | null>(null);
  // The height it's at or on its way to, so fitting the same text twice doesn't restart the glide
  const target = useRef<number | null>(null);
  const fitted = useRef(false);
  const reduce = useReducedMotion() ?? false;

  const resize = useCallback(
    (glide: boolean) => {
      const node = local.current;
      // Not on the page (a closed tab, display: none): the observer below fits it once it shows
      if (!node || node.clientWidth === 0) return;
      const next = measure(node);
      node.style.overflowY = next.overflows ? "auto" : "hidden";
      if (next.height === target.current) return;
      target.current = next.height;
      running.current?.stop();

      const from = node.offsetHeight;
      if (!glide || reduce || from === next.height) {
        node.style.height = `${next.height}px`;
        return;
      }
      // Growing into room it has: keep the text at the top while the box opens (see the note at the top)
      const hold = next.height > from && !next.overflows;
      if (hold) node.scrollTop = 0;
      running.current = animate(from, next.height, {
        duration: duration.base,
        ease: ease.out,
        onUpdate: (height) => {
          node.style.height = `${height}px`;
          if (hold) node.scrollTop = 0;
        },
      });
    },
    [reduce],
  );

  // On first paint it fits at once. A value or limits set from outside (controlled, a Clear button) glide.
  // biome-ignore lint/correctness/useExhaustiveDependencies: a new value or new limits refit it
  useLayoutEffect(() => {
    resize(fitted.current);
    fitted.current = true;
  }, [value, minRows, maxRows, resize]);

  useEffect(() => {
    const node = local.current;
    if (!node) return;
    // Text wraps differently at a new width, so refit at once; the height changes we make are ignored
    let width = node.clientWidth;
    const observer = new ResizeObserver(() => {
      if (node.clientWidth === width) return;
      width = node.clientWidth;
      resize(false);
    });
    observer.observe(node);
    // A webfont that loads late can change how the text wraps
    let live = true;
    document.fonts?.ready.then(() => {
      if (live) resize(false);
    });
    // A form reset puts the first value back without an input event
    const form = node.form;
    let frame = 0;
    const onReset = () => {
      frame = requestAnimationFrame(() => resize(true));
    };
    form?.addEventListener("reset", onReset);
    return () => {
      live = false;
      observer.disconnect();
      form?.removeEventListener("reset", onReset);
      cancelAnimationFrame(frame);
    };
  }, [resize]);

  // Unmounting mid-glide stops it
  useEffect(() => () => running.current?.stop(), []);

  const setRef = useCallback(
    (node: HTMLTextAreaElement | null) => {
      local.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  return (
    <textarea
      ref={setRef}
      data-slot="textarea"
      // Only for browsers without field-sizing, before hydration; the min height does the same job
      rows={minRows}
      value={value}
      onChange={(event) => {
        onChange?.(event);
        // After React has settled the value: a controlled field may change or refuse what was typed
        queueMicrotask(() => resize(true));
      }}
      style={{
        minHeight: linesTall(minRows),
        maxHeight: maxRows === undefined ? undefined : linesTall(Math.max(maxRows, minRows)),
        ...style,
      }}
      className={cn(
        "block w-full min-w-0 resize-none field-sizing-content rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs",
        "transition duration-(--duration-fast) ease-out",
        "placeholder:text-muted-foreground",
        "outline-ring focus-visible:border-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        "aria-invalid:border-destructive aria-invalid:outline-destructive",
        "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
