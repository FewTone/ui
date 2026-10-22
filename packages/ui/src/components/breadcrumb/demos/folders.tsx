"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@fewtone/ui/components/breadcrumb/breadcrumb";
import { Button } from "@fewtone/ui/components/button/button";
import { blur, duration, ease } from "@fewtone/ui/lib/motion";
import { FolderIcon } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";

type Folder = { name: string; folders?: Folder[] };

const home: Folder = {
  name: "Home",
  folders: [
    {
      name: "Projects",
      folders: [
        {
          name: "FewTone UI",
          folders: [
            { name: "Components", folders: [{ name: "Breadcrumb" }, { name: "Accordion" }] },
            { name: "Docs" },
          ],
        },
        { name: "Website" },
      ],
    },
    { name: "Photos", folders: [{ name: "2026" }, { name: "Travel" }] },
    { name: "Documents" },
  ],
};

/** A level's key: the path down to it, so the same name in two places is two levels */
const keyOf = (path: Folder[], index: number) =>
  path
    .slice(0, index + 1)
    .map((folder) => folder.name)
    .join("/");

/**
 * The folder list moves the way you went (1 deeper, -1 back up): the old list slides 12px away and the new one
 * comes in from the other side, row by row, both through the blur, the way Navigation Menu's panels move.
 */
function useListMotion() {
  const reduce = useReducedMotion() ?? false;
  const shift = reduce ? 0 : 12;
  const hidden = reduce ? blur.shown : blur.hidden;
  const list: Variants = {
    enter: {},
    // Rows arrive one after another, 0.05s apart (motion.md: items appearing in a list)
    center: { transition: { staggerChildren: reduce ? 0 : 0.05 } },
    exit: (direction: number) => ({
      opacity: 0,
      x: -shift * direction,
      filter: hidden,
      transition: reduce ? { duration: 0 } : { duration: duration.fast, ease: ease.in },
    }),
  };
  const row: Variants = {
    enter: (direction: number) => ({ opacity: 0, x: shift * direction, filter: hidden }),
    center: {
      opacity: 1,
      x: 0,
      filter: blur.shown,
      transitionEnd: { filter: "none" },
      transition: reduce ? { duration: 0 } : { duration: duration.slow, ease: ease.out },
    },
  };
  return { list, row };
}

/*
 * A folder browser. Open a folder and the trail grows a level out of the one before it, while the folder list
 * moves on: the old list slides away to the left and the new one comes in from the right, row by row. Press a
 * level above and it all plays backwards: the levels below slide back in and the new list comes from the left.
 * Each level is keyed by its path, which is what lets the trail animate. The old and new lists overlap as they
 * pass (popLayout), in a box as tall as the longest list, so the preview never changes height. Focus moves to
 * the new list (or, in an empty folder, to the level above), because the control that was pressed is gone.
 */
export default function BreadcrumbFolders() {
  const variants = useListMotion();
  const [view, setView] = useState<{ path: Folder[]; direction: number }>({ path: [home], direction: 1 });
  const { path, direction } = view;
  const here = path[path.length - 1] ?? home;
  const trail = useRef<HTMLElement>(null);
  const moved = useRef(false);

  const go = (next: Folder[]) => {
    moved.current = true;
    setView({ path: next, direction: next.length > path.length ? 1 : -1 });
  };

  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      <Breadcrumb ref={trail} aria-label="Folder">
        <BreadcrumbList>
          {path.map((folder, index) => (
            <Fragment key={keyOf(path, index)}>
              {index > 0 ? <BreadcrumbSeparator /> : null}
              <BreadcrumbItem>
                {index === path.length - 1 ? (
                  <BreadcrumbPage>{folder.name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <button
                      type="button"
                      className="cursor-pointer"
                      onClick={() => go(path.slice(0, index + 1))}
                    >
                      {folder.name}
                    </button>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>

      {/* As tall as the longest list (three folders), so the preview never changes height */}
      <div className="relative min-h-26">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={keyOf(path, path.length - 1)}
            variants={variants.list}
            custom={direction}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <FolderList
              folders={here.folders ?? []}
              label={here.name}
              row={variants.row}
              direction={direction}
              onOpen={(folder) => go([...path, folder])}
              moved={moved}
              trail={trail}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function FolderList({
  folders,
  label,
  row,
  direction,
  onOpen,
  moved,
  trail,
}: {
  folders: Folder[];
  label: string;
  row: Variants;
  direction: number;
  onOpen: (folder: Folder) => void;
  moved: { current: boolean };
  trail: { current: HTMLElement | null };
}) {
  const list = useRef<HTMLUListElement>(null);

  // Mounted after a move: the pressed control has gone, so focus lands on the first folder here, or in an empty
  // folder on the level above
  useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    const target =
      list.current?.querySelector("button") ??
      Array.from(trail.current?.querySelectorAll<HTMLElement>("[data-slot=breadcrumb-link]") ?? []).at(-1);
    target?.focus();
  }, [moved, trail]);

  if (folders.length === 0) {
    return (
      <motion.p variants={row} custom={direction} className="px-3 py-2 text-sm text-muted-foreground">
        No folders in {label}.
      </motion.p>
    );
  }

  return (
    <ul ref={list} aria-label={`Folders in ${label}`} className="flex flex-col gap-1">
      {folders.map((folder) => (
        <motion.li key={folder.name} variants={row} custom={direction}>
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => onOpen(folder)}>
            <FolderIcon aria-hidden className="text-muted-foreground" />
            {folder.name}
          </Button>
        </motion.li>
      ))}
    </ul>
  );
}
