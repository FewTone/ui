"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@fewtone/ui/components/dialog/dialog";
import { Input } from "@fewtone/ui/components/input/input";
import { useId, useState } from "react";

/*
 * A form in a dialog. Saving (the button, or Enter in a field) closes it, so it's controlled; Cancel, the
 * close button, Escape and the backdrop close it too.
 */
export default function DialogEditProfile() {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit profile</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <form
          className="grid gap-6"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>Change how others see you. Save when you're done.</DialogDescription>
          </DialogHeader>
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
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
