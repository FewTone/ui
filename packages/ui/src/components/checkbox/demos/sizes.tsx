import { Checkbox } from "@fewtone/ui/components/checkbox/checkbox";

export default function CheckboxSizes() {
  return (
    <div className="flex items-center gap-6">
      <Checkbox size="sm" aria-label="Small checkbox" defaultChecked />
      <Checkbox aria-label="Medium checkbox" defaultChecked />
    </div>
  );
}
