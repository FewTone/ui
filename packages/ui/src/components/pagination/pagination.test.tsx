import {
  getPaginationRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@fewtone/ui/components/pagination/pagination";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { axeViolations } from "../../test/axe";

function Pages({ start = 1, pageCount = 10 }: { start?: number; pageCount?: number }) {
  const [page, setPage] = useState(start);
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled={page === 1} onClick={() => setPage((current) => current - 1)} />
        </PaginationItem>
        {getPaginationRange({ page, pageCount }).map((item, index) => (
          <PaginationItem key={item === "ellipsis" ? `ellipsis-${index}` : item}>
            {item === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                isActive={item === page}
                aria-label={`Page ${item}`}
                onClick={() => setPage(item)}
              >
                {item}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext disabled={page === pageCount} onClick={() => setPage((current) => current + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

const current = () =>
  within(screen.getByRole("navigation", { name: "Pagination" }))
    .getAllByRole("button")
    .find((button) => button.getAttribute("aria-current") === "page");
const previous = () => screen.getByRole("button", { name: "Go to previous page" });
const next = () => screen.getByRole("button", { name: "Go to next page" });

describe("getPaginationRange", () => {
  it("shows every page when there are few", () => {
    expect(getPaginationRange({ page: 2, pageCount: 5 })).toEqual([1, 2, 3, 4, 5]);
  });

  it("keeps the same length, with an ellipsis for each gap", () => {
    expect(getPaginationRange({ page: 1, pageCount: 10 })).toEqual([1, 2, 3, 4, 5, "ellipsis", 10]);
    expect(getPaginationRange({ page: 5, pageCount: 10 })).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
    expect(getPaginationRange({ page: 10, pageCount: 10 })).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });

  it("takes more siblings and boundaries, and keeps the page in range", () => {
    expect(getPaginationRange({ page: 10, pageCount: 20, siblingCount: 2, boundaryCount: 2 })).toEqual([
      1,
      2,
      "ellipsis",
      8,
      9,
      10,
      11,
      12,
      "ellipsis",
      19,
      20,
    ]);
    expect(getPaginationRange({ page: 99, pageCount: 10 })).toEqual([1, "ellipsis", 6, 7, 8, 9, 10]);
  });
});

describe("Pagination", () => {
  it("is a navigation landmark marking the current page", async () => {
    render(<Pages start={4} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeTruthy();
    expect(current()?.textContent).toBe("4");
    await userEvent.click(screen.getByRole("button", { name: "Page 5" }));
    expect(current()?.textContent).toBe("5");
    expect(screen.getByRole("button", { name: "Page 4" }).hasAttribute("aria-current")).toBe(false);
    // One pill, under the current page
    expect(document.querySelectorAll("[data-slot=pagination-pill]")).toHaveLength(1);
  });

  it("turns Previous and Next off at the ends, keeping focus there", async () => {
    render(<Pages start={2} pageCount={3} />);
    expect(previous().getAttribute("aria-disabled")).toBeNull();
    await userEvent.click(previous());
    expect(current()?.textContent).toBe("1");
    expect(previous().getAttribute("aria-disabled")).toBe("true");
    // Disabled, it does nothing
    await userEvent.keyboard("{Enter}");
    expect(current()?.textContent).toBe("1");

    next().focus();
    await userEvent.keyboard("{Enter}{Enter}");
    expect(current()?.textContent).toBe("3");
    expect(next().getAttribute("aria-disabled")).toBe("true");
    expect(document.activeElement).toBe(next());
  });

  it("moves through pages from the keyboard", async () => {
    render(<Pages />);
    await userEvent.tab();
    // Previous is disabled on the first page but still in the tab order
    expect(document.activeElement).toBe(previous());
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Page 1" }));
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(current()?.textContent).toBe("2");
  });

  it("renders links with an href, and a disabled link without one", () => {
    const onClick = vi.fn();
    render(
      <Pagination aria-label="Results pages">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="?page=0" disabled onClick={onClick} />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="?page=1" isActive>
              1
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="?page=2" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>,
    );
    const nav = screen.getByRole("navigation", { name: "Results pages" });
    expect(within(nav).getByRole("link", { name: "1" }).getAttribute("aria-current")).toBe("page");
    expect(within(nav).getByRole("link", { name: "Go to next page" }).getAttribute("href")).toBe("?page=2");
    const disabled = within(nav).getByRole("link", { name: "Go to previous page" });
    expect(disabled.hasAttribute("href")).toBe(false);
    expect(disabled.getAttribute("aria-disabled")).toBe("true");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Pages start={5} />);
    expect(await axeViolations(container)).toEqual([]);
  });
});
