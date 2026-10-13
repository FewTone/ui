import { Switch } from "@fewtone/ui/components/switch/switch";

export default function SwitchSizes() {
  return (
    <div className="flex items-center gap-6">
      <Switch size="sm" aria-label="Small switch" defaultChecked />
      <Switch aria-label="Medium switch" defaultChecked />
    </div>
  );
}
