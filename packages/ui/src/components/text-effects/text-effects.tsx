"use client";

import { blur, duration, ease } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  Fragment,
  type HTMLAttributes,
  type Ref,
  type RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/*
 * Text Effects (owner's roadmap, 2026-10-16: "Shimmer, reveal and typewriter text"): three calm ways to bring
 * text in, each in one neutral hue and off with reduced motion. The words stay real text for search engines and
 * screen readers.
 * - TextShimmer: a sheen of `foreground` sweeps across text in `muted-foreground`, the lightness of one hue,
 *   never a colour. A copy of the text in the light colour sits inside a soft-edged band (a static mask); the band
 *   slides across while the copy slides back the same amount, so the copy stays put and only the light moves.
 *   Transforms only, on the compositor, not an animated background. It keeps Skeleton's pace (a 1.5s sweep, a
 *   0.5s rest) and its clock, so a shimmering label sweeps in step with the skeletons beside it.
 * - TextReveal: words (or characters) rise 12px through the blur, 0.05s apart (motion.md's list items), once in
 *   view or on mount. The pieces are aria-hidden; a visually hidden copy carries the text. They're hidden in the
 *   server's HTML too, so a reveal above the fold never flashes in place before it plays.
 * - Typewriter: types each phrase, holds it, deletes it and types the next. The caret is solid while it types and
 *   breathes (an eased fade, not a hard blink) while it waits; typing a phrase once, it fades away at the end.
 *   Screen readers aren't sent the typing: a visually hidden copy says every phrase once, and nothing is a live
 *   region, because announcing a phrase every few seconds, forever, would talk over the page. It rests while
 *   off-screen.
 */

const subscribe = () => () => {};
/** False on the server and while hydrating, so the server's HTML is what hydrates */
const useHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const cubic = (curve: readonly number[]) => `cubic-bezier(${curve.join(", ")})`;

/** Hands a node to our ref and to the caller's */
function useMergedRef<T>(own: RefObject<T | null>, theirs?: Ref<T>) {
  return useCallback(
    (node: T | null) => {
      own.current = node;
      if (typeof theirs === "function") theirs(node);
      else if (theirs) theirs.current = node;
    },
    [own, theirs],
  );
}

/* ----------------------------------------------------------------------------------------------------------- */

/** Skeleton's sheen: a 2s period, sweeping for the first 75% of it */
const SHIMMER_PERIOD = duration.slower * 4 * 1000;
const SHIMMER_SWEEP = 0.75;
/** The light is brightest in the band's middle and gone a quarter of the way in from each side */
const band = {
  maskImage: "linear-gradient(to right, transparent 25%, black, transparent 75%)",
  WebkitMaskImage: "linear-gradient(to right, transparent 25%, black, transparent 75%)",
} as const;

export type TextShimmerProps = ComponentProps<"span">;

/**
 * Text with a light sweeping across it, for a label that says something is happening ("Generating…"). It takes
 * the text's size; the colours are `muted-foreground` with a `foreground` sheen.
 */
function TextShimmer({ className, children, ...props }: TextShimmerProps) {
  const reduce = useReducedMotion() ?? false;
  const light = useRef<HTMLSpanElement>(null);
  const copy = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sweep = light.current;
    const still = copy.current;
    if (!sweep || !still || reduce || typeof sweep.animate !== "function") return;
    // From the start of the line in either writing direction
    const [from, to] = getComputedStyle(sweep).direction === "rtl" ? ["100%", "-100%"] : ["-100%", "100%"];
    const back = (value: string) => (value.startsWith("-") ? value.slice(1) : `-${value}`);
    const timing = { duration: SHIMMER_PERIOD, iterations: Number.POSITIVE_INFINITY };
    const easing = cubic(ease.inOut);
    const animations = [
      sweep.animate(
        [{ translate: from, easing }, { translate: to, offset: SHIMMER_SWEEP }, { translate: to }],
        timing,
      ),
      // The copy goes back as far as the band goes on, so the letters never move
      still.animate(
        [
          { translate: back(from), easing },
          { translate: back(to), offset: SHIMMER_SWEEP },
          { translate: back(to) },
        ],
        timing,
      ),
    ];
    // Counted from the page's start, like Skeleton's sheen, so every shimmer and skeleton sweeps together
    for (const animation of animations) animation.startTime = 0;
    return () => {
      for (const animation of animations) animation.cancel();
    };
  }, [reduce]);

  return (
    <span
      data-slot="text-shimmer"
      className={cn("relative inline-block text-muted-foreground", className)}
      {...props}
    >
      {children}
      {/* The light: a copy of the text in the foreground colour, seen through a band that sweeps across */}
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden select-none">
        <span ref={light} className="absolute inset-0 -translate-x-full rtl:translate-x-full" style={band}>
          <span
            ref={copy}
            className="absolute inset-0 translate-x-full text-foreground rtl:-translate-x-full"
          >
            {children}
          </span>
        </span>
      </span>
    </span>
  );
}

