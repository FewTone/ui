import { NumberTicker } from "@fewtone/ui/components/number-ticker/number-ticker";

/** The index card's preview: one stat. The page itself opens on three. */
export default function NumberTickerCard() {
  return (
    <div className="flex flex-col items-center gap-1">
      <NumberTicker value={12480} locale="en-US" className="text-3xl font-semibold tracking-tight" />
      <span className="text-xs text-muted-foreground">Users</span>
    </div>
  );
}
