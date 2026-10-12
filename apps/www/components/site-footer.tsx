import Link from "next/link";
import { site } from "@/lib/site";
import { LogoMark } from "./logo";

const columns = [
  {
    title: "Library",
    links: [
      { label: "Components", href: "/components" },
      { label: "Introduction", href: "/docs" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "Installation", href: "/docs/installation" },
      { label: "Theming", href: "/docs/theming" },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: site.github },
      { label: "FewTone", href: site.studio.url },
    ],
  },
];

/** The landing page footer: the one large brand moment (Navy) on the site */
export function SiteFooter() {
  return (
    <footer className="surface-brand-footer m-2 grid gap-10 rounded-xl px-8 pt-12 pb-6">
      <div className="mx-auto grid w-full max-w-content gap-8 md:grid-cols-2">
        <div>
          <LogoMark className="mb-3 h-(--size-logo-lg) w-auto" />
          <p className="text-display text-gradient-on-brand">FewTone UI</p>
          <p className="mt-3 max-w-xs text-body-sm opacity-80">
            Accessible React components for Next.js. Free and open source.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-4 text-body-sm">
          {columns.map((column) => (
            <div key={column.title} className="grid content-start gap-2">
              <p className="text-overline font-mono uppercase">{column.title}</p>
              {column.links.map((link) =>
                link.href.startsWith("/") ? (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="focus-ring rounded-sm opacity-80 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="focus-ring rounded-sm opacity-80 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </a>
                ),
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-content flex-wrap justify-between gap-2 border-t border-brand-foreground/20 pt-4 text-caption opacity-80">
        <span>© 2026 FewTone · MIT licence</span>
        <span>Built with Radix and Tailwind CSS</span>
      </div>
    </footer>
  );
}
