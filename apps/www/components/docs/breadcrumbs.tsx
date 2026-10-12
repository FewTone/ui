import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

export type Crumb = { name: string; href: string };

/** Visible breadcrumb; the same trail goes into BreadcrumbList structured data */
export function Breadcrumbs({ trail }: { trail: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-label text-muted-foreground">
        {trail.map((crumb, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-foreground">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="focus-ring rounded-sm transition-colors duration-(--duration-fast) ease-out hover:text-foreground"
                >
                  {crumb.name}
                </Link>
              )}
              {last ? null : <ChevronRightIcon className="size-(--size-icon-sm)" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
