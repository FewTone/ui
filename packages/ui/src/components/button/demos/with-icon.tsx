import { Button } from "@fewtone/ui/components/button/button";
import { ArrowRightIcon, DownloadIcon } from "lucide-react";

export default function ButtonWithIcon() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button variant="outline">
        <DownloadIcon aria-hidden />
        Download
      </Button>
      <Button>
        Next step
        <ArrowRightIcon aria-hidden />
      </Button>
    </div>
  );
}
