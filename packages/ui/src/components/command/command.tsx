"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@fewtone/ui/components/dialog/dialog";
import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { SearchIcon } from "lucide-react";
import {
  type AnimationPlaybackControls,
  animate,
  type HTMLMotionProps,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  type ComponentProps,
  createContext,
  isValidElement,
  type KeyboardEvent,
  type KeyboardEventHandler,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

/*
 * Command: a composable command menu, the ⌘K palette, with shadcn's parts and no cmdk package (roadmap,
 * 2026-10-16: "⌘K search for pages and actions").
 * - Typing filters the items. Each scores its text and `keywords` against the search: an exact match, then
 *   the start of a word, then anywhere, then the letters in order ("stg" finds Settings). While searching,
 *   the best matches rise to the top of their group and groups reorder by their best item (CSS order, so
 *   React never moves a node); a group with no matches hides with its heading. Items are hidden, not unmounted.
 * - The field owns the keyboard (a combobox controlling a listbox, with aria-activedescendant): arrows move,
 *   Home and End jump, Enter runs the highlighted item's onSelect. Focus never leaves the field.
 * - Motion (.agents/rules/motion.md):
 *   - one highlight glides between rows (Select's layoutId pill, scoped per list) and jumps while typing
 *     changes the list under it
 *   - the list's height glides as results come and go: an eased tween, never a spring, clipped only while it
 *     moves, carrying on from where it is when the results change again mid-glide
 *   - the empty state comes through the blur
 *   Nothing animates on first paint. With reduced motion the highlight and the height jump and the empty
 *   state only fades.
 * - CommandDialog puts it in our Dialog, held near the top of the screen so the field stays put while the
 *   list glides, and `shortcut` opens it with ⌘ or Ctrl plus a key.
 * - CommandProvider and useCommandInput are the same machinery without the box, for Combobox.
 */

/** How well an item matches the search: 0 hides it, 1 is an exact match */
export type CommandFilter = (text: string, search: string, keywords?: string[]) => number;

/** Lower case, single spaces, trimmed */
function normalize(text: string) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/** A word starts here: the first letter, or one after a space or punctuation ("next.js", "sign-in") */
function startsWord(text: string, at: number) {
  return at === 0 || /[\s\-_/.:,()]/.test(text[at - 1] ?? "");
}

/** Whether a word in the text starts with the term */
function hasWordStarting(text: string, term: string) {
  for (let at = text.indexOf(term); at !== -1; at = text.indexOf(term, at + 1)) {
    if (startsWord(text, at)) return true;
  }
  return false;
}

/** The letters in order, the first one starting a word. Tighter runs score higher, from 0.1 to 0.3. */
function inOrder(text: string, letters: string) {
  const [head = "", ...rest] = letters;
  let best = 0;
  for (let start = text.indexOf(head); start !== -1; start = text.indexOf(head, start + 1)) {
    if (!startsWord(text, start)) continue;
    let at = start;
    for (const letter of rest) {
      at = text.indexOf(letter, at + 1);
      if (at === -1) break;
    }
    // A later start has fewer letters after it, so it can't match either
    if (at === -1) break;
    best = Math.max(best, 0.1 + 0.2 * (letters.length / (at - start + 1)));
  }
  return best;
}

/**
 * The default ranking. In order: an exact match, the text starting with the search, a later word starting
 * with it, the search anywhere in the text, the same two for keywords, every word of the search starting a
 * word, and last the search's letters in order.
 */
function commandFilter(text: string, search: string, keywords: string[] = []) {
  const query = normalize(search);
  if (!query) return 1;
  const value = normalize(text);
  if (value === query) return 1;
  if (value.startsWith(query)) return 0.9;
  if (hasWordStarting(value, query)) return 0.8;
  if (value.includes(query)) return 0.7;
  const words = keywords.map(normalize);
  if (words.some((word) => hasWordStarting(word, query))) return 0.6;
  if (words.some((word) => word.includes(query))) return 0.5;
  const terms = query.split(" ");
  const all = [value, ...words].join(" ");
  if (terms.length > 1 && terms.every((term) => hasWordStarting(all, term))) return 0.4;
  const letters = query.replaceAll(" ", "");
  return letters.length > 1 ? inOrder(value, letters) : 0;
}

/** A score as a whole number: what the item's CSS order and the keyboard both sort by */
const rankOf = (score: number) => Math.round(score * 100);

const ITEM = "[data-slot=command-item]";
const GROUP = "[data-slot=command-group]";
/** The list's padding: rows scrolled into view keep this much room from its edges */
const EDGE = 4;

type GroupState = { hidden: boolean; order?: number };

/**
 * What the list shows right now, read from the DOM (as Select does), so any markup can sit between the
 * parts: the shown items that can be picked, in the order they appear; each group's state; and how many
 * items are shown at all, disabled ones included.
 */
function readList(list: HTMLElement, ranking: boolean) {
  const shown = Array.from(list.querySelectorAll<HTMLElement>(ITEM)).filter((item) => !item.hidden);
  const scoreOf = (item: HTMLElement) => rankOf(Number(item.dataset.score) || 0);
  const best = new Map<HTMLElement, number>();
  for (const group of list.querySelectorAll<HTMLElement>(GROUP)) best.set(group, -1);
  for (const item of shown) {
    const group = item.closest<HTMLElement>(GROUP);
    if (group) best.set(group, Math.max(best.get(group) ?? -1, scoreOf(item)));
  }
  const groups: Record<string, GroupState> = {};
  for (const [group, score] of best) {
    const id = group.dataset.groupId;
    if (id) groups[id] = { hidden: score < 0, order: ranking && score >= 0 ? -score : undefined };
  }
  // The same order CSS shows: groups and loose items by their best score, then where they are; the items
  // inside a group the same way
  const first = new Map<HTMLElement, number>();
  const rows = shown.map((item, index) => {
    const group = item.closest<HTMLElement>(GROUP);
    const top = group ?? item;
    if (!first.has(top)) first.set(top, index);
    return { item, index, top, own: scoreOf(item), outer: group ? (best.get(group) ?? 0) : scoreOf(item) };
  });
  if (ranking) {
    rows.sort(
      (a, b) =>
        b.outer - a.outer ||
        (first.get(a.top) ?? 0) - (first.get(b.top) ?? 0) ||
        b.own - a.own ||
        a.index - b.index,
    );
  }
  return {
    count: shown.length,
    groups,
    items: rows.map((row) => row.item).filter((item) => item.dataset.disabled !== "true"),
  };
}

function sameGroups(a: Record<string, GroupState>, b: Record<string, GroupState>) {
  const keys = Object.keys(a);
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) => a[key]?.hidden === b[key]?.hidden && a[key]?.order === b[key]?.order)
  );
}

