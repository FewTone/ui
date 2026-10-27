"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@fewtone/ui/components/drawer/drawer";
import { Input } from "@fewtone/ui/components/input/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { Textarea } from "@fewtone/ui/components/textarea/textarea";
import { useId, useState } from "react";

type Mode = "sheet" | "auto" | "dialog";

const modes: { value: Mode; label: string }[] = [
  { value: "sheet", label: "A sheet" },
  { value: "auto", label: "Sheet on phones" },
  { value: "dialog", label: "A dialog" },
];

/*
 * A form in a drawer. On a phone, focus a field: the sheet sits on the keyboard, the field stays in view above
 * the pinned buttons, and scrolling while typing never closes it. Saving (the button, or Enter in a field)
 * closes it, so it's controlled. The setting picks what it opens as; an app usually leaves it on auto.
 */
export default function DrawerProfile() {
  const id = useId();
  const [mode, setMode] = useState<Mode>("sheet");
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-mode`} className="text-sm text-muted-foreground">
          Opens as
        </label>
        <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
          <SelectTrigger id={`${id}-mode`} size="sm" className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {modes.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <Drawer mode={mode} open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline">Edit profile</Button>
          </DrawerTrigger>
          <DrawerContent className="sm:max-w-md">
            <form
              className="grid gap-6"
              onSubmit={(event) => {
                event.preventDefault();
                setOpen(false);
              }}
            >
              <DrawerHeader>
                <DrawerTitle>Edit profile</DrawerTitle>
                <DrawerDescription>Change how others see you. Save when you're done.</DrawerDescription>
              </DrawerHeader>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <label htmlFor={`${id}-name`} className="text-sm font-medium">
                    Name
                  </label>
                  <Input id={`${id}-name`} defaultValue="Maya Chen" autoComplete="name" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor={`${id}-username`} className="text-sm font-medium">
                    Username
                  </label>
                  <Input id={`${id}-username`} defaultValue="maya" autoComplete="username" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor={`${id}-bio`} className="text-sm font-medium">
                    Bio
                  </label>
                  <Textarea
                    id={`${id}-bio`}
                    defaultValue="Designer in Lisbon. I make calm interfaces."
                    minRows={3}
                    maxRows={6}
                  />
                </div>
              </div>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DrawerClose>
                <Button type="submit">Save changes</Button>
              </DrawerFooter>
            </form>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
