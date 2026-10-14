import type { ReactNode } from "react";
import { SidebarNav } from "@/components/docs/sidebar-nav";
import { SiteHeader } from "@/components/site-header";
import { getNavSections } from "@/lib/nav";
import { site } from "@/lib/site";

/**
 * Component pages and guides: header, sidebar, content. Two columns, no "On this page", no ads.
 * Full width: the sidebar sits against the left edge and the content fills the rest of the screen.
 * Guides cap their own line length (the MDX wrapper); component previews use all the room.
 */
export default function BrowseLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      {/* Every space here is a layout token in tokens.css (beUI rhythm) */}
      <div className="flex w-full flex-1 gap-(--space-shell) px-(--space-gutter)">
        <aside className="sticky top-(--size-header) hidden h-(--size-below-header) w-(--size-sidebar) shrink-0 overflow-y-auto pt-(--space-content-top) pr-(--space-sidebar-end) pb-(--space-content-y) lg:block">
          <SidebarNav sections={getNavSections()} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <main id="main" className="w-full flex-1 pt-(--space-content-first) pb-(--space-content-y)">
            {children}
          </main>
          <footer className="flex w-full flex-wrap justify-between gap-2 py-(--space-content-y) text-caption text-muted-foreground">
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
