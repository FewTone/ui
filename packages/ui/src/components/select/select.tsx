"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Select as SelectPrimitive } from "radix-ui";
import { type ComponentProps, createContext, type ReactNode, useContext, useId, useState } from "react";

/*
 * Select, built on Radix Select (a select-only combobox: arrow keys, Home/End, typeahead, Escape).
 * Opening and closing are CSS keyframes from the trigger's side; the highlight is a pill that glides
 * between options. Radix moves focus on hover and on arrow keys, so the pill follows both.
 */

function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup(props: ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(props: ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

const triggerSizes = {
  sm: "h-(--size-control-sm) rounded-md px-2.5",
  md: "h-(--size-control-md) px-3",
} as const;

function SelectTrigger({
  className,
  size = "md",
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Trigger> & { size?: keyof typeof triggerSizes }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group flex w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-input bg-transparent text-sm whitespace-nowrap shadow-xs",
        "transition duration-(--duration-fast) ease-out",
        "data-placeholder:text-muted-foreground *:data-[slot=select-value]:truncate",
        "outline-ring focus-visible:border-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        "aria-invalid:border-destructive aria-invalid:outline-destructive",
        "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
        triggerSizes[size],
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-(--size-icon-md) shrink-0 text-muted-foreground transition-transform duration-(--duration-base) ease-out group-data-[state=open]:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

/** Which option the gliding pill sits on. It lives inside the content, so every opening starts fresh. */
const HighlightContext = createContext<{
  active: string | null;
  setActive: (value: string | null) => void;
  reduceMotion: boolean;
} | null>(null);

function SelectViewport({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const groupId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  return (
    <HighlightContext.Provider value={{ active, setActive, reduceMotion }}>
      <SelectPrimitive.Viewport asChild>
        {/* layoutScroll keeps the pill in place while the list scrolls */}
        <motion.div
          layoutScroll
          data-slot="select-viewport"
          className="w-full min-w-(--radix-select-trigger-width) scroll-my-1 p-1"
        >
          <LayoutGroup id={groupId}>{children}</LayoutGroup>
        </motion.div>
      </SelectPrimitive.Viewport>
    </HighlightContext.Provider>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          "relative isolate z-(--z-popover) max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md",
          "origin-(--radix-select-content-transform-origin) data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
          className,
        )}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectViewport>{children}</SelectViewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({ className, ...props }: ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  value,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  const highlight = useContext(HighlightContext);
  const active = highlight?.active === value;
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      value={value}
      onFocus={(event) => {
        highlight?.setActive(value);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        // Moving to another option keeps the pill (it glides); leaving the list clears it
        const next = event.relatedTarget;
        if (!(next instanceof HTMLElement && next.closest("[data-slot=select-item]")))
          highlight?.setActive(null);
        onBlur?.(event);
      }}
      className={cn(
        "relative flex w-full cursor-default items-center gap-2 rounded-md py-1.5 ps-2 pe-8 text-sm outline-hidden select-none",
        "data-highlighted:text-accent-foreground",
        "data-disabled:pointer-events-none data-disabled:opacity-(--opacity-disabled)",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--size-icon-md)",
        className,
      )}
      {...props}
    >
      {/* Options are not stacking contexts: the pill joins the list's own layer (the content is `isolate`),
          so it passes behind every option's text, whichever way it glides */}
      {active ? (
        <motion.span
          layoutId="select-highlight"
          aria-hidden
          className="absolute inset-0 -z-10 rounded-md bg-accent"
          transition={highlight?.reduceMotion ? { duration: 0 } : spring.snappy}
        />
      ) : null}
      <span className="absolute end-2 flex size-(--size-icon-md) items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-(--size-icon-sm)" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({ className, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn("flex cursor-default items-center justify-center py-1 text-muted-foreground", className)}
      {...props}
    >
      <ChevronUpIcon className="size-(--size-icon-sm)" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn("flex cursor-default items-center justify-center py-1 text-muted-foreground", className)}
      {...props}
    >
      <ChevronDownIcon className="size-(--size-icon-sm)" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
