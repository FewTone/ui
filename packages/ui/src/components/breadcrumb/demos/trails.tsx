"use client";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@fewtone/ui/components/breadcrumb/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@fewtone/ui/components/dropdown-menu/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@fewtone/ui/components/select/select";
import { SlashIcon } from "lucide-react";
import { useId, useState } from "react";

type Mark = "chevron" | "slash";

/** The levels the collapsed trail folds into its menu */
const hidden = [
  { label: "Docs", href: "/docs" },
  { label: "Installation", href: "/docs/installation" },
];

/*
 * A four-level trail and a deeper one with its middle collapsed into a menu, named underneath, with the
 * separator in the top-right corner. An empty row at the bottom, as tall as the setting's row, keeps them centred.
 */
export default function BreadcrumbTrails() {
  const id = useId();
  const [mark, setMark] = useState<Mark>("chevron");
  const separator = <BreadcrumbSeparator>{mark === "slash" ? <SlashIcon /> : undefined}</BreadcrumbSeparator>;

  return (
    <div className="flex w-full flex-col gap-6 self-stretch">
      <div className="-mt-6 -mr-6 flex items-center justify-end gap-2">
        <label htmlFor={`${id}-separator`} className="text-sm text-muted-foreground">
          Separator
        </label>
        <Select value={mark} onValueChange={(value) => setMark(value as Mark)}>
          <SelectTrigger id={`${id}-separator`} size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="chevron">Chevron</SelectItem>
            <SelectItem value="slash">Slash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <ul className="flex flex-1 flex-col items-center justify-center gap-8">
        <li className="flex flex-col items-center gap-2">
          <Breadcrumb aria-label="Breadcrumb, four levels">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {separator}
              <BreadcrumbItem>
                <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
              </BreadcrumbItem>
              {separator}
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              {separator}
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <span className="text-xs text-muted-foreground">Four levels</span>
        </li>

        <li className="flex flex-col items-center gap-2">
          <Breadcrumb aria-label="Breadcrumb, collapsed">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              {separator}
              <BreadcrumbItem>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label="Show hidden levels"
                    className="cursor-pointer rounded-md outline-ring transition-colors duration-(--duration-fast) ease-out hover:text-foreground focus-visible:outline-(length:--focus-ring-width) focus-visible:outline-offset-(--focus-ring-offset) data-[state=open]:text-foreground"
                  >
                    <BreadcrumbEllipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {/* Each hidden level is a real link, rendered as the menu item */}
                    {hidden.map((level) => (
                      <DropdownMenuItem key={level.href} asChild>
                        <a href={level.href}>{level.label}</a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </BreadcrumbItem>
              {separator}
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              {separator}
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <span className="text-xs text-muted-foreground">Collapsed</span>
        </li>
      </ul>

      <div aria-hidden className="-mb-6 h-(--size-control-sm)" />
    </div>
  );
}
