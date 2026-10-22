"use client";

import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ChevronDownIcon } from "lucide-react";
import { motion, type Transition, useReducedMotion } from "motion/react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Accordion, built on Radix Accordion (roadmap, 2026-10-16: "Sections that open and close with a smooth
 * height change").
 * - Three looks (owner, 2026-10-19):
 *   - `card` (the default): one surface with Card's shadow and hairline, a quiet rule between sections
 *   - `separated`: each section is its own card, with no surface behind them (owner, 2026-10-19: no tray).
 *     An open section moves 4px further from its neighbours as it opens, so it reads as the one pulled out.
 *   - `plain`: rows and rules only, for inside a surface that's already a card (a Sheet, a Card)
 * - Hover: no underline (owner, 2026-10-19). In card and separated the question's row tints, a fill that
 *   only fades (motion.md); in every look the chevron brightens.
 * - Opening and closing run on motion (owner, 2026-10-19: "more smoother"; it was CSS keyframes before):
 *   - The height glides on spring.smooth, the preset for page sections. It's damped enough that it never
 *     visibly overshoots (about 0.1%), so the page below doesn't bounce, and it lands softly both ways. A
 *     section pressed again mid-glide turns round from where it is, keeping its speed, instead of jumping.
 *   - The answer is staged against it. Opening, the box leads and the answer follows a beat later
 *     (duration.instant), sharpening through the blur as it settles 6px down into place. Closing, the answer
 *     goes first and quickly (duration.fast), then the empty box folds.
 *   - The content is clipped only while it moves, so focus rings inside an open section aren't cut off.
 * - Closed answers stay in the page (Radix's forceMount) as hidden="until-found": find in page sees their
 *   text and opens the section, and search engines read them. React only writes a plain `hidden`, so the
 *   value is set after it.
 * - The chevron turns on spring.snappy. A span around it turns, so the icon's own transform is never
 *   replaced (motion.md's SVG pitfall).
 * - Nothing animates on first paint (initial={false}). With reduced motion everything changes at once.
 * - One section open at a time (type="single", plus `collapsible` to close it again) or several
 *   (type="multiple"). Each question is a button in a heading; arrow keys move between them.
 */

const accordionVariants = cva("", {
  variants: {
    variant: {
      card: "rounded-lg bg-card text-card-foreground shadow-sm ring-1 ring-border",
      separated: "flex flex-col gap-2",
      plain: "",
    },
  },
  defaultVariants: { variant: "card" },
});

export type AccordionVariant = NonNullable<VariantProps<typeof accordionVariants>["variant"]>;

const itemVariants = cva("group/accordion-item", {
  variants: {
    variant: {
      card: "border-b border-border last:border-b-0",
      separated: [
        "rounded-lg bg-card text-card-foreground shadow-sm ring-1 ring-border",
        // Open, it moves apart from its neighbours: the gap glides from 8 to 12px as the height does, and back
        "[transition-property:margin] duration-(--duration-slow) ease-out",
        "data-[state=open]:not-first:mt-1 data-[state=open]:not-last:mb-1",
      ],
      plain: "border-b border-border last:border-b-0",
    },
  },
  defaultVariants: { variant: "card" },
});

const triggerVariants = cva(
  [
    "group/accordion-trigger flex flex-1 cursor-pointer items-start justify-between gap-4 py-4 text-start text-sm font-medium",
    "outline-ring focus-visible:outline-(length:--focus-ring-width)",
    "disabled:pointer-events-none disabled:opacity-(--opacity-disabled)",
  ],
  {
    variants: {
      variant: {
        // The row runs edge to edge: it tints on hover, takes the card's corners at the ends, and its focus
        // ring sits inside it
        card: [
          "px-4 transition-colors duration-(--duration-fast) ease-out hover:bg-muted/50",
          "focus-visible:-outline-offset-(--focus-ring-width)",
          "group-first/accordion-item:rounded-t-lg",
          "group-last/accordion-item:group-data-[state=closed]/accordion-item:rounded-b-lg",
        ],
        separated: [
          "rounded-lg px-4 transition-colors duration-(--duration-fast) ease-out hover:bg-muted/50",
          "focus-visible:-outline-offset-(--focus-ring-width)",
          "group-data-[state=open]/accordion-item:rounded-b-none",
        ],
        plain: "rounded-md focus-visible:outline-offset-(--focus-ring-offset)",
      },
    },
    defaultVariants: { variant: "card" },
  },
);

const contentVariants = cva("pb-4 text-muted-foreground", {
  variants: {
    variant: {
      card: "px-4",
      separated: "px-4",
      plain: "",
    },
  },
  defaultVariants: { variant: "card" },
});

type AccordionContextValue = {
  /** The open sections */
  open: string[];
  reduce: boolean;
  variant: AccordionVariant;
  /** Opens a section from outside its question: a match found in the page */
  reveal: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);
const ItemContext = createContext({ value: "", open: false, disabled: false });

/** A single or multiple accordion's value, as a list */
function asList(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

export type AccordionProps = ComponentProps<typeof AccordionPrimitive.Root> & {
  /** card (one surface), separated (each section its own card) or plain (rows and rules) */
  variant?: AccordionVariant;
};

/**
 * Sections that open and close, built on Radix Accordion. Holds the open sections (controlled or not) so each
 * section knows whether it's open, and so a match found in the page can open one.
 */
function Accordion(props: AccordionProps) {
  const reduce = useReducedMotion() ?? false;
  const variant = props.variant ?? "card";
  const [internal, setInternal] = useState(() => asList(props.defaultValue));
  const open = props.value !== undefined ? asList(props.value) : internal;
  const own = {
    "data-slot": "accordion",
    "data-variant": variant,
    className: cn(accordionVariants({ variant }), props.className),
  };

  // Every change comes through here: a question pressed (through Radix) or a match found in the page
  const change = (next: string[]) => {
    setInternal(next);
    if (props.type === "multiple") props.onValueChange?.(next);
    else props.onValueChange?.(next[0] ?? "");
  };
  const reveal = (item: string) => {
    if (props.disabled || open.includes(item)) return;
    change(props.type === "multiple" ? [...open, item] : [item]);
  };

  let root: ReactNode;
  if (props.type === "multiple") {
    const {
      value: _value,
      defaultValue: _defaultValue,
      onValueChange: _change,
      variant: _variant,
      ...rest
    } = props;
    root = <AccordionPrimitive.Root {...rest} {...own} value={open} onValueChange={change} />;
  } else {
    const {
      value: _value,
      defaultValue: _defaultValue,
      onValueChange: _change,
      variant: _variant,
      ...rest
    } = props;
    root = (
      <AccordionPrimitive.Root
        {...rest}
        {...own}
        value={open[0] ?? ""}
        onValueChange={(next: string) => change(asList(next))}
      />
    );
  }

  return (
    <AccordionContext.Provider value={{ open, reduce, variant, reveal }}>{root}</AccordionContext.Provider>
  );
}

function AccordionItem({
  className,
  value,
  disabled = false,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  const accordion = useContext(AccordionContext);
  const open = accordion?.open.includes(value) ?? false;
  return (
    <ItemContext.Provider value={{ value, open, disabled }}>
      <AccordionPrimitive.Item
        data-slot="accordion-item"
        value={value}
        disabled={disabled}
        className={cn(itemVariants({ variant: accordion?.variant }), className)}
        {...props}
      />
    </ItemContext.Provider>
  );
}

/** The section's heading and the button that opens it */
function AccordionTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  const accordion = useContext(AccordionContext);
  const { open } = useContext(ItemContext);

  return (
    <AccordionPrimitive.Header data-slot="accordion-header" className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(triggerVariants({ variant: accordion?.variant }), className)}
        {...props}
      >
        {children}
        {/* Lined up with the first line of the question; it brightens while the question is hovered */}
        <motion.span
          aria-hidden
          data-slot="accordion-chevron"
          className={cn(
            "pointer-events-none mt-0.5 flex shrink-0 text-muted-foreground",
            "transition-colors duration-(--duration-fast) ease-out group-hover/accordion-trigger:text-foreground",
          )}
          initial={false}
          animate={{ rotate: open ? 180 : 0 }}
          transition={accordion?.reduce ? { duration: 0 } : spring.snappy}
        >
          <ChevronDownIcon className="size-(--size-icon-md)" />
        </motion.span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

const shown = { opacity: 1, filter: blur.shown, y: 0, transitionEnd: { filter: "none" } };
const gone = { opacity: 0, filter: blur.hidden, y: -6 };

/**
 * The section's content. `className` goes on the inner block, so padding and text styles never fight the
 * height animation.
 */
function AccordionContent({
  className,
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  const accordion = useContext(AccordionContext);
  const item = useContext(ItemContext);
  const { open } = item;
  const reveal = accordion?.reveal;
  const node = useRef<HTMLDivElement>(null);
  // Still: not gliding. Cleared in the same render as the section opens or closes, so it's clipped from the
  // first frame of the glide, and set again when the glide reaches the new state.
  const [still, setStill] = useState(true);
  const [wasOpen, setWasOpen] = useState(open);
  // Opened by find in page: the browser scrolls to the match straight away, so it opens at once
  const [instant, setInstant] = useState(false);
  if (open !== wasOpen) {
    setWasOpen(open);
    setStill(false);
  }
  const hidden = !open && still;
  const jump = (accordion?.reduce ?? false) || instant;

  const glide: Transition = jump ? { duration: 0 } : spring.smooth;
  const fade: Transition = jump
    ? { duration: 0 }
    : open
      ? { duration: duration.slow, ease: ease.out, delay: duration.instant }
      : { duration: duration.fast, ease: ease.in };

  // A plain `hidden` from React becomes "until-found", so find in page can reach the text. A disabled section
  // can't open, so it stays plainly hidden.
  useLayoutEffect(() => {
    if (hidden && !item.disabled) node.current?.setAttribute("hidden", "until-found");
  }, [hidden, item.disabled]);

  useEffect(() => {
    const element = node.current;
    if (!element || !reveal) return;
    const onMatch = () => {
      // The browser has already removed `hidden` and scrolls to the match straight after this event, so the
      // height is set by hand for that moment; motion takes over on the next frame
      element.style.height = "auto";
      setInstant(true);
      reveal(item.value);
    };
    element.addEventListener("beforematch", onMatch);
    return () => element.removeEventListener("beforematch", onMatch);
  }, [reveal, item.value]);

  return (
    <AccordionPrimitive.Content data-slot="accordion-content" {...props} hidden={hidden} forceMount asChild>
      <motion.div
        ref={node}
        className={cn("text-sm", !(open && still) && "overflow-hidden")}
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
        transition={glide}
        onAnimationComplete={(definition) => {
          // An interrupted glide reports in too: only the one that reached the current state counts
          if ((definition as { height?: unknown }).height !== (open ? "auto" : 0)) return;
          setStill(true);
          setInstant(false);
        }}
      >
        <motion.div
          className={cn(contentVariants({ variant: accordion?.variant }), className)}
          initial={false}
          animate={open ? shown : gone}
          transition={fade}
        >
          {children}
        </motion.div>
      </motion.div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger, accordionVariants };
