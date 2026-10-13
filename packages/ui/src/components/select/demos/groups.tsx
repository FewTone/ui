import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";

export default function SelectGroups() {
  return (
    <Select>
      <SelectTrigger className="max-w-56" aria-label="Font">
        <SelectValue placeholder="Choose a font" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Sans serif</SelectLabel>
          <SelectItem value="geist">Geist</SelectItem>
          <SelectItem value="inter">Inter</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Monospace</SelectLabel>
          <SelectItem value="geist-mono">Geist Mono</SelectItem>
          <SelectItem value="jetbrains-mono">JetBrains Mono</SelectItem>
          <SelectItem value="courier" disabled>
            Courier (not installed)
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
