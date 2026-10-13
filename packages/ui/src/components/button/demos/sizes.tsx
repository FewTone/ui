import { Button } from "@fewtone/ui/components/button/button";
import { PlusIcon } from "lucide-react";

export default function ButtonSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Button size="sm">Small</Button>
      <Button>Medium</Button>
      <Button size="lg">Large</Button>
      <Button size="icon-sm" variant="outline" aria-label="Add item">
        <PlusIcon />
      </Button>
      <Button size="icon" variant="outline" aria-label="Add item">
        <PlusIcon />
      </Button>
      <Button size="icon-lg" variant="outline" aria-label="Add item">
        <PlusIcon />
      </Button>
    </div>
  );
}
