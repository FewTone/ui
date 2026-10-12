/** Shown for a moment while a prerendered docs page streams in after a client navigation */
export function PageSkeleton() {
  return (
    <div aria-hidden className="grid grid-cols-1 gap-6">
      <div className="h-4 w-40 rounded-md bg-muted" />
      <div className="h-12 w-64 max-w-full rounded-lg bg-muted" />
      <div className="grid gap-2">
        <div className="h-4 w-full rounded-md bg-muted" />
        <div className="h-4 w-2/3 rounded-md bg-muted" />
      </div>
      <div className="h-72 rounded-xl border bg-card" />
    </div>
  );
}
