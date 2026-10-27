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

/** The index card's preview: one trigger that opens a sheet */
export default function DrawerCard() {
  return (
    <Drawer mode="sheet">
      <DrawerTrigger asChild>
        <Button variant="outline">Open sheet</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Move to trash?</DrawerTitle>
          <DrawerDescription>You can restore it from the trash for 30 days.</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button variant="destructive">Move to trash</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
