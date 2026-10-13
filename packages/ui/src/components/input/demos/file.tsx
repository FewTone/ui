import { Input } from "@fewtone/ui/components/input/input";
import { useId } from "react";

export default function InputFile() {
  const id = useId();
  return (
    <div className="grid w-full max-w-xs gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Avatar
      </label>
      <Input id={id} type="file" accept="image/*" />
    </div>
  );
}
