import { NumberTicker } from "@fewtone/ui/components/number-ticker/number-ticker";

const stats: { label: string; value: number; format?: Intl.NumberFormatOptions }[] = [
  { label: "Users", value: 12480 },
  {
    label: "Revenue",
    value: 84320,
    format: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  },
  { label: "Uptime", value: 0.9998, format: { style: "percent", minimumFractionDigits: 2 } },
];

/*
 * A count, a currency and a percentage rolling to their values, named underneath, large enough to see the
 * reels spin and lock in from the left. Each starts from 0, so the places 0 doesn't have fade in as they roll.
 * Replay rolls them again.
 */
export default function NumberTickerStats() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-12 gap-y-8">
      {stats.map((stat) => (
        <li key={stat.label} className="flex flex-col items-center gap-1">
          <NumberTicker
            value={stat.value}
            format={stat.format}
            locale="en-US"
            className="text-5xl font-semibold tracking-tight"
          />
          <span className="text-xs text-muted-foreground">{stat.label}</span>
        </li>
      ))}
    </ul>
  );
}
