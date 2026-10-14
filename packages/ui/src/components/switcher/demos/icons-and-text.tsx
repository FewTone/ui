import { Switcher, SwitcherItem } from "@fewtone/ui/components/switcher/switcher";
import { LayoutGridIcon, ListIcon } from "lucide-react";

export default function SwitcherIconsAndText() {
  return (
    <Switcher defaultValue="list" variant="outline" aria-label="View">
      <SwitcherItem value="list">
        <ListIcon />
        List
      </SwitcherItem>
      <SwitcherItem value="grid">
        <LayoutGridIcon />
        Grid
      </SwitcherItem>
    </Switcher>
  );
}
