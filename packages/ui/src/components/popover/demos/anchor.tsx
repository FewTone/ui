import { Button } from "@fewtone/ui/components/button/button";
import { Checkbox } from "@fewtone/ui/components/checkbox/checkbox";
import { Input } from "@fewtone/ui/components/input/input";
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@fewtone/ui/components/popover/popover";
import { SlidersHorizontalIcon } from "lucide-react";
import { useId } from "react";

const filters = [
  { key: "archived", label: "Include archived files", on: false },
  { key: "mine", label: "Only files I own", on: true },
  { key: "shared", label: "Shared with me", on: true },
];

/** The button opens it, but it lines up with the whole field and takes its width */
export default function PopoverAnchored() {
  const id = useId();

  return (
    <Popover>
      <PopoverAnchor asChild>
        <div className="flex w-full max-w-sm gap-2">
          <Input type="search" aria-label="Search files" placeholder="Search files…" />
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Filters">
              <SlidersHorizontalIcon aria-hidden />
            </Button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      <PopoverContent align="start" className="grid w-(--radix-popover-trigger-width) gap-4">
        <PopoverHeader>
          <PopoverTitle>Filters</PopoverTitle>
        </PopoverHeader>
        <div className="grid gap-3">
          {filters.map((filter) => (
            <div key={filter.key} className="flex items-center gap-2">
              <Checkbox id={`${id}-${filter.key}`} size="sm" defaultChecked={filter.on} />
              <label htmlFor={`${id}-${filter.key}`} className="text-sm">
                {filter.label}
              </label>
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <PopoverClose asChild>
            <Button size="sm">Done</Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
