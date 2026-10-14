"use client";

import { Button, type ButtonProps } from "@fewtone/ui/components/button/button";
import { ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { motion, type Transition, useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { useId, useSyncExternalStore } from "react";
import { flushSync } from "react-dom";

/*
 * The View Transitions API snapshots the page, the theme changes underneath, and the new theme is revealed
 * over the old one. Background, text and every component change together inside the moving edge. Each
 * reveal is a set of Web Animations keyframes for the two snapshots, built from the click point and the
 * screen size. Without browser support, or with reduced motion, the switch is instant.
 */

/** Every reveal, in the order the docs list them */
const themeReveals = [
  "circle",
  "shrink",
  "ink",
  "tide",
  "page-turn",
  "fade",
  "wipe-right",
  "wipe-down",
  "feather",
  "curtain",
  "diagonal",
] as const;

export type ThemeReveal = (typeof themeReveals)[number];
export type ThemeRevealSpeed = "quick" | "medium" | "slow";

/** Reveal lengths in milliseconds */
const revealSpeeds: Record<ThemeRevealSpeed, number> = { quick: 450, medium: 700, slow: 1000 };

type Point = { x: number; y: number };
/** The click point, the screen, and the radius from the click to the farthest corner */
type Stage = { origin: Point; width: number; height: number; radius: number };
/** Keyframes for the new and old snapshots; `oldOnTop` when the old one moves away to uncover the new */
type Reveal = { new?: Keyframe[]; old?: Keyframe[]; oldOnTop?: boolean };

const TAU = Math.PI * 2;
const px = (value: number) => `${value.toFixed(1)}px`;
const polygon = (points: Point[]) => `polygon(${points.map((p) => `${px(p.x)} ${px(p.y)}`).join(", ")})`;
const circle = (r: number, o: Point) => `circle(${px(r)} at ${px(o.x)} ${px(o.y)})`;
/** `count` evenly spaced keyframes, each made from its progress t (0 to 1) */
const frames = (count: number, make: (t: number) => Keyframe) =>
  Array.from({ length: count }, (_, index) => make(index / (count - 1)));

const reveals: Record<ThemeReveal, (stage: Stage) => Reveal> = {
  // A circle grows from the click until it passes the farthest corner
  circle: ({ origin, radius }) => ({
    new: [{ clipPath: circle(0, origin) }, { clipPath: circle(radius, origin) }],
  }),

  // The old theme closes into the click, uncovering the new one behind it
  shrink: ({ origin, radius }) => ({
    oldOnTop: true,
    old: [{ clipPath: circle(radius, origin) }, { clipPath: circle(0, origin) }],
  }),

  // A blob whose radius wobbles with two sine waves that drift as it grows. Its narrowest point is 80% of
  // the widest, so the end size is set for that point to pass the farthest corner.
  ink: ({ origin, radius }) => {
    const reach = (radius / 0.8) * 1.03;
    return {
      new: frames(20, (t) => ({
        clipPath: polygon(
          Array.from({ length: 64 }, (_, index) => {
            const angle = (index / 64) * TAU;
            const phase = t * Math.PI * 1.6;
            const r =
              reach * t * (1 + 0.12 * Math.sin(3 * angle + phase) + 0.08 * Math.sin(5 * angle - phase * 1.3));
            return { x: origin.x + r * Math.cos(angle), y: origin.y + r * Math.sin(angle) };
          }),
        ),
      })),
    };
  },

  // A wave edge rises from below the screen to above it. The swell is largest half-way, and two harmonics
  // travel sideways at different speeds so it rolls like liquid rather than sliding.
  tide: ({ width, height }) => {
    const swell = height * 0.06;
    const margin = swell * 1.2;
    return {
      new: frames(28, (t) => {
        const amplitude = swell * (Math.sin(Math.PI * t) + 0.15);
        const level = height + margin - t * (height + 2 * margin);
        const phase = t * TAU * 1.2;
        const wave = Array.from({ length: 49 }, (_, index) => {
          const x = (index / 48) * width;
          const k = (x / width) * TAU;
          return {
            x,
            y: level + amplitude * (0.7 * Math.sin(1.5 * k + phase) + 0.3 * Math.sin(3.2 * k - phase * 1.4)),
          };
        });
        return { clipPath: polygon([...wave, { x: width, y: height * 2 }, { x: 0, y: height * 2 }]) };
      }),
    };
  },

  // The old page turns on its left edge until it's side-on, fading over the last quarter
  "page-turn": ({ width }) => {
    const turn = (degrees: number) => `perspective(${px(width * 1.2)}) rotateY(${degrees}deg)`;
    return {
      oldOnTop: true,
      old: [
        { transformOrigin: "left center", transform: turn(0), opacity: 1 },
        { transformOrigin: "left center", transform: turn(68), opacity: 1, offset: 0.75 },
        { transformOrigin: "left center", transform: turn(90), opacity: 0 },
      ],
    };
  },

  fade: () => ({ new: [{ opacity: 0 }, { opacity: 1 }] }),

  "wipe-right": () => ({ new: [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0)" }] }),

  "wipe-down": () => ({ new: [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0)" }] }),

  // A mask 2.25 screens wide, opaque on its left 44% and clear on its right 44%, slides from right to left.
  // The soft band between is a quarter of the screen, and it crosses the whole screen.
  feather: () => {
    const mask = {
      maskImage: "linear-gradient(to right, black 44.4%, transparent 55.6%)",
      maskSize: "225% 100%",
      maskRepeat: "no-repeat",
    };
    return {
      new: [
        { ...mask, maskPosition: "100% 0" },
        { ...mask, maskPosition: "0% 0" },
      ],
    };
  },

  curtain: () => ({ new: [{ clipPath: "inset(0 50%)" }, { clipPath: "inset(0)" }] }),

  diagonal: ({ width, height }) => {
    const far = 2 * Math.max(width, height);
    return {
      new: [
        {
          clipPath: polygon([
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
          ]),
        },
        {
          clipPath: polygon([
            { x: 0, y: 0 },
            { x: far, y: 0 },
            { x: 0, y: far },
          ]),
        },
      ],
    };
  },
};

export type RevealOption = ThemeReveal | ThemeReveal[] | "random" | "none";

let lastRandom: ThemeReveal | undefined;

/** One reveal from a name, "random" (any reveal) or a list to pick from; never the same random one twice */
function pickReveal(option: RevealOption): ThemeReveal | undefined {
  if (option === "none") return undefined;
  if (typeof option === "string" && option !== "random") return option;
  const pool: readonly ThemeReveal[] = option === "random" ? themeReveals : option;
  const fresh = pool.length > 1 ? pool.filter((name) => name !== lastRandom) : pool;
  const chosen = fresh[Math.floor(Math.random() * fresh.length)];
  lastRandom = chosen;
  return chosen;
}

export type RevealThemeOptions = {
  /** The theme to switch to, as your theme provider names it */
  theme: string;
  /** Applies the theme, for example `setTheme` from next-themes' useTheme() */
  setTheme: (theme: string) => void;
  /** Where the reveal starts, in viewport pixels; the centre of the screen if left out */
  origin?: Point;
  reveal?: RevealOption;
  speed?: ThemeRevealSpeed | number;
};

/**
 * Switches the theme with a reveal. ThemeToggle uses it; call it yourself to switch from a menu item or a
 * shortcut. Returns the view transition, or nothing when the switch was instant.
 */
function revealTheme({
  theme,
  setTheme,
  origin,
  reveal = "circle",
  speed = "medium",
}: RevealThemeOptions): ViewTransition | undefined {
  // flushSync renders the theme provider's update straight away, so the new snapshot already has the theme
  const apply = () => flushSync(() => setTheme(theme));
  const name = pickReveal(reveal);
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!name || reduce || typeof document.startViewTransition !== "function") {
    apply();
    return undefined;
  }

  const root = document.documentElement;
  const width = window.innerWidth;
  const height = window.innerHeight;
  const from = origin ?? { x: width / 2, y: height / 2 };
  const radius = Math.hypot(Math.max(from.x, width - from.x), Math.max(from.y, height - from.y));
  const keyframes = reveals[name]({ origin: from, width, height, radius });
  const timing: KeyframeAnimationOptions = {
    duration: typeof speed === "number" ? speed : revealSpeeds[speed],
    easing: `cubic-bezier(${ease.inOut.join(", ")})`,
    fill: "both",
  };

  // While it runs: no default cross-fade, the old snapshot on top when it's the one that moves, and no CSS
  // transitions, so colours don't fade a second time inside the new snapshot
  const style = document.createElement("style");
  style.textContent = [
    "::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}",
    keyframes.oldOnTop ? "::view-transition-old(root){z-index:1}" : "",
    "*,*::before,*::after{transition:none!important}",
  ].join("");
  document.head.appendChild(style);

  // The animations fill both ways so the first and last frames hold; they're cancelled once the transition
  // ends, or their final frame would still apply to the next switch's snapshots
  const running: Animation[] = [];
  const transition = document.startViewTransition(apply);
  transition.ready
    .then(() => {
      if (keyframes.new) {
        running.push(
          root.animate(keyframes.new, { ...timing, pseudoElement: "::view-transition-new(root)" }),
        );
      }
      if (keyframes.old) {
        running.push(
          root.animate(keyframes.old, { ...timing, pseudoElement: "::view-transition-old(root)" }),
        );
      }
    })
    .catch(() => {
      // Skipped (another transition started); the theme has still changed
    });
  transition.finished.finally(() => {
    for (const animation of running) animation.cancel();
    style.remove();
  });
  return transition;
}

export type ThemeToggleProps = Omit<ButtonProps, "children" | "asChild"> & {
  /** How the new theme is revealed: one reveal, "random", a list to pick from at random, or "none" */
  reveal?: RevealOption;
  /** How long the reveal takes: "quick" (450ms), "medium" (700ms), "slow" (1000ms) or milliseconds */
  speed?: ThemeRevealSpeed | number;
};

const noop = () => () => {};

/** Ray angles round the sun, and the two stars that twinkle in beside the moon (x, y, radius) */
const rayAngles = [0, 45, 90, 135, 180, 225, 270, 315];
const stars = [
  { x: 17, y: 6.5, r: 2.4 },
  { x: 21.5, y: 3.5, r: 1.4 },
];
/** A four-point sparkle: each side curves in towards the centre */
const sparkle = ({ x, y, r }: { x: number; y: number; r: number }) =>
  `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`;

/**
 * One drawing that morphs between a sun and a moon. Going to the moon, the rays shrink and spin away, the
 * sun swells on a bouncy spring to a radius of 9, and a shadow (a mask circle of radius 6.4) slides over its
 * top right to carve a full, centred crescent, as in Lucide's moon. Two stars then twinkle in: one in the
 * crescent's bite, one just outside the moon. Going back, the shadow slides off and the rays pop out one after another.
 * Only transforms and opacity move. It starts in its current state without animating (initial={false}),
 * so the server render already shows the finished drawing.
 */
function SunMoon({ moon, className }: { moon: boolean; className?: string }) {
  const reduce = useReducedMotion();
  const maskId = `sun-moon-${useId().replace(/[^w-]/g, "")}`;
  const move = (transition: Transition): Transition => (reduce ? { duration: 0 } : transition);
  const stagger = (seconds: number) => (reduce ? 0 : seconds);

  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
      initial={false}
      animate={moon ? "moon" : "sun"}
      variants={{ sun: { rotate: 90 }, moon: { rotate: 0 } }}
      transition={move(spring.smooth)}
    >
      <mask id={maskId}>
        <rect width="24" height="24" fill="white" />
        <motion.circle
          cx="12"
          cy="12"
          r="6.4"
          fill="black"
          variants={{ sun: { x: 14, y: -14 }, moon: { x: 4.5, y: -4.5 } }}
          transition={move(spring.snappy)}
        />
      </mask>
      <motion.circle
        cx="12"
        cy="12"
        r="5"
        fill="currentColor"
        mask={`url(#${maskId})`}
        variants={{ sun: { scale: 1 }, moon: { scale: 1.8 } }}
        transition={move(spring.bouncy)}
      />
      <motion.g
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        variants={{
          sun: { transition: { staggerChildren: stagger(0.035), delayChildren: stagger(0.1) } },
          moon: { transition: { staggerChildren: 0 } },
        }}
      >
        {rayAngles.map((angle) => (
          <g key={angle} transform={`rotate(${angle} 12 12)`}>
            <motion.line
              x1="12"
              y1="1.75"
              x2="12"
              y2="3.75"
              variants={{ sun: { scale: 1, opacity: 1 }, moon: { scale: 0, opacity: 0 } }}
              transition={move(spring.snappy)}
            />
          </g>
        ))}
      </motion.g>
      <motion.g
        fill="currentColor"
        variants={{
          sun: { transition: { staggerChildren: 0 } },
          moon: { transition: { staggerChildren: stagger(0.08), delayChildren: stagger(0.22) } },
        }}
      >
        {stars.map((star) => (
          <motion.path
            key={star.x}
            d={sparkle(star)}
            variants={{
              sun: { scale: 0, opacity: 0, rotate: -90 },
              moon: { scale: 1, opacity: 1, rotate: 0 },
            }}
            transition={move(spring.bouncy)}
          />
        ))}
      </motion.g>
    </motion.svg>
  );
}

/**
 * A button that switches between light and dark, revealing the new theme from where it was pressed.
 * It uses next-themes (wrap your app in its ThemeProvider) and shows the theme you'd switch to: a moon on
 * light, a sun on dark, morphing between the two. Until the theme is known in the browser, CSS picks the
 * drawing and the label is neutral.
 */
function ThemeToggle({
  reveal = "circle",
  speed = "medium",
  variant = "outline",
  size = "icon",
  onClick,
  ...props
}: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const isDark = resolvedTheme === "dark";
  const icon = "size-(--size-icon-md)";

  return (
    <Button
      data-slot="theme-toggle"
      variant={variant}
      size={size}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Switch theme"}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        // From the pointer, or from the button's centre when it was pressed with the keyboard
        const box = event.currentTarget.getBoundingClientRect();
        const origin =
          event.detail > 0
            ? { x: event.clientX, y: event.clientY }
            : { x: box.left + box.width / 2, y: box.top + box.height / 2 };
        revealTheme({ theme: isDark ? "light" : "dark", setTheme, origin, reveal, speed });
      }}
      {...props}
    >
      <span className="grid place-items-center">
        {mounted ? (
          <SunMoon moon={!isDark} className={icon} />
        ) : (
          <>
            <SunMoon moon={false} className={cn(icon, "hidden dark:block")} />
            <SunMoon moon className={cn(icon, "dark:hidden")} />
          </>
        )}
      </span>
    </Button>
  );
}

export { revealTheme, ThemeToggle, themeReveals };
