"use client";

import { duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { cva } from "class-variance-authority";
import { ChevronRightIcon } from "lucide-react";
import { type HTMLMotionProps, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { DropdownMenu as DropdownMenuPrimitive, Slot } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  type FocusEvent,
  type FocusEventHandler,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

/*
 * Dropdown Menu, built on Radix Dropdown Menu (the WAI-ARIA menu button: arrow keys, Home/End, typeahead,
 * sub-menus on the arrow keys, Escape). Context Menu builds on the pieces exported at the end, so the two
 * menus look and move the same.
 * - The surface is Select's: the same border, shadow and keyframes, opening from the trigger and closing back
 *   into it through the blur.
 * - One highlight glides between the items of each menu level (Select's layoutId pill, on spring.snappy).
 *   Radix focuses items on hover and on arrow keys, so it follows both. When the pointer leaves for a label, a
 *   separator or outside the menu, it fades out where it was. Back on a row while it's still fading, it glides
 *   on from there; once it's gone, it fades in at the new row instead of flying over from the old one.
 * - A menu and its sub-menus share that one highlight: it stays on a sub-menu's trigger while its sub-menu is
 *   open, then travels across into the sub-menu's row (and back), never a second one. The chevron nudges towards it.
 * - On a destructive item the highlight takes a red tint, which fades in and out as it glides.
 * - Checkbox items draw their check in and erase it backwards (Checkbox's motion); radio items grow their dot.
 *   Both marks sit at the end of the row, as in Select, so labels line up with plain items.
 * - With reduced motion the highlight jumps and the marks appear at once.
 */

type Tone = "default" | "destructive";

type Highlight = {
  /** The row the highlight sits in, or null when there's none */
  row: string | null;
  /** False while it fades out in the row it was last in */
  shown: boolean;
  /** The row's tone, and the tone of the row it came from, so the red tint fades rather than snaps */
  tone: Tone;
  from: Tone;
  /**
   * Counts appearances from nothing. Each one has its own layoutId, so the highlight fades in where it appears
   * rather than gliding over from where it last faded out.
   */
  appearance: number;
  /** The first row of an appearance fades the highlight in; the rows after it glide it */
  fresh: boolean;
};

type Level = {
  highlight: Highlight;
  take: (row: string, tone: Tone) => void;
  release: (row: string) => void;
  /** The fade-out has finished: remove the highlight */
  settle: () => void;
  /** The row is gone: remove its highlight without a fade */
  drop: (row: string) => void;
  reduce: boolean;
};

const LevelContext = createContext<Level | null>(null);

/**
 * One menu level (the menu, or a sub-menu) and its one highlight. It lives inside the content, which Radix
 * remounts on every opening, so each opening starts clean.
 */
function MenuLevel({ children }: { children: ReactNode }) {
  const parent = useContext(LevelContext);
  const groupId = useId();
  const reduce = useReducedMotion() ?? false;
  const [highlight, setHighlight] = useState<Highlight>({
    row: null,
    shown: false,
    tone: "default",
    from: "default",
    appearance: 0,
    fresh: false,
  });

  const take = useCallback((row: string, tone: Tone) => {
    setHighlight((current) => {
      if (current.row === row && current.shown && current.tone === tone) return current;
      const appears = current.row === null;
      return {
        row,
        shown: true,
        tone,
        from: appears ? tone : current.tone,
        appearance: current.appearance + (appears ? 1 : 0),
        fresh: appears,
      };
    });
  }, []);

  const release = useCallback(
    (row: string) => {
      setHighlight((current) => {
        if (current.row !== row) return current;
        // With reduced motion there's no fade to wait for
        if (reduce) return { ...current, row: null, shown: false };
        return current.shown ? { ...current, shown: false } : current;
      });
    },
    [reduce],
  );

  const settle = useCallback(() => {
    setHighlight((current) => (current.shown ? current : { ...current, row: null }));
  }, []);

  // A row that unmounts (a sub-menu that closed) while it holds the highlight takes it away at once: its
  // fade-out would never finish, and the next row would glide in from a highlight that no longer exists
  const drop = useCallback((row: string) => {
    setHighlight((current) => (current.row === row ? { ...current, row: null, shown: false } : current));
  }, []);

  const level = useMemo(
    () => ({ highlight, take, release, settle, drop, reduce }),
    [highlight, take, release, settle, drop, reduce],
  );

  // A sub-menu joins its parent's level instead of starting its own: the menu has one highlight, so moving
  // from a trigger into its sub-menu carries the same highlight across, and the trigger doesn't keep another
  if (parent) return <>{children}</>;

  return (
    <LevelContext.Provider value={level}>
      <LayoutGroup id={groupId}>{children}</LayoutGroup>
    </LevelContext.Provider>
  );
}

/**
 * The highlight, inside the row that has it. Rows are not stacking contexts: it joins the surface's own layer
 * (the surface is `isolate`), so it passes behind every row's text, whichever way it glides.
 */
function MenuHighlight({ row }: { row: string }) {
  const level = useContext(LevelContext);
  if (!level || level.highlight.row !== row) return null;
  const { highlight, reduce, settle } = level;
  const fade = reduce ? { duration: 0 } : { duration: duration.fast, ease: ease.out };
  // Two fills, so the red tint crossfades with the neutral one instead of snapping as the highlight leaves
  const fill = (tone: Tone) => ({
    initial: { opacity: highlight.from === tone ? 1 : 0 },
    animate: { opacity: highlight.tone === tone ? 1 : 0 },
    transition: fade,
  });

  return (
    <motion.span
      layoutId={`menu-highlight-${highlight.appearance}`}
      data-slot="menu-highlight"
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-md"
      initial={highlight.fresh ? { opacity: 0 } : false}
      animate={{ opacity: highlight.shown ? 1 : 0 }}
      transition={reduce ? { duration: 0 } : { ...spring.snappy, opacity: fade }}
      onAnimationComplete={() => {
        if (!highlight.shown) settle();
      }}
    >
      <motion.span className="absolute inset-0 bg-accent" {...fill("default")} />
      <motion.span
        className="absolute inset-0 bg-destructive/10 dark:bg-destructive/20"
        {...fill("destructive")}
      />
    </motion.span>
  );
}

/**
 * Connects a row to its level's highlight: the row takes it when Radix focuses it (hover or arrow keys) and
 * lets go when focus leaves the level's rows. `keep` holds on to it: a sub-menu's trigger while its sub-menu
 * is open.
 */
function useMenuRow({
  tone = "default",
  keep = false,
  onFocus,
  onBlur,
}: {
  tone?: Tone;
  keep?: boolean;
  onFocus?: FocusEventHandler<HTMLDivElement>;
  onBlur?: FocusEventHandler<HTMLDivElement>;
}) {
  const level = useContext(LevelContext);
  const row = useId();
  const focused = useRef(false);
  const release = level?.release;
  const drop = level?.drop;

  // A sub-menu that closes while its trigger doesn't have focus (the pointer left for the menu's edge) lets go
  useEffect(() => {
    if (!keep && !focused.current) release?.(row);
  }, [keep, release, row]);

  useEffect(() => () => drop?.(row), [drop, row]);

  return {
    onFocus: (event: FocusEvent<HTMLDivElement>) => {
      focused.current = true;
      level?.take(row, tone);
      onFocus?.(event);
    },
    onBlur: (event: FocusEvent<HTMLDivElement>) => {
      focused.current = false;
      // Moving to another row, of this menu or its sub-menu: that row takes the highlight, so it glides instead of fading
      const next = event.relatedTarget;
      const toRow =
        next instanceof Element && next.matches("[role^=menuitem]") && next.closest("[role=menu]");
      if (!toRow && !keep) level?.release(row);
      onBlur?.(event);
    },
    highlight: <MenuHighlight row={row} />,
  };
}

/** Whether the nearest sub-menu is open, for its trigger */
const MenuSubContext = createContext(false);

/** A sub-menu's open state, controlled or not, so its trigger knows to keep the highlight while it's open */
function useMenuSub({
  open,
  defaultOpen = false,
  onOpenChange,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const current = open ?? uncontrolled;
  return {
    open: current,
    onOpenChange: (next: boolean) => {
      if (open === undefined) setUncontrolled(next);
      onOpenChange?.(next);
    },
  };
}

/** The same check as Checkbox, Copy Button and Loading Button, and a dash for indeterminate */
const CHECK = "M5 12.5l4.5 4.5L19 7.5";
const DASH = "M7 12h10";

/** A mark that draws itself in and erases the way it came. Its opacity goes with it, so a round cap never leaves a dot. */
function Mark({ d, shown, reduce }: { d: string; shown: boolean; reduce: boolean }) {
  return (
    <motion.path
      d={d}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={false}
      animate={{ pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
      transition={
        reduce
          ? { duration: 0 }
          : shown
            ? { pathLength: { duration: duration.base, ease: ease.out }, opacity: { duration: 0 } }
            : { duration: duration.fast, ease: ease.in }
      }
    />
  );
}

/** A checkbox item's mark. Nothing draws when a menu opens; only a change does. */
function MenuCheck({ checked }: { checked?: boolean | "indeterminate" }) {
  const reduce = useContext(LevelContext)?.reduce ?? false;
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="size-(--size-icon-md) text-current">
      <Mark d={CHECK} shown={checked === true} reduce={reduce} />
      <Mark d={DASH} shown={checked === "indeterminate"} reduce={reduce} />
    </svg>
  );
}

/** The class names both menus share */
const menuClasses = {
  // Select's floating surface. Each menu adds Radix's transform origin and available height for its own type.
  surface:
    "relative isolate z-(--z-popover) min-w-32 overflow-x-hidden overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md outline-hidden data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
  label: "px-2 py-1.5 text-xs text-muted-foreground data-inset:ps-8",
  separator: "pointer-events-none -mx-1 my-1 h-px bg-border",
  shortcut: "ms-auto ps-4 text-xs text-muted-foreground",
  // Checkbox and radio items leave room at the end for their mark, like Select's options
  choice: "pe-8",
  indicator: "pointer-events-none absolute end-2 flex size-(--size-icon-md) items-center justify-center",
  // A fill, so it only fades (no blur) as it grows in from half size
  dot: "size-2 rounded-full bg-current transition duration-(--duration-fast) ease-out data-[state=unchecked]:scale-50 data-[state=unchecked]:opacity-0",
  subTrigger: "group/menu-sub-trigger data-[state=open]:text-accent-foreground",
  // The chevron nudges towards the sub-menu while it's open
  chevron:
    "ms-auto transition-transform duration-(--duration-fast) ease-out group-data-[state=open]/menu-sub-trigger:translate-x-0.5 rtl:rotate-180 rtl:group-data-[state=open]/menu-sub-trigger:-translate-x-0.5",
};

const menuItemVariants = cva(
  [
    "relative flex cursor-default items-center gap-2 rounded-md py-1.5 ps-2 pe-2 text-sm outline-hidden select-none data-inset:ps-8",
    "data-highlighted:text-accent-foreground",
    "data-disabled:pointer-events-none data-disabled:opacity-(--opacity-disabled)",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--size-icon-md) [&_svg:not([class*='text-'])]:text-muted-foreground",
  ],
  {
    variants: {
      variant: {
        default: "",
        destructive:
          "text-destructive data-highlighted:text-destructive [&_svg:not([class*='text-'])]:text-destructive",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

/**
 * The floating surface of a menu or sub-menu, and its level of the highlight. Radix renders it through
 * `asChild`, so the surface is the motion element itself: with layoutScroll the highlight stays true while a
 * long menu scrolls.
 */
function MenuSurface({
  className,
  children,
  ...props
}: Omit<HTMLMotionProps<"div">, "children"> & { children?: ReactNode }) {
  return (
    <motion.div layoutScroll className={cn(menuClasses.surface, className)} {...props}>
      <MenuLevel>{children}</MenuLevel>
    </motion.div>
  );
}

function DropdownMenu(props: ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}

function DropdownMenuPortal(props: ComponentProps<typeof DropdownMenuPrimitive.Portal>) {
  return <DropdownMenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />;
}

function DropdownMenuTrigger(props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) {
  return <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />;
}

function DropdownMenuContent({
  className,
  sideOffset = 4,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        {...props}
        asChild
      >
        <MenuSurface
          className={cn(
            "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin)",
            className,
          )}
        >
          {children}
        </MenuSurface>
      </DropdownMenuPrimitive.Content>
    </DropdownMenuPrimitive.Portal>
  );
}

function DropdownMenuGroup(props: ComponentProps<typeof DropdownMenuPrimitive.Group>) {
  return <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />;
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Label> & { inset?: boolean }) {
  return (
    <DropdownMenuPrimitive.Label
      data-slot="dropdown-menu-label"
      data-inset={inset || undefined}
      className={cn(menuClasses.label, className)}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  children,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & {
  /** Lines the label up with items that start with an icon */
  inset?: boolean;
  /** Destructive is red, and tints the highlight red as it lands */
  variant?: Tone;
}) {
  const row = useMenuRow({ tone: variant, onFocus, onBlur });
  return (
    <DropdownMenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset || undefined}
      data-variant={variant}
      className={cn(menuItemVariants({ variant }), className)}
      onFocus={row.onFocus}
      onBlur={row.onBlur}
      {...props}
    >
      {row.highlight}
      {/* With asChild the child (a link) becomes the item and the highlight goes inside it */}
      <Slot.Slottable>{children}</Slot.Slottable>
    </DropdownMenuPrimitive.Item>
  );
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem>) {
  const row = useMenuRow({ onFocus, onBlur });
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      checked={checked}
      className={cn(menuItemVariants(), menuClasses.choice, className)}
      onFocus={row.onFocus}
      onBlur={row.onBlur}
      {...props}
    >
      {row.highlight}
      <span className={menuClasses.indicator}>
        <MenuCheck checked={checked} />
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
}

function DropdownMenuRadioGroup(props: ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) {
  return <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />;
}

function DropdownMenuRadioItem({
  className,
  children,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  const row = useMenuRow({ onFocus, onBlur });
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      className={cn(menuItemVariants(), menuClasses.choice, className)}
      onFocus={row.onFocus}
      onBlur={row.onBlur}
      {...props}
    >
      {row.highlight}
      <span className={menuClasses.indicator}>
        {/* Always mounted, so the dot can grow in and shrink away rather than appear */}
        <DropdownMenuPrimitive.ItemIndicator forceMount className={menuClasses.dot} />
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
}

function DropdownMenuSeparator({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(menuClasses.separator, className)}
      {...props}
    />
  );
}

/** A shortcut hint at the end of an item. It only shows the keys; binding them is up to you. */
function DropdownMenuShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span data-slot="dropdown-menu-shortcut" className={cn(menuClasses.shortcut, className)} {...props} />
  );
}

function DropdownMenuSub({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
  const sub = useMenuSub({ open, defaultOpen, onOpenChange });
  return (
    <MenuSubContext.Provider value={sub.open}>
      <DropdownMenuPrimitive.Sub
        data-slot="dropdown-menu-sub"
        open={sub.open}
        onOpenChange={sub.onOpenChange}
        {...props}
      />
    </MenuSubContext.Provider>
  );
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger> & { inset?: boolean }) {
  const open = useContext(MenuSubContext);
  const row = useMenuRow({ keep: open, onFocus, onBlur });
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset || undefined}
      className={cn(menuItemVariants(), menuClasses.subTrigger, className)}
      onFocus={row.onFocus}
      onBlur={row.onBlur}
      {...props}
    >
      {row.highlight}
      {children}
      <ChevronRightIcon aria-hidden className={menuClasses.chevron} />
    </DropdownMenuPrimitive.SubTrigger>
  );
}

function DropdownMenuSubContent({
  className,
  sideOffset = 4,
  // The surface's padding and border, so the sub-menu's first item lines up with its trigger
  alignOffset = -5,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    // In a portal, so the menu's own scrolling and its keyframes' transform can't clip or carry it
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        {...props}
        asChild
      >
        <MenuSurface
          className={cn(
            "max-h-(--radix-dropdown-menu-content-available-height) origin-(--radix-dropdown-menu-content-transform-origin) shadow-lg",
            className,
          )}
        >
          {children}
        </MenuSurface>
      </DropdownMenuPrimitive.SubContent>
    </DropdownMenuPrimitive.Portal>
  );
}

// The pieces Context Menu builds on (context-menu.tsx), so the two menus never drift apart
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuCheck,
  MenuSubContext,
  MenuSurface,
  menuClasses,
  menuItemVariants,
  useMenuRow,
  useMenuSub,
};
