import { Textarea } from "@fewtone/ui/components/textarea/textarea";
import { useId } from "react";

export default function TextareaDisabled() {
  const id = useId();
  return (
    <div className="grid w-full max-w-sm gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Release notes
      </label>
      <Textarea id={id} minRows={2} defaultValue="Locked while the release is being published." disabled />
    </div>
  );
}
