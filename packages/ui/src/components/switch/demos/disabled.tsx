import { Switch } from "@fewtone/ui/components/switch/switch";
import { useId } from "react";

export default function SwitchDisabled() {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Switch id={id} disabled defaultChecked />
      <label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        Sync is managed by your organisation
      </label>
    </div>
  );
}