/** Scrolls the list just enough to show the row, and its group's heading when it's the group's first row */
function reveal(list: HTMLElement, item: HTMLElement, previous?: HTMLElement) {
  const group = item.closest<HTMLElement>(GROUP);
  const opensGroup = group && previous?.closest(GROUP) !== group;
  const top = (opensGroup ? group.offsetTop : item.offsetTop) - EDGE;
  const bottom = item.offsetTop + item.offsetHeight + EDGE;
  if (top < list.scrollTop) list.scrollTop = top;
  else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
}

/** The plain text of an item's content, for matching the search. A shortcut isn't part of its name. */
function textOf(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return node.type === CommandShortcut ? "" : textOf(node.props.children);
  }
  return "";
}

/** Who moved the highlight: the keyboard and the pointer glide it; a list that changed under it jumps it */
type Highlight = "keyboard" | "pointer" | "list";

type CommandContextValue = {
  search: string;
  setSearch: (search: string) => void;
  /** The normalised search the items match against; empty when not filtering */
  query: string;
  filter: CommandFilter;
  label?: string;
  /** The highlighted item's value */
  active: string | null;
  activeId?: string;
  highlight: (value: string | null, how: Highlight) => void;
  /** The highlight jumps instead of gliding (typing changed the list) */
  instant: boolean;
  reduce: boolean;
  empty: boolean;
  groups: Record<string, GroupState>;
  listId: string;
  list: HTMLElement | null;
  setList: (node: HTMLElement | null) => void;
  register: (id: string, select: RefObject<() => void>) => () => void;
  /** What the list's status line says: the empty state, for screen readers */
  announcement: string;
  announce: (message: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>, homeEnd: boolean) => void;
};

