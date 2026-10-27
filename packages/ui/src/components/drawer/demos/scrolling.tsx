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

const sections = [
  {
    title: "Your account",
    text: "You're responsible for what happens under your account, and for keeping its password safe.",
  },
  {
    title: "Your content",
    text: "What you upload stays yours. You let us store and show it so the service can work.",
  },
  {
    title: "Acceptable use",
    text: "Don't break the law, harm others, or try to get round the limits of your plan.",
  },
  {
    title: "Payments",
    text: "Paid plans renew each month until you cancel. Cancelling stops the next renewal.",
  },
  {
    title: "Privacy",
    text: "We collect only what the service needs. The privacy policy says what, and why.",
  },
  {
    title: "Changes",
    text: "We'll tell you about changes that matter at least 30 days before they apply.",
  },
  {
    title: "Ending",
    text: "You can close your account at any time. We may close one that breaks these terms.",
  },
];

/*
 * Long content: the sheet grows to just under the status bar, its body scrolls on its own, and the buttons
 * stay pinned at the bottom. Drag it down from the top of the text, or by the grabber, to close it.
 */
export default function DrawerScrolling() {
  return (
    <Drawer mode="sheet">
      <DrawerTrigger asChild>
        <Button variant="outline">Read the terms</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Terms of service</DrawerTitle>
          <DrawerDescription>Updated 1 October 2026</DrawerDescription>
        </DrawerHeader>
        {sections.map((section) => (
          <section key={section.title} className="grid gap-1.5">
            <h3 className="text-sm font-medium">{section.title}</h3>
            <p className="text-sm text-muted-foreground">{section.text}</p>
          </section>
        ))}
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Decline</Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button>Accept</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
