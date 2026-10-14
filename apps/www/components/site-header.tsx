import Link from "next/link";
import { getNavSections, getSearchEntries } from "@/lib/nav";
import { site } from "@/lib/site";
import { CommandMenu } from "./command-menu";
import { GithubIcon } from "./github-icon";
import { HeaderFrame } from "./header-frame";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

/** Full width, so the logo lines up with the sidebar on component pages. Spacing follows beUI (ADR 0007). */
export function SiteHeader() {
  return (
    <HeaderFrame>
      <div className="flex h-full items-center gap-(--space-header) px-(--space-gutter)">
        <MobileNav sections={getNavSections()} />
        <div className="flex items-center gap-(--space-header-nav)">
          <Link href="/" aria-label="FewTone UI home" className="focus-ring flex rounded-sm">
            <Logo className="text-body-lg" />
          </Link>
          <nav
            aria-label="Main"
            className="hidden items-center gap-(--space-header-nav) text-body-sm text-muted-foreground md:flex"
          >
            <NavLink href="/components">Components</NavLink>
            <NavLink href="/docs">Docs</NavLink>
            {/* The Lab is dev only (it returns 404 in production), so its link is too */}
            {process.env.NODE_ENV !== "production" ? <NavLink href="/lab">Lab</NavLink> : null}
          </nav>
        </div>
        <div className="ml-auto flex items-center gap-(--space-header-actions)">
          <CommandMenu entries={getSearchEntries()} />
          <ThemeToggle />
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            aria-label="FewTone UI on GitHub"
            className="focus-ring inline-flex size-(--size-control-md) items-center justify-center rounded-lg border text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground"
          >
            <GithubIcon className="size-(--size-icon-md)" />
          </a>
        </div>
      </div>
    </HeaderFrame>
  );
}
