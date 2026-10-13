"use client";

import { cn } from "@fewtone/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavSection } from "@/lib/nav";
import { StatusBadge } from "./status-badge";

/**
 * Guides first, then one section per kind with its count. A kind filter appears once there are two kinds.
 * Spacing comes from the --space-nav-* tokens (beUI rhythm): link rows are 28px with no gaps between them.
 */
export function SidebarNav({ sections, onNavigate }: { sections: NavSection[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const kindSections = sections.filter((section) => section.kind);
  const [filter, setFilter] = useState("all");
  const visible = sections.filter((section) => !section.kind || filter === "all" || section.kind === filter);
  const filters = [
    { id: "all", label: "All" },
    ...kindSections.map((section) => ({ id: section.kind ?? section.id, label: section.label })),
  ];

  return (
    <nav aria-label="Guides and components" className="grid gap-(--space-nav-group)">
      {kindSections.length > 1 ? (
        <fieldset className="flex flex-wrap gap-(--space-tabs) justify-self-start rounded-lg bg-muted p-(--space-tabs)">
          <legend className="sr-only">Show</legend>
          {filters.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className={cn(
                "focus-ring rounded-md px-(--space-nav-item-x) py-(--space-nav-item-y) text-caption text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground",
                filter === option.id && "bg-background text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </fieldset>
      ) : null}

      {visible.map((section) => (
        <div key={section.id}>
          <p className="mb-(--space-nav-label) flex items-center gap-2 px-(--space-nav-item-x) text-overline font-semibold text-muted-foreground uppercase">
            {section.label}
            {section.count !== undefined ? (
              <span className="rounded-full bg-muted px-1.5 text-caption tabular-nums">{section.count}</span>
            ) : null}
          </p>
          <ul className="grid">
            {section.links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring flex items-center justify-between gap-2 rounded-md px-(--space-nav-item-x) py-(--space-nav-item-y) text-body-sm leading-5 text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground",
                      active && "bg-accent font-medium text-foreground",
                    )}
                  >
                    <span className="truncate">{link.title}</span>
                    {link.badge ? <StatusBadge>{link.badge}</StatusBadge> : null}
                  </Link>
                </li>
              );
            })}
            {section.links.length === 0 ? (
              <li className="px-(--space-nav-item-x) py-(--space-nav-item-y) text-body-sm leading-5 text-muted-foreground">
                Coming soon
              </li>
            ) : null}
          </ul>
        </div>
      ))}
    </nav>
  );
}
