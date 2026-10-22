"use client";

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
import { useState } from "react";

const pageCount = 10;

/*
 * Ten pages to click through. The pill slides to each new page; Previous and Next turn off at the ends.
 * Buttons, because the page changes in place; give the links an href (or asChild with your router's Link) to
 * move between URLs instead.
 */
export default function PaginationPages() {
  const [page, setPage] = useState(4);

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