/* ----------------------------------------------------------------------------------------------------------- */

/** motion.md's list items: a 12px rise through the blur, 0.05s apart */
const REVEAL_RISE = "translateY(12px)";
const REVEAL_STAGGER = 0.05;

type RevealTag = "p" | "span" | "div" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "blockquote" | "li";

export type TextRevealProps = Omit<HTMLAttributes<HTMLElement>, "children"> & {
  /** The text to reveal */
  children: string;
  /** The element to render, for example "h2" for a heading */
  as?: RevealTag;
  /** Reveal word by word, or character by character (for short headings) */
  by?: "word" | "character";
  /** Seconds before the first piece rises */
  delay?: number;
  /** Reveal once it scrolls into view. With false, it reveals on mount */
  startOnView?: boolean;
  ref?: Ref<HTMLElement>;
};

/**
 * Text that rises into place a word (or a character) at a time, once. Screen readers and search engines read the
 * whole text, as it is.
 */
function TextReveal({
  children,
  as: Comp = "p",
  by = "word",
  delay = 0,
  startOnView = true,
  className,
  ref,
  ...props
}: TextRevealProps) {
  const reduce = useReducedMotion() ?? false;
  const root = useRef<HTMLElement | null>(null);
  const setRef = useMergedRef(root, ref);
  const animations = useRef<Animation[]>([]);
  // Until it's revealed, every piece is held at opacity 0, from the server's HTML on
  const [shown, setShown] = useState(false);
  const settings = useRef({ delay, startOnView, reduce });
  settings.current = { delay, startOnView, reduce };

  useEffect(() => {
    const node = root.current;
    if (!node || shown) return;
    if (settings.current.reduce || typeof node.animate !== "function") {
      setShown(true);
      return;
    }
    const reveal = () => {
      const easing = cubic(ease.out);
      for (const animation of animations.current) animation.cancel();
      animations.current = Array.from(
        node.querySelectorAll<HTMLElement>("[data-slot=text-reveal-piece]"),
        (piece, index) =>
          piece.animate(
            [
              { opacity: 0, filter: blur.hidden, transform: REVEAL_RISE },
              { opacity: 1, filter: blur.shown, transform: "none" },
            ],
            {
              duration: duration.slow * 1000,
              delay: Math.round((settings.current.delay + index * REVEAL_STAGGER) * 1000),
              easing,
              // Holds each piece hidden while it waits; at the end it lets go, leaving no filter behind
              fill: "backwards",
            },
          ),
      );
      // The pieces drop their inline opacity in the same frame, and the animations take over
      setShown(true);
    };
    if (!settings.current.startOnView || typeof IntersectionObserver === "undefined") {
      reveal();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      reveal();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  useEffect(
    () => () => {
      for (const animation of animations.current) animation.cancel();
    },
    [],
  );

  const hidden = shown ? undefined : { opacity: 0 };
  const words = children.split(/\s+/).filter(Boolean);

  return (
    <Comp ref={setRef} data-slot="text-reveal" className={className} {...props}>
      <span className="sr-only select-none">{children}</span>
      <span aria-hidden data-slot="text-reveal-text">
        {words.map((word, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: the same word can come twice; its place is its identity
          <Fragment key={index}>
            {index > 0 ? " " : null}
            {by === "word" ? (
              <span data-slot="text-reveal-piece" className="inline-block" style={hidden}>
                {word}
              </span>
            ) : (
              // A word's characters never break apart across lines
              <span className="inline-block whitespace-nowrap">
                {Array.from(word).map((char, place) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: characters repeat; their place is their identity
                  <span key={place} data-slot="text-reveal-piece" className="inline-block" style={hidden}>
                    {char}
                  </span>
                ))}
              </span>
            )}
          </Fragment>
        ))}
      </span>
    </Comp>
  );
}

/* ----------------------------------------------------------------------------------------------------------- */

/** The caret's breath while it waits: in and out over a second */
const CARET_BREATH = duration.slower * 2 * 1000;

type Typing = {
  phrase: number;
  length: number;
  /** starting: before the first character · between: after deleting, before the next phrase */
  mode: "starting" | "typing" | "holding" | "deleting" | "between" | "done";
};

export type TypewriterProps = Omit<ComponentProps<"span">, "children"> & {
  /** One phrase, or several to type in turn */
  phrases: string | readonly string[];
  /** Go back to the first phrase after the last. On by default for several phrases, off for one */
  loop?: boolean;
  /** Seconds per character typed */
  typeSpeed?: number;
  /** Seconds per character deleted */
  deleteSpeed?: number;
  /** Seconds a typed phrase stays before it's deleted */
  hold?: number;
  /** Seconds before the first character, once it's in view */
  delay?: number;
  /** Show the caret */
  cursor?: boolean;
};

/**
 * Types a phrase, or several in turn, with a soft caret. It starts once it's in view and rests while it's
 * off-screen. Screen readers hear every phrase once, as plain text.
 */
function Typewriter({
  phrases,
  loop,
  typeSpeed = duration.instant,
  deleteSpeed = duration.instant / 2,
  hold = duration.slower * 4,
  delay = 0,
  cursor = true,
  className,
  ref,
  ...props
}: TypewriterProps) {
  const list = typeof phrases === "string" ? [phrases] : [...phrases];
  const loops = loop ?? list.length > 1;
  const reduce = useReducedMotion() ?? false;
  // With reduced motion the first phrase is simply there; the server's HTML (still empty) hydrates first
  const still = useHydrated() && reduce;
  const root = useRef<HTMLSpanElement | null>(null);
  const setRef = useMergedRef(root, ref);
  const caret = useRef<HTMLSpanElement>(null);
  const caretAnimation = useRef<Animation | null>(null);
  const [typing, setTyping] = useState<Typing>({ phrase: 0, length: 0, mode: "starting" });
  const [inView, setInView] = useState(false);
  const settings = useRef({ list, loops, typeSpeed, deleteSpeed, hold, delay });
  settings.current = { list, loops, typeSpeed, deleteSpeed, hold, delay };

  useEffect(() => {
    const node = root.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      const entry = entries.at(-1);
      if (entry) setInView(entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // One step at a time: a character typed or deleted, a hold, a pause between phrases
  useEffect(() => {
    if (still || !inView || typing.mode === "done") return;
    const { list, loops, typeSpeed, deleteSpeed, hold, delay } = settings.current;
    const total = Array.from(list[typing.phrase] ?? "").length;
    const last = typing.phrase >= list.length - 1;
    let wait: number;
    let next: Typing;
    switch (typing.mode) {
      case "starting":
      case "between":
        wait = typing.mode === "starting" ? delay : duration.slow;
        next = { ...typing, mode: total > 0 ? "typing" : "holding" };
        break;
      case "typing": {
        const length = typing.length + 1;
        wait = typeSpeed;
        next = { ...typing, length, mode: length >= total ? "holding" : "typing" };
        break;
      }
      case "holding":
        wait = hold;
        next = last && !loops ? { ...typing, mode: "done" } : { ...typing, mode: "deleting" };
        break;
      default: {
        const length = typing.length - 1;
        wait = deleteSpeed;
        next =
          length > 0
            ? { ...typing, length }
            : { phrase: last ? 0 : typing.phrase + 1, length: 0, mode: "between" };
      }
    }
    const timer = setTimeout(() => setTyping(next), wait * 1000);
    return () => clearTimeout(timer);
  }, [typing, inView, still]);

  // The caret: solid while the text moves, breathing while it waits, fading away when it's done
  const caretMode =
    typing.mode === "typing" || typing.mode === "deleting"
      ? "solid"
      : typing.mode === "done"
        ? "gone"
        : "wait";
  useEffect(() => {
    const node = caret.current;
    if (!node || typeof node.animate !== "function") return;
    // Read before cancelling, so the fade at the end starts from wherever the breath was
    const opacity = getComputedStyle(node).opacity || "1";
    caretAnimation.current?.cancel();
    caretAnimation.current = null;
    if (caretMode === "wait") {
      caretAnimation.current = node.animate([{ opacity: 1 }, { opacity: 0 }, { opacity: 1 }], {
        duration: CARET_BREATH,
        iterations: Number.POSITIVE_INFINITY,
        easing: cubic(ease.inOut),
      });
    } else if (caretMode === "gone") {
      // The end state, kept until it unmounts
      caretAnimation.current = node.animate([{ opacity }, { opacity: 0 }], {
        duration: duration.slow * 1000,
        easing: cubic(ease.out),
        fill: "forwards",
      });
    }
  }, [caretMode]);
  useEffect(() => () => caretAnimation.current?.cancel(), []);

  const typed = still
    ? (list[0] ?? "")
    : Array.from(list[typing.phrase] ?? "")
        .slice(0, typing.length)
        .join("");

  return (
    <span ref={setRef} data-slot="typewriter" className={cn("whitespace-pre-wrap", className)} {...props}>
      <span className="sr-only select-none">{list.join(", ")}</span>
      <span aria-hidden data-slot="typewriter-text">
        {typed}
      </span>
      {cursor && !still ? (
        // A 2px bar one line of the text tall: the zero-width space gives it the font's height and baseline
        <span
          ref={caret}
          aria-hidden
          data-slot="typewriter-caret"
          className="ms-0.5 inline-block w-0.5 rounded-full bg-current leading-none select-none"
        >
          {"​"}
        </span>
      ) : null}
    </span>
  );
}

export { TextReveal, TextShimmer, Typewriter };