const CommandContext = createContext<CommandContextValue | null>(null);

function useCommand(part: string) {
  const command = useContext(CommandContext);
  if (!command) throw new Error(`${part} must be used inside Command`);
  return command;
}

export type CommandProviderProps = {
  children?: ReactNode;
  /** The highlighted item's value, when you control it */
  value?: string;
  /** The item highlighted at first; otherwise the first item */
  defaultValue?: string;
  /** Called when the highlight moves to another item */
  onValueChange?: (value: string) => void;
  /** The search, when you control it here rather than on CommandInput */
  search?: string;
  /** Called with the search as it changes */
  onSearchChange?: (search: string) => void;
  /** Scores an item against the search; 0 hides it */
  filter?: CommandFilter;
  /** Set false to filter yourself, for example results from a server */
  shouldFilter?: boolean;
  /** ArrowDown on the last item goes back to the first, and ArrowUp the other way */
  loop?: boolean;
  /** The search field's accessible name */
  label?: string;
};

/** Command's state, without the box: the search, the highlight, filtering and the keyboard */
function CommandProvider({
  children,
  value,
  defaultValue,
  onValueChange,
  search: searchProp,
  onSearchChange,
  filter = commandFilter,
  shouldFilter = true,
  loop = false,
  label,
}: CommandProviderProps) {
  const [ownSearch, setOwnSearch] = useState("");
  const [ownActive, setOwnActive] = useState<string | null>(defaultValue ?? null);
  const [instant, setInstant] = useState(false);
  const [list, setList] = useState<HTMLElement | null>(null);
  const [view, setView] = useState<{ empty: boolean; activeId?: string; groups: Record<string, GroupState> }>(
    {
      empty: false,
      groups: {},
    },
  );
  const [announcement, announce] = useState("");
  const [, setVersion] = useState(0);
  const handlers = useRef(new Map<string, RefObject<() => void>>());
  const callbacks = useRef({ onValueChange, onSearchChange });
  const listId = useId();
  const reduce = useReducedMotion() ?? false;
  const search = searchProp ?? ownSearch;
  const query = shouldFilter ? normalize(search) : "";
  const active = value !== undefined ? value || null : ownActive;
  const lastQuery = useRef(query);
  const lastList = useRef<HTMLElement | null>(null);

  // When the search changes, the highlight jumps in the same render the rows move (from typing, or a
  // controlled search)
  const [seenQuery, setSeenQuery] = useState(query);
  if (seenQuery !== query) {
    setSeenQuery(query);
    setInstant(true);
  }

  useLayoutEffect(() => {
    callbacks.current = { onValueChange, onSearchChange };
  });

  const setSearch = useCallback((next: string) => {
    setOwnSearch(next);
    callbacks.current.onSearchChange?.(next);
  }, []);

  const highlight = useCallback((next: string | null, how: Highlight) => {
    setInstant(how === "list");
    setOwnActive(next);
    if (next !== null) callbacks.current.onValueChange?.(next);
  }, []);

  // Items register their Enter handler; a new or departing item has the list read again
  const register = useCallback((id: string, select: RefObject<() => void>) => {
    handlers.current.set(id, select);
    setVersion((version) => version + 1);
    return () => {
      handlers.current.delete(id);
      setVersion((version) => version + 1);
    };
  }, []);

  // After every render, read what the list shows: which groups hide and how they're ordered, whether it's
  // empty, and which item is highlighted. A new search highlights its best match, from the top; so does a
  // list that lost the highlighted item. Runs before paint, so nothing flickers.
  useLayoutEffect(() => {
    if (!list) {
      lastList.current = null;
      return;
    }
    const { items, groups, count } = readList(list, query !== "");
    const searched = lastQuery.current !== query;
    const mounted = lastList.current !== list;
    lastQuery.current = query;
    lastList.current = list;
    const current = items.find((item) => item.dataset.value === active);
    const next = searched || !current ? items[0] : current;
    const nextValue = next?.dataset.value ?? null;
    if (searched) list.scrollTop = 0;
    // A list opening on a highlighted item (Combobox's chosen option) shows it in the middle
    else if (mounted && next) list.scrollTop = next.offsetTop - (list.clientHeight - next.offsetHeight) / 2;
    if (nextValue !== active) highlight(nextValue, "list");
    const empty = count === 0;
    setView((previous) =>
      previous.empty === empty && previous.activeId === next?.id && sameGroups(previous.groups, groups)
        ? previous
        : { empty, activeId: next?.id, groups },
    );
  });

  function onKeyDown(event: KeyboardEvent<HTMLElement>, homeEnd: boolean) {
    if (!list || event.nativeEvent.isComposing) return;
    const { items } = readList(list, query !== "");
    const index = items.findIndex((item) => item.dataset.value === active);
    const last = items.length - 1;
    let next: number | undefined;
    switch (event.key) {
      case "ArrowDown":
        next = index < 0 ? 0 : index < last ? index + 1 : loop ? 0 : last;
        break;
      case "ArrowUp":
        next = index < 0 ? last : index > 0 ? index - 1 : loop ? last : 0;
        break;
      case "Home":
        if (homeEnd) next = 0;
        break;
      case "End":
        if (homeEnd) next = last;
        break;
      case "Enter": {
        const item = items[index];
        if (!item) return;
        event.preventDefault();
        handlers.current.get(item.id)?.current();
        return;
      }
    }
    if (next === undefined) return;
    event.preventDefault();
    const item = items[next];
    if (!item || item.dataset.value === active) return;
    // Scroll first, so the highlight's glide is measured where the rows now are
    reveal(list, item, items[next - 1]);
    highlight(item.dataset.value ?? null, "keyboard");
  }

  return (
    <CommandContext.Provider
      value={{
        search,
        setSearch,
        query,
        filter,
        label,
        active,
        activeId: view.activeId,
        highlight,
        instant,
        reduce,
        empty: view.empty,
        groups: view.groups,
        listId,
        list,
        setList,
        register,
        announcement,
        announce,
        onKeyDown,
      }}
    >
      {children}
    </CommandContext.Provider>
  );
}

