"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@fewtone/ui/components/pagination/pagination";
import { useState } from "react";

/** The index card's preview: the page numbers alone, so it fits a small tile. The page itself has Previous and Next. */
export default function PaginationCard() {
  const [page, setPage] = useState(2);

  return (
    <Pagination>
      <PaginationContent>
        {[1, 2, 3].map((item) => (
          <PaginationItem key={item}>
            <PaginationLink
              isActive={item === page}
              aria-label={`Page ${item}`}
              onClick={() => setPage(item)}
            >
              {item}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive={page === 10} aria-label="Page 10" onClick={() => setPage(10)}>
            10
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
