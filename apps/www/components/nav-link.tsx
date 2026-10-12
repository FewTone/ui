"use client";

import { cn } from "@fewtone/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Header link that marks itself as current for its whole section */
export function NavLink({ href, match, children }: { href: string; match?: string[]; children: ReactNode }) {
  const pathname = usePathname();
  const prefixes = match ?? [href];
  const active = prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "focus-ring rounded-sm transition-colors duration-(--duration-fast) ease-out hover:text-foreground",
        active && "text-foreground",
      )}
    >
      {children}
    </Link>
  );
}
