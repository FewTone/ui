"use client";

import { blur, duration, ease, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import {
  ComponentIcon,
  CornerDownLeftIcon,
  FileTextIcon,
  LayoutGridIcon,
  SearchIcon,
  SearchXIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import {
  Fragment,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { RowIndicator, useRowBox } from "@/components/motion/row-indicator";
import type { SearchEntry } from "@/lib/nav";
import { Kbd } from "./kbd";

/*
 * Site search (owner, 2026-10-13): ⌘K / Ctrl+K / "/" over the guides and every item. The index is small and
 * ships with the page.
 *
 * - The header button reads as a search field: icon, prompt, and the shortcut as key caps (⌘ K on a Mac,
 *   Ctrl K elsewhere), all on one centre line. On phones it's just the icon.
 * - The window springs open and fades out quickly (motion, inside Radix Dialog for focus and scroll).
 * - Results: an icon tile per kind of page, the match emphasised, ranked (titles starting with the search,
 *   then titles containing it, then descriptions). A highlight glides to the active row, and its Enter
 *   arrow slides in.
 */

const noop = () => () => {};
/** Mac or not, read on the client; the server assumes a Mac and the client corrects it after hydration */
function useIsMac() {
  return useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
    () => true,
  );
}

/** 0: the title starts with the search · 1: the title contains it · 2: the group or description does · -1: no match */
function rank(entry: SearchEntry, query: string) {
  const title = entry.title.toLowerCase();
  if (title.startsWith(query)) return 0;
  if (title.includes(query)) return 1;
  if (`${entry.group} ${entry.description}`.toLowerCase().includes(query)) return 2;
  return -1;
}

/** The title, with the part that matches the search underlined */
function Highlight({ text, query }: { text: string; query: string }) {
  const at = query ? text.toLowerCase().indexOf(query) : -1;
  if (at < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, at)}
      <mark className="bg-transparent text-foreground underline decoration-foreground/40 underline-offset-2">
        {text.slice(at, at + query.length)}
      </mark>
      {text.slice(at + query.length)}
    </>
  );
}

/** Which tile icon a result gets: a guide page, a kind's full list, or an item */
function EntryIcon({ entry }: { entry: SearchEntry }) {
  const Icon =
    entry.group === "Getting started"
      ? FileTextIcon
      : entry.title.startsWith("All ")
        ? LayoutGridIcon
        : ComponentIcon;
  return <Icon className="size-(--size-icon-md)" aria-hidden />;
}

function Hint({ keys, children }: { keys: ReactNode[]; children: ReactNode }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {keys.map((key, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: a fixed list of key caps
          <Kbd key={index}>{key}</Kbd>
        ))}
      </span>
      {children}
    </span>
  );
}

