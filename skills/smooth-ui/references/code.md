# Code for the core patterns

React + TypeScript + `motion/react` + Tailwind CSS. Every snippet imports the presets from `tokens.md` as `@/lib/motion` (`duration`, `ease`, `spring`, `blur`, `swap`). Adapt names and classes to the project. The comments explain the details that matter, so they carry to other stacks.

## Contents
1. Height that glides
2. Swap in place
3. Sliding pill (layoutId)
4. Indicator placed by offsets (when the set can move)
5. Gliding row highlight
6. Dialog that grows out of its trigger
7. Button tint (CSS only)
8. A check that draws itself
9. Continuous progress
10. Reordering rows (FLIP)
11. A loop that eases to a stop
12. Reduced motion helpers

---

## 1. Height that glides

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";
import { duration, ease } from "@/lib/motion";

/** Wrap anything whose height changes (a tab panel, a message, a list). The wrapper glides; the content doesn't move. */
export function AutoHeight({ children, className }: { children: ReactNode; className?: string }) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | "auto">("auto");
  const [moving, setMoving] = useState(false);
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    // Fires after layout, before paint: the new size is never shown before the glide starts
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <motion.div
      // Clip only while moving, so focus rings and shadows aren't cut at rest
      className={[moving && "overflow-hidden", className].filter(Boolean).join(" ")}
      initial={false}
      animate={{ height }}
      // A tween, never a bouncy spring: overshoot would bounce everything below
      transition={reduce ? { duration: 0 } : { duration: duration.slow, ease: ease.out }}
      onAnimationStart={() => setMoving(true)}
      onAnimationComplete={() => setMoving(false)}
    >
      <div ref={inner}>{children}</div>
    </motion.div>
  );
}
```

## 2. Swap in place

```tsx
"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { duration, ease, swap } from "@/lib/motion";

/**
 * Swaps its content when `id` changes: the old lifts away blurring as the new rises in.
 * Both sit in one grid cell, so the box never jumps. Hold the width yourself if the states differ
 * (lay every state out invisibly in the same cell).
 */
export function Swap({ id, children }: { id: string | number; children: ReactNode }) {
  const reduce = useReducedMotion();
  const states = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : // Once in, drop the filter: even blur(0) leaves a stacking context behind
      { ...swap, animate: { ...swap.animate, transitionEnd: { filter: "none" } } };
  return (
    <span className="inline-grid">
      <AnimatePresence initial={false}>
        <motion.span
          key={id}
          className="col-start-1 row-start-1"
          {...states}
          transition={{ duration: duration.base, ease: ease.out }}
        >
          {children}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

// <Swap id={state}>{state === "saved" ? "Saved" : "Save"}</Swap>
```

## 3. Sliding pill (layoutId)

Fine when the set itself never moves during the slide. Otherwise use section 4.

```tsx
"use client";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useId } from "react";
import { spring } from "@/lib/motion";

export function Segmented({ options, value, onChange }: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  const reduce = useReducedMotion();
  return (
    // One pill per set: the group id keeps two sets from trading pills.
    // The set is the one stacking context (isolate); options are not, so the pill passes behind every label.
    <LayoutGroup id={useId()}>
      <div role="radiogroup" className="relative isolate inline-flex gap-0.5 rounded-lg bg-muted p-0.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            role="radio"
            aria-checked={option === value}
            onClick={() => onChange(option)}
            className="relative h-8 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors duration-(--duration-base) aria-checked:text-foreground"
          >
            {option === value && (
              <motion.span
                layoutId="pill"
                className="absolute inset-0 -z-10 bg-background"
                // A numeric radius lets motion keep the corners true while the pill changes width
                style={{ borderRadius: 6 }}
                transition={reduce ? { duration: 0 } : spring.snappy}
              />
            )}
            {option}
          </button>
        ))}
      </div>
    </LayoutGroup>
  );
}
```

## 4. Indicator placed by offsets

Layout animations measure on-screen boxes once. If the set moves while the pill slides (content below re-centres the layout), the pill floats. This version measures inside the set, so it can't.

```tsx
"use client";
import { animate, motion, useMotionValue } from "motion/react";
import { type RefObject, useLayoutEffect, useRef } from "react";
import { spring } from "@/lib/motion";

type Leaving = { left: number; width: number; speed: number };

/**
 * Render inside the active item (which is `position: relative`). At rest it fills the item with CSS, so it's
 * right in server HTML and follows resizes. On a change it starts where the last one was, in the set's own
 * pixels, and slides x and width home. Share one `leaving` ref per set (useRef in the set's component).
 */
