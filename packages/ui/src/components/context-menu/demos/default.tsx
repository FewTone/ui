"use client";

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@fewtone/ui/components/context-menu/context-menu";
import { useState } from "react";

const sizes = [
  { value: "small", label: "Small" },
  { value: "default", label: "Default" },
  { value: "large", label: "Large" },
];

/** A page's right-click menu. Settings and choices keep it open, so you see them change. */
export default function ContextMenuDefault() {
  const [bookmarks, setBookmarks] = useState(true);
  const [fullUrls, setFullUrls] = useState(false);
  const [size, setSize] = useState("default");
  const keepOpen = (event: Event) => event.preventDefault();

  return (
    <ContextMenu>
      {/* Focusable, so the keyboard's context-menu key or Shift+F10 opens it too. The border firms up while it's open. */}
      <ContextMenuTrigger
        tabIndex={0}
        className="flex h-36 w-full max-w-72 items-center justify-center rounded-lg border border-dashed border-input text-sm text-muted-foreground transition-colors duration-(--duration-fast) ease-out select-none data-[state=open]:border-ring data-[state=open]:text-foreground"
      >
        Right-click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem>
          Back
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem disabled>
          Forward
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          Reload
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>More tools</ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>Save page as…</ContextMenuItem>
            <ContextMenuItem>Create shortcut…</ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem>Developer tools</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked={bookmarks} onCheckedChange={setBookmarks} onSelect={keepOpen}>
          Show bookmarks bar
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked={fullUrls} onCheckedChange={setFullUrls} onSelect={keepOpen}>
          Show full URLs
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuLabel>Text size</ContextMenuLabel>
        <ContextMenuRadioGroup value={size} onValueChange={setSize}>
          {sizes.map(({ value, label }) => (
            <ContextMenuRadioItem key={value} value={value} onSelect={keepOpen}>
              {label}
            </ContextMenuRadioItem>
          ))}
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
