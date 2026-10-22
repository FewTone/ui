"use client";

import { Badge } from "@fewtone/ui/components/badge/badge";
import { Checkbox } from "@fewtone/ui/components/checkbox/checkbox";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type TableSortDirection,
} from "@fewtone/ui/components/table/table";
import { useState } from "react";

type Status = "paid" | "pending" | "overdue";

const invoices = [
  { id: "INV-1048", status: "paid", method: "Card", date: "2026-10-12", day: "Oct 12, 2026", amount: 1250 },
  {
    id: "INV-1047",
    status: "pending",
    method: "Bank transfer",
    date: "2026-10-09",
    day: "Oct 9, 2026",
    amount: 480,
  },
  { id: "INV-1046", status: "overdue", method: "Card", date: "2026-10-03", day: "Oct 3, 2026", amount: 2900 },
  {
    id: "INV-1045",
    status: "paid",
    method: "PayPal",
    date: "2026-09-28",
    day: "Sep 28, 2026",
    amount: 760.5,
  },
  {
    id: "INV-1044",
    status: "paid",
    method: "Bank transfer",
    date: "2026-09-21",
    day: "Sep 21, 2026",
    amount: 3400,
  },
  { id: "INV-1043", status: "pending", method: "Card", date: "2026-09-15", day: "Sep 15, 2026", amount: 150 },
] satisfies { id: string; status: Status; method: string; date: string; day: string; amount: number }[];

const statuses = {
  paid: { label: "Paid", variant: "secondary" },
  pending: { label: "Pending", variant: "outline" },
  overdue: { label: "Overdue", variant: "destructive" },
} as const;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);

type Column = "date" | "amount";

/*
 * Invoices you can sort by date or amount (the rows glide to their new places) and pick with the checkboxes.
 * It sits on the page's own colour, as a table would, so the hover and the selected rows read as they do there.
 */
export default function TableInvoices() {
  const [sort, setSort] = useState<{ column: Column; direction: Exclude<TableSortDirection, "none"> }>({
    column: "date",
    direction: "descending",
  });
  const [selected, setSelected] = useState<Set<string>>(() => new Set(["INV-1046"]));

  const rows = [...invoices].sort((a, b) => {
    const order = sort.column === "date" ? a.date.localeCompare(b.date) : a.amount - b.amount;
    return sort.direction === "ascending" ? order : -order;
  });
  const directionOf = (column: Column) => (sort.column === column ? sort.direction : "none");
  // A column sorts ascending first; pressing the sorted column again flips it
  const sortBy = (column: Column) =>
    setSort((current) =>
      current.column === column
        ? { column, direction: current.direction === "ascending" ? "descending" : "ascending" }
        : { column, direction: "ascending" },
    );

  const all = selected.size === invoices.length ? true : selected.size > 0 ? "indeterminate" : false;
  const toggle = (id: string, on: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div className="w-full max-w-2xl rounded-lg bg-background px-2 pt-1 pb-3">
      <Table>
        <TableCaption>Recent invoices</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Checkbox
                size="sm"
                aria-label="Select all invoices"
                checked={all}
                onCheckedChange={(on) =>
                  setSelected(on === true ? new Set(invoices.map((invoice) => invoice.id)) : new Set())
                }
              />
            </TableHead>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead sort={directionOf("date")} onSort={() => sortBy("date")}>
              Date
            </TableHead>
            <TableHead className="text-right" sort={directionOf("amount")} onSort={() => sortBy("amount")}>
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((invoice) => {
            const on = selected.has(invoice.id);
            const status = statuses[invoice.status];
            return (
              <TableRow key={invoice.id} data-state={on ? "selected" : undefined}>
                <TableCell>
                  <Checkbox
                    size="sm"
                    aria-label={`Select ${invoice.id}`}
                    checked={on}
                    onCheckedChange={(value) => toggle(invoice.id, value === true)}
                  />
                </TableCell>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{invoice.method}</TableCell>
                <TableCell className="text-muted-foreground">{invoice.day}</TableCell>
                <TableCell className="text-right tabular-nums">{money.format(invoice.amount)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>Total</TableCell>
            <TableCell className="text-right tabular-nums">{money.format(total)}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
