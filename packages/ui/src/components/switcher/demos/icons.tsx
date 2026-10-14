import { Switcher, SwitcherItem } from "@fewtone/ui/components/switcher/switcher";
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon } from "lucide-react";

export default function SwitcherIcons() {
  return (
    <Switcher defaultValue="left" aria-label="Text alignment">
      <SwitcherItem value="left" aria-label="Align left">
        <AlignLeftIcon />
      </SwitcherItem>
      <SwitcherItem value="center" aria-label="Align centre">
        <AlignCenterIcon />
      </SwitcherItem>
      <SwitcherItem value="right" aria-label="Align right">
        <AlignRightIcon />
      </SwitcherItem>
    </Switcher>
  );
}
