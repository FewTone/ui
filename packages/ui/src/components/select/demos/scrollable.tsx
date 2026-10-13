import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";

const timezones = [
  "Pacific/Honolulu",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Africa/Cairo",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];

export default function SelectScrollable() {
  return (
    <Select defaultValue="Asia/Kolkata">
      <SelectTrigger className="max-w-64" aria-label="Time zone">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        {timezones.map((zone) => (
          <SelectItem key={zone} value={zone}>
            {zone.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