export function Indicator({ leaving, reduce }: { leaving: RefObject<Leaving | null>; reduce: boolean }) {
  const node = useRef<HTMLSpanElement>(null);
  const x = useMotionValue(0);

  useLayoutEffect(() => {
    const indicator = node.current;
    const item = indicator?.parentElement;
    if (!indicator || !item) return;
    // The previous indicator wrote its place as it unmounted, earlier in this same commit
    const from = leaving.current;
    leaving.current = null;
    const to = { left: item.offsetLeft, width: item.offsetWidth };
    const running: { stop: () => void }[] = [];
    if (from && !reduce && (from.left !== to.left || from.width !== to.width)) {
      running.push(animate(x, [from.left - to.left, 0], { ...spring.snappy, velocity: from.speed }));
      const grow = animate(indicator, { width: [`${from.width}px`, `${to.width}px`] }, spring.snappy);
      grow.then(() => indicator.style.removeProperty("width"));
      running.push(grow);
    }
    return () => {
      // Unmounting (another item was chosen): hand on where this one is now, mid-slide too
      leaving.current = {
        left: item.offsetLeft + x.get(),
        width: indicator.offsetWidth || item.offsetWidth,
        speed: x.getVelocity(),
      };
      for (const animation of running) animation.stop();
    };
  }, [leaving, x, reduce]);

  // Anchored left with a full width, so a width set mid-slide grows from the left edge (RTL included)
  return (
    <motion.span
      ref={node}
      aria-hidden
      style={{ x }}
      className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-full rounded-md bg-background"
    />
  );
}
```

## 5. Gliding row highlight

One element for the whole list, placed by each row's offsets (works in scroll containers and zoomed parents).

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";
import { type PointerEvent, useRef, useState } from "react";
import { duration, ease, spring } from "@/lib/motion";

export function HighlightList({ items }: { items: { id: string; label: string }[] }) {
  const reduce = useReducedMotion();
  const [box, setBox] = useState<{ y: number; height: number } | null>(null);
  const [shown, setShown] = useState(false);
  // True once the highlight has fully faded: the next appearance fades in in place instead of flying over
  const gone = useRef(true);
  const [jump, setJump] = useState(true);

  const show = (row: HTMLElement) => {
    setJump(gone.current || !!reduce);
    gone.current = false;
    setBox({ y: row.offsetTop, height: row.offsetHeight });
    setShown(true);
  };
  const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
    // Mouse only: touch never leaves a highlight behind
    if (event.pointerType === "mouse") show(event.currentTarget);
  };

  return (
    // The list is the one stacking context; rows are not, so the highlight sits behind every row's text
    <ul className="relative isolate grid" onPointerLeave={() => setShown(false)}>
      <motion.li
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 rounded-md bg-accent"
        initial={false}
        animate={box ? { y: box.y, height: box.height, opacity: shown ? 1 : 0 } : { opacity: 0 }}
        transition={{
          y: jump ? { duration: 0 } : spring.snappy,
          height: { duration: 0 },
          // A fill: it fades, never blurs
          opacity: { duration: duration.fast, ease: ease.out },
        }}
        onAnimationComplete={() => {
          if (!shown) gone.current = true;
        }}
      />
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onPointerEnter={onPointerEnter}
            onFocus={(event) => show(event.currentTarget)}
            onBlur={() => setShown(false)}
            className="w-full rounded-md px-2 py-1.5 text-start text-sm"
          >
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
```

## 6. Dialog that grows out of its trigger

The motion layer only. Use the project's dialog primitive for focus trapping, Escape, `aria-modal` and scroll locking; keep it mounted during the exit (`forceMount` in Radix, inside `AnimatePresence`).

