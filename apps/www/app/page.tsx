import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const footerLinks = [
  { title: "Library", items: ["Components", "Blocks", "Changelog"] },
  { title: "Resources", items: ["Docs", "MCP server", "llms.txt"] },
  { title: "Community", items: ["GitHub", "X", "Discord"] },
];

export default function Home() {
  return (
    <>
      <header className="border-b">
        <nav className="mx-auto flex max-w-content items-center gap-6 px-(--space-gutter) py-3 text-body-sm">
          <Link
            href="/"
            className="focus-ring flex items-center gap-2 rounded-sm font-semibold tracking-tight"
          >
            <span className="size-4 rounded-xs bg-foreground" aria-hidden />
            fewtone<span className="font-medium text-muted-foreground">/ui</span>
          </Link>
          <div className="hidden items-center gap-5 text-muted-foreground sm:flex">
            <span className="text-foreground">Components</span>
            <span>Blocks</span>
            <span>Docs</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="edge-brand inline-flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 text-label">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              Pro
            </span>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-content flex-col items-center gap-6 px-(--space-gutter) py-(--space-section) text-center">
          <span className="edge-brand inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-2 text-label text-muted-foreground [--edge-fill:var(--card)]">
            <span className="size-1.5 rounded-full bg-brand" aria-hidden />
            <span className="text-foreground">New</span> Design system foundations
          </span>
          <h1 className="max-w-heading text-display text-gradient-heading">
            Motion-ready components for Next.js
          </h1>
          <p className="max-w-prose text-body-lg text-muted-foreground">
            Accessible React components with considered motion. Copy the source, keep the polish. Built on
            Radix, Tailwind and Motion.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/lab/tokens"
              className="focus-ring inline-flex h-(--size-control-lg) items-center gap-2 rounded-lg bg-gradient-primary px-5 text-label text-primary-foreground shadow-sm transition-transform duration-(--duration-fast) ease-out active:scale-(--scale-press)"
            >
              View design tokens
              <ArrowRightIcon className="size-(--size-icon-md)" aria-hidden />
            </Link>
            <span className="inline-flex h-(--size-control-lg) items-center rounded-lg bg-muted px-4 font-mono text-code text-muted-foreground shadow-card">
              npx shadcn add @fewtone/button
            </span>
          </div>
        </section>
      </main>

      <footer className="surface-brand-footer m-2 grid gap-10 rounded-xl px-8 pt-12 pb-6">
        <div className="mx-auto grid w-full max-w-content gap-8 md:grid-cols-2">
          <div>
            <p className="text-display text-gradient-on-brand">fewtone/ui</p>
            <p className="mt-3 max-w-xs text-body-sm opacity-80">
              Motion-ready components for Next.js. Free and open source.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4 text-body-sm">
            {footerLinks.map((col) => (
              <div key={col.title} className="grid content-start gap-2">
                <p className="text-overline font-mono uppercase">{col.title}</p>
                {col.items.map((item) => (
                  <span key={item} className="opacity-80">
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-content flex-wrap justify-between gap-2 border-t border-brand-foreground/20 pt-4 text-caption opacity-80">
          <span>© 2026 FewTone · MIT licence</span>
          <span>Built with Radix, Tailwind and Motion</span>
        </div>
      </footer>
    </>
  );
}