export type CommandProps = Omit<ComponentProps<"div">, "defaultValue"> &
  Omit<CommandProviderProps, "children">;

function Command({
  className,
  value,
  defaultValue,
  onValueChange,
  search,
  onSearchChange,
  filter,
  shouldFilter,
  loop,
  label,
  ...props
}: CommandProps) {
  return (
    <CommandProvider
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      search={search}
      onSearchChange={onSearchChange}
      filter={filter}
      shouldFilter={shouldFilter}
      loop={loop}
      label={label}
    >
      <div
        data-slot="command"
        className={cn(
          "flex w-full flex-col overflow-hidden rounded-lg bg-popover text-popover-foreground",
          className,
        )}
        {...props}
      />
    </CommandProvider>
  );
}

/**
 * The combobox wiring for a search field inside Command: its role, the list it controls, the highlighted
 * row (aria-activedescendant) and the keyboard. CommandInput uses it; Combobox puts it on its own field.
 * Your onKeyDown runs first; call event.preventDefault() to keep a key for yourself.
 */
function useCommandInput({
  onKeyDown,
  homeEnd = true,
}: {
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
  /** Home and End jump to the first and last items; false leaves them to the text */
  homeEnd?: boolean;
} = {}) {
  const command = useCommand("useCommandInput");
  return {
    role: "combobox",
    "aria-expanded": true,
    "aria-autocomplete": "list",
    "aria-controls": command.listId,
    "aria-activedescendant": command.list ? command.activeId : undefined,
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event);
      if (!event.defaultPrevented) command.onKeyDown(event, homeEnd);
    },
  } as const;
}

