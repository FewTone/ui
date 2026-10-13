import { Input } from "@fewtone/ui/components/input/input";
import { useId } from "react";

export default function InputDefault() {
  const id = useId();
  return (
    <div className="grid w-full max-w-xs gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Email
      </label>
      <Input id={id} type="email" placeholder="you@example.com" autoComplete="email" />
    </div>
  );
}
