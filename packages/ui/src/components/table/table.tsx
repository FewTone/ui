import {
  TableBody,
  TableSortButton,
  type TableSortDirection,
} from "@fewtone/ui/components/table/table-motion";
import { cn } from "@fewtone/ui/lib/utils";
import type { ComponentProps } from "react";

/*
 * Table (owner's roadmap, 2026-10-16: "Data in rows and columns, with sortable headers"), with shadcn's parts:
 * Table (inside a container that scrolls sideways), TableHeader, TableBody, TableFooter, TableRow, TableHead,
 * TableCell and TableCaption. A real HTML table, so screen readers announce rows, columns and headers.
 * - Borders: quiet dividers between rows and none round the outside (design.md: few borders). The lines belong
 *   to the cells, with the table's borders kept separate and no spacing between them, so each row carries its
 *   own line when it glides.
 * - Sorting: give TableHead `sort` and `onSort`. Its label becomes a button, the header gets aria-sort (only the
 *   sorted column has one, as in the WAI-ARIA sortable table), and the arrow turns between up and down.
 * - When sorting changes the rows' order, they glide to their new places (TableBody, in table-motion.tsx with
 *   the sort button: the two client parts). Give rows a stable `key` so they can.
 * - Rows: hover is a colour change only, and a selected row (data-state="selected") is muted. A checkbox column
 *   stays as narrow as its checkbox.
 */

/** Wraps the table in a container that scrolls sideways when the columns don't fit */
function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom border-separate border-spacing-0 text-sm", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      // Header rows don't take the body's hover
      className={cn("[&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      // One line between the body and the footer (the body's last row has none), and none under it
      className={cn(
        "font-medium [&_tr]:hover:bg-transparent [&>tr:first-child>*]:border-t [&>tr:first-child>*]:border-border [&>tr:last-child>*]:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "transition-colors duration-(--duration-fast) ease-out hover:bg-muted/50 data-[state=selected]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

export type TableHeadProps = ComponentProps<"th"> & {
  /** This column's sort. Sets aria-sort on the sorted column and turns the arrow. */
  sort?: TableSortDirection;
  /** Makes the header a button that sorts the column; called when it's pressed */
  onSort?: () => void;
};

function TableHead({ className, sort, onSort, children, ...props }: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      aria-sort={sort === "ascending" || sort === "descending" ? sort : undefined}
      className={cn(
        "h-10 border-b border-border px-3 text-start align-middle font-medium whitespace-nowrap text-muted-foreground",
        "[&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:flex",
        className,
      )}
      {...props}
    >
      {onSort ? (
        <TableSortButton direction={sort ?? "none"} onClick={onSort}>
          {children}
        </TableSortButton>
      ) : (
        children
      )}
    </th>
  );
}

function TableCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "border-b border-border px-3 py-2.5 align-middle whitespace-nowrap",
        "[&:has([role=checkbox])]:w-px [&:has([role=checkbox])]:pe-0 [&>[role=checkbox]]:flex",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export type { TableSortButtonProps, TableSortDirection } from "@fewtone/ui/components/table/table-motion";
export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  TableSortButton,
};
