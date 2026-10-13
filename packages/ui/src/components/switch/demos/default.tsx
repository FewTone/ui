import { Switch } from "@fewtone/ui/components/switch/switch";
import { useId } from "react";

export default function SwitchDefault() {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <Switch id={id} />
      <label htmlFor={id} className="text-sm font-medium">
        Airplane mode
      </label>
    </div>
  );
}
