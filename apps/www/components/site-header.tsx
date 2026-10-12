import Link from "next/link";
import { getNavSections, getSearchEntries } from "@/lib/nav";
import { site } from "@/lib/site";
import { CommandMenu } from "./command-menu";
import { GithubIcon } from "./github-icon";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { ThemeToggle } from "./theme-toggle";

/** Full width, so the logo lines up with the sidebar on component pages */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-sticky) h-(--size-header) border-b bg-background/85 backdrop-blur">
      <div className="flex h-full items-center gap-4 px-(--space-gutter)">
        <MobileNav sections={getNavSections()} />
        <Link href="/" aria-label="FewTone UI home" className="focus-ring flex rounded-sm">
          <Logo className="text-body-lg" />
        </Link>
        <nav
          aria-label="Main"
          className="ml-2 hidden items-center gap-5 text-body-sm text-muted-foreground md:flex"
        >
          <NavLink href="/components">Components</NavLink>
          <NavLink href="/docs">Docs</NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <CommandMenu entries={getSearchEntries()} />
          <ThemeToggle />
          <a
            href={site.github}
            target="_blank"
            rel="noreferrer"
            aria-label="FewTone UI on GitHub"
            className="focus-ring inline-flex size-(--size-control-sm) items-center justify-center rounded-lg text-muted-foreground transition-colors duration-(--duration-fast) ease-out hover:bg-accent hover:text-foreground"
          >
            <GithubIcon className="size-(--size-icon-md)" />
          </a>
        </div>
      </div>
    </header>
  );
}
