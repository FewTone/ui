import { Command, CommandInput, CommandItem, CommandList } from "@fewtone/ui/components/command/command";
import { CalendarIcon, SmileIcon } from "lucide-react";

/** The index card's preview: a short command menu. The page itself opens on a full one. */
export default function CommandCard() {
  return (
    <Command label="Command menu" className="max-w-64 border border-border shadow-md">
      <CommandInput placeholder="Search…" />
      <CommandList>
        <CommandItem>
          <CalendarIcon />
          Calendar
        </CommandItem>
        <CommandItem>
          <SmileIcon />
          Search emoji
        </CommandItem>
      </CommandList>
    </Command>
  );
}