export type CommandInputProps = Omit<ComponentProps<"input">, "value" | "defaultValue" | "type"> & {
  /** The search, when you control it */
  value?: string;
  /** Called with the search as it changes */
  onValueChange?: (search: string) => void;
};

function CommandInput({ className, value, onValueChange, onChange, onKeyDown, ...props }: CommandInputProps) {
  const command = useCommand("CommandInput");
  const field = useCommandInput({ onKeyDown });
  const { setSearch } = command;

  // A controlled search follows the prop
  useLayoutEffect(() => {
    if (value !== undefined) setSearch(value);
  }, [value, setSearch]);

  return (
    <div
      data-slot="command-input-wrapper"
      className="flex shrink-0 items-center gap-2 border-b border-border px-3"
    >
      <SearchIcon aria-hidden className="size-(--size-icon-md) shrink-0 text-muted-foreground" />
      <input
        data-slot="command-input"
        type="text"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        aria-label={props["aria-labelledby"] ? undefined : (command.label ?? props.placeholder)}
        {...field}
        value={value ?? command.search}
        onChange={(event) => {
          onChange?.(event);
          if (value === undefined) setSearch(event.target.value);
          onValueChange?.(event.target.value);
        }}
        className={cn(
          "h-(--size-control-lg) w-full min-w-0 bg-transparent text-sm outline-hidden placeholder:text-muted-foreground",
          "disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)",
          className,
        )}
        {...props}
      />
    </div>
  );
}

/**
 * Glides `box` to the height its content needs whenever the content (`content`) changes size: the height
 * pattern, an eased tween (a spring's overshoot would bounce what's below) on the box's own min and max
 * height, clipped only while it moves. A change mid-glide carries on from where it is. Instant with reduced
 * motion, and nothing moves on first paint. Inside our Popover it stands aside, because the popover already
 * glides its own height. Shared with Combobox's field. Returns the height it's heading for while it moves.
 */
function useGlidingHeight(box: RefObject<HTMLElement | null>, content: RefObject<HTMLElement | null>) {
  const reduce = useReducedMotion() ?? false;
  const heading = useRef<number | null>(null);

  useLayoutEffect(() => {
    const outer = box.current;
    const inner = content.current;
    if (!outer || !inner || reduce || outer.closest("[data-slot=popover-content]")) return;
    // Layout pixels (offsets), so a dialog or popover scaling in doesn't count
    const natural = () => {
      const style = getComputedStyle(outer);
      const max = Number.parseFloat(style.maxHeight);
      const min = Number.parseFloat(style.minHeight) || 0;
      const height = inner.offsetHeight + outer.offsetHeight - outer.clientHeight;
      return Math.max(min, Number.isNaN(max) ? height : Math.min(height, max));
    };
    let to = outer.offsetHeight;
    let glide: AnimationPlaybackControls | undefined;
    const release = () => {
      glide = undefined;
      heading.current = null;
      outer.style.height = "";
      outer.style.overflow = "";
    };
    // ResizeObserver runs after layout and before paint, so the new size is never shown before the glide
    const observer = new ResizeObserver(() => {
      const next = natural();
      if (next === to) return;
      const from = glide ? outer.offsetHeight : to;
      glide?.stop();
      to = next;
      heading.current = next;
      outer.style.height = `${from}px`;
      outer.style.overflow = "hidden";
      glide = animate(
        outer,
        { height: [from, next] },
        { duration: duration.slow, ease: ease.out, onComplete: release },
      );
    });
    observer.observe(inner);
    return () => {
      observer.disconnect();
      glide?.stop();
      release();
    };
  }, [box, content, reduce]);

  return heading;
}

