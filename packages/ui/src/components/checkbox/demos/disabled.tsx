import { Checkbox } from "@fewtone/ui/components/checkbox/checkbox";
import { useId } from "react";

export default function CheckboxDisabled() {
  const id = useId();
  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3">
        <Checkbox id={`${id}-backup`} disabled defaultChecked />
        <label htmlFor={`${id}-backup`} className="text-sm font-medium text-muted-foreground">
          Back up automatically
        </label>
      </div>
      <div className="flex items-center gap-3">
        <Checkbox id={`${id}-mobile`} disabled />
        <label htmlFor={`${id}-mobile`} className="text-sm font-medium text-muted-foreground">
          Sync over mobile data
        </label>
      </div>
    </div>
  );
}
