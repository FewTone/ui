import { Button } from "@fewtone/ui/components/button/button";
import { Input } from "@fewtone/ui/components/input/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@fewtone/ui/components/sheet/sheet";
import { PanelBottomIcon, PanelLeftIcon, PanelRightIcon, PanelTopIcon } from "lucide-react";
import { useId } from "react";

const sides = [
  { side: "top", label: "Top", Icon: PanelTopIcon },
  { side: "right", label: "Right", Icon: PanelRightIcon },
  { side: "bottom", label: "Bottom", Icon: PanelBottomIcon },
  { side: "left", label: "Left", Icon: PanelLeftIcon },
] as const;

/** The same form in a sheet from each edge, each button named underneath */
export default function SheetSides() {
  const id = useId();
  return (
    <ul className="flex flex-wrap items-end justify-center gap-x-8 gap-y-6">
      {sides.map(({ side, label, Icon }) => (
        <li key={side} className="flex flex-col items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label={`Open a sheet from the ${side}`}>
                <Icon />
              </Button>
            </SheetTrigger>
            <SheetContent side={side}>
              <SheetHeader>
                <SheetTitle>Edit profile</SheetTitle>
                <SheetDescription>Change how others see you. Save when you're done.</SheetDescription>
              </SheetHeader>
              {/* Capped, so the fields stay a comfortable width in a sheet across the top or bottom */}
              <div className="grid gap-4 sm:max-w-sm">
                <div className="grid gap-2">
                  <label htmlFor={`${id}-${side}-name`} className="text-sm font-medium">
                    Name
                  </label>
                  <Input id={`${id}-${side}-name`} defaultValue="Maya Chen" autoComplete="name" />
                </div>
                <div className="grid gap-2">
                  <label htmlFor={`${id}-${side}-username`} className="text-sm font-medium">
                    Username
                  </label>
                  <Input id={`${id}-${side}-username`} defaultValue="maya" autoComplete="username" />
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button>Save changes</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
          <span aria-hidden className="text-xs text-muted-foreground">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