/** The soft edge shown where the list can scroll further, as on Select */
const fade =
  "pointer-events-none absolute inset-x-0 z-10 h-6 from-popover to-transparent transition-opacity duration-(--duration-fast)";

export type CommandListProps = ComponentProps<"div"> & {
  /** The list's accessible name */
  label?: string;
};

function CommandList({ className, children, label = "Results", ref, onScroll, ...props }: CommandListProps) {
  const command = useCommand("CommandList");
  const scroller = useRef<HTMLDivElement | null>(null);
  const sizer = useRef<HTMLDivElement>(null);
  const layoutGroup = useId();
  const [edges, setEdges] = useState({ top: false, bottom: false });
  const heading = useGlidingHeight(scroller, sizer);
  const { setList } = command;

  // The fades show there's more to scroll to. While the height glides, the bottom is judged by where it's
  // heading, so no fade flashes on the way.
  const updateEdges = useCallback(() => {
    const node = scroller.current;
    const inner = sizer.current;
    if (!node || !inner) return;
    const height = heading.current ?? node.clientHeight;
    const top = node.scrollTop > 1;
    const bottom = node.scrollTop + height < inner.offsetHeight - 1;
    setEdges((current) => (current.top === top && current.bottom === bottom ? current : { top, bottom }));
  }, [heading]);

  useLayoutEffect(() => {
    const node = scroller.current;
    const inner = sizer.current;
    if (!node || !inner) return;
    updateEdges();
    const observer = new ResizeObserver(updateEdges);
    observer.observe(node);
    observer.observe(inner);
    return () => observer.disconnect();
  }, [updateEdges]);

  const setRef = useCallback(
    (node: HTMLDivElement | null) => {
      scroller.current = node;
      setList(node);
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref, setList],
  );

  return (
    // Pressing anywhere in the list keeps focus in the search field (rows, the scrollbar, the empty state)
    // biome-ignore lint/a11y/noStaticElementInteractions: not an action, it only keeps focus where it is
    <div
      data-slot="command-list-frame"
      className="relative isolate flex min-h-0 flex-col"
      onMouseDown={(event) => event.preventDefault()}
    >
      <div
        aria-hidden
        className={cn(fade, "top-0 bg-linear-to-b", edges.top ? "opacity-100" : "opacity-0")}
      />
      {/* layoutScroll keeps the highlight in place while the list scrolls. Out of the tab order: the
          field moves through the rows. */}
      <motion.div
        ref={setRef}
        id={command.listId}
        role="listbox"
        aria-label={label}
        tabIndex={-1}
        layoutScroll
        data-slot="command-list"
        onScroll={(event) => {
          updateEdges();
          onScroll?.(event);
        }}
        className={cn(
          "relative max-h-72 min-h-0 overflow-y-auto overscroll-contain outline-hidden",
          className,
        )}
        {...(props as HTMLMotionProps<"div">)}
      >
        <div ref={sizer} className="flex flex-col p-1">
          <LayoutGroup id={layoutGroup}>{children}</LayoutGroup>
        </div>
      </motion.div>
      <div
        aria-hidden
        className={cn(fade, "bottom-0 bg-linear-to-t", edges.bottom ? "opacity-100" : "opacity-0")}
      />
      <span role="status" className="sr-only">
        {command.announcement}
      </span>
    </div>
  );
}

/**
 * Shown when nothing matches. It comes through the blur. Screen readers hear it from the list's status
 * line, so the message itself is hidden from them.
 */
