import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto grid w-full max-w-prose flex-1 content-center justify-items-center gap-4 px-(--space-gutter) py-(--space-section) text-center"
      >
        <p className="text-overline text-muted-foreground uppercase">404</p>
        <h1 className="text-h2">This page does not exist</h1>
        <p className="text-body text-muted-foreground">
          The address may be mistyped, or the page may have moved. Try search, or start from the components.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/components"
            className="focus-ring inline-flex h-(--size-control-md) items-center rounded-lg bg-primary px-4 text-label text-primary-foreground"
          >
            Browse components
          </Link>
          <Link
            href="/"
            className="focus-ring inline-flex h-(--size-control-md) items-center rounded-lg border px-4 text-label hover:bg-accent"
          >
            Home
          </Link>
        </div>
      </main>
    </>
  );
}
