import { ToggleGroup, ToggleGroupItem } from "@fewtone/ui/components/toggle-group/toggle-group";
import { BoldIcon, ItalicIcon, UnderlineIcon } from "lucide-react";

/** The index card's preview: one Toggle Group. The page itself opens on both variants. */
export default function ToggleGroupCard() {
  return (
    <ToggleGroup defaultValue={["bold", "italic"]} aria-label="Formatting">
      <ToggleGroupItem value="bold" aria-label="Bold">
        <BoldIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Italic">
        <ItalicIcon />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Underline">
        <UnderlineIcon />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