```tsx
"use client";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { type ReactNode, useCallback, useState } from "react";
import { blur, duration, ease, spring } from "@/lib/motion";

/**
 * The window scales from the centre of the element that opened it. Measured once as it mounts:
 * the trigger's on-screen centre against the window's own unscaled box (its offset inside a full-screen,
 * fixed positioner, so offsets are viewport coordinates).
 */
function useGrowFrom(trigger: HTMLElement | null) {
  const [origin, setOrigin] = useState("50% 50%");
  const ref = useCallback(
    (node: HTMLElement | null) => {
      const from = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
      if (!node || !from || from === document.body) return;
      const t = from.getBoundingClientRect();
      setOrigin(`${t.left + t.width / 2 - node.offsetLeft}px ${t.top + t.height / 2 - node.offsetTop}px`);
    },
    [trigger],
  );
  return { ref, origin };
}

/** While leaving, a layer lets clicks through, so the page is usable the moment the dialog starts to close */
function useClickThrough() {
  return useIsPresent() ? undefined : ("none" as const);
}

function Backdrop() {
  return (
    <motion.div
      className="fixed inset-0 bg-black/40"
      style={{ pointerEvents: useClickThrough() }}
      // The backdrop only fades: a full-screen blur is too costly
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.out } }}
      exit={{ opacity: 0, transition: { duration: duration.base, ease: ease.in } }}
    />
  );
}

function Window({ trigger, children }: { trigger: HTMLElement | null; children: ReactNode }) {
  const reduce = useReducedMotion();
  const { ref, origin } = useGrowFrom(trigger);
  const pointerEvents = useClickThrough();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: blur.hidden };
  return (
    <div className="pointer-events-none fixed inset-0 flex items-center justify-center p-4">
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        style={{ transformOrigin: origin, pointerEvents }}
        className="pointer-events-auto max-h-full w-full max-w-lg overflow-auto rounded-lg border bg-background p-6 shadow-lg"
        initial={hidden}
        animate={{
          opacity: 1,
          scale: 1,
          filter: blur.shown,
          transitionEnd: { filter: "none" },
          // The scale springs; opacity and blur tween, so the blur can't overshoot below zero
          transition: {
            scale: spring.snappy,
            opacity: { duration: duration.base, ease: ease.out },
            filter: { duration: duration.base, ease: ease.out },
          },
        }}
        // Leaving is timed and quick: nobody waits for something they dismissed
        exit={{ ...hidden, transition: { duration: duration.base, ease: ease.in } }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function DialogMotion({ open, trigger, children }: {
  open: boolean;
  trigger: HTMLElement | null;
  children: ReactNode;
}) {
  // initial={false}: a dialog that starts open is simply there
  return (
    <AnimatePresence initial={false}>
      {open && <Backdrop key="backdrop" />}
      {open && (
        <Window key="window" trigger={trigger}>
          {children}
        </Window>
      )}
    </AnimatePresence>
  );
}
```

