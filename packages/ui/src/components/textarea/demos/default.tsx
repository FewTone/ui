import { Textarea } from "@fewtone/ui/components/textarea/textarea";
import { useId } from "react";

export default function TextareaDefault() {
  const id = useId();
  return (
    <div className="grid w-full max-w-md gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Message
      </label>
      <Textarea id={id} placeholder="Write a few lines…" minRows={4} maxRows={10} />
    </div>
  );
}
