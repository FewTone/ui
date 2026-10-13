import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { useId } from "react";

export default function SelectDefault() {
  const id = useId();
  return (
    <div className="grid w-full max-w-56 gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        Plan
      </label>
      <Select defaultValue="pro">
        <SelectTrigger id={id}>
          <SelectValue placeholder="Choose a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="pro">Pro</SelectItem>
          <SelectItem value="team">Team</SelectItem>
          <SelectItem value="enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
