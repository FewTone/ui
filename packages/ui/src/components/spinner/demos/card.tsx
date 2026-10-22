import { Spinner } from "@fewtone/ui/components/spinner/spinner";

/** The index card's preview: the three sizes in a row. The page itself names them and adds a button. */
export default function SpinnerCard() {
  return (
    <div className="flex items-center gap-4">
      <Spinner size="sm" />
      <Spinner />
      <Spinner size="lg" />
    </div>
  );
}
