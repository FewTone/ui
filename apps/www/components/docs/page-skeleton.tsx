/** Shown for a moment while a prerendered docs page streams in after a client navigation */
export function PageSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-4 w-40 rounded-md bg-muted" />
      <div className="mt-(--space-title) h-8 w-64 max-w-full rounded-lg bg-muted" />
      <div className="mt-(--space-intro) grid gap-2">
        <div className="h-4 w-full max-w-prose rounded-md bg-muted" />
        <div className="h-4 w-2/3 max-w-prose rounded-md bg-muted" />
      </div>
      <div className="mt-(--space-page) h-72 rounded-xl bg-muted" />
    </div>
  );
}
