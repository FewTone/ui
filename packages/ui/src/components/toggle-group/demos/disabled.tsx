import { ToggleGroup, ToggleGroupItem } from "@fewtone/ui/components/toggle-group/toggle-group";

export default function ToggleGroupDisabled() {
  return (
    <ToggleGroup defaultValue={["email"]} variant="outline" aria-label="Notify by">
      <ToggleGroupItem value="email">Email</ToggleGroupItem>
      <ToggleGroupItem value="sms" disabled>
        SMS
      </ToggleGroupItem>
      <ToggleGroupItem value="push">Push</ToggleGroupItem>
    </ToggleGroup>
  );
}
