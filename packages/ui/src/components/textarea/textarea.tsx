"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { type AnimationPlaybackControls, animate, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";

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
 * - Drag to resize (owner, 2026-10-22: "like a normal textarea, in our style"): press the bottom-right corner,
 *   where the cursor turns to a resize arrow. Nothing is drawn there (the owner removed a two-stroke grip the
 *   same day), and it's the textarea's own pointer events, so there's still no wrapper. Dragging sets the height, held between minRows and maxRows by the min and max heights;
 *   it follows the pointer exactly, with no glide. The height you drag to becomes the field's floor: it keeps
 *   it as you type, and still grows past it when the text needs more room.
 */

/** The corner you drag by, a square in the bottom-right, in px: the small icon size (--size-icon-sm) */
const GRIP = 14;

/** Whether the pointer is on the corner you drag by. In on-screen pixels, so a zoomed or scaled field still matches. */
function onGrip(node: HTMLTextAreaElement, event: { clientX: number; clientY: number }) {
  const box = node.getBoundingClientRect();
  // Not drawn (display: none, or no layout at all)
  if (box.width === 0) return false;
  const zone = GRIP * (box.height / (node.offsetHeight || box.height || 1));
  return event.clientX >= box.right - zone && event.clientY >= box.bottom - zone;
}

/**
 * The height of a number of lines: the lines (`lh` is the field's own line height), plus the vertical padding
 * (py-2, 1rem in all) and the border (1px each side) from the classes below. CSS, so it holds on first paint.
 */
const linesTall = (lines: number) => `calc(${lines}lh + 1rem + 2px)`;

/**
 * The height that fits the text (`fits`, the min height holding it at minRows), and the max height (NaN when
 * there's none)
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
  return { fits: text + border, max };
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
function Textarea({
  className,
  style,
  minRows = 3,
  maxRows,
  value,
  onChange,
  onPointerDown,
  onPointerMove,
  onPointerLeave,
  ref,
  ...props
}: TextareaProps) {
  const local = useRef<HTMLTextAreaElement | null>(null);
  const running = useRef<AnimationPlaybackControls | null>(null);
  // The height it's at or on its way to, so fitting the same text twice doesn't restart the glide
  const target = useRef<number | null>(null);
  const fitted = useRef(false);
  // The height it was dragged to, the floor it keeps from then on (0: never dragged)
  const dragged = useRef(0);
  const reduce = useReducedMotion() ?? false;

  const resize = useCallback(
    (glide: boolean) => {
      const node = local.current;
      // Not on the page (a closed tab, display: none): the observer below fits it once it shows
      if (!node || node.clientWidth === 0) return;
      const { fits, max } = measure(node);
      // The text's height, or the height it was dragged to if that's more, up to the max
      const wanted = Math.max(fits, dragged.current);
      const height = Number.isNaN(max) ? wanted : Math.min(wanted, max);
      const next = { height, overflows: fits > height };
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

  // Drag the corner: the height follows the pointer exactly, from the height it had when you pressed
  const startDrag = (event: ReactPointerEvent<HTMLTextAreaElement>) => {
    const node = event.currentTarget;
    running.current?.stop();
    // No caret and no text selection from the press
    event.preventDefault();
    const scale = node.offsetHeight / (node.getBoundingClientRect().height || node.offsetHeight || 1);
    const startY = event.clientY;
    const startHeight = node.offsetHeight;
    node.setPointerCapture?.(event.pointerId);
    node.dataset.resizing = "";

    const move = (moved: PointerEvent) => {
      node.style.height = `${startHeight + (moved.clientY - startY) * scale}px`;
      // The min and max heights hold it between minRows and maxRows: what it ends up at is the new floor
      const height = node.offsetHeight;
      dragged.current = height;
      target.current = height;
      node.style.overflowY = measure(node).fits > height ? "auto" : "hidden";
    };
    const end = () => {
      delete node.dataset.resizing;
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerup", end);
      node.removeEventListener("pointercancel", end);
    };
    node.addEventListener("pointermove", move);
    node.addEventListener("pointerup", end);
    node.addEventListener("pointercancel", end);
  };

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
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (event.defaultPrevented || event.button !== 0 || !onGrip(event.currentTarget, event)) return;
        startDrag(event);
      }}
      // The resize cursor over the corner (data-grip), as on a native textarea's corner
      onPointerMove={(event) => {
        onPointerMove?.(event);
        event.currentTarget.toggleAttribute("data-grip", onGrip(event.currentTarget, event));
      }}
      onPointerLeave={(event) => {
        onPointerLeave?.(event);
        event.currentTarget.removeAttribute("data-grip");
      }}
      style={{
        minHeight: linesTall(minRows),
        maxHeight: maxRows === undefined ? undefined : linesTall(Math.max(maxRows, minRows)),
        ...style,
      }}
      className={cn(
        "block w-full min-w-0 resize-none field-sizing-content rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs",
        // The resize cursor over the corner and while dragging
        "data-grip:cursor-ns-resize data-resizing:cursor-ns-resize data-resizing:select-none",
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