export function CommandMenu({ entries }: { entries: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const listId = useId();
  const isMac = useIsMac();
  // The active row has a gliding highlight; it jumps instead while typing changes the results
  const list = useRef<HTMLDivElement>(null);
  const options = useRef<(HTMLDivElement | null)[]>([]);
  const [activeOption, setActiveOption] = useState<HTMLElement | null>(null);
  const [typing, setTyping] = useState(false);
  const activeBox = useRowBox(list, activeOption);
  // The window and the Enter arrow come and go through the blur; the full-screen overlay only fades, and
  // with reduced motion everything only fades
  const blurred = useReducedMotion() ? blur.shown : blur.hidden;

  const q = query.trim().toLowerCase();
  // No search: everything, grouped. A search: the matches, best first, without groups
  const results = useMemo(() => {
    if (!q) return entries;
    return entries
      .map((entry, index) => ({ entry, index, score: rank(entry, q) }))
      .filter((hit) => hit.score >= 0)
      .sort((a, b) => a.score - b.score || a.index - b.index)
      .map((hit) => hit.entry);
  }, [entries, q]);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const inField =
        !!target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if (
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !inField)
      ) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the active row changes with the index and the results
  useLayoutEffect(() => {
    const option = options.current[active] ?? null;
    setActiveOption(option);
    option?.scrollIntoView({ block: "nearest" });
  }, [active, results, open]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onInputKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setTyping(false);
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setTyping(false);
      setActive((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter") {
      const entry = results[active];
      if (entry) {
        event.preventDefault();
        go(entry.href);
      }
    }
  }

  const optionId = (index: number) => `${listId}-${index}`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Search components and guides"
          className="focus-ring inline-flex h-(--size-control-md) w-(--size-control-md) shrink-0 items-center justify-center gap-2 rounded-lg bg-secondary text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground md:w-60 md:justify-start md:ps-3 md:pe-1.5"
        >
          <SearchIcon className="size-(--size-icon-sm) shrink-0" aria-hidden />
          <span className="hidden flex-1 text-left text-label leading-none md:block">Search components…</span>
          <span className="hidden items-center gap-0.5 md:flex" aria-hidden>
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </Dialog.Trigger>

      <AnimatePresence
        onExitComplete={() => {
          // Reset after the window has faded, so its contents don't change while it leaves
          setQuery("");
          setActive(0);
        }}
      >
        {open ? (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 z-(--z-overlay) bg-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: duration.base, ease: ease.out }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild forceMount aria-describedby={undefined}>
              <motion.div
                className="fixed inset-x-(--space-gutter) top-24 z-(--z-modal) mx-auto grid max-w-xl overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-xl"
                initial={{ opacity: 0, filter: blurred, scale: 0.96, y: -8 }}
                animate={{ opacity: 1, filter: blur.shown, scale: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  filter: blurred,
                  scale: 0.98,
                  y: -4,
                  transition: { duration: duration.fast, ease: ease.in },
                }}
                transition={spring.snappy}
              >
                <Dialog.Title className="sr-only">Search FewTone UI</Dialog.Title>

                <div className="flex items-center gap-3 border-b ps-4 pe-3">
                  <SearchIcon className="size-(--size-icon-md) shrink-0 text-muted-foreground" aria-hidden />
                  <input
                    role="combobox"
                    aria-expanded="true"
                    aria-controls={listId}
                    aria-activedescendant={results[active] ? optionId(active) : undefined}
                    aria-autocomplete="list"
                    aria-label="Search components and guides"
                    value={query}
                    onChange={(event) => {
                      setTyping(true);
                      setQuery(event.target.value);
                      setActive(0);
                    }}
                    onKeyDown={onInputKey}
                    placeholder="Search components and guides…"
                    className="h-(--size-control-lg) w-full bg-transparent text-body outline-none placeholder:text-muted-foreground"
                  />
                  <Dialog.Close aria-label="Close search" className="focus-ring shrink-0 rounded-md">
                    <Kbd>esc</Kbd>
                  </Dialog.Close>
                </div>

                <div className="max-h-96 overflow-y-auto p-2">
                  {results.length === 0 ? (
                    <div className="grid justify-items-center gap-1 px-4 py-10 text-center">
                      <SearchXIcon className="mb-1 size-(--size-icon-lg) text-muted-foreground" aria-hidden />
                      <p className="text-body-sm text-foreground">No results for “{query.trim()}”</p>
                      <p className="text-caption text-muted-foreground">Try a component or guide name.</p>
                    </div>
                  ) : (
                    <div
                      ref={list}
                      id={listId}
                      role="listbox"
                      aria-label="Results"
                      className="relative isolate grid gap-0.5"
                    >
                      <RowIndicator box={activeBox} instant={typing} className="rounded-lg bg-accent" />
                      {results.map((entry, index) => {
                        const showGroup = !q && (index === 0 || results[index - 1]?.group !== entry.group);
                        const selected = index === active;
                        return (
                          <Fragment key={entry.href}>
                            {showGroup ? (
                              <p
                                className="px-3 pt-3 pb-1 text-overline text-muted-foreground uppercase"
                                aria-hidden
                              >
                                {entry.group}
                              </p>
                            ) : null}
                            <div
                              ref={(element) => {
                                options.current[index] = element;
                              }}
                              id={optionId(index)}
                              role="option"
                              aria-selected={selected}
                              tabIndex={-1}
                              onMouseMove={() => {
                                setTyping(false);
                                setActive(index);
                              }}
                              onClick={() => go(entry.href)}
                              onKeyDown={() => {}}
                              className="group flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2"
                            >
                              <span
                                className={cn(
                                  "grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground transition-colors duration-(--duration-fast) ease-out",
                                  selected && "bg-background text-foreground",
                                )}
                              >
                                <EntryIcon entry={entry} />
                              </span>
                              <span className="grid min-w-0 flex-1 gap-0.5">
                                <span className="truncate text-body-sm font-medium text-foreground">
                                  <Highlight text={entry.title} query={q} />
                                </span>
                                <span className="truncate text-caption text-muted-foreground">
                                  {entry.description}
                                </span>
                              </span>
                              {/* The Enter arrow slides and sharpens in on the active row */}
                              <motion.span
                                aria-hidden
                                className="shrink-0 text-muted-foreground"
                                initial={false}
                                animate={
                                  selected
                                    ? { opacity: 1, filter: blur.shown, x: 0 }
                                    : { opacity: 0, filter: blurred, x: -6 }
                                }
                                transition={typing ? { duration: 0 } : spring.snappy}
                              >
                                <CornerDownLeftIcon className="size-(--size-icon-sm)" />
                              </motion.span>
                            </div>
                          </Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2.5 text-caption text-muted-foreground">
                  <Hint keys={["↑", "↓"]}>Navigate</Hint>
                  <Hint keys={["↵"]}>Open</Hint>
                  <Hint keys={["esc"]}>Close</Hint>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  );
}
