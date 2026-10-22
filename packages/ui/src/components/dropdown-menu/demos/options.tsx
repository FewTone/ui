"use client";

import { Button } from "@fewtone/ui/components/button/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@fewtone/ui/components/dropdown-menu/dropdown-menu";
import { useState } from "react";

const panels = [
  { value: "top", label: "Top" },
  { value: "bottom", label: "Bottom" },
  { value: "right", label: "Right" },
];

/** View options: settings switched on and off, and one choice from a set. The menu stays open while you choose. */
export default function DropdownMenuOptions() {
  const [statusBar, setStatusBar] = useState(true);
  const [minimap, setMinimap] = useState(false);
  const [panel, setPanel] = useState("bottom");
  const keepOpen = (event: Event) => event.preventDefault();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">View</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-52">
        <DropdownMenuLabel>Show</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={statusBar} onCheckedChange={setStatusBar} onSelect={keepOpen}>
          Status bar
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={minimap} onCheckedChange={setMinimap} onSelect={keepOpen}>
          Minimap
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem disabled>Activity bar</DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Panel position</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={panel} onValueChange={setPanel}>
          {panels.map(({ value, label }) => (
            <DropdownMenuRadioItem key={value} value={value} onSelect={keepOpen}>
              {label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
