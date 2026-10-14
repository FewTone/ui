import { ArrowRightIcon, BlocksIcon, PaletteIcon, TerminalIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { addCommands } from "@/lib/install";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    url: "/",
    title: site.title,
    description: site.description,
  },
};

const points = [
  {
    Icon: BlocksIcon,
    title: "Accessible by default",
    body: "Built on Radix, with keyboard support and visible focus on every component.",
  },
  {
    Icon: PaletteIcon,
    title: "Yours to customize",
    body: "Plain Tailwind CSS and CSS variables. Change anything, in light and dark mode.",
  },
  {
    Icon: TerminalIcon,
    title: "Works with shadcn",
    body: "Add components with the shadcn CLI, or copy the source by hand.",
  },
];

/** Landing page: basic for now, polished later */
export default function Home() {
  return (
    <>
      <section className="mx-auto flex max-w-content flex-col items-center gap-6 px-(--space-gutter) py-(--space-section) text-center">
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-label text-muted-foreground">
          Free and open source · MIT licence
        </span>
        <h1 className="max-w-heading text-display text-gradient-heading">
          Accessible React components for Next.js
        </h1>
        <p className="max-w-prose text-body-lg text-muted-foreground">
          Copy-paste components built with Tailwind CSS and Radix. Free, open source, and yours to customize.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/components"
            className="focus-ring inline-flex h-(--size-control-lg) items-center gap-2 rounded-lg bg-gradient-primary px-5 text-label text-primary-foreground shadow-sm transition-opacity duration-(--duration-fast) ease-out hover:opacity-90 active:opacity-80"
          >
            View components
            <ArrowRightIcon className="size-(--size-icon-md)" aria-hidden />
          </Link>
          <Link
            href="/docs/installation"
            className="focus-ring inline-flex h-(--size-control-lg) items-center rounded-lg border px-5 text-label transition-colors duration-(--duration-fast) ease-out hover:bg-accent"
          >
            Get started
          </Link>
        </div>
        <code className="rounded-lg border bg-muted px-4 py-2 font-mono text-code text-muted-foreground">
          {addCommands("button").npm}
        </code>
      </section>

      <section
        aria-label="Why FewTone UI"
        className="mx-auto max-w-content px-(--space-gutter) pb-(--space-section)"
      >
        <ul className="grid gap-4 md:grid-cols-3">
          {points.map(({ Icon, title, body }) => (
            <li key={title} className="grid content-start gap-2 rounded-xl bg-muted p-6">
              <Icon className="size-(--size-icon-lg) text-muted-foreground" aria-hidden />
              <h2 className="text-h4">{title}</h2>
              <p className="text-body-sm text-muted-foreground">{body}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
