import { Spinner } from "@fewtone/ui/components/spinner/spinner";

/* Beside text, the row is the status, so it's read once as "Loading comments…" */
export default function SpinnerWithText() {
  return (
    <div role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner aria-hidden />
      Loading comments…
    </div>
  );
}
