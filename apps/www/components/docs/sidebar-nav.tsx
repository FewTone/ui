"use client";

import { cn } from "@fewtone/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { NavSection } from "@/lib/nav";
import { StatusBadge } from "./status-badge";

/** Guides first, then one section per kind with its count. A kind filter appears once there are two kinds. */
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
    <nav aria-label="Guides and components" className="grid gap-6">
      {kindSections.length > 1 ? (
        <fieldset className="flex flex-wrap gap-0.5 justify-self-start rounded-lg border bg-muted p-0.5">
          <legend className="sr-only">Show</legend>
          {filters.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={filter === option.id}
              onClick={() => setFilter(option.id)}
              className={cn(
                "focus-ring rounded-md px-2 py-0.5 text-caption text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground",
                filter === option.id && "bg-background text-foreground shadow-xs",
              )}
            >
              {option.label}
            </button>
          ))}
        </fieldset>
      ) : null}

      {visible.map((section) => (
        <div key={section.id} className="grid gap-1">
          <p className="flex items-center gap-2 px-2 pb-1 text-overline text-muted-foreground uppercase">
            {section.label}
            {section.count !== undefined ? (
              <span className="rounded-full border px-1.5 text-caption tabular-nums">{section.count}</span>
            ) : null}
          </p>
          <ul className="grid gap-0.5">
            {section.links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "focus-ring flex items-center justify-between gap-2 rounded-md px-2 py-1 text-body-sm text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground",
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
              <li className="px-2 py-1 text-body-sm text-muted-foreground">Coming soon</li>
            ) : null}
          </ul>
        </div>
      ))}
    </nav>
  );
}
