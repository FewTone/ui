"use client";

import { duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { animate, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type CSSProperties,
  type FocusEvent,
  type PointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/*
 * Marquee: a row of logos or cards that scrolls on its own (owner's roadmap, 2026-10-16).
 * - Seamless: the children are repeated until they cover the row with one copy to spare, and the track slides
 *   exactly one copy (and a gap) before starting over, which looks the same, at `speed` pixels a second. Only a
 *   transform moves, on the Web Animations API, so the compositor runs it without React or the main thread.
 * - It rests where nobody's looking: paused off-screen (IntersectionObserver) and while the tab is hidden.
 * - The crafted part: hover (pauseOnHover) and keyboard focus inside slow it to a stop over duration.slow rather
 *   than freezing it, and it picks up speed again when you leave, from exactly where it stopped. `paused` stops
 *   it the same way, for a pause control (WCAG 2.2.2: moving content that lasts needs a way to stop it).
 *   Only at full speed does the loop run by itself. While it slows or picks up it's paused and stepped by hand,
 *   frame by frame: changing playbackRate every frame on an animation the compositor runs let the two clocks
 *   drift, so leaving the hover snapped it to where it would have been without one (owner, 2026-10-21).
 * - The copies are aria-hidden and inert, so screen readers and Tab meet each item once.
 * - The edges fade through a static mask, so items arrive and leave softly on any surface.
 * - With reduced motion it doesn't move: one copy, in a row you can scroll.
 */

/** Each end fades over a tenth of the row */
const fades = {
  horizontal: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
  vertical: "linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)",
} as const;

const subscribe = () => () => {};

/** The loop runs by itself only at full speed (`free`), and only while it can be seen: on screen, in a visible tab */
function syncRunning(loop: Animation | null, onScreen: boolean, free: boolean) {
  if (!loop) return;
  const run = free && onScreen && document.visibilityState !== "hidden";
  if (run && loop.playState === "paused") loop.play();
  else if (!run && loop.playState === "running") loop.pause();
}

export type MarqueeProps = ComponentProps<"div"> & {
  /** Which way the items travel. Up and down need a height on the marquee (`className="h-72"`) */
  direction?: "left" | "right" | "up" | "down";
  /** Pixels a second */
  speed?: number;
  /** Slow to a stop while the pointer is over it */
  pauseOnHover?: boolean;
  /** Stopped (it slows to a stop, and picks up again when set back) */
  paused?: boolean;
  /** Space between items, and between the copies: a CSS length, or pixels. gap-4 (1rem) if left out */
  gap?: number | string;
  /** Fade the items out at the ends */
  fade?: boolean;
};

/**
 * A row of items that scrolls on its own, round and round. Put the items straight inside: logos, cards, quotes.
 */
function Marquee({
  direction = "left",
  speed = 40,
  pauseOnHover = true,
  paused = false,
  gap,
  fade = true,
  className,
  style,
  children,
  ref,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ...props
}: MarqueeProps) {
  const vertical = direction === "up" || direction === "down";
  const reduce = useReducedMotion() ?? false;
  // Read only after hydration, so the server's HTML (always the moving row) is what hydrates
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const still = hydrated && reduce;

  const root = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement>(null);
  const loop = useRef<Animation | null>(null);
  // How far through a loop it was, kept when the loop is rebuilt (a resize, a new speed)
  const phase = useRef(0);
  const onScreen = useRef(true);
  const [copies, setCopies] = useState(2);
  /** One copy and one gap, in pixels: the distance of a loop */
  const [length, setLength] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const held = paused || focused || (pauseOnHover && hovered);
  // The loop's speed, 0 to 1. It starts where the props say, so nothing glides on first paint.
  const rate = useRef(held ? 0 : 1);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      root.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref],
  );

  // Measure a loop and how many copies cover the row, again whenever either resizes
  useLayoutEffect(() => {
    const node = root.current;
    const row = track.current;
    if (!node || !row || still) return;
    const measure = () => {
      const [first, second] = Array.from(row.children) as HTMLElement[];
      if (!first || !second) return;
      // Right to left, the copies run leftwards, so the distance is the same either way
      const next = Math.abs(
        vertical ? second.offsetTop - first.offsetTop : second.offsetLeft - first.offsetLeft,
      );
      const room = vertical ? node.clientHeight : node.clientWidth;
      setLength(next);
      setCopies(next > 0 ? Math.max(2, Math.ceil(room / next) + 1) : 2);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    if (row.firstElementChild) observer.observe(row.firstElementChild);
    return () => observer.disconnect();
  }, [vertical, still]);

  // The loop: one copy's length, linear, forever
  useEffect(() => {
    const row = track.current;
    if (!row || still || length <= 0 || speed <= 0 || typeof row.animate !== "function") return;
    const axis = vertical ? "translateY" : "translateX";
    // Right to left, the copies start at the right edge and run leftwards, so the loop sits one copy further
    // right: the first copy always comes back to its own place
    const shift = !vertical && getComputedStyle(row).direction === "rtl" ? length : 0;
    const ends = (direction === "left" || direction === "up" ? [0, -length] : [-length, 0]).map(
      (end) => end + shift,
    );
    const ms = (length / speed) * 1000;
    const animation = row.animate(
      ends.map((end) => ({ transform: `${axis}(${end}px)` })),
      { duration: ms, iterations: Number.POSITIVE_INFINITY, easing: "linear" },
    );
    animation.currentTime = phase.current * ms;
    loop.current = animation;
    syncRunning(animation, onScreen.current, rate.current === 1);
    return () => {
      phase.current = ((Number(animation.currentTime) || 0) / ms) % 1;
      animation.cancel();
      loop.current = null;
    };
  }, [length, speed, direction, vertical, still]);

  // Rest off-screen and in a hidden tab
  useEffect(() => {
    const node = root.current;
    if (!node || still) return;
    const update = () => syncRunning(loop.current, onScreen.current, rate.current === 1);
    let observer: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver((entries) => {
        const entry = entries.at(-1);
        onScreen.current = entry?.isIntersecting ?? true;
        update();
      });
      observer.observe(node);
    }
    document.addEventListener("visibilitychange", update);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [still]);

  // Hover, focus and `paused` glide the speed to 0 and back, rather than freezing it. Meanwhile the loop is
  // paused and its time stepped by hand, at the gliding speed, so it never leaves the place it's drawn at.
  useEffect(() => {
    const target = held ? 0 : 1;
    if (rate.current === target) return;
    let last = performance.now();
    // Below full speed from here on: the loop stops running by itself
    if (rate.current === 1) rate.current = 1 - Number.EPSILON;
    syncRunning(loop.current, onScreen.current, false);
    const glide = animate(rate.current, target, {
      duration: reduce ? 0 : duration.slow,
      ease: ease.out,
      onUpdate: (value) => {
        const now = performance.now();
        const animation = loop.current;
        if (animation && onScreen.current && document.visibilityState !== "hidden")
          animation.currentTime = (Number(animation.currentTime) || 0) + (now - last) * value;
        last = now;
        rate.current = value;
      },
      onComplete: () => {
        rate.current = target;
        // Back to full speed: it runs by itself again, on from where it is
        syncRunning(loop.current, onScreen.current, rate.current === 1);
      },
    });
    return () => glide.stop();
  }, [held, reduce]);

  const spacing: CSSProperties | undefined =
    gap === undefined ? undefined : { gap: typeof gap === "number" ? `${gap}px` : gap };
  const groups = Array.from({ length: still ? 1 : copies }, (_, copy) => copy);
  const mask = fade && !still ? fades[vertical ? "vertical" : "horizontal"] : undefined;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: hover and focus only slow the loop down; nothing here is pressed
    <div
      ref={setRef}
      data-slot="marquee"
      data-direction={direction}
      data-orientation={vertical ? "vertical" : "horizontal"}
      data-paused={held || undefined}
      // With reduced motion it's a row to scroll, so the keyboard can reach it too
      tabIndex={still ? 0 : undefined}
      className={cn(
        "relative flex overflow-hidden",
        vertical && "flex-col",
        still && (vertical ? "overflow-y-auto" : "overflow-x-auto"),
        "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        className,
      )}
      style={mask ? { maskImage: mask, WebkitMaskImage: mask, ...style } : style}
      onPointerEnter={(event: PointerEvent<HTMLDivElement>) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") setHovered(true);
      }}
      onPointerLeave={(event: PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        setHovered(false);
      }}
      onFocus={(event: FocusEvent<HTMLDivElement>) => {
        onFocus?.(event);
        setFocused(true);
      }}
      onBlur={(event: FocusEvent<HTMLDivElement>) => {
        onBlur?.(event);
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
      {...props}
    >
      <div
        ref={track}
        data-slot="marquee-track"
        className={cn("flex shrink-0 gap-4", vertical ? "h-max flex-col" : "w-max")}
        style={spacing}
      >
        {groups.map((copy) => (
          // The first copy is the content; the others are only there to fill the row
          <div
            key={copy}
            data-slot="marquee-group"
            aria-hidden={copy > 0 || undefined}
            inert={copy > 0 || undefined}
            className={cn("flex shrink-0 gap-4", vertical && "flex-col")}
            style={spacing}
          >
            {children}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Marquee };
