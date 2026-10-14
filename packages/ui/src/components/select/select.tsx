"use client";

import { spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { CheckIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Select as SelectPrimitive } from "radix-ui";
import {
  type ComponentProps,
  createContext,
  isValidElement,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Select, built on Radix Select (a select-only combobox: arrow keys, Home/End, typeahead, Escape).
 * - Opening and closing are CSS keyframes from the trigger's side.
 * - The highlight is a pill that glides between options. Radix moves focus on hover and on arrow keys, so
 *   the pill follows both.
 * - Long lists scroll natively, capped at 18rem. Soft fades at the ends show there's more; they replace
 *   Radix's scroll arrows (owner, 2026-10-14).
 * - `searchable` adds a search field above the list (owner, 2026-10-14):
 *   - Typing filters the options. Hidden options stay mounted, so the trigger keeps showing the selected value.
 *   - The keyboard stays in the field: arrow keys move the pill through the matches, and Enter picks the
 *     highlighted one.
 *   - Typing after hovering an option goes back to the field.
 *   - The popup becomes a dialog holding the field and a listbox, with aria-activedescendant on the field.
 */

/** The plain text of an option's content, for matching the search */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return textOf(node.props.children);
  return "";
}

function Select(props: ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup({ className, ...props }: ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      // A group whose options are all filtered out by the search hides, label included
      className={cn("[&:not(:has([data-slot=select-item]:not([hidden])))]:hidden", className)}
      {...props}
    />
  );
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
        "group flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-input bg-transparent text-sm whitespace-nowrap shadow-xs",
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

/** Shared by the options of one opening: where the pill sits, and the search. It lives inside the content,
 * so every opening starts fresh. */
const ListContext = createContext<{
  active: string | null;
  setActive: (value: string | null | ((current: string | null) => string | null)) => void;
  reduceMotion: boolean;
  searchable: boolean;
  /** The search, trimmed and lower-cased; empty without a search field or before typing */
  query: string;
} | null>(null);

/** The soft edge shown where the list can scroll further (it replaces Radix's scroll arrows) */
const fade =
  "pointer-events-none absolute inset-x-0 z-10 h-6 from-popover to-transparent transition-opacity duration-(--duration-fast)";

type SearchOptions = {
  searchable: boolean;
  searchPlaceholder: string;
  emptyMessage: ReactNode | ((search: string) => ReactNode);
};

function SelectList({
  children,
  searchable,
  searchPlaceholder,
  emptyMessage,
}: SearchOptions & { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string>();
  const [search, setSearch] = useState("");
  const [empty, setEmpty] = useState(false);
  const [edges, setEdges] = useState({ top: false, bottom: false });
  const viewport = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const groupId = useId();
  const listId = useId();
  const reduceMotion = useReducedMotion() ?? false;
  const query = searchable ? search.trim().toLowerCase() : "";

  /** The options that can be picked right now: shown and enabled, in order */
  const options = useCallback(
    () =>
      Array.from(viewport.current?.querySelectorAll<HTMLElement>("[data-slot=select-item]") ?? []).filter(
        (option) => !option.hidden && !option.hasAttribute("data-disabled"),
      ),
    [],
  );

  // The fades at the ends show there's more to scroll to. The list's end is its last shown child:
  // scrollHeight would also count the highlight while it glides, and leave a fade on after it stops.
  const updateEdges = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const shown = Array.from(node.children).filter(
      (child): child is HTMLElement => child instanceof HTMLElement && child.offsetParent !== null,
    );
    const last = shown[shown.length - 1];
    const end = last ? last.offsetTop + last.offsetHeight : 0;
    const top = node.scrollTop > 1;
    const bottom = node.scrollTop + node.clientHeight < end - 1;
    setEdges((current) => (current.top === top && current.bottom === bottom ? current : { top, bottom }));
  }, []);

  useLayoutEffect(() => {
    const node = viewport.current;
    if (!node) return;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(node);
    return () => observer.disconnect();
  }, [updateEdges]);

  // Opening, the selected option sits in the middle of the list rather than at its edge under a fade.
  // Radix scrolls it just into view when it first takes focus; centre it on the next frame.
  useEffect(() => {
    const node = viewport.current;
    const content = node?.closest<HTMLElement>("[data-slot=select-content]");
    if (!node || !content) return;
    const centre = () =>
      requestAnimationFrame(() => {
        const selected = node.querySelector<HTMLElement>("[data-slot=select-item][data-state=checked]");
        if (selected && !selected.hidden)
          node.scrollTop = selected.offsetTop - (node.clientHeight - selected.offsetHeight) / 2;
        updateEdges();
      });
    content.addEventListener("focusin", centre, { once: true });
    return () => content.removeEventListener("focusin", centre);
  }, [updateEdges]);

  // Each search starts at the top, with the first match highlighted for Enter
  useLayoutEffect(() => {
    if (!searchable) return;
    const matches = options();
    setEmpty(matches.length === 0);
    if (query) {
      if (viewport.current) viewport.current.scrollTop = 0;
      setActive(matches[0]?.dataset.value ?? null);
    }
    updateEdges();
  }, [query, searchable, options, updateEdges]);

  // The field points screen readers at the highlighted option
  useLayoutEffect(() => {
    setActiveId(options().find((option) => option.dataset.value === active)?.id);
  }, [active, options]);

  // Keep the keyboard in the field. Radix first focuses the selected option (or the list), and focuses the
  // list again when the pointer leaves an option. Typing while an option has focus (after hovering) goes to
  // the field too, instead of Radix's typeahead.
  useEffect(() => {
    const input = field.current;
    const content = input?.closest<HTMLElement>("[data-slot=select-content]");
    if (!searchable || !input || !content) return;
    let first = true;
    const onFocusIn = (event: FocusEvent) => {
      if (event.target === input) return;
      if (first || event.target === content) {
        first = false;
        input.focus({ preventScroll: true });
      }
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.target === input || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.key.length === 1 || event.key === "Backspace") {
        event.stopPropagation();
        input.focus({ preventScroll: true });
      }
    };
    content.addEventListener("focusin", onFocusIn);
    content.addEventListener("keydown", onKeyDown, true);
    return () => {
      content.removeEventListener("focusin", onFocusIn);
      content.removeEventListener("keydown", onKeyDown, true);
    };
  }, [searchable]);

  function onFieldKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      const matches = options();
      if (matches.length === 0) return;
      const index = matches.findIndex((option) => option.dataset.value === active);
      const next =
        index < 0
          ? 0
          : event.key === "ArrowDown"
            ? Math.min(index + 1, matches.length - 1)
            : Math.max(index - 1, 0);
      const option = matches[next];
      setActive(option?.dataset.value ?? null);
      option?.scrollIntoView({ block: "nearest" });
    } else if (event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      const matches = options();
      const option = matches.find((match) => match.dataset.value === active) ?? matches[0];
      // Radix picks an option when the option itself receives Enter
      option?.dispatchEvent(new globalThis.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    } else if (event.key !== "Escape" && event.key !== "Tab") {
      // Typing, Space, Home and End stay in the field rather than driving Radix's typeahead and list keys
      event.stopPropagation();
    }
  }

  return (
    <ListContext.Provider value={{ active, setActive, reduceMotion, searchable, query }}>
      {searchable ? (
        <div
          data-slot="select-search"
          className="relative flex items-center gap-2 border-b border-border px-3"
        >
          <SearchIcon aria-hidden className="size-(--size-icon-sm) shrink-0 text-muted-foreground" />
          <input
            ref={field}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeId}
            aria-label={searchPlaceholder}
            placeholder={searchPlaceholder}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={onFieldKeyDown}
            onFocus={() => {
              // Highlight something Enter can pick: what's already highlighted, else the selected option or the first
              const matches = options();
              setActive((current) =>
                current && matches.some((option) => option.dataset.value === current)
                  ? current
                  : ((matches.find((option) => option.dataset.state === "checked") ?? matches[0])?.dataset
                      .value ?? null),
              );
            }}
            autoComplete="off"
            spellCheck={false}
            className="h-(--size-control-md) w-full min-w-0 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground"
          />
          {/* The top fade hangs just below the field, over the list */}
          <div
            aria-hidden
            className={cn(fade, "top-full bg-linear-to-b", edges.top ? "opacity-100" : "opacity-0")}
          />
        </div>
      ) : (
        <div
          aria-hidden
          className={cn(fade, "top-0 bg-linear-to-b", edges.top ? "opacity-100" : "opacity-0")}
        />
      )}
      <SelectPrimitive.Viewport
        asChild
        {...(searchable ? { role: "listbox", id: listId, "aria-label": "Options" } : {})}
      >
        {/* layoutScroll keeps the pill in place while the list scrolls */}
        <motion.div
          ref={viewport}
          layoutScroll
          onScroll={updateEdges}
          data-slot="select-viewport"
          className="max-h-72 w-full min-w-(--radix-select-trigger-width) scroll-my-1 p-1"
        >
          <LayoutGroup id={groupId}>{children}</LayoutGroup>
        </motion.div>
      </SelectPrimitive.Viewport>
      {/* The bottom fade lies over the popup's bottom edge, outside the list, so it never adds scroll height */}
      <div
        aria-hidden
        className={cn(fade, "bottom-0 bg-linear-to-t", edges.bottom ? "opacity-100" : "opacity-0")}
      />
      {searchable && empty ? (
        <p className="px-3 py-6 text-center text-sm text-muted-foreground">
          {typeof emptyMessage === "function" ? emptyMessage(search.trim()) : emptyMessage}
        </p>
      ) : null}
    </ListContext.Provider>
  );
}

