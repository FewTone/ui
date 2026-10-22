import { Badge } from "@fewtone/ui/components/badge/badge";

/** The index card's preview: three badges in a row. The page itself opens on every variant, named. */
export default function BadgeCard() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Badge>Stable</Badge>
      <Badge variant="outline">v2.4.0</Badge>
      <Badge variant="shine">Beta</Badge>
    </div>
  );
}