After closing, return focus to the trigger only if focus went away with the dialog (it's on `<body>`); if the user already clicked into the page during the exit, leave it there.

## 7. Button tint (CSS only)

```css
.button {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  cursor: pointer;
}
/* One tint layer in the label's own colour, so it works on every variant */
.button::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  background: currentColor;
  opacity: 0;
  transform: translateY(4px);
  transition:
    opacity var(--duration-fast) var(--ease-out),
    transform var(--duration-fast) var(--ease-out);
}
@media (hover: hover) {
  .button:hover::before { opacity: 0.1; transform: translateY(0); }
}
.button:active::before { opacity: 0.15; transition-duration: 0ms; }
```

Tailwind: `relative isolate overflow-hidden cursor-pointer before:absolute before:inset-0 before:-z-10 before:bg-current before:opacity-0 before:translate-y-1 before:transition before:duration-(--duration-fast) before:ease-out hover:before:opacity-10 hover:before:translate-y-0 active:before:opacity-15 active:before:duration-0`.

## 8. A check that draws itself

```tsx
import { motion, useReducedMotion, useTransform, useMotionValue, animate } from "motion/react";
import { useEffect } from "react";
import { duration, ease } from "@/lib/motion";

export function Check({ checked }: { checked: boolean }) {
  const reduce = useReducedMotion();
  const length = useMotionValue(checked ? 1 : 0);
  // A round cap at length 0 still draws a dot: tie opacity to the length
  const opacity = useTransform(length, [0, 0.05], [0, 1]);
  useEffect(() => {
    const run = animate(
      length,
      checked ? 1 : 0,
      reduce
        ? { duration: 0 }
        : checked
          ? { duration: duration.base, ease: ease.out, delay: duration.instant }
          : { duration: duration.fast, ease: ease.in },
    );
    return () => run.stop();
  }, [checked, reduce, length]);
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-4">
      <motion.path
        d="M5 12.5l4.5 4.5L19 7.5"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pathLength: length, opacity }}
      />
    </svg>
  );
}
```

## 9. Continuous progress

```ts
import type { Transition } from "motion/react";
import { useRef } from "react";
import { duration, ease } from "@/lib/motion";

/** Updates closer together than this join into one smooth rise */
const STEADY = 1;

/**
 * The transition for a progress value that keeps updating: each change lasts as long as the gap since the
 * last one, at an even pace, so the fill never stops to wait. After a pause it eases in. Never a spring.
 */
export function useFollow(target: number | null, reduce: boolean): Transition {
  const last = useRef({ target, at: Number.NEGATIVE_INFINITY, transition: { duration: 0 } as Transition });
  if (target !== last.current.target) {
    const now = performance.now();
    const gap = (now - last.current.at) / 1000;
    const transition: Transition = reduce
      ? { duration: 0 }
      : gap <= STEADY
        ? { duration: gap, ease: "linear" }
        : { duration: duration.slow, ease: ease.out };
    last.current = { target, at: now, transition };
  }
  return last.current.transition;
}

// const follow = useFollow(percent, reduce);
// <motion.div className="h-full w-full bg-primary" initial={false}
//   animate={{ x: `${percent - 100}%` }} transition={follow} />   // moved, not resized
```

## 10. Reordering rows (FLIP)

```tsx
import { animate } from "motion/react";
import { type RefObject, useLayoutEffect, useRef } from "react";
import { spring } from "@/lib/motion";

/**
 * Give each row `data-key`. When the order changes, each moved row starts where it was drawn and springs home.
 * Rows added, removed or resized just take their places. Offsets, so zoom can't double the trip.
 */
export function useFlip(list: RefObject<HTMLElement | null>, order: string, reduce: boolean) {
  const last = useRef<{ order: string; tops: Map<string, number> } | null>(null);
  useLayoutEffect(() => {
    const node = list.current;
    if (!node) return;
    const rows = Array.from(node.children) as HTMLElement[];
    const tops = new Map(rows.map((row) => [row.dataset.key ?? "", row.offsetTop]));
    const before = last.current;
    last.current = { order, tops };
    const sameRows = before && before.tops.size === tops.size && [...tops.keys()].every((key) => before.tops.has(key));
    if (!before || reduce || before.order === order || !sameRows) return;
    for (const row of rows) {
      const from = before.tops.get(row.dataset.key ?? "");
      const to = row.offsetTop;
      if (from === undefined || from === to) continue;
      animate(row, { y: [from - to, 0] }, spring.snappy).then(() => row.style.removeProperty("transform"));
    }
  }, [list, order, reduce]);
}

// useFlip(bodyRef, rows.map((row) => row.id).join(","), reduce)
```

## 11. A loop that eases to a stop

```ts
import { animate } from "motion/react";
import { duration, ease } from "@/lib/motion";

/**
 * A marquee track sliding one copy's width forever, on the compositor. Pausing glides the speed to 0 instead
 * of freezing: the animation is paused and its time stepped by hand at the gliding speed, then played again.
 * (Changing playbackRate every frame lets the compositor's clock drift, and it snaps on release.)
 */
export function marquee(track: HTMLElement, distance: number, pxPerSecond: number) {
  const loop = track.animate(
    [{ transform: "translateX(0)" }, { transform: `translateX(${-distance}px)` }],
    { duration: (distance / pxPerSecond) * 1000, iterations: Number.POSITIVE_INFINITY, easing: "linear" },
  );
  let rate = 1;
  let frame = 0;
  let glide: { stop: () => void } | undefined;

  const setSpeed = (target: 0 | 1) => {
    glide?.stop();
    cancelAnimationFrame(frame);
    loop.pause();
    let previous = performance.now();
    const step = (now: number) => {
      loop.currentTime = Number(loop.currentTime ?? 0) + (now - previous) * rate;
      previous = now;
      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    glide = animate(rate, target, {
      duration: duration.slow,
      ease: ease.out,
      onUpdate: (value) => {
        rate = value;
      },
      onComplete: () => {
        cancelAnimationFrame(frame);
        if (target === 1) loop.play();
      },
    });
  };

  const cancel = () => {
    glide?.stop();
    cancelAnimationFrame(frame);
    loop.cancel();
  };
  return { pause: () => setSpeed(0), resume: () => setSpeed(1), cancel };
}
```

Also pause it off-screen (IntersectionObserver) and while `document.hidden`, and keep several loops in step by setting `animation.startTime = 0`.

## 12. Reduced motion helpers

```ts
// CSS: the duration tokens collapse to 1ms under prefers-reduced-motion (tokens.md), so token-based
// transitions and keyframes become instant on their own.

```

```ts
// JavaScript with motion: read it in each component, which can't rely on an app-wide setting
import { useReducedMotion } from "motion/react";
const reduce = useReducedMotion() ?? false;
const transition = reduce ? { duration: 0 } : spring.snappy;
```

```ts
// Without motion
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
```
