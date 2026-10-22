import { Button } from "@fewtone/ui/components/button/button";
import { Spinner } from "@fewtone/ui/components/spinner/spinner";

/* The three sizes and one in a button, named underneath */
export default function SpinnerSizes() {
  return (
    <ul className="flex flex-wrap items-end justify-center gap-x-10 gap-y-6">
      <li className="flex flex-col items-center gap-2">
        <Spinner size="sm" />
        <span className="text-xs text-muted-foreground">Small</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <Spinner />
        <span className="text-xs text-muted-foreground">Medium</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <Spinner size="lg" />
        <span className="text-xs text-muted-foreground">Large</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        {/* The label already says what's happening, so the spinner is hidden from screen readers */}
        <Button variant="outline" disabled>
          <Spinner aria-hidden />
          Saving…
        </Button>
        <span className="text-xs text-muted-foreground">In a button</span>
      </li>
    </ul>
  );
}
