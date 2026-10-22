import { Badge } from "@fewtone/ui/components/badge/badge";
import { BadgeCheckIcon } from "lucide-react";

/* Every variant with a label it might carry, named underneath */
export default function BadgeVariants() {
  return (
    <ul className="flex flex-wrap items-end justify-center gap-x-10 gap-y-6">
      <li className="flex flex-col items-center gap-2">
        <Badge>
          <BadgeCheckIcon aria-hidden />
          Verified
        </Badge>
        <span className="text-xs text-muted-foreground">Default</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <Badge variant="secondary">Draft</Badge>
        <span className="text-xs text-muted-foreground">Secondary</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <Badge variant="destructive">Failed</Badge>
        <span className="text-xs text-muted-foreground">Destructive</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <Badge variant="outline">v2.4.0</Badge>
        <span className="text-xs text-muted-foreground">Outline</span>
      </li>
      <li className="flex flex-col items-center gap-2">
        <Badge variant="shine">Beta</Badge>
        <span className="text-xs text-muted-foreground">Shine</span>
      </li>
    </ul>
  );
}
