import { Badge } from "@fewtone/ui/components/badge/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@fewtone/ui/components/table/table";

const invoices = [
  { id: "INV-1048", status: "Paid", amount: "$1,250.00" },
  { id: "INV-1047", status: "Pending", amount: "$480.00" },
  { id: "INV-1046", status: "Overdue", amount: "$2,900.00" },
] as const;

/** The index card's preview: three rows. The page itself opens on the sortable invoices. */
export default function TableCard() {
  return (
    <div className="w-72 rounded-lg bg-background px-1">
      <Table aria-label="Invoices">
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.id}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    invoice.status === "Paid"
                      ? "secondary"
                      : invoice.status === "Overdue"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">{invoice.amount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
