"use client";

import { cn } from "@fewtone/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { Pill, PillGroup } from "@/components/motion/pill";
import { RowIndicator, useRowBox } from "@/components/motion/row-indicator";
import type { NavSection } from "@/lib/nav";
import { StatusBadge } from "./status-badge";

/**
 * Guides first, then one section per kind with its count. A kind filter appears once there are two kinds.
 * Spacing comes from the --space-nav-* tokens (beUI rhythm): link rows are 28px with no gaps between them.
 * Two indicators glide behind the links: the current page, and (mouse only) the hovered link.
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

  const list = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState<HTMLElement | null>(null);
  const [hovered, setHovered] = useState<HTMLElement | null>(null);
  // biome-ignore lint/correctness/useExhaustiveDependencies: the current link moves when the page or the filter changes
  useLayoutEffect(() => {
    setCurrent(list.current?.querySelector<HTMLElement>('[aria-current="page"]') ?? null);
  }, [pathname, filter]);
  const currentBox = useRowBox(list, current);
  const hoveredBox = useRowBox(list, hovered);

  return (
    <nav aria-label="Guides and components" className="grid gap-(--space-nav-group)">
      {kindSections.length > 1 ? (
        <PillGroup>
          <fieldset className="relative isolate flex flex-wrap gap-(--space-tabs) justify-self-start rounded-lg bg-muted p-(--space-tabs)">
            <legend className="sr-only">Show</legend>
            {filters.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={filter === option.id}
                onClick={() => setFilter(option.id)}
                className={cn(
                  "focus-ring relative rounded-md px-(--space-nav-item-x) py-(--space-nav-item-y) text-caption text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground",
                  filter === option.id && "text-foreground",
                )}
              >
                {filter === option.id ? <Pill radius={8} /> : null}
                {option.label}
              </button>
            ))}
          </fieldset>
        </PillGroup>
      ) : null}

      <div
        ref={list}
        className="relative isolate grid gap-(--space-nav-group)"
        onPointerLeave={() => setHovered(null)}
      >
        <RowIndicator box={hoveredBox} className="rounded-md bg-accent/60" />
        <RowIndicator box={currentBox} className="rounded-md bg-accent" />
        {visible.map((section) => (
          <div key={section.id}>
            {section.label ? (
              <p className="mb-(--space-nav-label) flex items-center gap-2 px-(--space-nav-item-x) text-overline font-semibold text-muted-foreground uppercase">
                {section.label}
                {section.count !== undefined ? (
                  <span className="rounded-full bg-muted px-1.5 text-caption tabular-nums">
                    {section.count}
                  </span>
                ) : null}
              </p>
            ) : null}
            <ul className="grid">
              {section.links.map((link) => {
                const active = pathname === link.href;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={onNavigate}
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse") setHovered(event.currentTarget);
                      }}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "focus-ring flex items-center justify-between gap-2 rounded-md px-(--space-nav-item-x) py-(--space-nav-item-y) text-body-sm leading-5 text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:text-foreground",
                        active && "font-medium text-foreground",
                      )}
                    >
                      <span className="truncate">{link.title}</span>
                      {link.badge ? <StatusBadge status={link.badge} /> : null}
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
      </div>
    </nav>
  );
}
