import { Button } from "@fewtone/ui/components/button/button";
import { ArrowUpRightIcon } from "lucide-react";

export default function ButtonAsLink() {
  return (
    <Button asChild variant="outline">
      <a href="https://github.com/FewTone/ui" target="_blank" rel="noreferrer">
        View on GitHub
        <ArrowUpRightIcon aria-hidden />
      </a>
    </Button>
  );
}
