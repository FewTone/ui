import { Switcher, SwitcherItem } from "@fewtone/ui/components/switcher/switcher";

/** The index card's preview: one Switcher. The page itself opens on both variants. */
export default function SwitcherCard() {
  return (
    <Switcher defaultValue="week" aria-label="Range">
      <SwitcherItem value="day">Day</SwitcherItem>
      <SwitcherItem value="week">Week</SwitcherItem>
      <SwitcherItem value="month">Month</SwitcherItem>
    </Switcher>
  );
}
