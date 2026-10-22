import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SliderDirections } from "./_slider/directions";

/*
 * The Lab home (dev only: app/lab/layout.tsx returns 404 in production). The component being built lives
 * here until it's approved, with no meta file, so no page, registry entry or search result (owner,
 * 2026-10-14). Once it's published its workbench is deleted. The header's Lab link shows in development
 * only.
 */

const links = [
  {
    href: "/lab/tokens",
    title: "Design tokens",
    note: "Every colour, size, space, radius, shadow and motion token.",
  },
  { href: "/components/switcher", title: "Switcher", note: "Built here, now published." },
  { href: "/components/toggle-group", title: "Toggle Group", note: "Built here, now published." },
  { href: "/components/loading-button", title: "Loading Button", note: "Built here, now published." },
  { href: "/components/radio-group", title: "Radio Group", note: "Built here, now published." },
];

export default function LabPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto grid w-full max-w-content gap-(--space-page) px-(--space-gutter) pt-(--space-content-first) pb-(--space-section)">
        <header className="grid gap-(--space-intro)">
          <p className="text-overline font-mono text-muted-foreground uppercase">Lab · dev only</p>
          <h1 className="text-h2">Lab</h1>
          <p className="max-w-prose text-body text-muted-foreground">
            In progress: new directions for Slider. New components start here, out of sight of the public
            site, until they're approved.
          </p>
        </header>
        <SliderDirections />
        <ul className="grid gap-(--space-grid) sm:grid-cols-2">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="focus-ring grid gap-1 rounded-xl bg-card px-(--space-card-x) py-(--space-stack) shadow-card transition-colors duration-(--duration-fast) ease-out hover:bg-accent"
              >
                <span className="text-body font-medium">{link.title}</span>
                <span className="text-body-sm text-muted-foreground">{link.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
