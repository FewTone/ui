import { Card, CardContent, CardHeader } from "@fewtone/ui/components/card/card";
import { Skeleton } from "@fewtone/ui/components/skeleton/skeleton";

/*
 * A profile row and a card, each named underneath. Every skeleton sweeps in step. The skeletons are hidden from
 * screen readers; each loading region says so with aria-busy and a visually hidden label.
 */
export default function SkeletonPlaceholders() {
  return (
    <ul className="flex w-full flex-wrap items-end justify-center gap-x-12 gap-y-8">
      <li className="flex flex-col items-center gap-3">
        <div aria-busy="true" className="flex w-64 items-center gap-3">
          <span className="sr-only">Loading profile</span>
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="grid flex-1 gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <span className="text-xs text-muted-foreground">Profile</span>
      </li>
      <li className="flex flex-col items-center gap-3">
        <Card aria-busy="true" className="w-64">
          <span className="sr-only">Loading post</span>
          <CardHeader>
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="aspect-video w-full" />
          </CardContent>
        </Card>
        <span className="text-xs text-muted-foreground">Card</span>
      </li>
    </ul>
  );
}
