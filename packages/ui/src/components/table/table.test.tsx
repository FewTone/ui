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
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

const people = [
  { name: "Ada", age: 36 },
  { name: "Grace", age: 85 },
  { name: "Alan", age: 41 },
];

function People({ selected }: { selected?: string }) {
  const [sort, setSort] = useState<TableSortDirection>("none");
  const rows =
    sort === "none"
      ? people
      : [...people].sort((a, b) => (sort === "ascending" ? a.age - b.age : b.age - a.age));
  return (
    <Table>
      <TableCaption>People</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead
            sort={sort}
            onSort={() => setSort((current) => (current === "ascending" ? "descending" : "ascending"))}
          >
            Age
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((person) => (
          <TableRow key={person.name} data-state={person.name === selected ? "selected" : undefined}>
            <TableCell>{person.name}</TableCell>
            <TableCell>{person.age}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>Average</TableCell>
          <TableCell>54</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

/** The names in the body's rows, in order */
const names = () =>
  within(screen.getAllByRole("rowgroup")[1] as HTMLElement)
    .getAllByRole("row")
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent);

const ageHeader = () => screen.getByRole("columnheader", { name: "Age" });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Table", () => {
  it("is a table named by its caption, with headers, rows and cells", () => {
    render(<People selected="Grace" />);
    const table = screen.getByRole("table", { name: "People" });
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((header) => header.textContent),
    ).toEqual(["Name", "Age"]);
    // A header row, three body rows and a footer row
    expect(within(table).getAllByRole("row")).toHaveLength(5);
    expect(names()).toEqual(["Ada", "Grace", "Alan"]);
    const grace = screen.getByRole("cell", { name: "Grace" }).closest("tr");
    expect(grace?.dataset.state).toBe("selected");
  });

  it("sorts from its header button, setting aria-sort and reordering the rows", async () => {
    render(<People />);
    // Unsorted columns carry no aria-sort, as in the WAI-ARIA sortable table
    expect(ageHeader().hasAttribute("aria-sort")).toBe(false);
    expect(screen.getByRole("columnheader", { name: "Name" }).hasAttribute("aria-sort")).toBe(false);

    const button = screen.getByRole("button", { name: "Age" });
    await userEvent.click(button);
    expect(ageHeader().getAttribute("aria-sort")).toBe("ascending");
    expect(names()).toEqual(["Ada", "Alan", "Grace"]);

    await userEvent.click(button);
    expect(ageHeader().getAttribute("aria-sort")).toBe("descending");
    expect(names()).toEqual(["Grace", "Alan", "Ada"]);
  });

  it("sorts from the keyboard", async () => {
    render(<People />);
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Age" }));
    await userEvent.keyboard("{Enter}");
    expect(ageHeader().getAttribute("aria-sort")).toBe("ascending");
    await userEvent.keyboard(" ");
    expect(ageHeader().getAttribute("aria-sort")).toBe("descending");
  });

  it("glides moved rows from where they were drawn", async () => {
    // jsdom has no layout: give each row a 40px place by its position in the body
    vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
      return this instanceof HTMLTableRowElement && this.parentElement
        ? Array.prototype.indexOf.call(this.parentElement.children, this) * 40
        : 0;
    });
    render(<People />);
    const row = (name: string) => screen.getByRole("cell", { name }).closest("tr") as HTMLTableRowElement;
    await userEvent.click(screen.getByRole("button", { name: "Age" }));
    // Grace moved from the second place to the third: she starts 40px up and glides down. Ada stayed put.
    expect(row("Grace").style.transform).toMatch(/^translateY\(-\d/);
    expect(row("Alan").style.transform).toMatch(/^translateY\(\d/);
    expect(row("Ada").style.transform).toBe("");
  });

  it("has no accessibility violations, sorted or not", async () => {
    const { container } = render(<People selected="Ada" />);
    expect(await axeViolations(container)).toEqual([]);
    await userEvent.click(screen.getByRole("button", { name: "Age" }));
    expect(await axeViolations(container)).toEqual([]);
  });
});
