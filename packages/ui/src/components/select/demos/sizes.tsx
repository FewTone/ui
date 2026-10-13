import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";

const options = ["Daily", "Weekly", "Monthly"];

export default function SelectSizes() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Select defaultValue="Weekly">
        <SelectTrigger size="sm" className="w-32" aria-label="Frequency, small">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select defaultValue="Weekly">
        <SelectTrigger className="w-32" aria-label="Frequency, medium">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
