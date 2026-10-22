"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@fewtone/ui/components/command/command";
import {
  FolderIcon,
  LayoutDashboardIcon,
  MoonIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  UserPlusIcon,
} from "lucide-react";
import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};
/** ⌘ on a Mac, Ctrl elsewhere: read on the client; the server assumes a Mac and the client corrects it */
function useIsMac() {
  return useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent),
    () => true,
  );
}

/*
 * The palette in a dialog, opened from a button or with ⌘J (Ctrl J). This site already uses ⌘K for its own
 * search, so the example takes J; your app would pass shortcut="k". The caps light up while the keys are
 * held. Running a command closes it, so it's controlled.
 */
export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const mac = useIsMac();
  const run = () => setOpen(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-keyshortcuts="Meta+J Control+J"
        className="w-64 justify-start ps-3 pe-2 text-muted-foreground"
      >
        <SearchIcon />
        <span className="flex-1 text-start">Search…</span>
        <kbd aria-hidden className="font-sans text-xs font-medium text-muted-foreground">
          {mac ? "⌘J" : "Ctrl J"}
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} shortcut="j">
        <CommandInput placeholder="Type a command or search…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Pages">
            <CommandItem onSelect={run} keywords={["home", "overview"]}>
              <LayoutDashboardIcon />
              Dashboard
            </CommandItem>
            <CommandItem onSelect={run}>
              <FolderIcon />
              Projects
            </CommandItem>
            <CommandItem onSelect={run} keywords={["preferences", "account"]}>
              <SettingsIcon />
              Settings
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem onSelect={run} keywords={["create", "add"]}>
              <PlusIcon />
              New project
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={run} keywords={["team", "members", "share"]}>
              <UserPlusIcon />
              Invite people
            </CommandItem>
            <CommandItem onSelect={run} keywords={["theme", "light", "appearance"]}>
              <MoonIcon />
              Switch to dark mode
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
