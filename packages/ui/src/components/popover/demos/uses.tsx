"use client";

import { Button } from "@fewtone/ui/components/button/button";
import { CopyButton } from "@fewtone/ui/components/copy-button/copy-button";
import { Input } from "@fewtone/ui/components/input/input";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@fewtone/ui/components/popover/popover";
import { Switch } from "@fewtone/ui/components/switch/switch";
import { useId, useState } from "react";

const size = [
  { key: "width", label: "Width", value: "100%" },
  { key: "height", label: "Height", value: "25px" },
];

const limits = [
  { key: "max-width", label: "Max. width", value: "300px" },
  { key: "max-height", label: "Max. height", value: "none" },
];

const link = "https://ui.fewtone.com/components/popover";

function Field({ id, label, value }: { id: string; label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <Input id={id} defaultValue={value} size="sm" className="col-span-2" />
    </div>
  );
}

/** Turning on Limit size adds two fields, and the popover glides to its new height */
function Dimensions() {
  const id = useId();
  const [limit, setLimit] = useState(false);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent className="grid w-80 gap-4">
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the size of the layer.</PopoverDescription>
        </PopoverHeader>
        <div className="grid gap-2">
          {size.map((field) => (
            <Field key={field.key} id={`${id}-${field.key}`} label={field.label} value={field.value} />
          ))}
          <div className="grid h-(--size-control-sm) grid-cols-3 items-center gap-4">
            <label htmlFor={`${id}-limit`} className="text-sm">
              Limit size
            </label>
            <Switch id={`${id}-limit`} checked={limit} onCheckedChange={setLimit} />
          </div>
          {limit ? (
            // The new fields come in through the blur while the popover glides open around them
            <div className="grid animate-popover-in gap-2">
              {limits.map((field) => (
                <Field key={field.key} id={`${id}-${field.key}`} label={field.label} value={field.value} />
              ))}
            </div>
          ) : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Share() {
  const id = useId();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Share</Button>
      </PopoverTrigger>
      <PopoverContent className="grid w-80 gap-4">
        <PopoverHeader>
          <PopoverTitle>Share this page</PopoverTitle>
          <PopoverDescription>Anyone with the link can view it.</PopoverDescription>
        </PopoverHeader>
        <div className="flex gap-2">
          <label htmlFor={id} className="sr-only">
            Link
          </label>
          <Input id={id} value={link} readOnly size="sm" />
          <CopyButton value={link} variant="outline" size="icon-sm" aria-label="Copy link" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default function PopoverUses() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Dimensions />
      <Share />
    </div>
  );
}
