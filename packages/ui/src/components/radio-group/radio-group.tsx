"use client";

import { duration, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva } from "class-variance-authority";
import {
  type AnimationPlaybackControls,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Radio Group (owner, 2026-10-15; chosen in the Lab).
 * - The selection travels: when the choice changes, the dot leaves the old radio and lands in the new one.
 *   Two ways (`travel`), both chosen by the owner:
 *   - slide (the default): straight across on spring.snappy
 *   - stretch: the front leaves first and the back follows a moment later, so it stretches into a capsule
 *     for the trip and lands round, like Switch's thumb
 * - At rest each dot sits inside its own radio, so nothing is measured until the choice changes. For a
 *   trip, one shared dot moves at the group's level, placed with offsets (layout numbers, so a zoomed or
 *   scaled preview doesn't double the movement), then hands back to the new radio's own dot in the same
 *   frame.
 * - Nothing animates on first paint. With reduced motion the dot moves at once.
 */

export type RadioGroupTravel = "slide" | "stretch";
type Size = "sm" | "md";

type GroupContextValue = {
  value: string;
  /** The radio the shared dot is on its way to; its own dot waits until it lands */
  arriving: string | null;
  size: Size;
  register: (value: string, node: HTMLElement | null) => void;
};

const GroupContext = createContext<GroupContextValue | null>(null);

const radioGroupItemVariants = cva(
  [
    "peer relative inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-input bg-transparent",
    "transition-colors duration-(--duration-fast) ease-out data-[state=checked]:border-primary data-[state=unchecked]:enabled:hover:border-ring",
    "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
    "aria-invalid:border-destructive aria-invalid:outline-destructive",
    "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
  ],
  {
    // The same sizes as Checkbox and Switch (16 and 20px)
    variants: { size: { sm: "size-4", md: "size-5" } },
    defaultVariants: { size: "md" },
  },
);

const dotSize = { sm: "size-1.5", md: "size-2" } as const;

/** A radio's centre in the group, in layout pixels (offsets, so transforms and zoom don't count) */
function centreOf(node: HTMLElement, root: HTMLElement) {
  let x = node.offsetWidth / 2;
  let y = node.offsetHeight / 2;
  let element: HTMLElement | null = node;
  while (element && element !== root) {
    x += element.offsetLeft;
    y += element.offsetTop;
    element = element.offsetParent as HTMLElement | null;
  }
  return element === root ? { x, y } : null;
}

export type RadioGroupProps = ComponentProps<typeof RadioGroupPrimitive.Root> & {
  /** 16 or 20px radios */
  size?: Size;
  /** How the dot travels to the new choice: straight across, or stretching on the way */
  travel?: RadioGroupTravel;
};

/**
 * One choice from a few, built on Radix Radio Group (role="radiogroup", arrow keys move and select).
 * Give each RadioGroupItem a visible label (`<label htmlFor>`).
 */
function RadioGroup({
  className,
  size = "md",
  travel = "slide",
  value,
  defaultValue,
  onValueChange,
  children,
  ref,
  ...props
}: RadioGroupProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue ?? "");
  const current = value ?? uncontrolled;
  const reduce = useReducedMotion() ?? false;
  const root = useRef<HTMLDivElement>(null);
  const items = useRef(new Map<string, HTMLElement>());
  const [arriving, setArriving] = useState<string | null>(null);
  // The shared dot's diameter while it travels
  const [trip, setTrip] = useState<number | null>(null);

  // The shared dot: its back end (x, y), its length along the trip (width) and the trip's angle
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const width = useMotionValue(0);
  const angle = useMotionValue(0);
  const running = useRef<AnimationPlaybackControls[]>([]);
  const tripId = useRef(0);
  const previous = useRef(current);

  // Unmounting mid-trip stops the animations
  useEffect(
    () => () => {
      for (const animation of running.current) animation.stop();
    },
    [],
  );

  // A new choice: send the shared dot from where it is (the old radio, or mid-trip) to the new radio
  // biome-ignore lint/correctness/useExhaustiveDependencies: only a change of choice starts a trip
  useLayoutEffect(() => {
    const from = previous.current;
    previous.current = current;
    if (from === current) return;

    const box = root.current;
    const start = items.current.get(from);
    const end = items.current.get(current);
    const a = box && start ? centreOf(start, box) : null;
    const b = box && end ? centreOf(end, box) : null;
    const shape = end?.querySelector<HTMLElement>("[data-slot=radio-group-indicator]");
    for (const animation of running.current) animation.stop();
    running.current = [];
    if (reduce || !a || !b || !shape) {
      setTrip(null);
      setArriving(null);
      return;
    }

    // Mid-trip, it leaves from where its front is now
    const size = shape.offsetWidth;
    const midTrip = trip !== null;
    const radians = (angle.get() * Math.PI) / 180;
    const origin = midTrip
      ? {
          x: x.get() + Math.cos(radians) * (width.get() - size),
          y: y.get() + Math.sin(radians) * (width.get() - size),
        }
      : a;
    const dx = b.x - origin.x;
    const dy = b.y - origin.y;
    const distance = Math.hypot(dx, dy);

    // Placed with jump(), not set(): set() counts the move from 0 (or the last trip) as speed, and the
    // slide's spring started with it, so the first trip overshot (owner, 2026-10-15). A slide turned
    // mid-trip keeps its speed, so it curves to the new radio smoothly.
    if (travel === "stretch" || !midTrip) {
      x.jump(origin.x);
      y.jump(origin.y);
    }
    width.jump(size);
    angle.jump((Math.atan2(dy, dx) * 180) / Math.PI);
    setTrip(size);
    setArriving(current);

    const id = ++tripId.current;
    let trips: AnimationPlaybackControls[];
    if (travel === "stretch") {
      // The front leaves first and the back follows a moment later
      const ends = { front: 0, back: 0 };
      const update = () => {
        x.set(origin.x + dx * ends.back);
        y.set(origin.y + dy * ends.back);
        width.set(size + Math.max(0, ends.front - ends.back) * distance);
      };
      trips = [
        animate(0, 1, {
          ...spring.snappy,
          onUpdate: (value) => {
            ends.front = value;
            update();
          },
        }),
        animate(0, 1, {
          ...spring.snappy,
          delay: duration.instant,
          onUpdate: (value) => {
            ends.back = value;
            update();
          },
        }),
      ];
    } else {
      trips = [animate(x, b.x, spring.snappy), animate(y, b.y, spring.snappy)];
    }
    running.current = trips;
    Promise.all(trips).then(() => {
      if (id !== tripId.current) return;
      running.current = [];
      setTrip(null);
      setArriving(null);
    });
  }, [current]);

  return (
    <GroupContext.Provider
      value={{
        value: current,
        arriving,
        size,
        register: (name, node) => {
          if (node) items.current.set(name, node);
          else items.current.delete(name);
        },
      }}
    >
      <RadioGroupPrimitive.Root
        ref={(node) => {
          root.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        data-slot="radio-group"
        value={current}
        onValueChange={(next) => {
          if (value === undefined) setUncontrolled(next);
          onValueChange?.(next);
        }}
        className={cn("relative isolate grid gap-3", className)}
        {...props}
      >
        {children}
        {trip !== null ? (
          // The shared dot: a zero-size point at its back end, turned towards the new radio, with the dot
          // (or, while stretching, the capsule) drawn out from it
          <motion.span
            aria-hidden
            data-slot="radio-group-travelling-dot"
            className="pointer-events-none absolute top-0 left-0 z-10 size-0"
            style={{ x, y, rotate: angle, originX: 0, originY: 0 }}
          >
            <motion.span
              className="absolute rounded-full bg-primary"
              style={{ left: -trip / 2, top: -trip / 2, height: trip, width }}
            />
          </motion.span>
        ) : null}
      </RadioGroupPrimitive.Root>
    </GroupContext.Provider>
  );
}

export type RadioGroupItemProps = ComponentProps<typeof RadioGroupPrimitive.Item>;

/** One radio. Its dot shows while it's chosen, except while the shared dot is still on its way. */
function RadioGroupItem({ className, value, ref, ...props }: RadioGroupItemProps) {
  const group = useContext(GroupContext);
  const size = group?.size ?? "md";
  const shown = group?.value === value && group.arriving !== value;

  return (
    <RadioGroupPrimitive.Item
      ref={(node) => {
        group?.register(value, node);
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      data-slot="radio-group-item"
      value={value}
      className={cn(radioGroupItemVariants({ size }), className)}
      {...props}
    >
      {/* Appears and goes at once, handing over to and from the shared dot */}
      <span
        aria-hidden
        data-slot="radio-group-indicator"
        className={cn(
          "pointer-events-none rounded-full bg-primary",
          dotSize[size],
          shown ? "scale-100" : "scale-0",
        )}
      />
    </RadioGroupPrimitive.Item>
  );
}

export { RadioGroup, RadioGroupItem, radioGroupItemVariants };
