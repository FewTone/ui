import { ToggleGroup, ToggleGroupItem } from "@fewtone/ui/components/toggle-group/toggle-group";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ToggleGroupDays() {
  return (
    <ToggleGroup defaultValue={["mon", "wed", "fri"]} aria-label="Repeat on">
      {days.map((day) => (
        <ToggleGroupItem key={day} value={day.toLowerCase()}>
          {day}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