export type SelectContentProps = ComponentProps<typeof SelectPrimitive.Content> & {
  /** Adds a search field above the options, for long lists */
  searchable?: boolean;
  /** The search field's placeholder and accessible name */
  searchPlaceholder?: string;
  /** Shown when nothing matches; a function receives the search */
  emptyMessage?: ReactNode | ((search: string) => ReactNode);
};

function SelectContent({
  className,
  children,
  position = "popper",
  sideOffset = 4,
  searchable = false,
  searchPlaceholder = "Search…",
  emptyMessage = (search: string) => `No results for “${search}”`,
  ...props
}: SelectContentProps) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        // With a search field the popup holds a field and a list, so it's a dialog and the list is the listbox
        {...(searchable ? { role: "dialog", "aria-label": searchPlaceholder } : {})}
        className={cn(
          "relative isolate z-(--z-popover) max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md",
          "origin-(--radix-select-content-transform-origin) data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out",
          className,
        )}
        {...props}
      >
        <SelectList searchable={searchable} searchPlaceholder={searchPlaceholder} emptyMessage={emptyMessage}>
          {children}
        </SelectList>
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
  textValue,
  id,
  onFocus,
  onBlur,
  ...props
}: ComponentProps<typeof SelectPrimitive.Item>) {
  const list = useContext(ListContext);
  const fallbackId = useId();
  const active = list?.active === value;
  // Hidden rather than removed when it doesn't match, so the trigger keeps the selected option's text
  const hidden = !!list?.query && !(textValue ?? textOf(children)).toLowerCase().includes(list.query);

  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      data-value={value}
      id={id ?? fallbackId}
      value={value}
      textValue={textValue}
      hidden={hidden}
      onFocus={(event) => {
        list?.setActive(value);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        // Moving to another option keeps the pill (it glides); leaving the list clears it. With a search
        // field the pill stays on the last option, so Enter still knows what to pick.
        const next = event.relatedTarget;
        if (!list?.searchable && !(next instanceof HTMLElement && next.closest("[data-slot=select-item]")))
          list?.setActive(null);
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
          transition={list?.reduceMotion ? { duration: 0 } : spring.snappy}
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
  const list = useContext(ListContext);
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      // Groups are what the separators divide; while searching, the matches read as one list
      hidden={!!list?.query}
      className={cn("pointer-events-none -mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
