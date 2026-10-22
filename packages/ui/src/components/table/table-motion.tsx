"use client";

import { duration, spring } from "@fewtone/ui/lib/motion";
import { cn } from "@fewtone/ui/lib/utils";
import { ArrowUpIcon } from "lucide-react";
import {
  type AnimationPlaybackControls,
  animate,
  type MotionValue,
  motion,
  motionValue,
  useReducedMotion,
} from "motion/react";
import { type ComponentProps, useEffect, useRef } from "react";

/*
 * The client parts of Table: the body, whose rows glide when their order changes, and the sort button with its
 * arrow. table.tsx re-exports them, so every other part stays a server component.
 * - Rows glide (FLIP, .agents/rules/motion.md): when sorting reorders the rows, each row starts from where it
 *   was drawn and glides to its new place on spring.snappy. Only a transform moves, and rows stay real `tr`s.
 *   Places are offsets (layout pixels), so a zoomed or scaled page doesn't double the trip. Re-sorting mid-glide
 *   leaves from where each row is now. Rows that are added, removed or resized just take their places: only a
 *   new order glides. With reduced motion nothing moves.
 * - The sort arrow turns between up and down on spring.snappy. Unsorted, it's hidden until you point at the
 *   header (or focus it); when a column stops being sorted it fades out where it was, then resets.
 */

export type TableSortDirection = "ascending" | "descending" | "none";

/** A row on its way to its new place: its offset, and the spring taking it there */
type Glide = { y: MotionValue<number>; animation?: AnimationPlaybackControls; stop: () => void };

/** Where a row sits in its body, in layout pixels (offsets: transforms and zoom don't count) */
const placeOf = (row: HTMLTableRowElement, body: HTMLTableSectionElement) => row.offsetTop - body.offsetTop;

function TableBody({ className, ref, ...props }: ComponentProps<"tbody">) {
  const node = useRef<HTMLTableSectionElement | null>(null);
  const reduce = useReducedMotion() ?? false;
  // Read by the observer below, which outlives renders
  const reduceRef = useRef(reduce);
  useEffect(() => {
    reduceRef.current = reduce;
  }, [reduce]);

  useEffect(() => {
    const body = node.current;
    if (!body) return;
    const glides = new Map<HTMLTableRowElement, Glide>();
    let order: HTMLTableRowElement[] = [];
    let places = new Map<HTMLTableRowElement, number>();

    /** Note each row's place, to glide from next time. Rows that left the table let go of their glide. */
    const remember = () => {
      order = Array.from(body.rows);
      places = new Map(order.map((row) => [row, placeOf(row, body)]));
      for (const [row, glide] of glides) if (!places.has(row)) glide.stop();
    };

    // React moves the rows' nodes when their keys change order. The observer runs after it does and before the
    // browser paints, so each row can be put back where it was drawn, then let go.
    const onRowsChange = () => {
      const before = order;
      const was = places;
      remember();
      if (reduceRef.current) return;
      const kept = order.filter((row) => was.has(row));
      const keptBefore = before.filter((row) => places.has(row));
      if (kept.every((row, index) => row === keptBefore[index])) return;

      for (const row of kept) {
        let glide = glides.get(row);
        const from = (was.get(row) ?? 0) - (places.get(row) ?? 0) + (glide?.y.get() ?? 0);
        // Still and already in place: nothing to do. A row mid-glide is placed again either way.
        if (from === 0 && !glide) continue;
        if (!glide) {
          const y = motionValue(0);
          const unsubscribe = y.on("change", (value) => {
            row.style.transform = value === 0 ? "" : `translateY(${value}px)`;
          });
          const created: Glide = {
            y,
            stop: () => {
              created.animation?.stop();
              unsubscribe();
              row.style.transform = "";
              glides.delete(row);
            },
          };
          glide = created;
          glides.set(row, glide);
        }
        // Placed with jump(), which resets the speed, so the spring doesn't count the jump as a push
        glide.animation?.stop();
        glide.y.jump(from);
        glide.animation = animate(glide.y, 0, spring.snappy);
      }
    };

    remember();
    const rows = new MutationObserver(onRowsChange);
    rows.observe(body, { childList: true });
    // Places change when the table reflows (a new width, rows that grow), so note them again
    const size = new ResizeObserver(remember);
    size.observe(body);
    return () => {
      rows.disconnect();
      size.disconnect();
      for (const glide of glides.values()) glide.stop();
    };
  }, []);

  return (
    <tbody
      ref={(element) => {
        node.current = element;
        if (typeof ref === "function") ref(element);
        else if (ref) ref.current = element;
      }}
      data-slot="table-body"
      className={cn("[&>tr:last-child>*]:border-b-0", className)}
      {...props}
    />
  );
}

export type TableSortButtonProps = ComponentProps<"button"> & {
  /** The column's sort, which turns the arrow */
  direction?: TableSortDirection;
};

/**
 * The button inside a sortable TableHead. TableHead renders it for you when you give it `onSort`; use it directly
 * only to build a header of your own (set aria-sort on the header yourself then).
 */
function TableSortButton({ direction = "none", className, children, ...props }: TableSortButtonProps) {
  const reduce = useReducedMotion() ?? false;
  const sorted = direction !== "none";

  return (
    <button
      type="button"
      data-slot="table-sort-button"
      data-sort={direction}
      className={cn(
        "group/sort -mx-1.5 inline-flex h-(--size-control-sm) cursor-pointer items-center gap-1 rounded-md px-1.5 font-medium whitespace-nowrap",
        "transition-colors duration-(--duration-fast) ease-out hover:text-foreground",
        sorted && "text-foreground",
        // In a right-aligned column (numbers), the arrow goes first, so the label lines up with the values
        "in-[.text-right]:flex-row-reverse in-[.text-end]:flex-row-reverse",
        "outline-ring focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset)",
        className,
      )}
      {...props}
    >
      {children}
      {/* The arrow always keeps its room, so the label never shifts as it appears */}
      <span
        aria-hidden
        className={cn(
          "inline-flex transition-opacity duration-(--duration-fast) ease-out",
          sorted
            ? "opacity-100"
            : "text-muted-foreground opacity-0 group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100",
        )}
      >
        <motion.span
          className="inline-flex"
          initial={false}
          animate={{ rotate: direction === "descending" ? 180 : 0 }}
          // Turning, it springs. Leaving a column, it fades out pointing where it pointed, then resets.
          transition={
            reduce ? { duration: 0 } : sorted ? spring.snappy : { duration: 0, delay: duration.fast }
          }
        >
          <ArrowUpIcon className="size-(--size-icon-sm)" />
        </motion.span>
      </span>
    </button>
  );
}

export { TableBody, TableSortButton };
