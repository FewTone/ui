import { cn } from "@fewtone/ui/lib/utils";
import { CheckIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { guides } from "@/lib/guides";
import { getRoadmap, type RoadmapStatus } from "@/lib/roadmap";

/*
 * The public roadmap (owner, 2026-10-14). The list is lib/roadmap.ts; each entry's status comes from the
 * content index, so a component appears as Available, with a link, the day it ships. Listed with the
 * guides (lib/guides.ts), so it's in the sidebar, search and sitemap. Neutral styling only: Navy stays
 * for the footer, Pro surfaces and the Beta badge.
 */

const page = guides.find((guide) => guide.href === "/roadmap");

export const metadata: Metadata = {
  title: { absolute: page?.headline ?? "FewTone UI Roadmap" },
  description: page?.description,
  alternates: { canonical: "/roadmap" },
  openGraph: { type: "website", url: "/roadmap", title: page?.headline, description: page?.description },
};

const labels: Record<RoadmapStatus, string> = { available: "Available", next: "Next up", planned: "Planned" };

function Status({ status }: { status: RoadmapStatus }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-caption leading-none",
        status === "available" && "bg-secondary text-foreground",
        status === "next" && "bg-muted text-foreground",
        status === "planned" && "text-muted-foreground",
      )}
    >
      {status === "available" ? <CheckIcon aria-hidden className="size-(--size-icon-sm)" /> : null}
      {labels[status]}
    </span>
  );
}

export default function RoadmapPage() {
  const { groups, counts } = getRoadmap();

  return (
    <article className="mx-auto grid w-full max-w-docs gap-(--space-page)">
      <header className="grid gap-(--space-intro)">
        <h1 className="text-h2">Roadmap</h1>
        <p className="text-body text-muted-foreground">
          The components FewTone UI has today, what's being built next, and what's planned. Each one ships
          with a live preview, docs, an accessible API and a one-line install with the shadcn CLI.
        </p>
        <p className="text-body-sm text-muted-foreground">
          {counts.available} available · {counts.next} next up · {counts.planned} planned
        </p>
      </header>

      {groups.map(({ group, entries }) => {
        const id = `roadmap-${group.toLowerCase()}`;
        return (
          <section key={group} aria-labelledby={id} className="grid gap-(--space-heading)">
            <h2 id={id} className="scroll-mt-24 text-h3">
              {group}
            </h2>
            <ul className="grid gap-(--space-grid) sm:grid-cols-2">
              {entries.map((entry) => (
                <li
                  key={entry.name}
                  className="grid content-start gap-1 rounded-xl bg-card px-(--space-card-x) py-(--space-stack) shadow-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    {entry.href ? (
                      <Link
                        href={entry.href}
                        className="focus-ring rounded-sm text-body font-medium text-foreground underline-offset-4 hover:underline"
                      >
                        {entry.title}
                      </Link>
                    ) : (
                      <span className="text-body font-medium">{entry.title}</span>
                    )}
                    <Status status={entry.status} />
                  </div>
                  <p className="text-body-sm text-muted-foreground">{entry.note}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </article>
  );
}
