import type { ReactNode } from "react";
import { SidebarNav } from "@/components/docs/sidebar-nav";
import { SiteHeader } from "@/components/site-header";
import { getNavSections } from "@/lib/nav";
import { site } from "@/lib/site";

/** Component pages and guides: header, sidebar, content. Two columns, no "On this page", no ads. */
export default function BrowseLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-wide flex-1">
        <aside className="sticky top-(--size-header) hidden h-(--size-below-header) w-(--size-sidebar) shrink-0 overflow-y-auto border-r py-8 pr-4 pl-(--space-gutter) lg:block">
          <SidebarNav sections={getNavSections()} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="main" className="mx-auto w-full max-w-docs flex-1 px-(--space-gutter) py-10">
            {children}
          </main>
          <footer className="mx-auto flex w-full max-w-docs flex-wrap justify-between gap-2 px-(--space-gutter) py-6 text-caption text-muted-foreground">
            <span>© 2026 FewTone · MIT licence</span>
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              className="focus-ring rounded-sm hover:text-foreground"
            >
              GitHub
            </a>
          </footer>
        </div>
      </div>
    </>
  );
}
