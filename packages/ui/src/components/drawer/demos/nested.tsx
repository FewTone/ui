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

const people = ["Olivia Martin", "Jackson Lee", "Isabella Nguyen"];

/*
 * A sheet opened from a sheet: the first steps back behind the second, and comes forward again when it closes.
 * The inner drawer follows its parent, so it's a sheet here too.
 */
export default function DrawerNested() {
  return (
    <Drawer mode="sheet">
      <DrawerTrigger asChild>
        <Button variant="outline">Share</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Share the Q4 plan</DrawerTitle>
          <DrawerDescription>These people can open it.</DrawerDescription>
        </DrawerHeader>
        <ul className="grid gap-2 text-sm">
          {people.map((person) => (
            <li key={person}>{person}</li>
          ))}
        </ul>
        <DrawerFooter>
          <Drawer mode="sheet">
            <DrawerTrigger asChild>
              <Button>Add people</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Add people</DrawerTitle>
                <DrawerDescription>They'll get an email with a link.</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button>Done</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
