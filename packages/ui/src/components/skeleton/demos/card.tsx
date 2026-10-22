import { Skeleton } from "@fewtone/ui/components/skeleton/skeleton";

/** The index card's preview: one profile row. The page itself opens on a row and a card. */
export default function SkeletonCard() {
  return (
    <div aria-busy="true" className="flex w-56 items-center gap-3">
      <span className="sr-only">Loading profile</span>
      <Skeleton className="size-10 shrink-0 rounded-full" />
      <div className="grid flex-1 gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
