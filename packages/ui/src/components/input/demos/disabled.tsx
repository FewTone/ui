import { Input } from "@fewtone/ui/components/input/input";
import { useId } from "react";

export default function InputDisabled() {
  const id = useId();
  return (
    <div className="grid w-full max-w-xs gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Workspace
      </label>
      <Input id={id} defaultValue="fewtone" disabled />
    </div>
  );
}