function CommandEmpty({ className, children = "No results found.", ref, ...props }: ComponentProps<"div">) {
  const command = useCommand("CommandEmpty");
  const node = useRef<HTMLDivElement | null>(null);
  const { announce, empty: shown } = command;
  const setRef = (element: HTMLDivElement | null) => {
    node.current = element;
    if (typeof ref === "function") ref(element);
    else if (ref) ref.current = element;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: the message can change with the search
  useLayoutEffect(() => {
    announce(shown ? (node.current?.textContent ?? "") : "");
  }, [shown, command.search, announce]);
  useLayoutEffect(() => () => announce(""), [announce]);

  if (!shown) return null;
  return (
    <motion.div
      ref={setRef}
      data-slot="command-empty"
      aria-hidden
      // Only after a search: a list that starts out empty is simply there
      initial={command.search ? { opacity: 0, filter: command.reduce ? blur.shown : blur.hidden } : false}
      animate={{ opacity: 1, filter: blur.shown, transitionEnd: { filter: "none" } }}
      transition={{ duration: duration.base, ease: ease.out }}
      className={cn("py-6 text-center text-sm text-muted-foreground", className)}
      {...(props as HTMLMotionProps<"div">)}
    >
      {children}
    </motion.div>
  );
}

export type CommandGroupProps = ComponentProps<"div"> & {
  /** The group's heading, which also names it */
  heading?: ReactNode;
};

function CommandGroup({ className, heading, children, style, ...props }: CommandGroupProps) {
  const command = useCommand("CommandGroup");
  const id = useId();
  const headingId = useId();
  const state = command.groups[id];

  return (
    // biome-ignore lint/a11y/useSemanticElements: a group of options in a listbox, not form fields, so not a fieldset
    <div
      data-slot="command-group"
      data-group-id={id}
      role="group"
      aria-labelledby={heading ? headingId : undefined}
      // A group with no matches hides, heading included; while searching, the best group comes first
      hidden={state?.hidden}
      style={{ order: state?.order, ...style }}
      className={cn("flex flex-col", className)}
      {...props}
    >
      {heading ? (
        <div
          id={headingId}
          data-slot="command-group-heading"
          className="order-first px-2 py-1.5 text-xs font-medium text-muted-foreground"
        >
          {heading}
        </div>
      ) : null}
      {children}
    </div>
  );
}

export type CommandItemProps = Omit<ComponentProps<"div">, "onSelect" | "value"> & {
  /** What onSelect receives and the highlight tracks. Defaults to the item's text; keep it unique. */
  value?: string;
  /** More words the search matches, for example "preferences" for Settings */
  keywords?: string[];
  /** The text the search matches, when the content isn't plain text */
  textValue?: string;
  /** Runs on Enter or a click */
  onSelect?: (value: string) => void;
  disabled?: boolean;
  /** Always shown, whatever the search */
  forceMount?: boolean;
};

function CommandItem({
  value: valueProp,
  keywords,
  textValue,
  onSelect,
  disabled = false,
  forceMount = false,
  className,
  children,
  id,
  style,
  onPointerMove,
  onClick,
  ...props
}: CommandItemProps) {
  const command = useCommand("CommandItem");
  const fallbackId = useId();
  const itemId = id ?? fallbackId;
  const text = textValue ?? textOf(children);
  const value = (valueProp ?? text).trim();
  const score = forceMount || !command.query ? 1 : command.filter(text, command.search, keywords);
  const hidden = score <= 0;
  const active = !hidden && command.active === value;
  const select = useRef(() => {});
  const { register } = command;

  // Enter runs the latest onSelect
  useLayoutEffect(() => {
    select.current = () => {
      if (!disabled) onSelect?.(value);
    };
  });
  useLayoutEffect(() => register(itemId, select), [itemId, register]);

  return (
    // The field keeps focus and the keyboard (aria-activedescendant points here), so the row needs neither
    // biome-ignore lint/a11y/useFocusableInteractive: focus stays in the search field
    // biome-ignore lint/a11y/useKeyWithClickEvents: Enter in the search field runs it
    <div
      id={itemId}
      role="option"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      data-slot="command-item"
      data-value={value}
      data-score={score}
      data-selected={active}
      data-disabled={disabled}
      hidden={hidden}
      // While searching, CSS order puts the best matches first; ties keep their place
      style={{ order: command.query && !hidden ? -rankOf(score) : undefined, ...style }}
      onPointerMove={(event) => {
        onPointerMove?.(event);
        if (!disabled && !active && !event.defaultPrevented) command.highlight(value, "pointer");
      }}
      onClick={(event) => {
        onClick?.(event);
        if (!disabled && !event.defaultPrevented) onSelect?.(value);
      }}
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-hidden select-none",
        "data-[selected=true]:text-accent-foreground",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-(--opacity-disabled)",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--size-icon-md) [&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {/* Rows are not stacking contexts: the highlight joins the list's own layer (it's `isolate`), so it
          passes behind every row's text, whichever way it glides */}
      {active ? (
        <motion.span
          layoutId="command-highlight"
          aria-hidden
          className="absolute inset-0 -z-10 rounded-md bg-accent"
          transition={command.instant || command.reduce ? { duration: 0 } : spring.snappy}
        />
      ) : null}
      {children}
    </div>
  );
}

function CommandSeparator({
  className,
  alwaysRender = false,
  ...props
}: ComponentProps<"div"> & {
  /** Keep it while searching (it hides by default, since the matches read as one list) */
  alwaysRender?: boolean;
}) {
  const command = useCommand("CommandSeparator");
  return (
    <div
      data-slot="command-separator"
      aria-hidden
      hidden={!!command.query && !alwaysRender}
      className={cn("-mx-1 my-1 h-px shrink-0 bg-border", className)}
      {...props}
    />
  );
}

/** A keyboard shortcut at the end of an item. The search doesn't match it. */
function CommandShortcut({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("ms-auto inline-flex items-center gap-1 text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}

export type CommandDialogProps = Omit<ComponentProps<typeof Dialog>, "children"> &
  Omit<CommandProviderProps, "children"> & {
    children?: ReactNode;
    /** Names the dialog for screen readers (it isn't shown) */
    title?: string;
    /** Describes the dialog for screen readers (it isn't shown) */
    description?: string;
    /** Classes for the window */
    className?: string;
    /** Show a close button in the top corner. Escape and the backdrop close it either way. */
    showCloseButton?: boolean;
    /** Opens and closes it with ⌘ (Ctrl on Windows and Linux) plus this key, for example "k" */
    shortcut?: string;
  };

/** The palette in a Dialog. Put CommandInput and CommandList inside, as in Command. */
function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run.",
  className,
  showCloseButton = false,
  shortcut,
  open,
  defaultOpen,
  onOpenChange,
  modal,
  children,
  ...command
}: CommandDialogProps) {
  const [own, setOwn] = useState(defaultOpen ?? false);
  const current = open ?? own;
  const setOpen = useCallback(
    (next: boolean) => {
      setOwn(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (!shortcut) return;
    const key = shortcut.toLowerCase();
    function onKey(event: globalThis.KeyboardEvent) {
      // Another handler already took the key, or it's a different chord
      if (event.defaultPrevented || event.repeat || event.isComposing) return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      // Letters also match by their place on the keyboard, for layouts that type another character
      if (event.key.toLowerCase() !== key && event.code !== `Key${key.toUpperCase()}`) return;
      event.preventDefault();
      setOpen(!current);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shortcut, current, setOpen]);

  return (
    <Dialog open={current} onOpenChange={setOpen} modal={modal}>
      <DialogContent
        showCloseButton={showCloseButton}
        // Near the top rather than centred, so the field stays put while the list's height glides
        className={cn(
          "gap-0 self-start overflow-hidden bg-popover p-0 text-popover-foreground sm:mt-20",
          className,
        )}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className="rounded-none" {...command}>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandProvider,
  CommandSeparator,
  CommandShortcut,
  commandFilter,
  // Shared with Combobox
  useCommandInput,
  useGlidingHeight,
};
