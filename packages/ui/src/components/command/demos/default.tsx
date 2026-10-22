import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@fewtone/ui/components/command/command";
import {
  CalculatorIcon,
  CalendarIcon,
  CreditCardIcon,
  SettingsIcon,
  SmileIcon,
  UserIcon,
} from "lucide-react";

/*
 * A command menu on the page: two groups with icons and shortcuts, a separator and a disabled item. Typing
 * filters it. It sits at the top of the preview, so the field stays put while the list's height glides.
 */
export default function CommandDefault() {
  return (
    <div className="flex w-full justify-center self-start">
      <Command label="Command menu" className="max-w-md border border-border shadow-md">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem keywords={["schedule", "events"]}>
              <CalendarIcon />
              Calendar
            </CommandItem>
            <CommandItem keywords={["smiley", "emoticon"]}>
              <SmileIcon />
              Search emoji
            </CommandItem>
            <CommandItem disabled>
              <CalculatorIcon />
              Calculator
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem keywords={["account"]}>
              <UserIcon />
              Profile
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem keywords={["payment", "invoices"]}>
              <CreditCardIcon />
              Billing
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
            <CommandItem keywords={["preferences"]}>
              <SettingsIcon />
              Settings
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}
