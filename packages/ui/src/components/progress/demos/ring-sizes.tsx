import { ProgressRing } from "@fewtone/ui/components/progress/progress";

/* The ring's three sizes, named underneath: small sits beside text like an icon; medium and large fit the value */
export default function ProgressRingSizes() {
  return (
    <ul className="flex flex-wrap items-end justify-center gap-x-10 gap-y-6">
      <li className="flex flex-col items-center gap-2">
        <span className="flex items-center gap-2 text-sm">
          <ProgressRing value={30} size="sm" aria-label="Syncing" />
          Syncing
        </span>
        <span className="text-xs text-muted-foreground">Small</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <ProgressRing value={60} showValue aria-label="Storage used" />
        <span className="text-xs text-muted-foreground">Medium</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <ProgressRing value={90} size="lg" showValue aria-label="Course completed" />
        <span className="text-xs text-muted-foreground">Large</span>
      </li>
    </ul>
  );
}
