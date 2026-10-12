import Link from "next/link";
import { getNavSections, getSearchEntries } from "@/lib/nav";
import { site } from "@/lib/site";
import { CommandMenu } from "./command-menu";
import { GithubIcon } from "./github-icon";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { ThemeSwitch } from "./theme-switch";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-(--z-sticky) h-(--size-header) border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-full max-w-wide items-center gap-4 px-(--space-gutter)">
        <MobileNav sections={getNavSections()} />
        <Link href="/" aria-label="FewTone UI home" className="focus-ring rounded-sm text-body-sm">
          <Logo />
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
          <ThemeSwitch />
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
