import { Badge } from "@fewtone/ui/components/badge/badge";
import { ArrowUpRightIcon } from "lucide-react";

export default function BadgeAsLink() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Badge asChild variant="outline">
        <a href="https://github.com/FewTone/ui/releases" target="_blank" rel="noreferrer">
          Release notes
          <ArrowUpRightIcon aria-hidden />
        </a>
      </Badge>
      <Badge asChild variant="shine">
        <a href="/roadmap">Beta</a>
      </Badge>
    </div>
  );
}
