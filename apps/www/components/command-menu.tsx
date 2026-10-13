"use client";

import { cn } from "@fewtone/ui/lib/utils";
import { CornerDownLeftIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { Fragment, type KeyboardEvent, useEffect, useId, useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/nav";

/** ⌘K / Ctrl+K / "/" search over guides and items. The index is small and ships with the page. */
export function CommandMenu({ entries }: { entries: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const listId = useId();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return entries;
    return entries.filter((entry) =>
      `${entry.title} ${entry.group} ${entry.description}`.toLowerCase().includes(q),
    );
  }, [entries, query]);

  useEffect(() => {
    function onKey(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target && (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActive(0);
    }
  }

  function go(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  function onInputKey(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
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
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="focus-ring inline-flex h-(--size-control-md) items-center gap-2 rounded-lg border px-2.5 text-label text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground sm:pr-1.5"
        >
          <SearchIcon className="size-(--size-icon-sm)" aria-hidden />
          <span className="sr-only sm:not-sr-only">Search</span>
          <kbd className="hidden rounded-sm bg-muted px-1.5 font-mono text-caption sm:inline">⌘K</kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-(--z-overlay) bg-overlay data-[state=open]:animate-fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-4 top-24 z-(--z-modal) mx-auto max-w-xl overflow-hidden rounded-2xl border bg-popover text-popover-foreground shadow-xl data-[state=open]:animate-scale-in"
        >
          <Dialog.Title className="sr-only">Search FewTone UI</Dialog.Title>
          <div className="flex items-center gap-3 border-b px-4">
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
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={onInputKey}
              placeholder="Search components and guides"
              className="h-12 w-full bg-transparent text-body outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {results.length === 0 ? (
              <p className="px-3 py-8 text-center text-body-sm text-muted-foreground">
                No results for “{query.trim()}”
              </p>
            ) : (
              <div id={listId} role="listbox" aria-label="Results" className="grid gap-0.5">
                {results.map((entry, index) => {
                  const showGroup = index === 0 || results[index - 1]?.group !== entry.group;
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
                        id={optionId(index)}
                        role="option"
                        aria-selected={index === active}
                        tabIndex={-1}
                        onMouseMove={() => setActive(index)}
                        onClick={() => go(entry.href)}
                        onKeyDown={() => {}}
                        className={cn(
                          "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2",
                          index === active && "bg-accent",
                        )}
                      >
                        <span className="grid min-w-0 gap-0.5">
                          <span className="truncate text-body-sm font-medium">{entry.title}</span>
                          <span className="truncate text-caption text-muted-foreground">
                            {entry.description}
                          </span>
                        </span>
                        {index === active ? (
                          <CornerDownLeftIcon
                            className="size-(--size-icon-sm) shrink-0 text-muted-foreground"
                            aria-hidden
                          />
                        ) : null}
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
